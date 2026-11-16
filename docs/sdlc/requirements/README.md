# Product Requirements

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start narrative -->
## Summary

### REQ-TECHSTACK · approved · source: requirements:technology-stack

Product owner approved an exact technology stack: FastAPI backend, PostgreSQL database, React frontend, hosted on AWS.

- Backend: FastAPI 0.115 -- chosen for clean server-side API/role-based access logic and natural pairing with PostgreSQL locking to guard against double bookings.
- Database: PostgreSQL 16 -- provides transactional integrity and row-level locking needed so a slot is booked exactly once, plus encryption at rest and storage for doctors, specializations, disease-to-specialization mapping, and consultation records.
- Frontend: React 19 -- single responsive codebase serving patients (mobile), doctors, and admins with distinct interactive screens; satisfies the no-native-app decision.
- Cloud: AWS -- single account covering managed PostgreSQL, app hosting, email, and background jobs with encryption/backups/audit-friendly access, scalable beyond the pilot.
Design must use exactly this stack; no substitutions.

### REQ-SERVICES · approved · source: requirements:services

Two runtime services were approved: SendGrid for transactional email and Redis as a background job queue.

- Email: SendGrid (SaaS, env var SENDGRID_API_KEY) -- sends confirmation, reschedule, cancellation and reminder emails reliably.
- Queue: Redis (container redis:7-alpine, used as a queue) -- background worker queue so appointment reminders and emails are scheduled/sent without blocking a patient's booking action.
Required API keys/secrets: REDIS_URL, SENDGRID_API_KEY (SendGrid key stored as a secret, never shown in plain text).

### REQ-SCOPE · approved · source: requirements:scope

Defines what MediBook will and will not build for this lightweight-delivery, version-1 release.

In scope: patient self-registration/sign-in; doctor search by disease, symptom or specialization; disease/symptom-to-specialization mapping lookup; doctor availability as recurring weekly fixed-length slots; real-time view of available slots; appointment booking with server-side double-booking prevention; reschedule and cancel appointments; doctor view of scheduled appointments; consultation records (notes, diagnosis, optional prescription); consultation status updates; patient and doctor profile management; booking dashboards for patient and doctor; whole-slot bookings from recurring weekly hours; free-text consultation records only (no HL7/FHIR or lab/imaging); consultation fees handled offline (no online payments).
Out of scope: AI/LLM/machine-learning features such as automated symptom diagnosis (mapping is predefined/static only); telehealth or video/audio consultation delivery (in-person only); a native iOS/Android app (responsive web app instead).

### REQ-FEAT-SIGNIN · approved · source: requirements:feature-group:Sign-in & accounts

Covers patient self-registration, sign-in/sign-out, and admin provisioning of doctor/admin accounts.

- Patient self-registration: prospective patients register with valid email, phone and password; rejected with field-specific feedback if the email is already in use or a required field is missing/invalid; on success the account is created and the patient is signed in or prompted to sign in.
- Sign in and sign out: patients, doctors and admins sign in with email/password and land on their role's dashboard; sign-out ends the session; an inactive session expires and requires signing in again.
- Administrator provisions staff accounts: admin creates doctor/admin accounts with required details and chosen role (not self-registered); staff sign in with credentials set at first login.

### REQ-FEAT-PROFILES · approved · source: requirements:feature-group:Profiles & consent

Covers patient and doctor profile management and mandatory health-data consent capture.

- Patient profile management: signed-in patient views/updates name, contact email and phone used for future notifications; changing email to one already used by another account is rejected with a clear message.
- Health-data consent capture: a new patient must consent to the clinic storing/processing their health data before first booking an appointment or saving consultation-related data; cannot proceed until accepted; consent is stored with a timestamp.
- Doctor profile management: signed-in doctor views/maintains professional profile (name, bio, contact details) visible to patients searching; specialization can only be chosen from the list defined by the administrator.

### REQ-FEAT-SEARCH · approved · source: requirements:feature-group:Finding a doctor

Covers patient search for doctors by disease/symptom via static mapping, and by specialization directly.

