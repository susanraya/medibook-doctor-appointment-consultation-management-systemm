"""Generated routers: one per architecture component that owns endpoints.

Every generated route is a stub that returns a typed placeholder (see
`app.schemas.StubResponse`), so the service starts, serves its OpenAPI
document and passes its tests before a single handler is implemented.
`app.main` includes every router in `all_routers`.
"""

from app.routers.admin import router as admin_router
from app.routers.appointments import router as appointments_router
from app.routers.auth import router as auth_router
from app.routers.doctor import router as doctor_router
from app.routers.doctors import router as doctors_router
from app.routers.me import router as me_router
from app.routers.search import router as search_router

all_routers = [
    auth_router,
    admin_router,
    me_router,
    search_router,
    doctors_router,
    appointments_router,
    doctor_router,
]

__all__ = ["all_routers"]
