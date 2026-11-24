# Sprint Plan

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start sprints -->
## Sprint 1: Sprint 1

Authentication, sessions and role-based account provisioning (delivered)

Capacity: 20 points · Committed: 18

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-001 | Story | Patient self-registration | 5 | backend-agent | — |
| US-002 | Story | Sign in and sign out | 5 | backend-agent | US-001 |
| US-003 | Story | Administrator provisions doctor and admin accounts | 3 | backend-agent | US-002 |
| US-004 | Story | Role-based access enforcement | 5 | security-agent | US-002, US-003 |

## Sprint 2: Sprint 2

Patient/doctor profile management, consent capture, and admin reference data (doctors, specializations, disease mappings)

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-005 | Story | Patient manages own profile | 3 | frontend-agent | US-001, US-002 |
| US-006 | Story | Patient consent capture | 3 | backend-agent | US-001 |
| US-020 | Story | Manage doctor accounts and profiles | 5 | backend-agent | US-003 |
| US-021 | Story | Manage specializations | 3 | backend-agent | — |
| US-022 | Story | Maintain disease/symptom-to-specialization mapping | 5 | backend-agent | US-021 |

## Sprint 3: Sprint 3

Doctor search by disease/symptom/specialization and doctor weekly availability setup

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-007 | Story | Doctor manages own profile | 3 | frontend-agent | US-003, US-021 |
| US-008 | Story | Search doctors by disease or symptom via mapping | 5 | backend-agent | US-020, US-021, US-022 |
| US-009 | Story | Search doctors by specialization | 3 | backend-agent | US-020, US-021 |
| US-010 | Story | Doctor defines recurring weekly availability | 8 | backend-agent | US-007 |
| ↳ US-010-T1 | Task | Add doctor_availability schema and migration | — | backend-agent | — |
| ↳ US-010-T2 | Task | Implement slot-generation logic | — | backend-agent | — |
| ↳ US-010-T3 | Task | Implement PUT /me/availability endpoint with booking-impact warning | — | backend-agent | — |
| ↳ US-010-T4 | Task | Build doctor availability management UI | — | frontend-agent | — |

## Sprint 4: Sprint 4

Real-time slot visibility and concurrency-safe appointment booking

Capacity: 20 points · Committed: 18

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-011 | Story | Admin manages doctor availability | 5 | backend-agent | US-010 |
| US-012 | Story | View real-time available slots | 5 | frontend-agent | US-010 |
| US-013 | Story | Book an appointment with double-booking prevention | 8 | backend-agent | US-012, US-006 |
| ↳ US-013-T1 | Task | Add appointments schema and row-level locking transaction | — | backend-agent | — |
| ↳ US-013-T2 | Task | Implement POST /appointments booking endpoint | — | backend-agent | — |
| ↳ US-013-T3 | Task | Enforce consent check before booking | — | backend-agent | — |
| ↳ US-013-T4 | Task | Build booking confirmation UI flow | — | frontend-agent | — |

## Sprint 5: Sprint 5

Reschedule/cancel appointments, doctor appointment dashboard, and health-data encryption safeguards

Capacity: 20 points · Committed: 18

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-014 | Story | Patient reschedules an appointment | 5 | backend-agent | US-013 |
| US-015 | Story | Patient cancels an appointment | 3 | backend-agent | US-013 |
| US-017 | Story | Doctor views scheduled appointments | 5 | frontend-agent | US-013 |
| US-027 | Story | Encryption and protected storage of health data | 5 | security-agent | US-001 |

## Sprint 6: Sprint 6

Patient dashboard, consultation records and status updates, email provider configuration

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-016 | Story | Patient views own appointments and records | 5 | frontend-agent | US-013, US-018 |
| US-018 | Story | Doctor maintains consultation records | 8 | backend-agent | US-017 |
| ↳ US-018-T1 | Task | Add consultation_records schema and migration | — | backend-agent | — |
| ↳ US-018-T2 | Task | Implement consultation record endpoints with treating-doctor access control | — | backend-agent | — |
| ↳ US-018-T3 | Task | Add audit logging for consultation record view/edit | — | backend-agent | — |
| ↳ US-018-T4 | Task | Build doctor consultation record entry UI | — | frontend-agent | — |
| US-019 | Story | Doctor updates consultation status | 3 | backend-agent | US-018 |
| US-026 | Story | Email provider configuration | 3 | devops-agent | US-003 |

## Sprint 7: Sprint 7

Admin appointment oversight/reassignment and access audit logging

Capacity: 20 points · Committed: 13

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-023 | Story | Oversee, cancel, and reassign appointments | 8 | backend-agent | US-013, US-020 |
| ↳ US-023-T1 | Task | Implement GET /admin/appointments with filters | — | backend-agent | — |
| ↳ US-023-T2 | Task | Implement concurrency-safe reassignment endpoint | — | backend-agent | — |
| ↳ US-023-T3 | Task | Wire cancellation/reassignment notifications | — | integration-agent | — |
| ↳ US-023-T4 | Task | Build admin appointments oversight UI | — | frontend-agent | — |
| US-028 | Story | Access and audit logging | 5 | security-agent | US-018, US-023 |

## Sprint 8: Sprint 8

Background-queued booking/reschedule/cancellation emails and upcoming-appointment reminders

Capacity: 20 points · Committed: 13

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-024 | Story | Booking, reschedule, and cancellation emails | 8 | integration-agent | US-013, US-014, US-015, US-026 |
| ↳ US-024-T1 | Task | Implement Celery notification tasks | — | integration-agent | — |
| ↳ US-024-T2 | Task | Integrate SendGrid with failure logging | — | integration-agent | — |
| ↳ US-024-T3 | Task | Enqueue notification jobs from booking/reschedule/cancel endpoints | — | backend-agent | — |
| ↳ US-024-T4 | Task | Add admin surface for failed notifications | — | devops-agent | — |
| US-025 | Story | Upcoming appointment reminder | 5 | integration-agent | US-024 |

## Unscheduled

_Nothing unscheduled._
<!-- sdlc:auto:end sprints -->
