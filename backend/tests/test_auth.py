from models.user import User, UserRole
from services.auth_service import hash_password


def _make_user(db_session, email="viewer@example.com", password="testpass123", role=UserRole.VIEWER) -> User:
    user = User(email=email, hashed_password=hash_password(password), role=role)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def test_login_success_sets_cookie(client, db_session):
    _make_user(db_session, email="viewer@example.com", password="testpass123")

    response = client.post("/api/auth/login", json={"email": "viewer@example.com", "password": "testpass123"})
    assert response.status_code == 200
    assert "access_token" in response.cookies


def test_login_wrong_password_rejected(client, db_session):
    _make_user(db_session, email="viewer@example.com", password="testpass123")

    response = client.post("/api/auth/login", json={"email": "viewer@example.com", "password": "wrongpass"})
    assert response.status_code == 401


def test_register_requires_auth(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "new@example.com", "password": "testpass123", "role": "viewer"},
    )
    assert response.status_code == 401


def test_register_requires_admin_role(client, db_session):
    _make_user(db_session, email="analyst@example.com", password="testpass123", role=UserRole.ANALYST)
    client.post("/api/auth/login", json={"email": "analyst@example.com", "password": "testpass123"})

    response = client.post(
        "/api/auth/register",
        json={"email": "new@example.com", "password": "testpass123", "role": "viewer"},
    )
    assert response.status_code == 403


def test_register_succeeds_as_admin(client, db_session):
    _make_user(db_session, email="admin@example.com", password="testpass123", role=UserRole.ADMIN)
    client.post("/api/auth/login", json={"email": "admin@example.com", "password": "testpass123"})

    response = client.post(
        "/api/auth/register",
        json={"email": "new-analyst@example.com", "password": "testpass123", "role": "analyst"},
    )
    assert response.status_code == 201
    assert response.json()["email"] == "new-analyst@example.com"
