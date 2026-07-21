# Import from the asyncio extension
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from .config import settings

SQLALCHEMY_DATABASE_URL = settings.database_url

engine = create_async_engine(SQLALCHEMY_DATABASE_URL)

AsyncSessionLocal = async_sessionmaker(
    bind=engine, 
    autocommit=False, 
    autoflush=False,
    expire_on_commit=False # Required for async so attributes don't expire after commit
)

class Base(DeclarativeBase):
    pass

# Dependency now uses 'async def' and 'async with'
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session