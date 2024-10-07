def test_create_product(client, db):
    product_data = {
        "name": "Test Product",
        "category": "Vegetables",
        "price": 12.5,
        "quantity": 100,
    }
    response = client.post("/products/", json=product_data)
    assert response.status_code == 200
    assert "Product with id" in response.text


def test_update_product(client, db):
    updated_product = {"name": "Updated Product", "price": 15.0}
    response = client.patch("/products/1", json=updated_product)
    assert response.status_code == 200
    assert "updated" in response.text


def test_delete_product(client, db):
    response = client.delete("/products/1")
    assert response.status_code == 200
    assert "deleted" in response.text
