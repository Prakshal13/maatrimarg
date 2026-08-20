from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import init_db
from app.routers import risk

app = FastAPI(title="MaatriMarg API")

# Allow the React frontends (running on localhost during dev) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this before real deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(risk.router)

# More routers will be added here as we build each phase, e.g.:
# from app.routers import hospitals, mothers, routing, alerts
# app.include_router(hospitals.router)
# app.include_router(mothers.router)
# app.include_router(routing.router)
# app.include_router(alerts.router)
