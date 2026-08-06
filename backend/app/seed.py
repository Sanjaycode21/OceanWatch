import logging
from app.core.database import SessionLocal, Base, engine
from app.features.categories.models import HazardCategory

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("seed")

CATEGORIES = [
    "Ocean Weather",
    "Pollution",
    "Maritime",
    "Marine Ecosystem",
    "Navigation",
    "Illegal Activities",
    "Human Emergency"
]

def seed_categories() -> None:
    """Seeds the database with unique master hazard categories."""
    logger.info("Initializing hazard categories database seed...")
    
    # Auto-generate database tables (safe for local sqlite verification run)
    from app.features.users.models import User
    from app.features.reports.models import Report, CredibilityFactor
    from app.features.ai.models import AIAnalysis
    from app.features.incidents.models import FusedIncident
    from app.features.alerts.models import Alert
    from app.features.sos.models import SOSRequest
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    try:
        for name in CATEGORIES:
            existing = db.query(HazardCategory).filter(HazardCategory.name == name).first()
            if not existing:
                category = HazardCategory(name=name)
                db.add(category)
                logger.info(f"Created category: '{name}'")
            else:
                logger.info(f"Category '{name}' already populated. Skipping.")
        db.commit()
        logger.info("Database seed transaction completed successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"Seeding transaction failed: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_categories()
