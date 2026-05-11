from fastapi import FastAPI
from api import database

app = FastAPI(
    title='AI DB Docs',
    version='0.0.1',
    docs_url='/docs',
)

app.include_router(database.router)