# Planning

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### EPIC-001 · approved · source: planning:EPIC-001

Patients self-register online; doctor and admin accounts are provisioned by the administrator. All roles sign in with email and password, with sessions that are secured and can be ended.

Goal: establish account access and authentication. Assumption stated: patients register themselves while doctor/admin accounts are created internally by the administrator; authentication uses email/password with role-based authorization.

**Related:** US-001, US-002, US-003, US-004

### EPIC-002 · approved · source: planning:EPIC-002

Patients and doctors manage their own profile information; patient consent for health-data handling is captured.

Goal: profile management for patients and doctors plus consent capture. Assumption stated: health-data safeguards follow general best practice rather than a named regulatory regime.

**Related:** US-005, US-006, US-007

### EPIC-003 · approved · source: planning:EPIC-003

Patients find relevant doctors by disease, symptom, or specialization using a predefined, non-AI disease/symptom-to-specialization mapping maintained by the admin.

Goal: doctor search and specialization mapping. Explicitly no AI, LLM, or machine learning is used for matching; resolution is via a static predefined mapping table.

**Related:** US-008, US-009

### EPIC-004 · approved · source: planning:EPIC-004

Doctors define availability as recurring weekly working hours split into fixed-length consultation slots; a booking occupies a whole slot. Admins can also manage availability.

Goal: doctor availability management. Assumption stated: availability is recurring weekly hours divided into fixed-length slots.

**Related:** US-010, US-011

### EPIC-005 · approved · source: planning:EPIC-005

Patients view real-time available slots and book whole-slot in-person appointments, with server-side concurrency control preventing double bookings.

Goal: appointment booking and real-time availability. Consultation fees are handled offline; no online payment functionality is in scope.

**Related:** US-012, US-013

### EPIC-006 · approved · source: planning:EPIC-006

Patients can reschedule or cancel their own upcoming appointments.

Goal: reschedule/cancel flows that free the original slot and reserve a new one under the same concurrency rules used for initial booking.

**Related:** US-014, US-015

### EPIC-007 · approved · source: planning:EPIC-007

Patients have a dashboard to see their upcoming and past appointments and consultation outcomes relevant to them.

Goal: patient booking dashboard for appointment and record visibility.

**Related:** US-016

### EPIC-008 · approved · source: planning:EPIC-008

Doctors view their scheduled appointments, maintain free-text consultation records (notes, diagnosis, optional prescription) tied to appointment and patient, and update consultation statuses.

Goal: doctor appointment dashboard and consultation records. Assumption stated: free-text records only, no HL7/FHIR or lab/imaging integrations.

**Related:** US-017, US-018, US-019

### EPIC-009 · approved · source: planning:EPIC-009

Admin dashboard manages doctor accounts/profiles, specializations, the predefined disease/symptom-to-specialization mapping table, and oversight of all appointments including cancel and reassign.

Goal: administration dashboard. Assumption stated: admin owns and edits the mapping table.

**Related:** US-020, US-021, US-022, US-023

### EPIC-010 · approved · source: planning:EPIC-010

The system sends email notifications for booking confirmation, reschedule, and cancellation, plus a reminder for upcoming appointments, via a transactional email provider configured with an API key.

Goal: email notifications and reminders. Assumption stated: email only; no SMS in the pilot.

**Related:** US-024, US-025, US-026

### EPIC-011 · approved · source: planning:EPIC-011

Health data is protected with general best-practice safeguards: encryption in transit and at rest, role-based access to records, consent capture, and an access/audit log.

Goal: health-data safeguards and audit log. Assumption stated: general best practice is applied because no specific jurisdiction (HIPAA/GDPR/DPDP) was named.

**Related:** US-027, US-028

### SPRINT-1 · approved · source: planning:Sprint 1

Sprint 1 goal: authentication, sessions and role-based account provisioning.

Capacity: 20. Scope: EPIC-001 and its stories US-001 (patient self-registration, 5 pts), US-002 (sign in/sign out, 5 pts), US-003 (admin provisions doctor/admin accounts, 3 pts), US-004 (role-based access enforcement, 5 pts). Input marks this sprint's goal as "(delivered)".

**Related:** EPIC-001, US-001, US-002, US-003, US-004

### SPRINT-2 · approved · source: planning:Sprint 2

Sprint 2 goal: patient/doctor profile management, consent capture, and admin reference data (doctors, specializations, disease mappings).

