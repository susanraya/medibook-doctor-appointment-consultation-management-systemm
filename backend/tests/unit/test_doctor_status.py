"""Unit tests for doctor account deactivation/reactivation (AC-049)."""

from datetime import datetime, timedelta

from sqlalchemy.orm import Session as DBSession

from app.models import Appointment, AppointmentSlot, User
from app.models import Session as SessionModel
from app.security import hash_password
from app.services import update_doctor_status
from app.sessions import create_session


def _make_doctor(db: DBSession, email: str = "doc@example.com") -> User:
    user = User(
        email=email,
        phone="",
        password_hash=hash_password("pw1234567"),
        role="doctor",
        full_name="Doc",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _make_patient(db: DBSession, email: str = "patient@example.com") -> User:
    user = User(
        email=email,
        phone="",
        password_hash=hash_password("pw1234567"),
        role="patient",
        full_name="Pat",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _make_appointment(
    db: DBSession, doctor: User, patient: User, status: str = "scheduled"
) -> Appointment:
    now = datetime.utcnow()
    slot = AppointmentSlot(
        doctor_id=doctor.id, start_at=now, end_at=now + timedelta(minutes=30), status="booked"
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)

    appointment = Appointment(
        slot_id=slot.id, patient_id=patient.id, doctor_id=doctor.id, status=status
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment


def test_ac049_deactivating_marks_the_doctor_inactive(db_session: DBSession) -> None:
    doctor = _make_doctor(db_session)

    update_doctor_status(db_session, doctor, is_active=False)

    assert doctor.is_active is False
    reloaded = db_session.query(User).filter(User.id == doctor.id).first()
    assert reloaded is not None
    assert reloaded.is_active is False


def test_ac049_deactivating_ends_every_live_session(db_session: DBSession) -> None:
    doctor = _make_doctor(db_session)
    token = create_session(db_session, doctor)

    update_doctor_status(db_session, doctor, is_active=False)

    session = db_session.query(SessionModel).filter(SessionModel.token == token).first()
    assert session is not None
    assert session.revoked_at is not None


def test_ac049_deactivating_flags_scheduled_appointments_for_reassignment(
    db_session: DBSession,
) -> None:
    doctor = _make_doctor(db_session)
    patient = _make_patient(db_session)
    appointment = _make_appointment(db_session, doctor, patient, status="scheduled")

    flagged_ids = update_doctor_status(db_session, doctor, is_active=False)

    assert flagged_ids == [appointment.id]
    reloaded = db_session.query(Appointment).filter(Appointment.id == appointment.id).first()
    assert reloaded is not None
    assert reloaded.needs_reassignment is True


def test_ac049_deactivating_does_not_flag_cancelled_or_completed_appointments(
    db_session: DBSession,
) -> None:
    doctor = _make_doctor(db_session)
    patient = _make_patient(db_session)
    cancelled = _make_appointment(db_session, doctor, patient, status="cancelled")
    completed = _make_appointment(
        db_session, doctor, _make_patient(db_session, "patient2@example.com"), status="completed"
    )

    flagged_ids = update_doctor_status(db_session, doctor, is_active=False)

    assert flagged_ids == []
    for appointment_id in (cancelled.id, completed.id):
        reloaded = db_session.query(Appointment).filter(Appointment.id == appointment_id).first()
        assert reloaded is not None
        assert reloaded.needs_reassignment is False


def test_ac049_reactivating_restores_active_status_without_touching_flags(
    db_session: DBSession,
) -> None:
    doctor = _make_doctor(db_session)
    patient = _make_patient(db_session)
    appointment = _make_appointment(db_session, doctor, patient, status="scheduled")
    update_doctor_status(db_session, doctor, is_active=False)

    flagged_ids = update_doctor_status(db_session, doctor, is_active=True)

    assert flagged_ids == []
    reloaded_doctor = db_session.query(User).filter(User.id == doctor.id).first()
    assert reloaded_doctor is not None
    assert reloaded_doctor.is_active is True
    reloaded_appointment = (
        db_session.query(Appointment).filter(Appointment.id == appointment.id).first()
    )
    assert reloaded_appointment is not None
    assert reloaded_appointment.needs_reassignment is True
