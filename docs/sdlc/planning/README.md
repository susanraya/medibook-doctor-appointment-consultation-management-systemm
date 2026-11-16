# Planning

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
### EPIC-001 · approved · source: planning:EPIC-001

Account access and authentication: patients self-register, doctor/admin accounts are provisioned by the administrator, and all roles sign in with email/password under secured, endable sessions.

Assumption: patients register themselves while doctor/admin accounts are created internally by the administrator; email/password authentication with role-based authorization.

**Related:** US-001, US-002, US-003, US-004

### EPIC-002 · approved · source: planning:EPIC-002

Profile management: patients and doctors manage their own profile information, and patient consent for health-data handling is captured.

Assumption: health-data safeguards follow general best practice rather than a named regulatory regime.

**Related:** US-005, US-006, US-007

### EPIC-003 · approved · source: planning:EPIC-003

Doctor search and specialization mapping: patients find relevant doctors by disease, symptom, or specialization using a predefined, non-AI mapping maintained by the admin.

No AI/ML is used for matching; mapping is a static lookup table.

**Related:** US-008, US-009

### EPIC-004 · approved · source: planning:EPIC-004

Doctor availability management: doctors define recurring weekly working hours split into fixed-length slots; a booking occupies a whole slot; admins can also manage availability.

Assumption: availability is recurring weekly hours divided into fixed-length slots.

**Related:** US-010, US-011

### EPIC-005 · approved · source: planning:EPIC-005

Appointment booking and real-time availability: patients view real-time available slots and book whole-slot in-person appointments, with server-side concurrency control preventing double bookings.

Consultation fees are handled offline; no online payment in scope.

**Related:** US-012, US-013

### EPIC-006 · approved · source: planning:EPIC-006

Reschedule and cancel appointments: patients can reschedule or cancel their own upcoming appointments, freeing the original slot and reserving the new one under the same concurrency rules.

**Related:** US-014, US-015

### EPIC-007 · approved · source: planning:EPIC-007

Patient booking dashboard: patients have a dashboard to see their upcoming and past appointments and the consultation outcomes relevant to them.

**Related:** US-016

### EPIC-008 · approved · source: planning:EPIC-008

Doctor appointment dashboard and consultation records: doctors view scheduled appointments, maintain free-text consultation records tied to appointment and patient, and update consultation statuses.

Assumption: free-text records only, no HL7/FHIR or lab/imaging integrations.

**Related:** US-017, US-018, US-019

### EPIC-009 · approved · source: planning:EPIC-009

Administration dashboard: manages doctor accounts/profiles, specializations, the predefined disease/symptom-to-specialization mapping table, and oversight of all appointments including cancel and reassign.

Assumption: admin owns and edits the mapping table.

**Related:** US-020, US-021, US-022, US-023

### EPIC-010 · approved · source: planning:EPIC-010

Email notifications and reminders: the system sends booking confirmation, reschedule, cancellation, and upcoming-appointment reminder emails via a transactional provider configured with an API key.

Assumption: email only; no SMS in the pilot.

**Related:** US-024, US-025, US-026

### EPIC-011 · approved · source: planning:EPIC-011

Health-data safeguards and audit log: health data is protected with general best-practice safeguards -- encryption in transit and at rest, role-based access to records, consent capture, and an access/audit log.

Assumption: general best practice is applied because no specific jurisdiction (HIPAA/GDPR/DPDP) was named.

**Related:** US-027, US-028
<!-- sdlc:auto:end narrative -->
