def test_create_comment(client, db):
    comment_data = {"content": "This is a test comment"}
    response = client.post("/products/1/comments", json=comment_data)
    assert response.status_code == 200
    assert "created on product" in response.text


def test_get_comments(client, db):
    response = client.get("/products/1/comments")
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_update_comment(client, db):
    updated_content = {"content": "Updated comment"}
    response = client.patch("/products/1/comments/1", json=updated_content)
    assert response.status_code == 200
    assert "updated" in response.text


def test_delete_comment(client, db):
    response = client.delete("/products/1/comments/1")
    assert response.status_code == 200
    assert "deleted" in response.text
