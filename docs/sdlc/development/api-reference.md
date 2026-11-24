# API Reference

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start endpoints -->
| Method | Path | Handler | Source | Summary |
|---|---|---|---|---|
| GET | /health | health | `backend/app/main.py:58` | Liveness probe, and the only route here that is not a stub. |
<!-- sdlc:auto:end endpoints -->

<!-- sdlc:auto:start drift -->
**Designed but missing:**

- GET /admin/appointments
- GET /admin/audit-logs
- GET /appointments/{id}/consultation
- GET /doctor/appointments
- GET /doctors/{doctor_id}/slots
- GET /me/appointments
- GET /me/profile
- GET /search/doctors
- GET/POST/PUT/DELETE /admin/mappings
- GET/POST/PUT/DELETE /admin/specializations
- POST /admin/users
- POST /appointments
- POST /appointments/{id}/cancel
- POST /auth/login
- POST /auth/logout
- POST /auth/register
- POST /me/consent
- PUT /admin/appointments/{id}/reassign
- PUT /admin/doctors/{doctor_id}/availability
- PUT /admin/doctors/{doctor_id}/status
- PUT /admin/email-settings
- PUT /appointments/{id}/consultation
- PUT /appointments/{id}/reschedule
- PUT /appointments/{id}/status
- PUT /me/availability
- PUT /me/profile
<!-- sdlc:auto:end drift -->

<!-- sdlc:auto:start source -->
Generated from commit `7e12986`
<!-- sdlc:auto:end source -->