Capacity: 20. Scope: EPIC-002 stories US-005 (patient profile, 3 pts), US-006 (consent capture, 3 pts), US-007 (doctor profile, 3 pts); plus admin reference-data stories from EPIC-009: US-020 (manage doctor accounts/profiles, 5 pts), US-021 (manage specializations, 3 pts), US-022 (maintain disease/symptom-to-specialization mapping, 5 pts).

**Related:** EPIC-002, US-005, US-006, US-007, US-020, US-021, US-022

### SPRINT-3 · approved · source: planning:Sprint 3

Sprint 3 goal: doctor search by disease/symptom/specialization and doctor weekly availability setup.

Capacity: 20. Scope: EPIC-003 stories US-008 (search by disease/symptom mapping, 5 pts), US-009 (search by specialization, 3 pts); EPIC-004 stories US-010 (doctor recurring weekly availability, 8 pts, with tasks: add doctor_availability schema/migration, implement slot-generation logic, implement PUT /me/availability endpoint with booking-impact warning, build doctor availability management UI) and US-011 (admin manages doctor availability, 5 pts).

**Related:** EPIC-003, EPIC-004, US-008, US-009, US-010, US-010-T1, US-010-T2, US-010-T3, US-010-T4, US-011

### SPRINT-4 · approved · source: planning:Sprint 4

Sprint 4 goal: real-time slot visibility and concurrency-safe appointment booking.

Capacity: 20. Scope: EPIC-005 stories US-012 (view real-time available slots, 5 pts) and US-013 (book appointment with double-booking prevention, 8 pts, with tasks: add appointments schema and row-level locking transaction, implement POST /appointments booking endpoint, enforce consent check before booking, build booking confirmation UI flow).

**Related:** EPIC-005, US-012, US-013, US-013-T1, US-013-T2, US-013-T3, US-013-T4

### SPRINT-5 · approved · source: planning:Sprint 5

Sprint 5 goal: reschedule/cancel appointments, doctor appointment dashboard, and health-data encryption safeguards.

Capacity: 20. Scope: EPIC-006 stories US-014 (patient reschedules, 5 pts), US-015 (patient cancels, 3 pts); EPIC-008 story US-017 (doctor views scheduled appointments, 5 pts); EPIC-011 story US-027 (encryption and protected storage of health data, 5 pts).

**Related:** EPIC-006, EPIC-008, EPIC-011, US-014, US-015, US-017, US-027

### SPRINT-6 · approved · source: planning:Sprint 6

Sprint 6 goal: patient dashboard, consultation records and status updates, email provider configuration.

Capacity: 20. Scope: EPIC-007 story US-016 (patient views own appointments/records, 5 pts); EPIC-008 stories US-018 (doctor maintains consultation records, 8 pts, with tasks: add consultation_records schema/migration, implement consultation record endpoints with treating-doctor access control, add audit logging for consultation record view/edit, build doctor consultation record entry UI) and US-019 (doctor updates consultation status, 3 pts); EPIC-010 story US-026 (email provider configuration, 3 pts).

**Related:** EPIC-007, EPIC-008, EPIC-010, US-016, US-018, US-018-T1, US-018-T2, US-018-T3, US-018-T4, US-019, US-026

### SPRINT-7 · approved · source: planning:Sprint 7

Sprint 7 goal: admin appointment oversight/reassignment and access audit logging.

Capacity: 20. Scope: EPIC-009 story US-023 (oversee, cancel, and reassign appointments, 8 pts, with tasks: implement GET /admin/appointments with filters, implement concurrency-safe reassignment endpoint, wire cancellation/reassignment notifications, build admin appointments oversight UI); EPIC-011 story US-028 (access and audit logging, 5 pts).

**Related:** EPIC-009, EPIC-011, US-023, US-023-T1, US-023-T2, US-023-T3, US-023-T4, US-028

### SPRINT-8 · approved · source: planning:Sprint 8

Sprint 8 goal: background-queued booking/reschedule/cancellation emails and upcoming-appointment reminders.

Capacity: 20. Scope: EPIC-010 stories US-024 (booking/reschedule/cancellation emails, 8 pts, with tasks: implement Celery notification tasks, integrate SendGrid with failure logging, enqueue notification jobs from booking/reschedule/cancel endpoints, add admin surface for failed notifications) and US-025 (upcoming appointment reminder, 5 pts).

**Related:** EPIC-010, US-024, US-024-T1, US-024-T2, US-024-T3, US-024-T4, US-025
<!-- sdlc:auto:end narrative -->
