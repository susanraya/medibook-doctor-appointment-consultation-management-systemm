# Traceability Matrix

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start legend -->
Built from recorded links, not written by a model: requirement key → plan item (`source_stable_key`) → development ticket (`stable_key`) → the ticket's test steps → the last live deployment that started after the work finished. **AC tests** counts the story's acceptance criteria that have a test case, and those whose test cases all passed in the latest finished E2E run. **Tests** counts the tests written for the story, and **Result** how many last passed, how many failed and when, as of this page's generation; the Documentation tab shows them live.
<!-- sdlc:auto:end legend -->

<!-- sdlc:auto:start matrix -->
| Requirement | Epic | Title | Plan items | Sprint | Design | Code | Commits | Ticket | Test step | Tests | Result | AC tests | Deployed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| US-001 | EPIC-001 | Patient self-registration | US-001 | 1 | POST /auth/register, api, db, users, web | — | 76235be | delivered | not run | 0 | No tests | 3/3 tested · 0/3 passing | — |
| US-002 | EPIC-001 | Sign in and sign out | US-002 | 1 | POST /auth/login, POST /auth/logout, api, db, sessions, users, web | backend/alembic.ini, backend/app/deps.py, backend/app/main.py, backend/app/routers/admin.py, backend/app/routers/auth.py +23 more | 76235be | delivered | succeeded | 45 | 36 / 45 pass · 24 Nov | 4/4 tested · 1/4 passing | — |
| US-003 | EPIC-001 | Administrator provisions doctor and admin accounts | US-003 | 1 | POST /admin/users, api, db, users | backend/app/models.py, backend/app/routers/admin.py, backend/app/routers/auth.py, backend/app/schemas.py, backend/migrations/versions/0002_add_password_status.py +7 more | fe3a60e | delivered | succeeded | 23 | 19 / 23 pass · 24 Nov | 3/3 tested · 0/3 passing | — |
| US-004 | EPIC-001 | Role-based access enforcement | US-004 | 1 | api, sessions, users, web | — | 76235be | delivered | not run | 0 | No tests | 3/3 tested · 3/3 passing | — |
| US-005 | EPIC-002 | Patient manages own profile | US-005 | 2 | GET /me/profile, PUT /me/profile, api, db, users, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-006 | EPIC-002 | Patient consent capture | US-006 | 2 | POST /me/consent, api, db, patient_consents, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-007 | EPIC-002 | Doctor manages own profile | US-007 | 3 | GET /me/profile, PUT /me/profile, api, db, doctor_profiles, specializations, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-008 | EPIC-003 | Search doctors by disease or symptom via mapping | US-008 | 3 | GET /search/doctors, api, db, disease_mapping_specializations, disease_mappings, doctor_profiles, specializations | — | — | not started | not run | 0 | No tests | 0/3 tested · 0/3 passing | — |
| US-009 | EPIC-003 | Search doctors by specialization | US-009 | 3 | GET /search/doctors, api, db, doctor_profiles, specializations | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-010 | EPIC-004 | Doctor defines recurring weekly availability | US-010, US-010-T1, US-010-T2, US-010-T3, US-010-T4 | 3 | PUT /me/availability, api, appointment_slots, db, doctor_availability, web | — | — | not started | not run | 0 | No tests | 0/3 tested · 0/3 passing | — |
| US-011 | EPIC-004 | Admin manages doctor availability | US-011 | 4 | PUT /admin/doctors/{doctor_id}/availability, api, appointment_slots, appointments, db, doctor_availability, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-012 | EPIC-005 | View real-time available slots | US-012 | 4 | GET /doctors/{doctor_id}/slots, api, appointment_slots, db, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-013 | EPIC-005 | Book an appointment with double-booking prevention | US-013, US-013-T1, US-013-T2, US-013-T3, US-013-T4 | 4 | POST /appointments, api, appointment_slots, appointments, db, patient_consents, web | — | — | not started | not run | 0 | No tests | 0/3 tested · 0/3 passing | — |
| US-014 | EPIC-006 | Patient reschedules an appointment | US-014 | 5 | PUT /appointments/{id}/reschedule, api, appointment_slots, appointments, db, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-015 | EPIC-006 | Patient cancels an appointment | US-015 | 5 | POST /appointments/{id}/cancel, api, appointment_slots, appointments, db, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-016 | EPIC-007 | Patient views own appointments and records | US-016 | 6 | GET /appointments/{id}/consultation, GET /me/appointments, api, appointments, consultation_records, db, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-017 | EPIC-008 | Doctor views scheduled appointments | US-017 | 5 | GET /doctor/appointments, api, appointments, db, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-018 | EPIC-008 | Doctor maintains consultation records | US-018, US-018-T1, US-018-T2, US-018-T3, US-018-T4 | 6 | GET /appointments/{id}/consultation, PUT /appointments/{id}/consultation, api, appointments, consultation_records, db, web | — | — | not started | not run | 0 | No tests | 0/3 tested · 0/3 passing | — |
| US-019 | EPIC-008 | Doctor updates consultation status | US-019 | 6 | PUT /appointments/{id}/status, api, appointments, db, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-020 | EPIC-009 | Manage doctor accounts and profiles | US-020 | 2 | POST /admin/users, PUT /admin/doctors/{doctor_id}/status, api, db, doctor_profiles, users, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-021 | EPIC-009 | Manage specializations | US-021 | 2 | GET/POST/PUT/DELETE /admin/specializations, api, db, specializations, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-022 | EPIC-009 | Maintain disease/symptom-to-specialization mapping | US-022 | 2 | GET/POST/PUT/DELETE /admin/mappings, api, db, disease_mapping_specializations, disease_mappings, specializations, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-023 | EPIC-009 | Oversee, cancel, and reassign appointments | US-023, US-023-T1, US-023-T2, US-023-T3, US-023-T4 | 7 | GET /admin/appointments, PUT /admin/appointments/{id}/reassign, api, appointment_slots, appointments, db, web, worker | — | — | not started | not run | 0 | No tests | 0/3 tested · 0/3 passing | — |
| US-024 | EPIC-010 | Booking, reschedule, and cancellation emails | US-024, US-024-T1, US-024-T2, US-024-T3, US-024-T4 | 8 | POST /appointments, POST /appointments/{id}/cancel, PUT /appointments/{id}/reschedule, api, appointments, db, email, notification_log, worker | — | — | not started | not run | 0 | No tests | 0/3 tested · 0/3 passing | — |
| US-025 | EPIC-010 | Upcoming appointment reminder | US-025 | 8 | appointments, db, email, notification_log, worker | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-026 | EPIC-010 | Email provider configuration | US-026 | 6 | PUT /admin/email-settings, api, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-027 | EPIC-011 | Encryption and protected storage of health data | US-027 | 5 | api, consultation_records, db, users | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
| US-028 | EPIC-011 | Access and audit logging | US-028 | 7 | GET /admin/audit-logs, api, audit_logs, db, web | — | — | not started | not run | 0 | No tests | 0/2 tested · 0/2 passing | — |
<!-- sdlc:auto:end matrix -->
