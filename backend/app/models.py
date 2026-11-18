"""SQLAlchemy models for the approved data model.

One class per entity in `docs/sdlc/architecture/data-model.md`. IDs are
stored as 36-character strings holding a UUID4's text form rather than a
database-specific UUID column type, so the same model works against the
SQLite this scaffold defaults to locally and the PostgreSQL the architecture
names for deployment -- nothing else here is database-specific.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    SmallInteger,
    String,
    Text,
    Time,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    """A patient, doctor or admin. Role is enforced server-side (NFR-004)."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(32), default="")
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(16))  # patient | doctor | admin
    full_name: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Session(Base):
    """An opaque bearer session. Revoked server-side on logout or deactivation."""

    __tablename__ = "sessions"

    token: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    last_activity_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class PatientConsent(Base):
    """A patient's consent to the clinic storing and processing health data."""

    __tablename__ = "patient_consents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    consented: Mapped[bool] = mapped_column(Boolean, default=False)
    consented_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Specialization(Base):
    """One entry in the admin-defined list doctors and mappings point at."""

    __tablename__ = "specializations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class DoctorProfile(Base):
    """A doctor's clinical profile, in addition to their `users` row."""

    __tablename__ = "doctor_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), unique=True, index=True
    )
    specialization_id: Mapped[str] = mapped_column(String(36), ForeignKey("specializations.id"))
    bio: Mapped[str] = mapped_column(Text, default="")
    contact: Mapped[str] = mapped_column(String(255), default="")


class DiseaseMapping(Base):
    """A normalized disease or symptom term the search endpoint matches on."""

    __tablename__ = "disease_mappings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    term: Mapped[str] = mapped_column(String(255), unique=True, index=True)


class DiseaseMappingSpecialization(Base):
    """Which specializations a disease/symptom term resolves to."""

    __tablename__ = "disease_mapping_specializations"

    mapping_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("disease_mappings.id"), primary_key=True
    )
    specialization_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("specializations.id"), primary_key=True
    )


class DoctorAvailability(Base):
    """One recurring weekly working-hours range a doctor's slots are generated from."""

    __tablename__ = "doctor_availability"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    doctor_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    day_of_week: Mapped[int] = mapped_column(SmallInteger)  # 0 = Monday .. 6 = Sunday
    start_time: Mapped[Time] = mapped_column(Time)
    end_time: Mapped[Time] = mapped_column(Time)
    slot_length_minutes: Mapped[int] = mapped_column(SmallInteger)


class AppointmentSlot(Base):
    """One bookable (or blocked) unit of a doctor's generated availability."""

    __tablename__ = "appointment_slots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    doctor_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(16), default="free")  # free | booked | blocked


class Appointment(Base):
    """A patient's booking of one whole slot."""

    __tablename__ = "appointments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    slot_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("appointment_slots.id"), unique=True
    )
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    doctor_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    status: Mapped[str] = mapped_column(String(16), default="scheduled")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class ConsultationRecord(Base):
    """The treating doctor's notes, diagnosis and optional prescription."""

    __tablename__ = "consultation_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    appointment_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("appointments.id"), unique=True
    )
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    doctor_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    diagnosis: Mapped[str] = mapped_column(Text, default="")
    prescription: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class NotificationLog(Base):
    """One attempt by the worker to send a booking-related email."""

    __tablename__ = "notification_log"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    appointment_id: Mapped[str] = mapped_column(String(36), ForeignKey("appointments.id"))
    kind: Mapped[str] = mapped_column(String(32))  # confirmation|reschedule|cancellation|reminder
    status: Mapped[str] = mapped_column(String(16))  # sent | failed
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class AuditLog(Base):
    """A view/create/update/cancel event on a consultation record or appointment."""

    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    action: Mapped[str] = mapped_column(String(16))  # view | create | update | cancel
    entity_type: Mapped[str] = mapped_column(String(32))  # consultation_record | appointment
    entity_id: Mapped[str] = mapped_column(String(36))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


__all__ = [
    "Base",
    "User",
    "Session",
    "PatientConsent",
    "Specialization",
    "DoctorProfile",
    "DiseaseMapping",
    "DiseaseMappingSpecialization",
    "DoctorAvailability",
    "AppointmentSlot",
    "Appointment",
    "ConsultationRecord",
    "NotificationLog",
    "AuditLog",
]
