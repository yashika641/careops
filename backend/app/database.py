from supabase import create_client, Client
from app.config import settings
import asyncpg
from typing import Optional


class Database:
    def __init__(self):
        self.supabase: Optional[Client] = None
        self.pool: Optional[asyncpg.Pool] = None
    
    def get_supabase_client(self) -> Client:
        """Get Supabase client for auth and realtime features"""
        if not self.supabase:
            self.supabase = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_KEY
            )
        return self.supabase
    
    def get_admin_client(self) -> Client:
        """Get Supabase admin client with service role key"""
        return create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )
    
    async def get_pool(self) -> asyncpg.Pool:
        """Get async database connection pool"""
        if not self.pool:
            self.pool = await asyncpg.create_pool(
                settings.DATABASE_URL,
                min_size=10,
                max_size=20,
                command_timeout=60
            )
        return self.pool
    
    async def close(self):
        """Close database connections"""
        if self.pool:
            await self.pool.close()


# Global database instance
db = Database()


async def get_db_connection():
    """Dependency for getting database connection"""
    pool = await db.get_pool()
    async with pool.acquire() as connection:
        yield connection


def get_supabase() -> Client:
    """Dependency for getting Supabase client"""
    return db.get_supabase_client()
