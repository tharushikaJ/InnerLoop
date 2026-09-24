import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models.intern_pod import InternPod, InternPodMember
from app.models.project import Project
from app.models.task import Task
from app.models.user import User


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    client.cookies.clear()
    yield


def register(payload):
    return client.post("/api/auth/register", json=payload)


def login(role, email):
    client.cookies.clear()
    return client.post("/api/auth/login", json={
        "role": role,
        "email": email,
        "password": "Password123",
    })


def test_registers_all_supported_roles_without_exposing_password_hash():
    intern = register({
        "name": "Ishan Intern",
        "email": "intern@example.com",
        "password": "Password123",
        "role": "intern",
    })
    assert intern.status_code == 201
    assert intern.json()["user"]["role"] == "intern"
    assert intern.json()["user"]["designation"] is None
    assert "password_hash" not in intern.json()["user"]

    employee = register({
        "name": "Esha Employee",
        "email": "employee@example.com",
        "password": "Password123",
        "role": "employee",
        "designation": "Software Engineer",
        "department": "Digital Lab",
    })
    assert employee.status_code == 201
    assert employee.json()["user"]["designation"] == "Software Engineer"

    management = register({
        "name": "Manoj Manager",
        "email": "management@example.com",
        "password": "Password123",
        "role": "management",
        "designation": "Project Manager",
        "department": "Digital Lab",
    })
    assert management.status_code == 201
    assert management.json()["user"]["role"] == "management"


def test_registration_validation_and_duplicate_email():
    payload = {
        "name": "Esha Employee",
        "email": "employee@example.com",
        "password": "Password123",
        "role": "employee",
    }
    assert register(payload).status_code == 422

    payload.update({"designation": "Engineer", "department": "Digital Lab"})
    assert register(payload).status_code == 201
    assert register(payload).status_code == 409

    assert register({
        "name": "Invalid Role",
        "email": "invalid@example.com",
        "password": "Password123",
        "role": "administrator",
    }).status_code == 422


def test_login_me_logout_and_generic_login_failures():
    register({
        "name": "Ishan Intern",
        "email": "intern@example.com",
        "password": "Password123",
        "role": "intern",
    })

    for credentials in (
        {"role": "intern", "email": "intern@example.com", "password": "wrong-password"},
        {"role": "employee", "email": "intern@example.com", "password": "Password123"},
        {"role": "intern", "email": "missing@example.com", "password": "Password123"},
    ):
        response = client.post("/api/auth/login", json=credentials)
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid email, password, or role."

    login = client.post("/api/auth/login", json={
        "role": "intern",
        "email": "intern@example.com",
        "password": "Password123",
    })
    assert login.status_code == 200
    assert "innerloop_access_token" in login.cookies
    assert "password_hash" not in login.json()["user"]

    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "intern@example.com"

    assert client.post("/api/auth/logout").status_code == 200
    assert client.get("/api/auth/me").status_code == 401


