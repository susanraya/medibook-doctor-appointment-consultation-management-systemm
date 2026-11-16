# Sprint Plan

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start sprints -->
## Sprint 1: Sprint 1

Authentication foundation: patient self-registration, sign in/out, admin-provisioned staff accounts, role-based access enforcement.

Capacity: 20 points · Committed: 18

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-001 | Story | Patient self-registration | 5 | backend-agent | — |
| US-002 | Story | Sign in and sign out | 5 | backend-agent | US-001 |
| US-003 | Story | Administrator provisions doctor and admin accounts | 3 | backend-agent | US-002 |
| US-004 | Story | Role-based access enforcement | 5 | security-agent | US-002, US-003 |

## Sprint 2: Sprint 2

Admin reference data and self-service profiles: doctor accounts, specializations, disease mapping, patient profile and consent capture.

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-005 | Story | Patient manages own profile | 3 | frontend-agent | US-002 |
| US-006 | Story | Patient consent capture | 3 | backend-agent | US-002 |
| US-020 | Story | Manage doctor accounts and profiles | 5 | backend-agent | US-003 |
| US-021 | Story | Manage specializations | 3 | backend-agent | US-004 |
| US-022 | Story | Maintain disease/symptom-to-specialization mapping | 5 | backend-agent | US-021 |

## Sprint 3: Sprint 3

Doctor discoverability: doctor profile management, search by disease/symptom and by specialization, recurring weekly availability.

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-007 | Story | Doctor manages own profile | 3 | frontend-agent | US-020, US-021 |
| US-008 | Story | Search doctors by disease or symptom via mapping | 5 | backend-agent | US-022, US-020 |
| US-009 | Story | Search doctors by specialization | 3 | backend-agent | US-021, US-020 |
| US-010 | Story | Doctor defines recurring weekly availability | 8 | backend-agent | US-020 |
| ↳ US-010-T1 | Task | Design doctor_availability and appointment_slots schema | — | backend-agent | — |
| ↳ US-010-T2 | Task | Implement PUT /me/availability with overlap merge/reject logic | — | backend-agent | — |
| ↳ US-010-T3 | Task | Implement slot generation across weekly working hours | — | backend-agent | — |
| ↳ US-010-T4 | Task | Build doctor availability editor with booking-impact warning | — | frontend-agent | — |

## Sprint 4: Sprint 4

Booking engine: admin availability overrides, real-time slot visibility, and double-booking-safe appointment booking.

Capacity: 20 points · Committed: 18

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-011 | Story | Admin manages doctor availability | 5 | backend-agent | US-010 |
| US-012 | Story | View real-time available slots | 5 | frontend-agent | US-010 |
| US-013 | Story | Book an appointment with double-booking prevention | 8 | backend-agent | US-012, US-006 |
| ↳ US-013-T1 | Task | Implement POST /appointments with locking transaction | — | backend-agent | — |
| ↳ US-013-T2 | Task | Add consent gate before booking | — | backend-agent | — |
| ↳ US-013-T3 | Task | Build booking confirmation flow | — | frontend-agent | — |
| ↳ US-013-T4 | Task | Write concurrent-booking test suite | — | qa-agent | — |

## Sprint 5: Sprint 5

Appointment lifecycle and doctor dashboard: reschedule, cancel, scheduled-appointments view, and health-data encryption baseline.

Capacity: 20 points · Committed: 18

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-014 | Story | Patient reschedules an appointment | 5 | backend-agent | US-013 |
| US-015 | Story | Patient cancels an appointment | 3 | backend-agent | US-013 |
| US-017 | Story | Doctor views scheduled appointments | 5 | frontend-agent | US-013 |
| US-027 | Story | Encryption and protected storage of health data | 5 | security-agent | US-001, US-002 |

## Sprint 6: Sprint 6

Clinical documentation: consultation records, status updates, patient record view, and email provider configuration.

Capacity: 20 points · Committed: 19

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-016 | Story | Patient views own appointments and records | 5 | frontend-agent | US-018 |
| US-018 | Story | Doctor maintains consultation records | 8 | backend-agent | US-013, US-017 |
| ↳ US-018-T1 | Task | Add consultation_records schema | — | backend-agent | — |
| ↳ US-018-T2 | Task | Implement PUT/GET /appointments/{id}/consultation | — | backend-agent | — |
| ↳ US-018-T3 | Task | Build consultation record entry screen | — | frontend-agent | — |
| ↳ US-018-T4 | Task | Enforce treating-doctor/owner-only access | — | security-agent | — |
| US-019 | Story | Doctor updates consultation status | 3 | backend-agent | US-018 |
| US-026 | Story | Email provider configuration | 3 | devops-agent | US-004 |

## Sprint 7: Sprint 7

Admin oversight and audit: appointment reassignment/cancellation across the clinic and the access/audit log.

Capacity: 20 points · Committed: 13

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-023 | Story | Oversee, cancel, and reassign appointments | 8 | backend-agent | US-013, US-010, US-020 |
| ↳ US-023-T1 | Task | Implement GET /admin/appointments with filters | — | backend-agent | — |
| ↳ US-023-T2 | Task | Implement PUT /admin/appointments/{id}/reassign | — | backend-agent | — |
| ↳ US-023-T3 | Task | Build admin appointment oversight screen | — | frontend-agent | — |
| ↳ US-023-T4 | Task | Queue reassignment/cancellation notifications | — | integration-agent | — |
| US-028 | Story | Access and audit logging | 5 | security-agent | US-018, US-013 |

## Sprint 8: Sprint 8

Notifications: background-queued booking/reschedule/cancellation emails and upcoming-appointment reminders.

Capacity: 20 points · Committed: 13

| Key | Type | Title | Points | Role | Depends on |
|---|---|---|---|---|---|
| US-024 | Story | Booking, reschedule, and cancellation emails | 8 | integration-agent | US-013, US-014, US-015 |
| ↳ US-024-T1 | Task | Stand up Celery worker on Redis broker | — | devops-agent | — |
| ↳ US-024-T2 | Task | Implement SendGrid send integration with failure logging | — | integration-agent | — |
| ↳ US-024-T3 | Task | Trigger notification jobs from booking, reschedule, and cancel | — | backend-agent | — |
| ↳ US-024-T4 | Task | Add notification_log schema | — | backend-agent | — |
| US-025 | Story | Upcoming appointment reminder | 5 | integration-agent | US-024 |

## Unscheduled

_Nothing unscheduled._
<!-- sdlc:auto:end sprints -->