- Search doctors by disease or symptom: patient enters a disease/symptom; system resolves it to matching specialization(s) using only the predefined static mapping table (no AI) and lists doctors in those specializations; if no mapping exists, patient is told so and offered the option to browse by specialization instead.
- Browse doctors by specialization: patient selects a specialization and sees active doctors assigned to it; an empty-result message (not an error) is shown when a specialization has no active doctors.

### REQ-FEAT-AVAILABILITY · approved · source: requirements:feature-group:Availability & slots

Covers doctors setting recurring weekly availability/slots and admin overriding or blocking out availability.

- Doctor sets weekly availability: doctor defines recurring weekly working hours and a slot length; system generates fixed-length bookable slots across those hours; overlapping ranges on the same day are merged or rejected to avoid duplicate slots; doctor is warned before a change affects an existing booking.
- Admin manages doctor availability: admin adjusts any doctor's recurring availability or blocks out time ranges for leave, closures or corrections; if a blocked range contains booked appointments, admin is warned about the affected appointments before confirming.

### REQ-FEAT-BOOKING · approved · source: requirements:feature-group:Booking & changes

Covers real-time slot visibility, booking with double-booking prevention, reschedule/cancel, and related emails/reminders.

- Real-time slot availability: patient sees only unbooked future slots for a doctor; a slot taken by someone else disappears on refresh or booking attempt.
- Book appointment with double-booking prevention: a consenting patient books an available whole slot for an in-person consultation and receives confirmation; server-side concurrency control ensures only one of two simultaneous submissions for the same slot succeeds, the other is told it is no longer available; no online payment is requested (fees handled offline).
- Reschedule an appointment: patient moves an upcoming appointment to another available future slot; original slot released, new slot reserved under the same double-booking rules; if the new slot is taken concurrently, the reschedule fails and the original appointment is retained.
- Cancel an appointment: patient cancels an upcoming appointment, marking it cancelled and freeing its slot; cancelling a completed or past appointment is not permitted.
- Booking, reschedule and cancellation emails: system emails the patient's registered address with appointment details whenever a booking is confirmed, rescheduled or cancelled, whether changed by the patient or an administrator.
- Upcoming appointment reminder: system emails a reminder with appointment details once the configured reminder lead time is reached; no reminder is sent if the appointment was cancelled before the reminder was due.

### REQ-FEAT-PATIENTDASH · approved · source: requirements:feature-group:Patient dashboard

Covers the patient's dashboard of upcoming/past appointments and their own consultation records.

- Patient booking dashboard: signed-in patient sees upcoming and past appointments with doctor, specialization, date/time and status; for a past appointment they can open their own consultation record (notes, diagnosis, any prescription) but not other patients' records.

### REQ-FEAT-DOCTORWORKSPACE · approved · source: requirements:feature-group:Doctor workspace

Covers the doctor's appointment dashboard, consultation record keeping, and consultation status updates.

- Doctor appointment dashboard: signed-in doctor sees scheduled appointments with patient name, date/time, slot and current status; an empty-state message is shown when there are no appointments in the selected period.
- Maintain consultation records: treating doctor records free-text clinical notes, a diagnosis and an optional prescription for an appointment, stored against that appointment and patient; only free-text fields are captured, no lab/imaging/structured-record integrations; a doctor who is not the treating doctor is denied access.
- Update consultation status: treating doctor updates status (e.g. scheduled, completed, no-show); new status appears on both doctor's and patient's dashboards; invalid transitions (e.g. completing a cancelled appointment) are rejected.

### REQ-FEAT-ADMIN · approved · source: requirements:feature-group:Admin & settings

Covers admin management of doctors, specializations, the disease-to-specialization mapping, appointment oversight, audit log and email provider configuration.

