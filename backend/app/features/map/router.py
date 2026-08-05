from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.features.users.models import User
from app.features.incidents.models import FusedIncident

router = APIRouter(prefix="/map", tags=["map"])

@router.get("/incidents")
def read_map_incidents(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["authority", "admin"]))
) -> dict:
    """Returns a GeoJSON FeatureCollection containing coordinate positions and marker colors for all incidents."""
    incidents = db.query(FusedIncident).all()
    features = []
    
    for inc in incidents:
        # Determine marker color based on confirmation state
        if inc.status == "confirmed":
            color = "red"
        elif inc.status == "probable":
            color = "orange"
        elif inc.status == "resolved":
            color = "green"
        else:
            color = "yellow"

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [inc.longitude, inc.latitude]
            },
            "properties": {
                "id": str(inc.id),
                "hazard": inc.hazard_type,
                "priority": inc.priority,
                "status": inc.status,
                "incident_confidence": inc.incident_confidence,
                "marker_color": color,
                "radius": inc.radius
            }
        }
        features.append(feature)
        
    return {
        "type": "FeatureCollection",
        "features": features
    }
