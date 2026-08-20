from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import init_db
from app.routers import risk, hospitals

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="MaatriMarg API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(risk.router)
app.include_router(hospitals.router)

# More routers will be added here as we build each phase, e.g.:
# from app.routers import mothers, routing, alerts
# app.include_router(mothers.router)
# app.include_router(routing.router)
# app.include_router(alerts.router)