- Manage doctor accounts and profiles: admin creates, edits, deactivates and reactivates doctor accounts/profiles; a deactivated doctor no longer appears in patient search and cannot sign in, and existing appointments are flagged for reassignment or cancellation.
- Manage specializations: admin adds, renames and removes specializations, reflected everywhere specializations are selected; deleting one assigned to doctors or used in the mapping table warns about dependencies before being allowed or blocked.
- Maintain disease-to-specialization mapping: admin owns/edits the predefined mapping table linking a disease/symptom to one or more specializations; changes are used immediately by patient search; mapping to a non-existent specialization is rejected until a valid one is chosen.
- Oversee, cancel and reassign appointments: admin views all appointments across doctors with filters by doctor, patient, date and status; can cancel or reassign (same double-booking rules apply, freeing original slot and reserving new one); affected parties are notified.
- Access and audit log: admin reviews who viewed or modified consultation records and appointments, with user, action, affected record and timestamp per entry.
- Configure email provider: admin enters the transactional email provider API key; stored securely as a secret, never displayed in plain text; a missing or invalid key causes send failures to be logged and surfaced to the administrator.

### NFR-001 · approved · source: requirements:NFR-001

Security: passwords must be stored only in hashed form, never plain text.

Applies to patients, doctors and admins, both at account creation and when a password is changed.

### NFR-002 · approved · source: requirements:NFR-002

Security: sessions must end on sign-out, expire after configured inactivity, and end immediately on account deactivation.

A signed-in session must end when the user signs out, be treated as expired after the configured inactivity period (requiring re-sign-in), and be ended immediately when the account is deactivated.

### NFR-003 · approved · source: requirements:NFR-003

Security: sign-in failures show one generic message that does not reveal whether email or password was wrong.

When sign-in fails, the user must see a single generic failure message, not a field-specific one.

### NFR-004 · approved · source: requirements:NFR-004

Security: role boundaries must be enforced on both pages and the API.

Each user must only reach the pages, actions and data permitted for their role; attempts by a patient, doctor or deactivated user to reach features outside their role must be denied on both the web pages and the server.

### NFR-005 · approved · source: requirements:NFR-005

Privacy: consultation records are visible only to their owning patient, the treating doctor, and administrators.

Any other doctor or patient attempting to open a consultation record must be denied.

### NFR-006 · approved · source: requirements:NFR-006

Security: patient data, credentials and consultation records encrypted at rest; all traffic encrypted in transit.

Health data must be encrypted at rest in the database and all traffic must be served over encrypted transport.

### NFR-007 · approved · source: requirements:NFR-007

Compliance: sensitive actions (viewing/changing consultation records or appointments) must be audit-logged; consent stored with timestamp.

Every view or change of a consultation record or appointment must create an audit entry capturing the user, the action, the affected record and a timestamp; consent must be stored with a timestamp.

### NFR-008 · approved · source: requirements:NFR-008

Availability: bookings must succeed even if the email provider is down or misconfigured.

If the transactional email provider is unavailable or no valid key is configured, the booking, reschedule or cancellation must still succeed and the failed notification must be logged for retry/review and surfaced to the administrator.

### NFR-009 · approved · source: requirements:NFR-009

Performance: notification and reminder emails must be sent via a background queue so they never block a booking action.

Emails must not delay or block the patient's booking click; sending happens asynchronously through a queue.

### NFR-010 · approved · source: requirements:NFR-010

Security: the email provider API key must be stored as a secret and never shown in plain text; new staff accounts use a placeholder credential.

The transactional email provider API key must be stored securely as a secret and never displayed in plain text; new staff accounts must record the placeholder <set-at-first-login> rather than any real credential.

### NFR-011 · approved · source: requirements:NFR-011

Compatibility: delivered as a responsive web app usable in standard mobile or desktop browsers, no native app.

Patients, doctors and admins must all be able to use the product in a standard mobile or desktop browser.

### NFR-012 · approved · source: requirements:NFR-012

Scalability: must comfortably handle a single-clinic pilot scale.

Target: roughly tens of doctors and up to a few thousand patients.

### NFR-013 · approved · source: requirements:NFR-013

Compliance (accepted risk): health-data handling follows general best practice only; no specific regulatory regime named.

No specific jurisdiction (such as HIPAA, GDPR or DPDP) was named, so health-data handling follows general best practice only, with region-specific compliance to be layered on later if needed. This is an accepted risk, not a confirmed regulatory posture.
<!-- sdlc:auto:end narrative -->

<!-- sdlc:auto:start summary -->
**Requirements version:** v1  
**Delivery scope:** lightweight  
**Approved:** 2026-11-16

