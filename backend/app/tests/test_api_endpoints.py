import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.anyio
async def test_api_health_and_root():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

        root_resp = await ac.get("/")
        assert root_resp.status_code == 200
        assert "OpportunityAI" in root_resp.json()["app"]

@pytest.mark.anyio
async def test_opportunities_listing_and_filtering():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Seed opportunities first
        seed_resp = await ac.post("/api/opportunities/seed")
        assert seed_resp.status_code == 200
        assert seed_resp.json()["count"] > 0

        # List opportunities
        list_resp = await ac.get("/api/opportunities")
        assert list_resp.status_code == 200
        opps = list_resp.json()
        assert len(opps) > 0
        
        # Verify fields on first opportunity
        first = opps[0]
        assert "title" in first
        assert "organization" in first
        assert "match_score" in first
        assert "deadline_urgency" in first
        assert "eligibility_status" in first

        # Filter by category
        cat_resp = await ac.get("/api/opportunities?category=Internship")
        assert cat_resp.status_code == 200
        for item in cat_resp.json():
            assert item["category"] == "Internship"

@pytest.mark.anyio
async def test_auth_and_application_tracking_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        import uuid
        test_email = f"student_{uuid.uuid4().hex[:6]}@example.com"
        
        # 1. Register student
        reg_payload = {
            "email": test_email,
            "password": "StrongPassword123!",
            "full_name": "Test Student"
        }
        reg_resp = await ac.post("/api/auth/register", json=reg_payload)
        assert reg_resp.status_code == 200
        token_data = reg_resp.json()
        access_token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        # 2. Get Me
        me_resp = await ac.get("/api/auth/me", headers=headers)
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == test_email

        # 3. Update profile
        prof_update = {
            "college": "National Engineering College",
            "academic_year": "3rd Year",
            "cgpa": 9.2,
            "technical_skills": ["Python", "React", "Docker", "Git"]
        }
        up_resp = await ac.put("/api/profile", json=prof_update, headers=headers)
        assert up_resp.status_code == 200
        assert up_resp.json()["profile"]["cgpa"] == 9.2

        # 4. Save an opportunity
        save_payload = {"opportunity_id": "opp-gsoc-2026", "priority": "high", "notes": "Target organization selected"}
        save_resp = await ac.post("/api/saved", json=save_payload, headers=headers)
        assert save_resp.status_code == 200
        
        saved_list = await ac.get("/api/saved", headers=headers)
        assert saved_list.status_code == 200
        assert len(saved_list.json()) >= 1

        # 5. Create application tracker entry
        app_payload = {
            "opportunity_id": "opp-aws-cloud-intern",
            "status": "Application in progress",
            "notes": "Drafted statement of purpose."
        }
        app_resp = await ac.post("/api/applications", json=app_payload, headers=headers)
        assert app_resp.status_code == 200
        app_id = app_resp.json()["id"]

        # 6. Update application status (Kanban move)
        move_resp = await ac.patch(f"/api/applications/{app_id}", json={"status": "Applied"}, headers=headers)
        assert move_resp.status_code == 200
        assert move_resp.json()["status"] == "Applied"
        assert len(move_resp.json()["history"]) >= 2

        # 7. Check Dashboard Analytics
        analytics_resp = await ac.get("/api/analytics", headers=headers)
        assert analytics_resp.status_code == 200
        analytics_data = analytics_resp.json()
        assert "stats" in analytics_data
        assert "applications_by_status" in analytics_data
        assert "top_in_demand_skills" in analytics_data
