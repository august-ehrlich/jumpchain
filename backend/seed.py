import asyncio
from sqlalchemy import select
from backend.core.database import AsyncSessionLocal
import models

async def seed_data():
    async with AsyncSessionLocal() as db:
        # 1. Idempotency Check: Look for existing data
        print("Checking database state...")
        stmt = select(models.Document).limit(1)
        result = await db.execute(stmt)
        existing_record = result.scalar_one_or_none()

        if existing_record:
            print("Database is already seeded. Exiting safely.")
            return

        print("No data found. Seeding initial documents...")

        # 2. Create your dummy objects
        dummy_documents = [
            models.Document()
        ]

        # 3. Add and commit to the database
        db.add_all(dummy_documents)
        await db.commit()

        print("Successfully seeded the database!")

if __name__ == "__main__":
    # asyncio.run() creates the event loop needed to execute our async function
    asyncio.run(seed_data())