**Capabilities in scope:** Patient self-registration and sign-in, Doctor search by disease, symptom, or specialization, Disease/symptom-to-specialization mapping lookup, Doctor availability as recurring weekly fixed-length slots, Real-time view of available consultation slots, Appointment booking with server-side double-booking prevention, Reschedule and cancel appointments, Doctor view of scheduled appointments, Consultation records: notes, diagnosis, optional prescription, Consultation status updates, Patient and doctor profile management, Booking dashboard for patient and doctor, Whole-slot bookings from recurring weekly hours, Free-text consultation records, no HL7/FHIR or lab/imaging, Consultation fees handled offline, no online payments

**Approved technology stack:**

| Layer | Choice | Rationale |
|---|---|---|
| backend | FastAPI | The hard part of this product is booking integrity — preventing two patients grabbing the same slot — which lives in server-side logic over the database. FastAPI gives you a clean, well-structured API for that, handles the role-based access checks for patients/doctors/admins cleanly, and pairs naturally with PostgreSQL's locking for the double-booking guard. It is the default this platform builds and is more than fast enough for tens of doctors and a few thousand patients. |
| cloud | AWS | A single-clinic pilot handling health data needs reliable hosting with encryption, backups, and audit-friendly access controls without over-investing. AWS covers managed PostgreSQL, app hosting, and the add-on services (email, background jobs) in one account, and is the platform default. It scales from this pilot to a larger rollout without re-platforming if the clinic expands. |
| database | PostgreSQL | Appointments demand transactional integrity: a slot must be booked exactly once even if two people click at the same instant. PostgreSQL gives you that with row-level locking and transactions, which is the direct mechanism behind your 'prevents double bookings' requirement. It also comfortably holds the structured data you described — doctors, specializations, the disease-to-specialization mapping table, consultation records — and supports encryption at rest for your health-data safeguards. |
| frontend | React | Your three audiences — patients self-booking from phones, doctors managing their day, and an admin running the clinic — all need the same responsive web app with distinct, interactive screens (live slot availability, calendars, record entry). React handles all three well in one codebase and runs in any mobile browser, which is exactly your 'no native app' decision. It is also the default and best-supported option this platform builds. |
<!-- sdlc:auto:end summary -->

<!-- sdlc:auto:start epics -->
## EPIC-001: Account Access and Authentication

Patients self-register online; doctor and admin accounts are provisioned by the administrator. All roles sign in with email and password, and sessions are secured and can be ended. Assumption: patients register themselves while doctor/admin accounts are created internally by the administrator; email/password authentication with role-based authorization.

### US-001: Patient self-registration

**Priority:** critical

> As a prospective patient, I want to register my own account online with my email, phone, and a password, so that I can access the clinic's appointment system and manage my bookings.

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | I am on the registration page and have provided a valid email, phone number, and a password | I submit the registration form with an email not already registered | my patient account is created, my password is stored only in hashed form, and I am signed in or prompted to sign in |
| AC-002 | I am on the registration page | I submit an email address that is already registered | registration is rejected and I am told the email is already in use |
| AC-003 | I am completing registration | I submit with a missing or invalid required field (email, phone, or password) | the account is not created and I see which field needs correcting |

### US-002: Sign in and sign out

**Priority:** critical

> As a registered user (patient, doctor, or admin), I want to sign in with my credentials and sign out when finished, so that only I can access my account and I can end my session securely.

| ID | Given | When | Then |
|---|---|---|---|
| AC-004 | I am a registered user with valid credentials | I submit my correct email and password | I am signed in and taken to the dashboard appropriate to my role |
| AC-005 | I enter an incorrect email or password | I attempt to sign in | I am denied access and shown a generic failure message that does not reveal which field was wrong |
| AC-006 | I am signed in | I choose to sign out | my session ends and I must sign in again to access protected pages |
| AC-007 | I am signed in and inactive beyond the configured session lifetime | I next make a request | my session is treated as expired and I am required to sign in again |

### US-003: Administrator provisions doctor and admin accounts

**Priority:** high

> As a clinic administrator, I want to create and provision doctor and administrator accounts, so that only authorised clinic staff have doctor or admin access, since these accounts are not self-registered.

