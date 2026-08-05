import logging
import sys

def setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s - %(filename)s:%(lineno)d - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    # Configure logging levels for third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

logger = logging.getLogger("oceanwatch")
