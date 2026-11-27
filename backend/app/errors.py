"""Error codes the API returns, one constant per error.

Each constant pairs the HTTP status with the message shown to the user. A
route declares these in its `responses=` mapping so the OpenAPI document
carries the full contract (step 1); the route body raises the matching
`fastapi.HTTPException(status_code=..., detail=...)` (step 2).
"""

EMAIL_ALREADY_IN_USE = {
    "status_code": 409,
    "detail": "That email is already in use",
}

CONSENT_REQUIRED = {
    "status_code": 403,
    "detail": "Give consent to store and process your health data before you continue",
}

SPECIALIZATION_NOT_FOUND = {
    "status_code": 404,
    "detail": "Specialization not found",
}

DOCTOR_NOT_FOUND = {
    "status_code": 404,
    "detail": "Doctor not found",
}

SPECIALIZATION_NAME_TAKEN = {
    "status_code": 409,
    "detail": "A specialization with that name already exists",
}

SPECIALIZATION_IN_USE = {
    "status_code": 409,
    "detail": (
        "This specialization is assigned to doctors or used in the mapping table "
        "and cannot be deleted"
    ),
}

MAPPING_NOT_FOUND = {
    "status_code": 404,
    "detail": "Mapping entry not found",
}

MAPPING_TERM_TAKEN = {
    "status_code": 409,
    "detail": "A mapping entry for that disease or symptom already exists",
}
