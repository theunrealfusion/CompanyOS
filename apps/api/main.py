from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CompanyOS API",
    description="Open-Source Autonomous AI Company Operating System API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

from apps.api.routers import agents, companies, ws

app.include_router(agents.router, prefix="/api/v1")
app.include_router(companies.router, prefix="/api/v1")
app.include_router(ws.router)

@app.get("/")
async def root():
    return {"status": "ok", "message": "CompanyOS API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
