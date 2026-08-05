import base64
import logging
import os
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form

from sqlalchemy.orm import Session
from app.api import deps
from app.core.storage import BaseStorageService
from app.core.config import settings
from app.features.users.models import User
from app.features.reports import crud, schemas

router = APIRouter(prefix="/reports", tags=["reports"])
logger = logging.getLogger("reports")

# Allowed file extensions & MIME types
IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"]
VIDEO_EXTENSIONS = [".mp4", ".mov"]

def validate_file(filename: str, content_size: int, content_type: str, is_video: bool = False) -> None:
    """Validates file extensions and size restrictions."""
    ext = os.path.splitext(filename)[1].lower()
    allowed_exts = VIDEO_EXTENSIONS if is_video else IMAGE_EXTENSIONS
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed types: {allowed_exts}"
        )
        
    # Check max file size limit
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if content_size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB}MB"
        )

def decode_base64_file(base64_str: str, is_video: bool = False) -> tuple[bytes, str, str]:
    """Decodes data URI or raw base64 strings to bytes, determining extension and mime."""
    try:
        if base64_str.startswith("data:"):
            header, base64_data = base64_str.split(";base64,")
            mime_type = header.replace("data:", "")
            ext = ".png"
            if "jpeg" in mime_type or "jpg" in mime_type:
                ext = ".jpg"
            elif "png" in mime_type:
                ext = ".png"
            elif "mp4" in mime_type:
                ext = ".mp4"
            elif "mov" in mime_type:
                ext = ".mov"
            file_bytes = base64.b64decode(base64_data)
            return file_bytes, ext, mime_type
        else:
            file_bytes = base64.b64decode(base64_str)
            ext = ".mp4" if is_video else ".png"
            mime_type = "video/mp4" if is_video else "image/png"
            return file_bytes, ext, mime_type
    except Exception as e:
        raise ValueError(f"Failed to decode base64 file payload: {e}")

@router.post("/", response_model=schemas.ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(
    latitude: float = Form(..., ge=-90, le=90),
    longitude: float = Form(..., ge=-180, le=180),
    timestamp: str = Form(...),
    description: Optional[str] = Form(None),
    device_id: Optional[str] = Form(None),
    image: UploadFile = File(...),
    video: Optional[UploadFile] = File(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["citizen"])),
    storage_service: BaseStorageService = Depends(deps.get_storage_service)
):
    """Ingests a new citizen hazard report. Restricts access to Citizen users only."""
    # Parse timestamp
    try:
        report_time = datetime.fromisoformat(timestamp)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ISO-8601 timestamp string format"
        )

    # Validate and save image
    image_content = await image.read()
    validate_file(image.filename, len(image_content), image.content_type, is_video=False)
    image_url = storage_service.save_file(image_content, image.filename, image.content_type)

    # Validate and save optional video
    video_url = None
    if video:
        video_content = await video.read()
        validate_file(video.filename, len(video_content), video.content_type, is_video=True)
        video_url = storage_service.save_file(video_content, video.filename, video.content_type)

    # Create DB entry
    report = crud.create_report(
        db,
        user_id=current_user.id,
        latitude=latitude,
        longitude=longitude,
        timestamp=report_time,
        description=description,
        device_id=device_id,
        image_url=image_url,
        video_url=video_url
    )

    # Broadcast to SSE subscribers
    from app.core.events import publisher
    publisher.broadcast_sync("report_created", {
        "id": str(report.id),
        "description": report.description,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "report_status": report.report_status,
        "created_at": report.created_at.isoformat()
    })

    return report

