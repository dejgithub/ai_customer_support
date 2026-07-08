from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from app.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_async_engine(settings.DATABASE_URL, echo=(settings.ENVIRONMENT == "development"), connect_args=connect_args)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        if settings.DATABASE_URL.startswith("postgresql"):
            try:
                await conn.execute(text("ALTER TABLE customers ALTER COLUMN business_id DROP NOT NULL"))
            except Exception:
                pass
            try:
                await conn.execute(text("ALTER TABLE conversations ALTER COLUMN business_id DROP NOT NULL"))
            except Exception:
                pass