| ID | Given | When | Then |
|---|---|---|---|
| AC-008 | I am signed in as an administrator | I create a new doctor or admin account with the required details | the account is created with the chosen role and the user can sign in with credentials set at first login |
| AC-009 | a non-admin user attempts to reach the account provisioning screens | they request the page | access is denied by role-based authorization |
| AC-010 | a new staff password has not yet been set | the account is created | the placeholder password is recorded as <set-at-first-login> and no real credential is stored or displayed |

### US-004: Role-based access enforcement

**Priority:** critical

> As a clinic administrator, I want each user to only reach the features and data permitted for their role, so that patient, doctor, and admin boundaries are respected.

| ID | Given | When | Then |
|---|---|---|---|
| AC-011 | a patient is signed in | they attempt to open a doctor-only or admin-only page or API | the request is denied |
| AC-012 | a doctor is signed in | they attempt to open admin-only management pages | the request is denied |
| AC-013 | a deactivated account | the user attempts any authenticated action | the request is denied and any existing session is ended |

## EPIC-002: Profile Management

Patients and doctors manage their own profile information; patient consent for health-data handling is captured. Assumption: health-data safeguards follow general best practice rather than a named regime.

### US-005: Patient manages own profile

**Priority:** high

> As a patient, I want to view and update my profile details (name, contact email, phone), so that my contact information and notifications stay accurate.

| ID | Given | When | Then |
|---|---|---|---|
| AC-014 | I am a signed-in patient | I update my name, email, or phone with valid values | the changes are saved and used for future notifications |
| AC-015 | I change my email to one already used by another account | I save | the change is rejected and I am told the email is already in use |

### US-006: Patient consent capture

**Priority:** high

> As a patient, I want to be asked for and give consent to the clinic storing and processing my health data, so that my health information is handled with my agreement.

| ID | Given | When | Then |
|---|---|---|---|
| AC-016 | I am a new patient who has not yet given consent | I first attempt to book an appointment or save consultation-related data | I am asked to give consent and cannot proceed until I accept |
| AC-017 | I have given consent | the consent is recorded | the system stores the consent with a timestamp for audit purposes |

### US-007: Doctor manages own profile

**Priority:** medium

> As a doctor, I want to view and maintain my professional profile (name, specialization, bio, contact), so that patients see accurate information when searching and booking.

| ID | Given | When | Then |
|---|---|---|---|
| AC-018 | I am a signed-in doctor | I update my displayed profile fields with valid values | the changes are saved and shown to patients in search results |
| AC-019 | I am a signed-in doctor | I attempt to change my assigned specialization | the specialization list offered is limited to specializations defined by the administrator |

## EPIC-003: Doctor Search and Specialization Mapping

Patients find relevant doctors by disease, symptom, or specialization using a predefined, non-AI disease/symptom-to-specialization mapping maintained by the admin. No AI/ML is used for matching.

### US-008: Search doctors by disease or symptom via mapping

**Priority:** critical

> As a patient, I want to search for doctors by entering a disease or symptom and have the system map it to the right specialization, so that I can find appropriate doctors without knowing which specialization I need.

| ID | Given | When | Then |
|---|---|---|---|
| AC-020 | a disease or symptom exists in the predefined mapping table | I search using that disease or symptom | the system resolves it to the mapped specialization(s) via static lookup and lists doctors in those specializations |
| AC-021 | I enter a disease or symptom that is not in the mapping table | I search | I am told no mapping was found and offered the option to browse by specialization instead |
| AC-022 | the mapping is performed | results are returned | the resolution uses only the predefined static mapping table and no AI, LLM, or machine learning |

### US-009: Search doctors by specialization

**Priority:** high

> As a patient, I want to browse or search doctors directly by specialization, so that I can choose a doctor when I already know the specialization I need.

| ID | Given | When | Then |
|---|---|---|---|
| AC-023 | specializations are defined by the administrator | I select a specialization | the system lists active doctors assigned to that specialization |
| AC-024 | a specialization has no active doctors | I select it | I am shown an empty-result message rather than an error |

## EPIC-004: Doctor Availability Management

