"""Patient-facing search over the static disease/symptom-to-specialization
mapping and the specialization list.

No authentication is required (a patient searches before signing in, and the
test cases for this endpoint call it with no bearer token at all).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app.services import search_doctors

router = APIRouter(tags=["search"])

_db = Depends(get_db)


@router.get("/search/doctors")
async def search_doctors_endpoint(
    specialization: str | None = None,
    symptom: str | None = None,
    db: DBSession = _db,
) -> dict:
    doctors = search_doctors(db, specialization, symptom)
    return {
        "doctors": [
            {
                "id": doctor.id,
                "full_name": doctor.full_name,
                "email": doctor.email,
                "specialization": doctor.specialization,
            }
            for doctor in doctors
        ]
    }
