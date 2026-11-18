# Planning

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### EPIC-001 · approved · source: planning:EPIC-001

Covers account access: patients self-register online while doctor and admin accounts are provisioned by the administrator; all roles sign in with email/password and sessions can be ended securely.

Goal: establish authentication and authorization foundation. Assumption stated in input: patients register themselves while doctor/admin accounts are created internally by the administrator; email/password authentication with role-based authorization.

**Related:** US-001, US-002, US-003, US-004

### EPIC-002 · approved · source: planning:EPIC-002

Covers patients and doctors managing their own profile information, plus capturing patient consent for health-data handling.

Goal: let patients and doctors maintain accurate self-service profiles and ensure patient consent is captured before health data is processed. Assumption stated in input: health-data safeguards follow general best practice rather than a named regulatory regime.

**Related:** US-005, US-006, US-007

### EPIC-003 · approved · source: planning:EPIC-003

Covers patients finding relevant doctors by disease, symptom, or specialization using a predefined, non-AI mapping maintained by the admin.

Goal: resolve disease/symptom searches to specializations via a static, admin-maintained lookup table, and allow direct browsing by specialization. No AI/ML is used for matching.

**Related:** US-008, US-009

### EPIC-004 · approved · source: planning:EPIC-004

Covers doctors defining recurring weekly availability split into fixed-length consultation slots, with admin override capability.

Goal: let doctors set recurring weekly working hours divided into fixed-length slots that patients can book whole, and let admins adjust any doctor's availability for leave, closures, or corrections. Assumption stated in input: availability is recurring weekly hours divided into fixed-length slots.

**Related:** US-010, US-011

### EPIC-005 · approved · source: planning:EPIC-005

Covers real-time visibility of available slots and whole-slot in-person appointment booking with server-side double-booking prevention.

Goal: show patients only currently free future slots and let them book a whole slot with concurrency control so simultaneous bookings cannot collide. Consultation fees are handled offline; no online payment.

**Related:** US-012, US-013

### EPIC-006 · approved · source: planning:EPIC-006

Covers patients rescheduling or cancelling their own upcoming appointments.

Goal: let patients move an upcoming appointment to another available slot (freeing the original and reserving the new one under the same concurrency rules) or cancel it outright, freeing the slot for others.

**Related:** US-014, US-015

### EPIC-007 · approved · source: planning:EPIC-007

Covers the patient-facing dashboard listing upcoming/past appointments and the patient's own consultation records.

Goal: give patients a single place to track their care, showing upcoming and past appointments plus their own consultation outcomes.

**Related:** US-016

### EPIC-008 · approved · source: planning:EPIC-008

Covers the doctor-facing appointment dashboard, free-text consultation record keeping, and consultation status updates.

Goal: let doctors view their scheduled appointments, record free-text clinical notes/diagnosis/optional prescription tied to an appointment and patient, and update consultation status through its lifecycle. Assumption stated in input: free-text records only, no HL7/FHIR or lab/imaging integrations.

**Related:** US-017, US-018, US-019

### EPIC-009 · approved · source: planning:EPIC-009

Covers the admin dashboard: managing doctor accounts/profiles, specializations, the disease/symptom-to-specialization mapping table, and oversight (including cancel/reassign) of all appointments.

Goal: give administrators full control of the clinic's staff roster, specialization list, the static mapping table patients search against, and cross-doctor appointment oversight. Assumption stated in input: admin owns and edits the mapping table.

**Related:** US-020, US-021, US-022, US-023

### EPIC-010 · approved · source: planning:EPIC-010

Covers email notifications for booking confirmation, reschedule, cancellation, and upcoming-appointment reminders via a transactional email provider.

Goal: notify patients by email on booking changes and remind them ahead of upcoming appointments, with the provider configured via an admin-entered API key. Assumption stated in input: email only, no SMS in the pilot.

**Related:** US-024, US-025, US-026

### EPIC-011 · approved · source: planning:EPIC-011

Covers general best-practice protection of health data (encryption, hashed credentials, role-based record access, consent) and an access/audit log.

Goal: protect patient health data and credentials and provide an audit trail of who accessed or changed consultation records and appointments. Assumption stated in input: general best practice is applied because no specific jurisdiction (HIPAA/GDPR/DPDP) was named.

**Related:** US-027, US-028

### SPRINT-1 · approved · source: planning:Sprint 1

Sprint 1 builds the authentication and role-based access foundation.

