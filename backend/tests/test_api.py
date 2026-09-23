import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import Base, engine, SessionLocal
from backend.app.models.candidate import CandidateModel

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "GCCX" in data["service"]

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "endpoints" in data

def test_stats():
    response = client.get("/api/v1/stats")
    assert response.status_code == 200
    data = response.json()
    assert "totalCandidates" in data
    assert data["totalCandidates"] >= 48
    assert "needsReview" in data
    assert "shortlisted" in data
    assert "avgFitScore" in data

def test_get_candidates():
    response = client.get("/api/v1/candidates?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "candidates" in data
    assert len(data["candidates"]) <= 10
    assert data["total"] >= 48
    assert data["totalPages"] >= 5

def test_candidate_search():
    response = client.get("/api/v1/candidates?search=Python")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    for c in data["candidates"]:
        skills_and_text = " ".join(c["skills"]) + " " + c["name"] + " " + c["targetRole"]
        assert "python" in skills_and_text.lower() or "sharma" in c["name"].lower()

def test_candidate_filters():
    response = client.get("/api/v1/candidates?min_experience=5")
    assert response.status_code == 200
    data = response.json()
    for c in data["candidates"]:
        assert c["yearsExperience"] >= 5

def test_candidate_detail():
    # First get candidate id
    list_res = client.get("/api/v1/candidates?limit=1")
    cid = list_res.json()["candidates"][0]["id"]

    response = client.get(f"/api/v1/candidates/{cid}")
    assert response.status_code == 200
    c = response.json()
    assert c["id"] == cid
    assert "skills" in c
    assert "workHistory" in c

def test_shortlist_toggle():
    list_res = client.get("/api/v1/candidates?limit=1")
    cid = list_res.json()["candidates"][0]["id"]
    orig_shortlist = list_res.json()["candidates"][0]["shortlisted"]

    # Toggle shortlist
    res = client.post(f"/api/v1/candidates/{cid}/shortlist")
    assert res.status_code == 200
    assert res.json()["shortlisted"] != orig_shortlist

    # Toggle back
    res_back = client.post(f"/api/v1/candidates/{cid}/shortlist")
    assert res_back.status_code == 200
    assert res_back.json()["shortlisted"] == orig_shortlist

def test_add_and_remove_tag():
    list_res = client.get("/api/v1/candidates?limit=1")
    cid = list_res.json()["candidates"][0]["id"]

    # Add tag
    tag_name = "AutomatedTestTag"
    add_res = client.post(f"/api/v1/candidates/{cid}/tags", json={"name": tag_name})
    assert add_res.status_code == 200
    assert tag_name in add_res.json()["tags"]

    # Remove tag
    del_res = client.delete(f"/api/v1/candidates/{cid}/tags/{tag_name}")
    assert del_res.status_code == 200
    assert tag_name not in del_res.json()["tags"]

def test_add_note():
    list_res = client.get("/api/v1/candidates?limit=1")
    cid = list_res.json()["candidates"][0]["id"]

    note_text = "Automated test note evaluation."
    res = client.post(
        f"/api/v1/candidates/{cid}/notes",
        json={"text": note_text, "author": "Test Bot", "author_role": "QA"}
    )
    assert res.status_code == 200
    notes = res.json()["notesList"]
    assert any(n["text"] == note_text for n in notes)

def test_status_update():
    list_res = client.get("/api/v1/candidates?limit=1")
    cid = list_res.json()["candidates"][0]["id"]

    res = client.post(f"/api/v1/candidates/{cid}/status", json={"status": "IN_REVIEW"})
    assert res.status_code == 200
    assert res.json()["reviewStatus"] == "IN_REVIEW"

def test_task2a_skill_ranking():
    res = client.get("/api/v1/skills/rank?skills=Python,AWS,Docker&limit=5")
    assert res.status_code == 200
    data = res.json()
    assert "results" in data
    assert len(data["results"]) > 0
    assert data["results"][0]["overlap_score"] > 0

def test_task2b_verification():
    res = client.get("/api/v1/skills/task2b")
    assert res.status_code == 200
    data = res.json()
    assert len(data["bugs_identified"]) == 4
    assert "matches" in data
