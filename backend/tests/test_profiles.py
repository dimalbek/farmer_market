def test_create_farmer_profile(client, db):
    profile_data = {"farm_name": "Test Farm", "location": "Astana", "farm_size": 100.5}
    response = client.post("/profiles/farmer/", json=profile_data)
    assert response.status_code == 200
    assert "Farmer profile created" in response.text


def test_get_profile(client, db):
    response = client.get("/profiles/me")
    assert response.status_code == 200
    assert "username" in response.json()