@router.get("/me", response_model=List[schemas.ReportResponse])
def read_my_reports(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Retrieves paginated, filterable, and sorted lists of active reports submitted by the active caller."""
    allowed_sorts = ["created_at", "timestamp", "report_status", "credibility_score"]
    if sort_by not in allowed_sorts:
        sort_by = "created_at"
        
    return crud.get_reports_for_user(
        db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        status_filter=status_filter,
        sort_by=sort_by,
        sort_order=sort_order
    )

@router.post("/sync", response_model=schemas.ReportSyncResponse)
def sync_offline_reports(
    payload: schemas.ReportSyncRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["citizen"])),
    storage_service: BaseStorageService = Depends(deps.get_storage_service)
):
    """Enables synchronization of offline queued reports. Decodes base64 media uploads asynchronously."""
    results = []
    processed_count = 0
    
    for idx, item in enumerate(payload.reports):
        try:
            image_url = None
            video_url = None
            
            # Process base64 image if present
            if item.image_base64:
                file_bytes, ext, mime_type = decode_base64_file(item.image_base64, is_video=False)
                validate_file(f"temp_img{ext}", len(file_bytes), mime_type, is_video=False)
                image_url = storage_service.save_file(file_bytes, f"sync_image{ext}", mime_type)
            else:
                # Citizens must provide an image to register hazard reports
                raise ValueError("An image media file is required for submitting hazard reports.")
                
            # Process base64 video if present
            if item.video_base64:
                file_bytes, ext, mime_type = decode_base64_file(item.video_base64, is_video=True)
                validate_file(f"temp_vid{ext}", len(file_bytes), mime_type, is_video=True)
                video_url = storage_service.save_file(file_bytes, f"sync_video{ext}", mime_type)

            # Insert report record
            report = crud.create_report(
                db,
                user_id=current_user.id,
                latitude=item.latitude,
                longitude=item.longitude,
                timestamp=item.timestamp,
                description=item.description,
                device_id=item.device_id,
                image_url=image_url,
                video_url=video_url
            )
            
            # Broadcast to SSE subscribers
            from app.core.events import publisher
            publisher.broadcast_sync("report_created", {
                "id": str(report.id),
                "description": report.description,
                "latitude": report.latitude,
                "longitude": report.longitude,
                "report_status": report.report_status,
                "created_at": report.created_at.isoformat()
            })

            processed_count += 1
            results.append(schemas.ReportSyncResponseItem(
                success=True,
                temp_index=idx,
                report_id=report.id
            ))
        except Exception as e:
            logger.error(f"Failed to sync offline item index {idx}: {e}")
            results.append(schemas.ReportSyncResponseItem(
                success=False,
                temp_index=idx,
                error=str(e)
            ))
            
    return schemas.ReportSyncResponse(processed=processed_count, results=results)

@router.get("/{id}", response_model=schemas.ReportResponse)
def read_report(
    id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Retrieves full details of a specific report. Restricts to report owners or authorities."""
    report = crud.get_report(db, report_id=id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found or has been soft-deleted"
        )
        
    # Check permissions (owners and authority members are allowed)
    if current_user.role == "citizen" and report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Cannot view reports belonging to other citizens."
        )
    return report

@router.patch("/{id}", response_model=schemas.ReportResponse)
def update_citizen_report(
    id: str,
    report_in: schemas.ReportUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["citizen"]))
):
    """Allows report owners to modify text descriptions while report status remains PENDING_AI_ANALYSIS."""
    report = crud.get_report(db, report_id=id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found or has been soft-deleted"
        )
        
    # Verify ownership
    if report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Cannot modify reports belonging to other citizens."
        )
        
    # Check state constraints
    if report.report_status != "PENDING_AI_ANALYSIS":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Report cannot be modified once AI verification is initiated. Status: {report.report_status}"
        )
        
    return crud.update_report(db, db_report=report, obj_in=report_in)

@router.delete("/{id}", response_model=schemas.ReportResponse)
def delete_citizen_report(
    id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["citizen"]))
):
    """Performs soft deletion on a citizen report."""
    report = crud.get_report(db, report_id=id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found or has been soft-deleted"
        )
        
    # Verify ownership
    if report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Cannot delete reports belonging to other citizens."
        )
        
    return crud.soft_delete_report(db, db_report=report)
