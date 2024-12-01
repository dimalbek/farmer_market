

def test_signup(client, db):
    user_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "phone": "+1234567890",
        "password": "password123",
        "role": "Buyer",
    }
    response = client.post("/auth/users", json=user_data)
    assert response.status_code == 200
    assert "User ID" in response.text

def test_login(client, db):
    login_data = {"email": "testuser@example.com", "password": "password123"}
    response = client.post("/auth/users/login", data=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
