from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import os

class APIKeyAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow OPTIONS for CORS and health/system routes without auth
        if request.method == "OPTIONS" or request.url.path.startswith("/api/v1/system") or request.url.path == "/health" or request.url.path.startswith("/ws"):
            return await call_next(request)
            
        # Optional: Require a specific API Key for all other /api routes
        expected_key = os.getenv("COMPANYOS_API_KEY")
        if expected_key:
            auth_header = request.headers.get("Authorization")
            if not auth_header or auth_header != f"Bearer {expected_key}":
                return JSONResponse(status_code=401, content={"message": "Unauthorized: Invalid or missing API key"})
                
        # Simple Rate Limiting Simulation using request state
        request.state.user = "authenticated_user"
        
        response = await call_next(request)
        return response