Doctors define availability as recurring weekly working hours split into fixed-length consultation slots; a booking occupies a whole slot. Admins can also manage availability. Assumption: availability is recurring weekly hours divided into fixed-length slots.

### US-010: Doctor defines recurring weekly availability

**Priority:** critical

> As a doctor, I want to set my recurring weekly working hours divided into fixed-length consultation slots, so that patients can book whole slots within my working hours.

| ID | Given | When | Then |
|---|---|---|---|
| AC-025 | I am a signed-in doctor | I define working hours for days of the week and a slot length | the system generates fixed-length consultation slots across those hours and makes them bookable |
| AC-026 | I define overlapping working-hour ranges on the same day | I save | the overlap is rejected or merged so that no duplicate slots are created |
| AC-027 | a slot already has a booking | I remove or shorten the availability covering that slot | I am warned that an existing appointment is affected before the change is applied |

### US-011: Admin manages doctor availability

**Priority:** medium

> As a clinic administrator, I want to override or adjust any doctor's availability, so that I can handle leave, closures, or corrections on behalf of staff.

| ID | Given | When | Then |
|---|---|---|---|
| AC-028 | I am a signed-in administrator | I adjust a selected doctor's recurring availability or block out slots | the changes take effect and affected availability is updated for patients |
| AC-029 | I block out a time range that contains booked appointments | I save | I am warned about the affected appointments before confirming |

## EPIC-005: Appointment Booking and Real-time Availability

Patients view real-time available slots and book whole-slot in-person appointments. Server-side concurrency control prevents double bookings. Consultation fees are handled offline; no online payment.

### US-012: View real-time available slots

**Priority:** critical

> As a patient, I want to see a doctor's currently available consultation slots in real time, so that I only attempt to book slots that are actually free.

| ID | Given | When | Then |
|---|---|---|---|
| AC-030 | a doctor has generated availability and some slots are already booked | I view that doctor's availability | only unbooked, future slots are shown as available |
| AC-031 | another patient books a slot while I am viewing availability | I refresh or attempt to book | the now-taken slot no longer appears as available |

### US-013: Book an appointment with double-booking prevention

**Priority:** critical

> As a patient, I want to book an available whole slot for an in-person consultation, so that I secure a confirmed appointment with the chosen doctor.

| ID | Given | When | Then |
|---|---|---|---|
| AC-032 | I select an available future slot and have given consent | I confirm the booking | the whole slot is reserved for me, marked unavailable to others, and I see a confirmation |
| AC-033 | two patients attempt to book the same slot at the same time | both submit | server-side concurrency control ensures only one booking succeeds and the other is told the slot is no longer available |
| AC-034 | I complete a booking | the booking is confirmed | no online payment is requested because consultation fees are handled offline |

## EPIC-006: Reschedule and Cancel Appointments

Patients can reschedule or cancel their own upcoming appointments, freeing the original slot and reserving the new one under the same concurrency rules.

### US-014: Patient reschedules an appointment

**Priority:** high

> As a patient, I want to move an upcoming appointment to another available slot, so that I can adjust my booking when my plans change.

| ID | Given | When | Then |
|---|---|---|---|
| AC-035 | I have an upcoming appointment | I select a different available future slot and confirm the reschedule | the original slot is released, the new slot is reserved under the same double-booking rules, and the appointment reflects the new time |
| AC-036 | the new slot is taken concurrently by someone else | I confirm the reschedule | the reschedule fails, my original appointment is retained, and I am told the slot is no longer available |

### US-015: Patient cancels an appointment

**Priority:** high

> As a patient, I want to cancel an upcoming appointment, so that the slot is freed and I am no longer scheduled.

| ID | Given | When | Then |
|---|---|---|---|
| AC-037 | I have an upcoming appointment | I cancel it | the appointment is marked cancelled and its slot becomes available to other patients |
| AC-038 | an appointment is already completed or in the past | I attempt to cancel it | the cancellation is not permitted |

## EPIC-007: Patient Booking Dashboard

Patients have a dashboard to see their upcoming and past appointments and consultation outcomes relevant to them.

### US-016: Patient views own appointments and records

**Priority:** high

