from fastapi import APIRouter
from core.database_manager import DatabaseManager

router = APIRouter(
    prefix='/database',
    tags=['database']
)

manager = DatabaseManager()


@router.get("/schemas")
async def get_schemas():
    return manager.get_schemas()