def test_inactive_user_cannot_login():
    register({
        "name": "Inactive User",
        "email": "inactive@example.com",
        "password": "Password123",
        "role": "intern",
    })
    with TestingSession() as db:
        user = db.query(User).filter(User.email == "inactive@example.com").one()
        user.status = "inactive"
        db.commit()

    response = client.post("/api/auth/login", json={
        "role": "intern",
        "email": "inactive@example.com",
        "password": "Password123",
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email, password, or role."


def seed_rbac_workspace():
    users = [
        {"name": "Ishan Intern", "email": "intern@example.com", "password": "Password123", "role": "intern"},
        {"name": "Nadia Intern", "email": "intern2@example.com", "password": "Password123", "role": "intern"},
        {"name": "Esha Employee", "email": "employee@example.com", "password": "Password123", "role": "employee", "designation": "Engineer", "department": "Digital Lab"},
        {"name": "Manoj Manager", "email": "management@example.com", "password": "Password123", "role": "management", "designation": "Manager", "department": "Digital Lab"},
    ]
    for payload in users:
        assert register(payload).status_code == 201

    with TestingSession() as db:
        intern = db.query(User).filter(User.email == "intern@example.com").one()
        other_intern = db.query(User).filter(User.email == "intern2@example.com").one()
        first_pod = InternPod(pod_name="First Pod", status="active", progress_percentage=50)
        other_pod = InternPod(pod_name="Other Pod", status="active", progress_percentage=25)
        db.add_all([first_pod, other_pod])
        db.flush()

        direct_project = Project(project_name="Pod One Project", assigned_intern_pod_id=first_pod.id, current_status="active", progress_percentage=60)
        other_project = Project(project_name="Pod Two Project", assigned_intern_pod_id=other_pod.id, current_status="blocked", progress_percentage=20)
        reverse_project = Project(project_name="Reverse Assigned Project", current_status="active", progress_percentage=40)
        db.add_all([direct_project, other_project, reverse_project])
        db.flush()
        first_pod.assigned_project_id = reverse_project.id

        db.add_all([
            InternPodMember(pod_id=first_pod.id, intern_user_id=intern.id, status="active"),
            InternPodMember(pod_id=other_pod.id, intern_user_id=other_intern.id, status="active"),
            Task(task_title="Direct Task", assigned_user_id=intern.id, status="in progress"),
            Task(task_title="Pod Task", assigned_intern_pod_id=first_pod.id, status="todo"),
            Task(task_title="Other Intern Task", assigned_user_id=other_intern.id, assigned_intern_pod_id=other_pod.id, status="todo"),
            Task(task_title="Unassigned Task", status="todo"),
        ])
        db.commit()


def test_intern_data_is_sql_scoped_and_privileged_routes_are_forbidden():
    seed_rbac_workspace()
    assert login("intern", "intern@example.com").status_code == 200

    projects = client.get("/api/projects")
    assert projects.status_code == 200
    assert {item["project_name"] for item in projects.json()} == {"Pod One Project", "Reverse Assigned Project"}

    tasks = client.get("/api/tasks")
    assert tasks.status_code == 200
    assert {item["task_title"] for item in tasks.json()} == {"Direct Task", "Pod Task"}

    dashboard = client.get("/api/dashboard")
    assert dashboard.status_code == 200
    assert dashboard.json()["role"] == "intern"
    assert dashboard.json()["metrics"]["projects"] == 2
    assert dashboard.json()["metrics"]["open_tasks"] == 2

    for path in ("/api/meetings", "/api/intern-pods", "/api/meeting-rooms", "/api/reports/summary", "/api/users", "/api/settings", "/api/audit-logs"):
        assert client.get(path).status_code == 403


def test_employee_can_use_operational_routes_but_not_administration():
    seed_rbac_workspace()
    assert login("employee", "employee@example.com").status_code == 200

    for path in ("/api/dashboard", "/api/projects", "/api/tasks", "/api/meetings", "/api/intern-pods", "/api/meeting-rooms", "/api/reports/summary"):
        assert client.get(path).status_code == 200
    assert len(client.get("/api/projects").json()) == 3
    assert len(client.get("/api/tasks").json()) == 4
    for path in ("/api/users", "/api/settings", "/api/audit-logs"):
        assert client.get(path).status_code == 403


def test_management_can_use_every_rbac_route():
    seed_rbac_workspace()
    assert login("management", "management@example.com").status_code == 200

    for path in ("/api/dashboard", "/api/projects", "/api/tasks", "/api/meetings", "/api/intern-pods", "/api/meeting-rooms", "/api/reports/summary", "/api/users", "/api/settings", "/api/audit-logs"):
        assert client.get(path).status_code == 200
    metrics = client.get("/api/dashboard").json()["metrics"]
    assert metrics["active_projects"] == 2
    assert metrics["blocked_projects"] == 1
    assert metrics["delayed_projects"] == 0
