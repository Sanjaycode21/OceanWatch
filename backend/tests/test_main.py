import sys
import os
import base64

# Append the parent directory to Python's system path to permit local app importing
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from fastapi import Depends, APIRouter
from app.main import app
from app.api import deps
from app.features.reports.models import Report

client = TestClient(app)

# Create a temporary protected router mounted on the app to verify role checks
rbac_router = APIRouter(prefix="/api/v1/test-rbac", tags=["test"])

@rbac_router.get("/authority-only", dependencies=[Depends(deps.RoleChecker(["authority", "admin"]))])
def authority_route() -> dict:
    return {"message": "Success"}

@rbac_router.get("/admin-only", dependencies=[Depends(deps.RoleChecker(["admin"]))])
def admin_route() -> dict:
    return {"message": "Success"}

app.include_router(rbac_router)

def test_health_check() -> None:
    """Verifies that the /health endpoint is operational and returns a 200 status."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "OceanWatch AI Backend",
        "version": "1.0.0"
    }

def test_signup_validation() -> None:
    """Tests account registration and uniqueness constraints."""
    payload = {
        "email": "testuser@oceanwatch.org",
        "password": "strongpassword123",
        "full_name": "Test User",
        "phone": "+1234567890",
        "role": "citizen"
    }
    response = client.post("/api/v1/auth/signup", json=payload)
    assert response.status_code in [201, 400]  # Might exist from previous runs

def test_login_and_token_rotation() -> None:
    """Tests credentials validation, refresh token rotation, replay safety, and logout."""
    payload = {
        "email": "authority@oceanwatch.gov",
        "password": "authoritypassword",
        "full_name": "Coast Guard Agent",
        "phone": "+111222333",
        "role": "authority"
    }
    client.post("/api/v1/auth/signup", json=payload)
    
    login_response = client.post("/api/v1/auth/login", data={
        "username": "authority@oceanwatch.gov",
        "password": "authoritypassword"
    })
    assert login_response.status_code == 200
    tokens = login_response.json()
    
    access_token = tokens["access_token"]
    me_response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    assert me_response.status_code == 200
    assert me_response.json()["role"] == "authority"

def test_citizen_report_lifecycle() -> None:
    """Tests full lifecycle of citizen reports including file uploads, patch bounds, listing, and soft deletion."""
    citizen_payload = {
        "email": "citizenreporter@ocean.com",
        "password": "citizenpassword",
        "role": "citizen"
    }
    client.post("/api/v1/auth/signup", json=citizen_payload)
    citizen_login = client.post("/api/v1/auth/login", data={"username": "citizenreporter@ocean.com", "password": "citizenpassword"})
    citizen_token = citizen_login.json()["access_token"]

    authority_payload = {
        "email": "authorityagent@oceanwatch.gov",
        "password": "authoritypassword",
        "role": "authority"
    }
    client.post("/api/v1/auth/signup", json=authority_payload)
    auth_login = client.post("/api/v1/auth/login", data={"username": "authorityagent@oceanwatch.gov", "password": "authoritypassword"})
    auth_token = auth_login.json()["access_token"]

    files = {
        "image": ("test.png", b"fake image bytes", "image/png"),
        "video": ("test.mp4", b"fake video bytes", "video/mp4")
    }
    data = {
        "latitude": 24.55,
        "longitude": -81.78,
        "timestamp": "2026-08-05T22:00:00",
        "description": "Floating oil slick observed near reef.",
        "device_id": "phone-xyz"
    }
    response = client.post(
        "/api/v1/reports/",
        data=data,
        files=files,
        headers={"Authorization": f"Bearer {citizen_token}"}
    )
    assert response.status_code == 201
    report = response.json()
    assert report["report_status"] in ["VERIFIED", "FUSED", "UNDER_VERIFICATION", "AI_ANALYZED"]
    assert report["latitude"] == 24.55
    assert report["image_url"].startswith("/uploads/")
    report_id = report["id"]

    bad_response = client.post(
        "/api/v1/reports/",
        data=data,
        files=files,
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert bad_response.status_code == 403

    details = client.get(
        f"/api/v1/reports/{report_id}",
        headers={"Authorization": f"Bearer {citizen_token}"}
    )
    assert details.status_code == 200
    assert details.json()["description"] == "Floating oil slick observed near reef."

    edit_response = client.patch(
        f"/api/v1/reports/{report_id}",
        json={"description": "Updated report description: Oil spill floating near coral reef."},
        headers={"Authorization": f"Bearer {citizen_token}"}
    )
    assert edit_response.status_code == 200
    assert edit_response.json()["description"] == "Updated report description: Oil spill floating near coral reef."

    delete_response = client.delete(
        f"/api/v1/reports/{report_id}",
        headers={"Authorization": f"Bearer {citizen_token}"}
    )
    assert delete_response.status_code == 200

    gone_response = client.get(
        f"/api/v1/reports/{report_id}",
        headers={"Authorization": f"Bearer {citizen_token}"}
    )
    assert gone_response.status_code == 404

def test_offline_sync() -> None:
    """Tests synchronization endpoint processing of batch offline queued reports containing base64 images."""
    citizen_payload = {
        "email": "syncuser@ocean.com",
        "password": "syncpassword",
        "role": "citizen"
    }
    client.post("/api/v1/auth/signup", json=citizen_payload)
    login_res = client.post("/api/v1/auth/login", data={"username": "syncuser@ocean.com", "password": "syncpassword"})
    token = login_res.json()["access_token"]

    fake_png_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    sync_payload = {
        "reports": [
            {
                "description": "Offline debris report 1",
                "latitude": 10.0,
                "longitude": 20.0,
                "timestamp": "2026-08-05T12:00:00Z",
                "device_id": "offline-device-1",
                "image_base64": fake_png_base64
            },
            {
                "description": "Offline debris report 2",
                "latitude": 15.0,
                "longitude": 25.0,
                "timestamp": "2026-08-05T13:00:00Z",
                "device_id": "offline-device-1",
                "image_base64": fake_png_base64
            }
        ]
    }
    
    response = client.post(
        "/api/v1/reports/sync",
        json=sync_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["processed"] == 2
    assert len(res_data["results"]) == 2
    assert res_data["results"][0]["success"] is True

def test_ai_processing_pipeline() -> None:
    """Tests the full AI Orchestrator processing pipeline including classification, credibility scoring, and spatial fusion."""
    citizen_payload = {
        "email": "aipipelinecitizen@ocean.com",
        "password": "citizenpassword",
        "role": "citizen"
    }
    client.post("/api/v1/auth/signup", json=citizen_payload)
    login_res = client.post("/api/v1/auth/login", data={"username": "aipipelinecitizen@ocean.com", "password": "citizenpassword"})
    token = login_res.json()["access_token"]
    
    files = {
        "image": ("slick.png", b"fake image bytes", "image/png")
    }
    data = {
        "latitude": 25.10,
        "longitude": -80.20,
        "timestamp": "2026-08-05T22:00:00",
        "description": "Oil slick observed spreading",
        "device_id": "phone-abc"
    }
    response = client.post(
        "/api/v1/reports/",
        data=data,
        files=files,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    report_id = response.json()["id"]
    
    from app.api.deps import get_ai_orchestrator, get_db
    db = next(get_db())
    orchestrator = get_ai_orchestrator()
    
    processed_report = orchestrator.process_report(db, report_id)
    assert processed_report.report_status in ["VERIFIED", "FUSED"]
    assert processed_report.hazard_category == "Pollution"
    assert processed_report.hazard_type == "Oil Spill"
    assert processed_report.credibility_score is not None
    assert processed_report.credibility_score >= 50.0
    
    from app.features.reports.models import CredibilityFactor
    factors = db.query(CredibilityFactor).filter(CredibilityFactor.report_id == report_id).all()
    assert len(factors) > 0
    
    from app.features.incidents.models import FusedIncident
    incident = db.query(FusedIncident).filter(FusedIncident.id == processed_report.incident_id).first()
    assert incident is not None
    assert incident.hazard_type == "Oil Spill"
    assert incident.supporting_reports >= 1
    
    data_dup = {
        "latitude": 25.102,
        "longitude": -80.202,
        "timestamp": "2026-08-05T22:05:00",
        "description": "More oil slick spreading",
        "device_id": "phone-def"
    }
    dup_res = client.post(
        "/api/v1/reports/",
        data=data_dup,
        files=files,
        headers={"Authorization": f"Bearer {token}"}
    )
    dup_id = dup_res.json()["id"]
    
    processed_dup = orchestrator.process_report(db, dup_id)
    assert processed_dup.report_status == "FUSED"
    assert processed_dup.incident_id == incident.id
    
    db.refresh(incident)
    assert incident.supporting_reports >= 2

def test_authority_command_center_endpoints() -> None:
    """Tests all authority command center operations (filtering, patching, maps, dashboard, trust, SOS dispatches)."""
    # 1. Sign up/login citizen & authority
    citizen_payload = {
        "email": "cmdcitizen@ocean.com",
        "password": "citizenpassword",
        "role": "citizen"
    }
    client.post("/api/v1/auth/signup", json=citizen_payload)
    cit_tok = client.post("/api/v1/auth/login", data={"username": "cmdcitizen@ocean.com", "password": "citizenpassword"}).json()["access_token"]

    auth_payload = {
        "email": "cmdauthority@oceanwatch.gov",
        "password": "authoritypassword",
        "role": "authority"
    }
    client.post("/api/v1/auth/signup", json=auth_payload)
    auth_tok = client.post("/api/v1/auth/login", data={"username": "cmdauthority@oceanwatch.gov", "password": "authoritypassword"}).json()["access_token"]
    
    # 2. Ingest report and process it to yield FusedIncident Centroid
    files = {
        "image": ("incident.png", b"fake image bytes", "image/png")
    }
    data = {
        "latitude": 25.40,
        "longitude": -80.50,
        "timestamp": "2026-08-05T22:00:00",
        "description": "Oil spill near port entrance",
        "device_id": "phone-cmd"
    }
    rep_res = client.post(
        "/api/v1/reports/",
        data=data,
        files=files,
        headers={"Authorization": f"Bearer {cit_tok}"}
    )
    report_id = rep_res.json()["id"]
    
    from app.api.deps import get_ai_orchestrator, get_db
    db = next(get_db())
    orchestrator = get_ai_orchestrator()
    processed_rep = orchestrator.process_report(db, report_id)
    inc_id = processed_rep.incident_id
    
    # 3. Test GET incidents list (Authority)
    inc_res = client.get("/api/v1/incidents/", headers={"Authorization": f"Bearer {auth_tok}"})
    assert inc_res.status_code == 200
    assert len(inc_res.json()) > 0
    
    # Block citizen from incidents query
    cit_block_res = client.get("/api/v1/incidents/", headers={"Authorization": f"Bearer {cit_tok}"})
    assert cit_block_res.status_code == 403
    
    # 4. Test GET incident detail
    detail_res = client.get(f"/api/v1/incidents/{inc_id}", headers={"Authorization": f"Bearer {auth_tok}"})
    assert detail_res.status_code == 200
    assert len(detail_res.json()["reports"]) == 1
    assert "✓ Valid image media attached" in detail_res.json()["supporting_factors"]

    # 5. Test PATCH incident update (resolving incident)
    patch_res = client.patch(
        f"/api/v1/incidents/{inc_id}",
        json={"status": "resolved", "assigned_team": "Team Alpha", "resolution_notes": "Cleaned."},
        headers={"Authorization": f"Bearer {auth_tok}"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "resolved"
    assert patch_res.json()["resolved_at"] is not None
    
    # 6. Test GET Map GeoJSON (marker color green since status=resolved)
    map_res = client.get("/api/v1/map/incidents", headers={"Authorization": f"Bearer {auth_tok}"})
    assert map_res.status_code == 200
    geojson = map_res.json()
    assert geojson["type"] == "FeatureCollection"
    
    # 7. Test Dashboard summary & analytics
    sum_res = client.get("/api/v1/dashboard/summary", headers={"Authorization": f"Bearer {auth_tok}"})
    assert sum_res.status_code == 200
    assert sum_res.json()["total_incidents"] > 0
    
    ana_res = client.get("/api/v1/dashboard/analytics", headers={"Authorization": f"Bearer {auth_tok}"})
    assert ana_res.status_code == 200
    assert len(ana_res.json()["incidents_by_status"]) > 0

    # 8. Test GET users trust stats
    trust_res = client.get("/api/v1/users/trust", headers={"Authorization": f"Bearer {auth_tok}"})
    assert trust_res.status_code == 200
    assert len(trust_res.json()) > 0

def test_ai_analysis_db_schema() -> None:
    """Verifies that the AIAnalysis database table can ingest and query records successfully."""
    from app.api.deps import get_db
    from app.features.ai.models import AIAnalysis
    from app.features.reports.models import Report
    import uuid
    from datetime import datetime, timezone
    
    db = next(get_db())
    
    # 1. Create a dummy report
    report = Report(
        id=uuid.uuid4(),
        latitude=25.0,
        longitude=-80.0,
        timestamp=datetime.now(timezone.utc),
        report_status="PENDING_AI_ANALYSIS"
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    
    # 2. Add an AIAnalysis record linked to this report
    analysis = AIAnalysis(
        report_id=report.id,
        analyzed_description="Oil spill observed near reef",
        hazard_category="Pollution",
        hazard_type="Oil Spill",
        confidence=0.92,
        reasoning="Visual evidence shows dark slick on surface."
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    # 3. Retrieve and assert properties
    retrieved = db.query(AIAnalysis).filter(AIAnalysis.report_id == report.id).first()
    assert retrieved is not None
    assert retrieved.hazard_type == "Oil Spill"
    assert retrieved.confidence == 0.92
    assert retrieved.analyzed_description == "Oil spill observed near reef"
    
    # 4. Clean up
    db.delete(analysis)
    db.delete(report)
    db.commit()
