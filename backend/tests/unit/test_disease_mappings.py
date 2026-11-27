"""Unit tests for the disease/symptom-to-specialization mapping CRUD service
(AC-052, AC-053)."""

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session as DBSession

from app.models import DiseaseMapping, DiseaseMappingSpecialization, Specialization
from app.services import (
    create_mapping,
    delete_mapping,
    list_mappings,
    update_mapping,
)


def _make_specialization(db: DBSession, name: str) -> Specialization:
    specialization = Specialization(name=name, is_active=True)
    db.add(specialization)
    db.commit()
    db.refresh(specialization)
    return specialization


def test_ac052_create_mapping_adds_it_to_the_list(db_session: DBSession) -> None:
    cardiology = _make_specialization(db_session, "Cardiology")

    mapping, specialization_ids = create_mapping(db_session, "chest pain", [cardiology.id])

    assert mapping.term == "chest pain"
    assert specialization_ids == [cardiology.id]
    listed = list_mappings(db_session)
    assert [(m.term, ids) for m, ids in listed] == [("chest pain", [cardiology.id])]


def test_ac052_create_mapping_links_more_than_one_specialization(db_session: DBSession) -> None:
    cardiology = _make_specialization(db_session, "Cardiology")
    pulmonology = _make_specialization(db_session, "Pulmonology")

    mapping, specialization_ids = create_mapping(
        db_session, "shortness of breath", [cardiology.id, pulmonology.id]
    )

    assert set(specialization_ids) == {cardiology.id, pulmonology.id}
    links = (
        db_session.query(DiseaseMappingSpecialization)
        .filter(DiseaseMappingSpecialization.mapping_id == mapping.id)
        .all()
    )
    assert {link.specialization_id for link in links} == {cardiology.id, pulmonology.id}


def test_ac052_create_mapping_rejects_a_duplicate_term(db_session: DBSession) -> None:
    cardiology = _make_specialization(db_session, "Cardiology")
    create_mapping(db_session, "chest pain", [cardiology.id])

    with pytest.raises(HTTPException) as exc_info:
        create_mapping(db_session, "chest pain", [cardiology.id])

    assert exc_info.value.status_code == 409
    assert len(list_mappings(db_session)) == 1


def test_ac053_create_mapping_rejects_an_unknown_specialization(db_session: DBSession) -> None:
    with pytest.raises(HTTPException) as exc_info:
        create_mapping(db_session, "chest pain", ["does-not-exist"])

    assert exc_info.value.status_code == 404
    assert list_mappings(db_session) == []
    stored = db_session.query(DiseaseMapping).filter(DiseaseMapping.term == "chest pain").first()
    assert stored is None


def test_ac053_create_mapping_rejects_when_any_specialization_is_unknown(
    db_session: DBSession,
) -> None:
    cardiology = _make_specialization(db_session, "Cardiology")

    with pytest.raises(HTTPException) as exc_info:
        create_mapping(db_session, "chest pain", [cardiology.id, "does-not-exist"])

    assert exc_info.value.status_code == 404
    assert list_mappings(db_session) == []


def test_ac052_update_mapping_replaces_term_and_specializations(db_session: DBSession) -> None:
    cardiology = _make_specialization(db_session, "Cardiology")
    pulmonology = _make_specialization(db_session, "Pulmonology")
    mapping, _ = create_mapping(db_session, "chest pain", [cardiology.id])

    updated, specialization_ids = update_mapping(
        db_session, mapping.id, "severe chest pain", [pulmonology.id]
    )

    assert updated.id == mapping.id
    assert updated.term == "severe chest pain"
    assert specialization_ids == [pulmonology.id]
    listed = list_mappings(db_session)
    assert [(m.term, ids) for m, ids in listed] == [("severe chest pain", [pulmonology.id])]


def test_ac052_update_unknown_mapping_is_not_found(db_session: DBSession) -> None:
    cardiology = _make_specialization(db_session, "Cardiology")

    with pytest.raises(HTTPException) as exc_info:
        update_mapping(db_session, "does-not-exist", "chest pain", [cardiology.id])

    assert exc_info.value.status_code == 404


def test_ac052_update_mapping_rejects_a_duplicate_term(db_session: DBSession) -> None:
    cardiology = _make_specialization(db_session, "Cardiology")
    create_mapping(db_session, "chest pain", [cardiology.id])
    other, _ = create_mapping(db_session, "cough", [cardiology.id])

    with pytest.raises(HTTPException) as exc_info:
        update_mapping(db_session, other.id, "chest pain", [cardiology.id])

    assert exc_info.value.status_code == 409


def test_ac053_update_mapping_rejects_an_unknown_specialization(db_session: DBSession) -> None:
    cardiology = _make_specialization(db_session, "Cardiology")
    mapping, _ = create_mapping(db_session, "chest pain", [cardiology.id])

    with pytest.raises(HTTPException) as exc_info:
        update_mapping(db_session, mapping.id, "chest pain", ["does-not-exist"])

    assert exc_info.value.status_code == 404
    reloaded = db_session.query(DiseaseMapping).filter(DiseaseMapping.id == mapping.id).first()
    assert reloaded is not None
    assert reloaded.term == "chest pain"
    links = (
        db_session.query(DiseaseMappingSpecialization)
        .filter(DiseaseMappingSpecialization.mapping_id == mapping.id)
        .all()
    )
    assert [link.specialization_id for link in links] == [cardiology.id]


def test_ac052_delete_mapping_removes_it_from_the_list(db_session: DBSession) -> None:
    cardiology = _make_specialization(db_session, "Cardiology")
    mapping, _ = create_mapping(db_session, "chest pain", [cardiology.id])

    delete_mapping(db_session, mapping.id)

    assert list_mappings(db_session) == []
    assert (
        db_session.query(DiseaseMappingSpecialization)
        .filter(DiseaseMappingSpecialization.mapping_id == mapping.id)
        .first()
        is None
    )


def test_ac052_delete_unknown_mapping_is_not_found(db_session: DBSession) -> None:
    with pytest.raises(HTTPException) as exc_info:
        delete_mapping(db_session, "does-not-exist")

    assert exc_info.value.status_code == 404