> As a patient, I want a dashboard listing my upcoming and past appointments and my own consultation records, so that I can keep track of my care in one place.

| ID | Given | When | Then |
|---|---|---|---|
| AC-039 | I am a signed-in patient with appointments | I open my dashboard | I see my upcoming and past appointments with doctor, specialization, date/time, and status |
| AC-040 | a doctor has recorded a consultation for one of my past appointments | I open that appointment | I can view my own consultation record (notes, diagnosis, and any prescription) but not other patients' records |

## EPIC-008: Doctor Appointment Dashboard and Consultation Records

Doctors view their scheduled appointments, maintain free-text consultation records (notes, diagnosis, optional prescription) tied to appointment and patient, and update consultation statuses. Assumption: free-text records only, no HL7/FHIR or lab/imaging integrations.

### US-017: Doctor views scheduled appointments

**Priority:** high

> As a doctor, I want a dashboard of my scheduled appointments, so that I can prepare for and manage my daily consultations.

| ID | Given | When | Then |
|---|---|---|---|
| AC-041 | I am a signed-in doctor with booked appointments | I open my dashboard | I see my upcoming appointments with patient name, date/time, slot, and current status |
| AC-042 | I have no appointments in the selected period | I view the dashboard | I see an empty-state message rather than an error |

### US-018: Doctor maintains consultation records

**Priority:** critical

> As a doctor, I want to record free-text clinical notes, a diagnosis, and an optional prescription for an appointment, so that the patient's consultation is documented and available to authorised people.

| ID | Given | When | Then |
|---|---|---|---|
| AC-043 | I am the treating doctor for an appointment | I save a consultation record with notes, diagnosis, and an optional prescription | the record is stored tied to that appointment and patient and visible to me, the patient, and admins per access rules |
| AC-044 | a doctor is not the treating doctor for an appointment | they attempt to open its consultation record | access is denied |
| AC-045 | I am entering a consultation record | I save | only free-text fields are captured, with no HL7/FHIR or lab/imaging integration |

### US-019: Doctor updates consultation status

**Priority:** high

> As a doctor, I want to update the status of a consultation (for example scheduled, completed, or no-show), so that the appointment lifecycle is accurately reflected.

| ID | Given | When | Then |
|---|---|---|---|
| AC-046 | I am the treating doctor for an appointment | I change its status to an allowed value | the new status is saved and shown on my dashboard and the patient's dashboard |
| AC-047 | an appointment is cancelled | I attempt to set it to completed | the invalid transition is rejected |

## EPIC-009: Administration Dashboard

Admin dashboard manages doctor accounts/profiles, specializations, the predefined disease/symptom-to-specialization mapping table, and oversight of all appointments including cancel and reassign. Assumption: admin owns and edits the mapping table.

### US-020: Manage doctor accounts and profiles

**Priority:** high

> As a clinic administrator, I want to create, edit, deactivate, and reactivate doctor accounts and their profiles, so that the clinic's staff roster is kept accurate.

| ID | Given | When | Then |
|---|---|---|---|
| AC-048 | I am a signed-in administrator | I create or edit a doctor account with required details and a specialization | the doctor record is saved and reflected in patient search |
| AC-049 | I deactivate a doctor | the change is saved | the doctor no longer appears in patient search and cannot sign in, while existing appointments are flagged for reassignment or cancellation |

### US-021: Manage specializations

**Priority:** medium

> As a clinic administrator, I want to maintain the list of specializations, so that doctors and the mapping table reference a consistent set.

| ID | Given | When | Then |
|---|---|---|---|
| AC-050 | I am a signed-in administrator | I add, rename, or remove a specialization | the change is reflected wherever specializations are selected |
| AC-051 | a specialization is assigned to doctors or used in the mapping table | I attempt to delete it | I am warned about the dependencies before the deletion is allowed or blocked |

### US-022: Maintain disease/symptom-to-specialization mapping

**Priority:** high

> As a clinic administrator, I want to own and edit the predefined disease/symptom-to-specialization mapping table, so that patient searches resolve to the correct specializations.