Goal: 'Authentication and role-based access foundation: patient self-registration, sign-in/out, admin-provisioned staff accounts, and RBAC enforcement.' Capacity: 20 points. Covers US-001 (patient self-registration), US-002 (sign in/out), US-003 (admin-provisioned doctor/admin accounts), and US-004 (role-based access enforcement).

**Related:** EPIC-001, US-001, US-002, US-003, US-004

### SPRINT-2 · approved · source: planning:Sprint 2

Sprint 2 covers profile management, patient consent capture, and admin setup of doctor accounts, specializations, and the disease-mapping table.

Goal: 'Profile management, consent capture, and admin setup of doctor accounts, specializations and the disease-mapping table.' Capacity: 20 points. Covers US-005 (patient profile), US-006 (consent capture), US-007 (doctor profile), and the admin setup stories named in the goal: US-020 (manage doctor accounts/profiles), US-021 (manage specializations), US-022 (maintain disease/symptom-to-specialization mapping).

**Related:** EPIC-002, US-005, US-006, US-007, US-020, US-021, US-022

### SPRINT-3 · approved · source: planning:Sprint 3

Sprint 3 delivers doctor search (by disease/symptom and by specialization) and doctor-defined recurring weekly availability with slot generation.

Goal: 'Doctor search (by disease/symptom and by specialization) and doctor-defined recurring weekly availability/slot generation.' Capacity: 20 points. Covers US-008 (search by disease/symptom via mapping), US-009 (search by specialization), and US-010 (doctor defines recurring weekly availability), including its tasks for slot generation, overlap validation, availability UI, and booking-impact warnings.

**Related:** EPIC-003, EPIC-004, US-008, US-009, US-010

### SPRINT-4 · approved · source: planning:Sprint 4

Sprint 4 delivers real-time slot visibility, admin availability overrides, and core appointment booking with double-booking prevention.

Goal: 'Real-time slot visibility, admin availability overrides, and core appointment booking with server-side double-booking prevention.' Capacity: 20 points. Covers US-011 (admin manages doctor availability), US-012 (view real-time available slots), and US-013 (book an appointment with double-booking prevention), including its row-level-locking endpoint, consent gate, booking confirmation UI, and concurrency test suite tasks.

**Related:** EPIC-005, US-011, US-012, US-013

### SPRINT-5 · approved · source: planning:Sprint 5

Sprint 5 delivers appointment reschedule/cancel, the doctor appointment dashboard, and health-data encryption safeguards.

Goal: 'Reschedule and cancel appointments, doctor appointment dashboard, and health-data encryption safeguards.' Capacity: 20 points. Covers US-014 (patient reschedules), US-015 (patient cancels), US-017 (doctor views scheduled appointments), and US-027 (encryption and protected storage of health data).

**Related:** EPIC-006, EPIC-011, US-014, US-015, US-017, US-027

### SPRINT-6 · approved · source: planning:Sprint 6

Sprint 6 delivers consultation records and status updates, the patient booking dashboard, and email provider configuration.

Goal: 'Consultation records and status updates, patient booking dashboard, and email provider configuration.' Capacity: 20 points. Covers US-016 (patient dashboard), US-018 (doctor maintains consultation records, including schema, access-controlled endpoints, entry UI, and audit-logging-hook tasks), US-019 (doctor updates consultation status), and US-026 (email provider configuration).

**Related:** EPIC-007, EPIC-008, EPIC-010, US-016, US-018, US-019, US-026

### SPRINT-7 · approved · source: planning:Sprint 7

Sprint 7 delivers admin oversight/cancellation/reassignment of appointments and audit logging.

Goal: 'Admin oversight, cancellation and reassignment of appointments, and audit logging.' Capacity: 20 points. Covers US-023 (oversee, cancel, and reassign appointments, including its oversight endpoint, reassign endpoint reusing double-booking logic, oversight/reassignment UI, and notification-wiring tasks) and US-028 (access and audit logging).

**Related:** EPIC-009, EPIC-011, US-023, US-028

### SPRINT-8 · approved · source: planning:Sprint 8

Sprint 8 delivers transactional booking/reschedule/cancellation emails and upcoming-appointment reminders via a background queue.

Goal: 'Transactional booking/reschedule/cancellation emails and upcoming-appointment reminders via background queue.' Capacity: 20 points. Covers US-024 (booking/reschedule/cancellation emails, including notification queue jobs, SendGrid template integration, notification_log persistence with retry, and QA tests for email-outage resilience) and US-025 (upcoming appointment reminder).

**Related:** EPIC-010, US-024, US-025
<!-- sdlc:auto:end narrative -->
