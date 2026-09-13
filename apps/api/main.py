from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="CompanyOS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBasic()

def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    if credentials.username != "admin" or credentials.password != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

class HealthCheck(BaseModel):
    status: str

@app.get("/health", response_model=HealthCheck)
async def health_check():
    return HealthCheck(status="ok")

@app.get("/secure-health", response_model=HealthCheck)
async def secure_health_check(username: str = Depends(verify_credentials)):
    return HealthCheck(status="ok")

from apps.api.routers import graph, agents_router, tasks_router, settings_router
app.include_router(graph.router)
app.include_router(agents_router.router)
app.include_router(tasks_router.router)
app.include_router(settings_router.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("apps.api.main:app", host="0.0.0.0", port=8000, reload=True)


