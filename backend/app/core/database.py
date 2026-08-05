import uuid
from sqlalchemy import create_engine, CHAR
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.types import TypeDecorator
from app.core.config import settings

# Configure SQLite threading rules if SQLite is active as a fallback
connect_args = {}
if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise CHAR(36), storing as string.
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            from sqlalchemy.dialects.postgresql import UUID
            return dialect.type_descriptor(UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            return value

# Dynamically select spatial column type based on the active database driver
if settings.SQLALCHEMY_DATABASE_URI.startswith("sqlite"):
    from sqlalchemy import String as SQLString
    SpatialPoint = SQLString(100)
else:
    from geoalchemy2 import Geometry
    SpatialPoint = Geometry(geometry_type="POINT", srid=4326, spatial_index=True)
