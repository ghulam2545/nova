import uvicorn
from fastapi import FastAPI

app = FastAPI(
    title='AI DB Docs',
    version='0.0.1',
    docs_url='/docs',
)

@app.get('/')
async def root():
    return {'message': 'Hello World'}