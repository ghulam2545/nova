from fastapi import FastAPI, Request
from api import database, chat
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from core.database_service import DatabaseService

db = DatabaseService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        db.test_connection()
        print("Database connected successfully")
    except Exception as e:
        print(f"Database connection failed: {e}")
        raise e
    yield


app = FastAPI(
    title='AI DB Docs',
    version='0.0.1',
    docs_url='/docs',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(database.router)
app.include_router(chat.router)

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "title": "AI DB Docs"
        }
    )
