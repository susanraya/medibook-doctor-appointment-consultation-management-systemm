"""Unit tests for the specializations CRUD service (AC-050, AC-051)."""

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session as DBSession

from app.models import DiseaseMapping, DiseaseMappingSpecialization, DoctorProfile, User
from app.services import (
    create_specialization,
    create_staff_account,
    delete_specialization,
    list_specializations,
    update_specialization,
)


def test_ac050_create_specialization_adds_it_to_the_list(db_session: DBSession) -> None:
    created = create_specialization(db_session, "Cardiology")

    names = [s.name for s in list_specializations(db_session)]
    assert created.name == "Cardiology"
    assert created.is_active is True
    assert names == ["Cardiology"]


def test_ac050_rejects_a_duplicate_name(db_session: DBSession) -> None:
    create_specialization(db_session, "Cardiology")

    with pytest.raises(HTTPException) as exc_info:
        create_specialization(db_session, "Cardiology")

    assert exc_info.value.status_code == 409
    assert len(list_specializations(db_session)) == 1


def test_ac050_rename_specialization_updates_the_name(db_session: DBSession) -> None:
    specialization = create_specialization(db_session, "Cardiology")

    renamed = update_specialization(db_session, specialization.id, "Cardiac Care")

    assert renamed.id == specialization.id
    names = [s.name for s in list_specializations(db_session)]
    assert names == ["Cardiac Care"]


def test_ac050_rename_rejects_a_duplicate_name(db_session: DBSession) -> None:
    create_specialization(db_session, "Cardiology")
    dermatology = create_specialization(db_session, "Dermatology")

    with pytest.raises(HTTPException) as exc_info:
        update_specialization(db_session, dermatology.id, "Cardiology")

    assert exc_info.value.status_code == 409


def test_ac050_rename_unknown_specialization_is_not_found(db_session: DBSession) -> None:
    with pytest.raises(HTTPException) as exc_info:
        update_specialization(db_session, "does-not-exist", "Neurology")

    assert exc_info.value.status_code == 404


def test_ac050_removed_specialization_no_longer_appears_in_the_list(
    db_session: DBSession,
) -> None:
    specialization = create_specialization(db_session, "Oncology")

    delete_specialization(db_session, specialization.id)

    assert list_specializations(db_session) == []


def test_ac051_delete_unknown_specialization_is_not_found(db_session: DBSession) -> None:
    with pytest.raises(HTTPException) as exc_info:
        delete_specialization(db_session, "does-not-exist")

    assert exc_info.value.status_code == 404


def test_ac051_delete_blocked_when_assigned_to_a_doctor(db_session: DBSession) -> None:
    specialization = create_specialization(db_session, "Pediatrics")
    create_staff_account(
        db_session,
        full_name="Doc One",
        email="doc-one@example.com",
        phone="+1 555 0111",
        role="doctor",
        specialization_id=specialization.id,
    )

    with pytest.raises(HTTPException) as exc_info:
        delete_specialization(db_session, specialization.id)

    assert exc_info.value.status_code == 409
    assert len(list_specializations(db_session)) == 1


def test_ac051_delete_blocked_when_used_in_a_mapping(db_session: DBSession) -> None:
    specialization = create_specialization(db_session, "Neurology")
    mapping = DiseaseMapping(term="headache")
    db_session.add(mapping)
    db_session.commit()
    db_session.add(
        DiseaseMappingSpecialization(mapping_id=mapping.id, specialization_id=specialization.id)
    )
    db_session.commit()

    with pytest.raises(HTTPException) as exc_info:
        delete_specialization(db_session, specialization.id)

    assert exc_info.value.status_code == 409
    assert len(list_specializations(db_session)) == 1


def test_ac051_delete_succeeds_once_dependency_is_gone(db_session: DBSession) -> None:
    specialization = create_specialization(db_session, "Oncology")
    user, _ = create_staff_account(
        db_session,
        full_name="Doc Two",
        email="doc-two@example.com",
        phone="+1 555 0112",
        role="doctor",
        specialization_id=specialization.id,
    )
    # Drop the dependency, as deleting the doctor account would, then the
    # specialization can be removed without a warning blocking it.
    profile = db_session.query(DoctorProfile).filter(DoctorProfile.user_id == user.id).first()
    db_session.delete(profile)
    db_session.delete(db_session.query(User).filter(User.id == user.id).first())
    db_session.commit()

    delete_specialization(db_session, specialization.id)

    assert list_specializations(db_session) == []
