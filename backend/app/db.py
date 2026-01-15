from sqlmodel import SQLModel, create_engine, Session
from app.config import settings

# In the future we will use PostgreSQL, but for now we follow the connection string.
# Note: check_same_thread=False is needed only for SQLite.
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(
    settings.DATABASE_URL, 
    echo=(settings.ENV == "dev"), 
    connect_args=connect_args
)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
