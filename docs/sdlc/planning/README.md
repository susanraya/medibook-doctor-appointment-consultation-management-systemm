# Planning

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### EPIC-001 · approved · source: planning:EPIC-001

Covers patient self-registration, sign-in/sign-out for all roles, admin provisioning of doctor/admin accounts, and enforcement of role-based access boundaries.

Goal: patients self-register online; doctor and admin accounts are provisioned by the administrator. All roles sign in with email and password, and sessions are secured and can be ended. Assumption: patients register themselves while doctor/admin accounts are created internally by the administrator; email/password authentication with role-based authorization.

**Related:** US-001, US-002, US-003, US-004

### EPIC-002 · approved · source: planning:EPIC-002

Covers self-service profile management for patients and doctors, plus capture of patient consent for health-data handling.

Goal: patients and doctors manage their own profile information; patient consent for health-data handling is captured. Assumption: health-data safeguards follow general best practice rather than a named regime.

**Related:** US-005, US-006, US-007

### EPIC-003 · approved · source: planning:EPIC-003

Covers patient discovery of doctors by disease/symptom (via predefined mapping) or directly by specialization.

Goal: patients find relevant doctors by disease, symptom, or specialization using a predefined, non-AI disease/symptom-to-specialization mapping maintained by the admin. No AI/ML is used for matching.

**Related:** US-008, US-009

### EPIC-004 · approved · source: planning:EPIC-004

Covers doctor-defined recurring weekly availability split into fixed-length slots, and admin ability to override that availability.

Goal: doctors define availability as recurring weekly working hours split into fixed-length consultation slots; a booking occupies a whole slot. Admins can also manage availability. Assumption: availability is recurring weekly hours divided into fixed-length slots.

**Related:** US-010, US-011

### EPIC-005 · approved · source: planning:EPIC-005

Covers real-time visibility of available slots and whole-slot appointment booking with concurrency-safe double-booking prevention.

Goal: patients view real-time available slots and book whole-slot in-person appointments. Server-side concurrency control prevents double bookings. Consultation fees are handled offline; no online payment.

**Related:** US-012, US-013

### EPIC-006 · approved · source: planning:EPIC-006

Covers patients rescheduling or cancelling their own upcoming appointments.

Goal: patients can reschedule or cancel their own upcoming appointments, freeing the original slot and reserving the new one under the same concurrency rules.

**Related:** US-014, US-015

### EPIC-007 · approved · source: planning:EPIC-007

Covers a patient-facing dashboard of upcoming/past appointments and consultation outcomes.

Goal: patients have a dashboard to see their upcoming and past appointments and consultation outcomes relevant to them.

**Related:** US-016

### EPIC-008 · approved · source: planning:EPIC-008

Covers the doctor's scheduled-appointments dashboard, free-text consultation record keeping, and consultation status updates.

Goal: doctors view their scheduled appointments, maintain free-text consultation records (notes, diagnosis, optional prescription) tied to appointment and patient, and update consultation statuses. Assumption: free-text records only, no HL7/FHIR or lab/imaging integrations.

**Related:** US-017, US-018, US-019

### EPIC-009 · approved · source: planning:EPIC-009

Covers the admin dashboard for managing doctor accounts, specializations, the disease/symptom-to-specialization mapping table, and oversight of all appointments.

Goal: admin dashboard manages doctor accounts/profiles, specializations, the predefined disease/symptom-to-specialization mapping table, and oversight of all appointments including cancel and reassign. Assumption: admin owns and edits the mapping table.

**Related:** US-020, US-021, US-022, US-023

### EPIC-010 · approved · source: planning:EPIC-010

Covers email notifications for booking/reschedule/cancellation, upcoming-appointment reminders, and admin configuration of the email provider.

Goal: the system sends email notifications for booking confirmation, reschedule, and cancellation, plus a reminder for upcoming appointments, via a transactional email provider configured with an API key. Assumption: email only; no SMS in the pilot.

**Related:** US-024, US-025, US-026

### EPIC-011 · approved · source: planning:EPIC-011

