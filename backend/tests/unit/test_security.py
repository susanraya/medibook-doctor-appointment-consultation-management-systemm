"""AC-001/NFR-001: passwords are hashed, never stored or comparable in plain text."""

from app.security import generate_session_token, hash_password, verify_password


def test_ac001_hash_password_never_stores_the_plain_value() -> None:
    hashed = hash_password("correct-horse-1")

    assert hashed != "correct-horse-1"
    assert verify_password("correct-horse-1", hashed) is True
    assert verify_password("wrong-password", hashed) is False


def test_generate_session_token_is_unique_and_opaque() -> None:
    tokens = {generate_session_token() for _ in range(50)}

    assert len(tokens) == 50
    assert all(len(t) >= 32 for t in tokens)
