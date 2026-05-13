from fastapi import APIRouter
from core.database_service import DatabaseService

router = APIRouter()

database_service = DatabaseService()


@router.get("/schemas")
async def get_schemas():
    return database_service.get_schemas()


@router.get("/schemas/{schema_name}/tables")
async def get_tables(schema_name: str):
    return database_service.get_tables(schema_name)


@router.get("/schemas/{schema_name}/tables/{table_name}/ddl")
async def get_table_ddl(schema_name: str, table_name: str):
    return database_service.get_table_ddl(schema_name, table_name)


@router.get("/schemas/{schema_name}/tables/{table_name}/constraints")
async def get_tables_constraints(schema_name: str, table_name: str):
    return database_service.get_tables_constraints(schema_name, table_name)


@router.get("/schemas/{schema_name}/tables/{table_name}/indexes")
async def get_tables_indexes(schema_name: str, table_name: str):
    return database_service.get_tables_indexes(schema_name, table_name)


@router.get("/schemas/{schema_name}/tables/{table_name}/relationships")
async def get_tables_relationships(schema_name: str, table_name: str):
    return database_service.get_tables_relationships(schema_name, table_name)


@router.get("/schemas/{schema_name}/tables/{table_name}/size")
async def get_tables_size(schema_name: str, table_name: str):
    return database_service.get_tables_size(schema_name, table_name)


@router.get("/schemas/{schema_name}/tables/{table_name}/stats")
async def get_tables_stats(schema_name: str, table_name: str):
    return database_service.get_tables_stats(schema_name, table_name)


@router.get("/schemas/{schema_name}/tables/{table_name}")
async def get_tables_column(schema_name: str, table_name: str):
    return database_service.get_tables_column(schema_name, table_name)


@router.get("/schemas/{schema_name}/views/{view_name}")
async def get_views(schema_name: str, view_name: str):
    pass


@router.get("/schemas/{schema_name}/views/{view_name}/sql")
async def get_views_sql(schema_name: str, view_name: str):
    pass


@router.get("/schemas/{schema_name}/functions")
async def get_functions(schema_name: str):
    return database_service.get_functions(schema_name)


@router.get("/schemas/{schema_name}/functions/{function_name}")
async def get_functions_details(schema_name: str, function_name: str):
    pass


@router.get("/schemas/{schema_name}/functions/{function_name}/ddl")
async def get_functions_ddl(schema_name: str, function_name: str):
    pass


@router.get("/schemas/{schema_name}/tables/{table_name}/triggers")
async def get_tables_triggers(schema_name: str, table_name: str):
    pass


@router.get("/schemas/{schema_name}/sequences")
async def get_sequences(schema_name: str):
    pass


@router.get("/schemas/{schema_name}/enums")
async def get_enums(schema_name: str):
    return database_service.get_enums_from_schema(schema_name)


@router.get("/extensions")
async def get_extensions():
    return database_service.get_extensions()


@router.get("/roles")
async def get_roles():
    return database_service.get_roles()


@router.get("/schemas/{schema_name}/tables/{table_name}/grants")
async def get_tables_grants(schema_name: str, table_name: str):
    return database_service.get_tables_grants(schema_name, table_name)


@router.get("/schemas/{schema_name}/tables/{table_name}/dependencies")
async def get_tables_dependencies(schema_name: str, table_name: str):
    return database_service.get_tables_dependencies(schema_name, table_name)