Covers general best-practice safeguards for health data (encryption, hashed credentials, role-based record access) and an access/audit log.

Goal: health data is protected with general best-practice safeguards: encryption in transit and at rest, role-based access to records, consent capture, and an access/audit log. Assumption: general best practice is applied because no specific jurisdiction (HIPAA/GDPR/DPDP) was named.

**Related:** US-027, US-028

### SPRINT-1 · approved · source: planning:Sprint 1

Sprint 1 builds the authentication foundation: patient self-registration, sign in/out for all roles, admin-provisioned staff accounts, and role-based access enforcement.

Goal: Authentication foundation: patient self-registration, sign in/out, admin-provisioned staff accounts, role-based access enforcement. Capacity: 20 points. Plan items: US-001 Patient self-registration (story, 5 pts, backend-agent); US-002 Sign in and sign out (story, 5 pts, backend-agent); US-003 Administrator provisions doctor and admin accounts (story, 3 pts, backend-agent); US-004 Role-based access enforcement (story, 5 pts, security-agent). Points planned: 18 of 20 capacity.

**Related:** EPIC-001, US-001, US-002, US-003, US-004

### SPRINT-2 · approved · source: planning:Sprint 2

Sprint 2 builds admin reference data (doctor accounts, specializations, disease mapping) and self-service patient profile/consent capture.

Goal: Admin reference data and self-service profiles: doctor accounts, specializations, disease mapping, patient profile and consent capture. Capacity: 20 points. Plan items: US-020 Manage doctor accounts and profiles (story, 5 pts, backend-agent); US-021 Manage specializations (story, 3 pts, backend-agent); US-022 Maintain disease/symptom-to-specialization mapping (story, 5 pts, backend-agent); US-005 Patient manages own profile (story, 3 pts, frontend-agent); US-006 Patient consent capture (story, 3 pts, backend-agent). Points planned: 19 of 20 capacity.

**Related:** EPIC-002, EPIC-009, US-020, US-021, US-022, US-005, US-006

### SPRINT-3 · approved · source: planning:Sprint 3

Sprint 3 builds doctor discoverability: doctor profile management, disease/symptom and specialization search, and recurring weekly availability.

Goal: Doctor discoverability: doctor profile management, search by disease/symptom and by specialization, recurring weekly availability. Capacity: 20 points. Plan items: US-007 Doctor manages own profile (story, 3 pts, frontend-agent); US-008 Search doctors by disease or symptom via mapping (story, 5 pts, backend-agent); US-009 Search doctors by specialization (story, 3 pts, backend-agent); US-010 Doctor defines recurring weekly availability (story, 8 pts, backend-agent) with tasks US-010-T1 Design doctor_availability and appointment_slots schema (backend-agent), US-010-T2 Implement PUT /me/availability with overlap merge/reject logic (backend-agent), US-010-T3 Implement slot generation across weekly working hours (backend-agent), US-010-T4 Build doctor availability editor with booking-impact warning (frontend-agent). Points planned: 19 of 20 capacity.

**Related:** EPIC-002, EPIC-003, EPIC-004, US-007, US-008, US-009, US-010, US-010-T1, US-010-T2, US-010-T3, US-010-T4

### SPRINT-4 · approved · source: planning:Sprint 4

Sprint 4 builds the booking engine: admin availability overrides, real-time slot visibility, and double-booking-safe appointment booking.

Goal: Booking engine: admin availability overrides, real-time slot visibility, and double-booking-safe appointment booking. Capacity: 20 points. Plan items: US-011 Admin manages doctor availability (story, 5 pts, backend-agent); US-012 View real-time available slots (story, 5 pts, frontend-agent); US-013 Book an appointment with double-booking prevention (story, 8 pts, backend-agent) with tasks US-013-T1 Implement POST /appointments with locking transaction (backend-agent), US-013-T2 Add consent gate before booking (backend-agent), US-013-T3 Build booking confirmation flow (frontend-agent), US-013-T4 Write concurrent-booking test suite (qa-agent). Points planned: 18 of 20 capacity.

