from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.bens import router as bens_router
from app.api.routes.locais import router as locais_router
from app.api.routes.users import router as users_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(locais_router)
api_router.include_router(bens_router)

