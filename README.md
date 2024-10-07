# **Project Overview**

Farmer Market is a platform that connects farmers and buyers within Kazakhstan, enabling users to manage product listings, create profiles, and engage with others through a commenting system. This Minimum Viable Product (MVP) focuses on key features like user registration, product management, and commenting functionality.

## **Features**

- **User Registration**: Users can register by providing essential details such as email, phone number, password, and role (Farmer, Buyer, Admin).
  
- **User Authentication**: Ensures secure user access using OAuth2PasswordBearer.

- **User Profile Management**: Authenticated users can create and manage their profiles, with unique profiles for Farmers and Buyers.

- **Product Listing Creation**: Farmers and Admins can create product listings with details like category, price, quantity, and description.

- **Product Listing Modification and Deletion**: Authenticated users can modify and delete their product listings.

- **Commenting System**: Users can add comments on product listings, offering feedback and insights.

- **Comment Management**: Users can edit and delete their comments on product listings.

- **API Endpoints**: The platform provides various API endpoints for user registration, authentication, product management, and commenting.

## **Technology Stack**

- **FastAPI**: A modern, high-performance web framework for building APIs with Python 3.7+ based on standard Python type hints.
  
- **SQLAlchemy**: A powerful and flexible SQL toolkit and Object-Relational Mapping (ORM) library for Python.

- **Alembic**: A lightweight database migration tool for usage with SQLAlchemy.

## **Structure**
```
.
├── README.md
├── backend
│   ├── README.md
│   ├── alembic
│   │   ├── README
│   │   ├── __pycache__
│   │   │   └── env.cpython-312.pyc
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions
│   │       ├── 1a0d0d69b4e9_fist_migration.py
│   │       ├── 5983eb8a3353_user_table_username_fullname.py
│   │       └── __pycache__
│   │           ├── 1a0d0d69b4e9_fist_migration.cpython-312.pyc
│   │           └── 5983eb8a3353_user_table_username_fullname.cpython-312.pyc
│   ├── alembic.ini
│   ├── app
│   │   ├── __pycache__
│   │   │   └── main.cpython-312.pyc
│   │   ├── api
│   │   │   ├── __pycache__
│   │   │   │   ├── auth.cpython-312.pyc
│   │   │   │   ├── comments.cpython-312.pyc
│   │   │   │   ├── products.cpython-312.pyc
│   │   │   │   └── profiles.cpython-312.pyc
│   │   │   ├── auth.py
│   │   │   ├── comments.py
│   │   │   ├── products.py
│   │   │   └── profiles.py
│   │   ├── database
│   │   │   ├── __pycache__
│   │   │   │   ├── database.cpython-312.pyc
│   │   │   │   └── models.cpython-312.pyc
│   │   │   ├── database.py
│   │   │   └── models.py
│   │   ├── main.py
│   │   ├── repositories
│   │   │   ├── __pycache__
│   │   │   │   ├── comments.cpython-312.pyc
│   │   │   │   ├── products.cpython-312.pyc
│   │   │   │   └── users.cpython-312.pyc
│   │   │   ├── comments.py
│   │   │   ├── orders.py
│   │   │   ├── products.py
│   │   │   └── users.py
│   │   ├── schemas
│   │   │   ├── __pycache__
│   │   │   │   ├── buyers.cpython-312.pyc
│   │   │   │   ├── comments.cpython-312.pyc
│   │   │   │   ├── farmers.cpython-312.pyc
│   │   │   │   ├── products.cpython-312.pyc
│   │   │   │   └── users.cpython-312.pyc
│   │   │   ├── buyers.py
│   │   │   ├── comments.py
│   │   │   ├── farmers.py
│   │   │   ├── orders.py
│   │   │   ├── products.py
│   │   │   └── users.py
│   │   └── utils
│   │       ├── __pycache__
│   │       │   └── security.cpython-312.pyc
│   │       └── security.py
│   ├── poetry.lock
│   ├── pyproject.toml
│   ├── pytest.ini
│   ├── test.db
│   └── tests
│       ├── __pycache__
│       │   ├── conftest.cpython-312-pytest-8.3.3.pyc
│       │   ├── test_auth.cpython-312-pytest-8.3.3.pyc
│       │   ├── test_comments.cpython-312-pytest-8.3.3.pyc
│       │   ├── test_products.cpython-312-pytest-8.3.3.pyc
│       │   └── test_profiles.cpython-312-pytest-8.3.3.pyc
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_comments.py
│       ├── test_db
│       ├── test_products.py
│       └── test_profiles.py
└── frontend
    └── front.txt

21 directories, 61 files
```


## **Installation**

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/dimalbek/FarmerMarket.git
    cd FarmerMarket/backend
    ```

2. **Set up a Virtual Environment (optional but recommended)**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate
    ```

3. **Install Dependencies**:
    ```bash
    pipx install poetry  # If not installed
    poetry install
    ```

4. **Initialize the Database**:
    ```bash
    alembic upgrade head
    ```

5. **Run the Application**:
    ```bash
    uvicorn app.main:app --reload
    ```

The API will now be accessible at http://127.0.0.1:8000 .
You may check endpoints at http://127.0.0.1:8000/docs .

## **API Endpoints**
### User Authentication ###

- POST /auth/users: Register a new user.
- POST /auth/users/login: Log in with email and password.
- GET /auth/users/me: View user profile information.
- PATCH /auth/users/me: Modify profile information.

### Profile Management ###

- POST /profiles/farmer/: Create or update a Farmer profile.
- POST /profiles/buyer/: Create or update a Buyer profile.
- GET /profiles/me: Retrieve the authenticated user’s profile based on their role.

### Product Listings ###

- POST /products/: Create a new product listing (Farmers and Admins only).
- GET /products/{product_id}: Retrieve details of a product listing.
- PATCH /products/{product_id}: Update product details.
- DELETE /products/{product_id}: Delete a product listing.

### Comments ###

- POST /products/{product_id}/comments: Add a comment to a product listing.
- GET /products/{product_id}/comments: Retrieve comments for a product listing.
- PATCH /products/{product_id}/comments/{comment_id}: Modify a comment on a product listing.
- DELETE /products/{product_id}/comments/{comment_id}: Delete a comment on a product listing.

## Author ##

Developed by Dinmukhamed Albek.