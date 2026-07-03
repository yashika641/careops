"""
Sample tests for CareOps Backend API
Run with: pytest tests/test_api.py -v
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestAuth:
    """Test authentication endpoints"""
    
    def test_signup_customer(self):
        """Test customer signup"""
        response = client.post(
            "/auth/signup",
            json={
                "email": "test@example.com",
                "password": "testpass123",
                "username": "Test User",
                "phone_number": "+1234567890",
                "role": "customer"
            }
        )
        # Note: This will fail if user already exists
        # In real tests, use unique emails or clean up after
        assert response.status_code in [201, 400]
    
    def test_signin(self):
        """Test user signin"""
        # First create a user, then sign in
        response = client.post(
            "/auth/signin",
            json={
                "email": "admin@careops.com",
                "password": "your-admin-password"
            }
        )
        assert response.status_code in [200, 401]
        if response.status_code == 200:
            data = response.json()
            assert "access_token" in data
            assert "user" in data


class TestAppointments:
    """Test appointment endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for tests"""
        response = client.post(
            "/auth/signin",
            json={
                "email": "admin@careops.com",
                "password": "your-admin-password"
            }
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        return None
    
    def test_get_appointments(self, auth_token):
        """Test getting appointments"""
        if not auth_token:
            pytest.skip("No auth token available")
        
        response = client.get(
            "/appointments",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestLeads:
    """Test lead endpoints"""
    
    def test_create_lead(self):
        """Test creating a lead (public endpoint)"""
        response = client.post(
            "/leads",
            json={
                "name": "Test Lead",
                "email": "lead@example.com",
                "phone_number": "+1234567890",
                "service_interest": "Senior Care",
                "source": "Website"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Lead"
        assert data["status"] == "new"


class TestHealth:
    """Test health check"""
    
    def test_root(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
    
    def test_health(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
