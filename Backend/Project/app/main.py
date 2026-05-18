from __future__ import annotations
from fastapi import FastAPI
from fastapi.security import HTTPBearer
from app.core.cors import setup_cors
from app.api.controllers.auth_controller import router as auth_router
from app.repositories.user_repository import ensure_user_indexes
from app.api.controllers.table_cell_controller import router as table_cell_router
from app.api.controllers.table_controller import router as table_router
from app.api.controllers.core_controller import router as core_router
from app.api.controllers.gmap_controller import router as gmap_router


bearer_scheme = HTTPBearer()

app = FastAPI(
    title="Office Works API",
    version="1.0.0",
    swagger_ui_parameters={"persistAuthorization": True},
)


setup_cors(app)

from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Office Works API",
        version="1.0.0",
        description="API with JWT authentication",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


@app.on_event("startup")
async def startup_event():
    await ensure_user_indexes()


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(table_cell_router)
app.include_router(table_router)   
app.include_router(core_router)  
app.include_router(gmap_router)