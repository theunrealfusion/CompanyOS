import asyncio
from apps.api.adapters.telegram_poller import run_telegram_poller
from typing import Optional
import sys
from pathlib import Path

# Add project root to sys.path so 'apps.api...' imports resolve cleanly
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CompanyOS API",
    description="Open-Source Autonomous AI Company Operating System API",
    version="0.1.0",
)

from apps.api.middleware import APIKeyAuthMiddleware
app.add_middleware(APIKeyAuthMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

from apps.api.routers.tasks import router as tasks_router
from apps.api.routers import (
    agents,
    approvals,
    companies,
    goals,
    metrics,
    models_router,
    mongodb_router,
    providers,
    runs,
    system_router,
    ws,
)

app.include_router(agents.router, prefix="/api/v1")
app.include_router(companies.router, prefix="/api/v1")
app.include_router(goals.router, prefix="/api/v1")
app.include_router(mongodb_router.router, prefix="/api/v1")
app.include_router(approvals.router, prefix="/api/v1")
app.include_router(metrics.router, prefix="/api/v1")
app.include_router(models_router.router, prefix="/api/v1")
app.include_router(providers.router, prefix="/api/v1")
app.include_router(runs.router, prefix="/api/v1")
app.include_router(system_router.router, prefix="/api/v1")
app.include_router(ws.router)


@app.get("/")
async def root():
    return {"status": "ok", "message": "CompanyOS API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("apps.api.main:app", host="0.0.0.0", port=8003, reload=True)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import logging
    logging.error(f"Unhandled error: {exc}")
    return JSONResponse(status_code=500, content={"message": "Internal server error"})

@app.on_event("startup")
async def startup_event():
    import logging
    logging.info("Starting background tasks...")
    asyncio.create_task(run_telegram_poller())
    from apps.api.routers.ws import bridge_redis_to_ws
    asyncio.create_task(bridge_redis_to_ws())