| ID | Given | When | Then |
|---|---|---|---|
| AC-052 | I am a signed-in administrator | I add, edit, or remove a mapping entry linking a disease or symptom to one or more specializations | the change is saved and immediately used by patient search |
| AC-053 | I map a disease or symptom to a specialization that does not exist | I save | the entry is rejected until a valid specialization is chosen |

### US-023: Oversee, cancel, and reassign appointments

**Priority:** high

> As a clinic administrator, I want to view all appointments and cancel or reassign them, so that I can manage scheduling issues across the clinic.

| ID | Given | When | Then |
|---|---|---|---|
| AC-054 | I am a signed-in administrator | I open the appointments oversight view | I can see all appointments across doctors with filters by doctor, patient, date, and status |
| AC-055 | an appointment needs to move to another doctor or slot | I reassign it to an available slot under the same double-booking rules | the original slot is freed, the new slot is reserved, and affected parties are notified |
| AC-056 | I cancel an appointment on behalf of the clinic | I confirm | the appointment is marked cancelled, its slot is freed, and a cancellation notification is sent |

## EPIC-010: Email Notifications and Reminders

The system sends email notifications for booking confirmation, reschedule, and cancellation, plus a reminder for upcoming appointments, via a transactional email provider configured with an API key. Assumption: email only; no SMS in the pilot.

### US-024: Booking, reschedule, and cancellation emails

**Priority:** high

> As a patient, I want to receive an email when my appointment is confirmed, rescheduled, or cancelled, so that I have a record of the change to my booking.

| ID | Given | When | Then |
|---|---|---|---|
| AC-057 | I successfully book an appointment | the booking is confirmed | a confirmation email with the appointment details is sent to my registered email |
| AC-058 | my appointment is rescheduled or cancelled by me or by an administrator | the change is saved | a corresponding reschedule or cancellation email is sent to my registered email |
| AC-059 | the transactional email provider is unavailable | a notification cannot be delivered | the appointment change still succeeds and the failed notification is logged for retry or review |

### US-025: Upcoming appointment reminder

**Priority:** medium

> As a patient, I want to receive an email reminder before my upcoming appointment, so that I do not forget to attend.

| ID | Given | When | Then |
|---|---|---|---|
| AC-060 | I have a confirmed upcoming appointment | the configured reminder lead time is reached | a reminder email with the appointment details is sent to my registered email |
| AC-061 | an appointment is cancelled before the reminder is due | the reminder time arrives | no reminder is sent |

### US-026: Email provider configuration

**Priority:** medium

> As a clinic administrator, I want to configure the transactional email provider credentials, so that the system can send notifications.

| ID | Given | When | Then |
|---|---|---|---|
| AC-062 | I am a signed-in administrator | I enter the email provider API key | it is stored securely as a secret such as <your-api-key> and never displayed in plain text |
| AC-063 | no valid email provider key is configured | a notification should be sent | the failure is logged and surfaced to the administrator |

## EPIC-011: Health-Data Safeguards and Audit Log

Health data is protected with general best-practice safeguards: encryption in transit and at rest, role-based access to records, consent capture, and an access/audit log. Assumption: general best practice is applied because no specific jurisdiction (HIPAA/GDPR/DPDP) was named.

### US-027: Encryption and protected storage of health data

**Priority:** high

> As a clinic administrator, I want patient health data and credentials to be stored and transmitted securely, so that sensitive information is protected in line with general best practice.

| ID | Given | When | Then |
|---|---|---|---|
| AC-064 | patient data and consultation records are stored | they are written to the database | the data is encrypted at rest and all traffic is served over encrypted transport |
| AC-065 | a user password is stored | the account is created or the password changed | only a hashed form of the password is persisted, never plain text |

### US-028: Access and audit logging

**Priority:** medium

> As a clinic administrator, I want an audit log of access to and changes of consultation records and appointments, so that I can review who accessed or modified sensitive data.

| ID | Given | When | Then |
|---|---|---|---|
| AC-066 | a consultation record is viewed or modified | the action occurs | an audit entry records the user, action, affected record, and timestamp |
| AC-067 | I am a signed-in administrator | I open the audit log | I can review access and change events for records and appointments |
<!-- sdlc:auto:end epics -->
