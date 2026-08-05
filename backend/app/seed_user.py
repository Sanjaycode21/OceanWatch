import logging
from app.core.database import SessionLocal
from app.features.users import crud
from app.features.users.schemas import UserCreate
from app.features.users.models import User
from app.features.reports.models import Report
from app.features.incidents.models import FusedIncident
from app.features.alerts.models import Alert
from app.features.sos.models import SOSRequest

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("seed_user")

def seed_operator() -> None:
    logger.info("Initializing authority user seed...")
    from app.core.database import engine, Base
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_email = db.query(User).filter(User.email == "authority@oceanwatch.com").first()
        existing_phone = db.query(User).filter(User.phone == "+1234567890").first()
        if not existing_email and not existing_phone:
            user_in = UserCreate(
                email="authority@oceanwatch.com",
                phone="+1234567890",
                password="Authority123!",
                full_name="Command Dispatcher",
                role="authority"
            )
            crud.create_user(db, user_in)
            logger.info("Default authority user 'authority@oceanwatch.com' created successfully.")
        else:
            logger.info("Default authority user already exists. Skipping.")
    except Exception as e:
        logger.error(f"User seed failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_operator()