**Related:** EPIC-004, EPIC-005, US-011, US-012, US-013, US-013-T1, US-013-T2, US-013-T3, US-013-T4

### SPRINT-5 · approved · source: planning:Sprint 5

Sprint 5 builds the appointment lifecycle (reschedule, cancel), the doctor's scheduled-appointments dashboard, and the health-data encryption baseline.

Goal: Appointment lifecycle and doctor dashboard: reschedule, cancel, scheduled-appointments view, and health-data encryption baseline. Capacity: 20 points. Plan items: US-014 Patient reschedules an appointment (story, 5 pts, backend-agent); US-015 Patient cancels an appointment (story, 3 pts, backend-agent); US-017 Doctor views scheduled appointments (story, 5 pts, frontend-agent); US-027 Encryption and protected storage of health data (story, 5 pts, security-agent). Points planned: 18 of 20 capacity.

**Related:** EPIC-006, EPIC-008, EPIC-011, US-014, US-015, US-017, US-027

### SPRINT-6 · approved · source: planning:Sprint 6

Sprint 6 builds clinical documentation (consultation records, status updates), the patient's own-record view, and email provider configuration.

Goal: Clinical documentation: consultation records, status updates, patient record view, and email provider configuration. Capacity: 20 points. Plan items: US-018 Doctor maintains consultation records (story, 8 pts, backend-agent) with tasks US-018-T1 Add consultation_records schema (backend-agent), US-018-T2 Implement PUT/GET /appointments/{id}/consultation (backend-agent), US-018-T3 Build consultation record entry screen (frontend-agent), US-018-T4 Enforce treating-doctor/owner-only access (security-agent); US-019 Doctor updates consultation status (story, 3 pts, backend-agent); US-016 Patient views own appointments and records (story, 5 pts, frontend-agent); US-026 Email provider configuration (story, 3 pts, devops-agent). Points planned: 19 of 20 capacity.

**Related:** EPIC-007, EPIC-008, EPIC-010, US-018, US-018-T1, US-018-T2, US-018-T3, US-018-T4, US-019, US-016, US-026

### SPRINT-7 · approved · source: planning:Sprint 7

Sprint 7 builds admin oversight of all appointments (reassignment/cancellation) and the access/audit log.

Goal: Admin oversight and audit: appointment reassignment/cancellation across the clinic and the access/audit log. Capacity: 20 points. Plan items: US-023 Oversee, cancel, and reassign appointments (story, 8 pts, backend-agent) with tasks US-023-T1 Implement GET /admin/appointments with filters (backend-agent), US-023-T2 Implement PUT /admin/appointments/{id}/reassign (backend-agent), US-023-T3 Build admin appointment oversight screen (frontend-agent), US-023-T4 Queue reassignment/cancellation notifications (integration-agent); US-028 Access and audit logging (story, 5 pts, security-agent). Points planned: 13 of 20 capacity.

**Related:** EPIC-009, EPIC-011, US-023, US-023-T1, US-023-T2, US-023-T3, US-023-T4, US-028

### SPRINT-8 · approved · source: planning:Sprint 8

Sprint 8 builds background-queued notifications: booking/reschedule/cancellation emails and upcoming-appointment reminders.

Goal: Notifications: background-queued booking/reschedule/cancellation emails and upcoming-appointment reminders. Capacity: 20 points. Plan items: US-024 Booking, reschedule, and cancellation emails (story, 8 pts, integration-agent) with tasks US-024-T1 Stand up Celery worker on Redis broker (devops-agent), US-024-T2 Implement SendGrid send integration with failure logging (integration-agent), US-024-T3 Trigger notification jobs from booking, reschedule, and cancel (backend-agent), US-024-T4 Add notification_log schema (backend-agent); US-025 Upcoming appointment reminder (story, 5 pts, integration-agent). Points planned: 13 of 20 capacity.

**Related:** EPIC-010, US-024, US-024-T1, US-024-T2, US-024-T3, US-024-T4, US-025
<!-- sdlc:auto:end narrative -->
