# Farmus

**Farmus** is an e-commerce platform designed primarily for farmers (to sell products), buyers (to purchase products), and admins (to manage the system). It features user authentication with two-factor registration, password reset workflows, product listings with images, cart/checkout flows, order management, a real-time chat system, and more.

---
# Backend

## Project Overview

Farmus offers:

- **User Management**: Sign up, login, two-factor authentication, password resets.
- **Role-Based Access**: Farmers, Buyers, and Admins with distinct permissions.
- **Product Management**: Farmers can create products with images; buyers can browse and purchase.
- **Cart & Checkout**: Integrated Stripe checkout for seamless payments.
- **Order Management**: Order tracking, status updates, and admin oversight.
- **Comments & Reviews**: Users can comment on products.
- **Real-time Chat**: Buyers and farmers communicate via WebSockets.
- **Admin Features**: Farmer approvals, user management, etc.

---

## Features

1. **Two-Factor Authentication**  
   - Users receive a verification code by email for both registration and login.  
   - Additional security for password resets.

2. **Product Listings**  
   - Farmers (upon approval) can create and manage products.  
   - Product images, category search, price range filters, and more.

3. **Shopping Cart & Checkout**  
   - Buyers can add or remove items from their cart.  
   - Stripe-based payment processing.  
   - Automated order creation and cart clearing on successful payment.

4. **Orders & Comments**  
   - Track order details and status.  
   - Comment on products (buyers, farmers, admin).

5. **Real-time Chat**  
   - Buyer-Farmer communication through WebSockets.  
   - Farmers and buyers can only chat if they are in the same chat session.

6. **Admin Dashboard**  
   - Approve or reject farmer applications.  
   - Manage users (view, update, delete).  
   - Access to all farmer and buyer data.

---

## Technology Stack

- **FastAPI**: Main framework for building the API.
- **SQLAlchemy & Alembic**: Database ORM and schema migrations.
- **SQLite**: Default relational database for development (swappable for Postgres or MySQL).
- **Stripe**: Payment processing and checkout flow.
- **Pytest**: Test suite for verifying application features.

---

## Project Structure

```plaintext
.
├── README.md
├── alembic
│   ├── README
│   ├── env.py
│   ├── script.py.mako
│   └── versions
│       ├── 7ff36c4fed98_fist_migration.py
├── alembic.ini
├── app
│   ├── api
│   │   ├── admin.py
│   │   ├── auth.py
│   │   ├── cart.py
│   │   ├── chat.py
│   │   ├── checkout.py
│   │   ├── comments.py
│   │   ├── orders.py
│   │   ├── products.py
│   │   ├── profiles.py
│   │   └── webhook.py
│   ├── config.py
│   ├── database
│   │   ├── database.py
│   │   └── models.py
│   ├── main.py
│   ├── repositories
│   │   ├── buyers.py
│   │   ├── cart.py
│   │   ├── chat.py
│   │   ├── comments.py
│   │   ├── farmers.py
│   │   ├── orders.py
│   │   ├── products.py
│   │   └── users.py
│   ├── schemas
│   │   ├── buyers.py
│   │   ├── cart.py
│   │   ├── chat.py
│   │   ├── comments.py
│   │   ├── farmers.py
│   │   ├── orders.py
│   │   ├── password_reset.py
│   │   ├── products.py
│   │   ├── users.py
│   │   └── verification_code.py
│   └── utils
│       ├── code_generator.py
│       ├── connection_manager.py
│       ├── email_utils.py
│       ├── file_upload.py
│       └── security.py
├── app.log
├── poetry.lock
├── pyproject.toml
├── pytest.ini
├── requirements.txt
├── sql_app.db
├── tests
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_comments.py
│   ├── test_db
│   ├── test_products.py
│   └── test_profiles.py
└── uploaded_images

```
## **Installation**

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/dimalbek/farmer_market.git
    cd farmer_market/backend
    ```

2. **Set up a Virtual Environment (optional but recommended)**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate
    ```

3. **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```


4. **Create .env File in the root directory and fill it with the following content**:
    ```
    SECRET_KEY=your_secret_key
    MAIL_USERNAME=your_email@example.com
    MAIL_PASSWORD=your_email_password
    STRIPE_PUBLISHABLE_KEY=pk_test_***
    STRIPE_SECRET_KEY=sk_test_***
    STRIPE_WEBHOOK_SECRET=whsec_***
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=1440
    ```

5. **Initialize the Database**:
    ```bash
    alembic upgrade head
    ```

6. **Run the Application**:
    ```bash
    uvicorn app.main:app --reload
    ```

The API will now be accessible at http://127.0.0.1:8000 .
You may check endpoints at http://127.0.0.1:8000/docs .


## API Endpoints

Below is a brief overview of available endpoints. Refer to [`/docs`](../docs) in your local environment for additional details.

---

### **Auth & User Routes**

- **POST** `/auth/users/register/initiate`  
  Initiate user registration, sending a verification code to the email.

- **POST** `/auth/users/register/confirm`  
  Complete registration by confirming the code.

- **POST** `/auth/users/login/initiate`  
  Begin a 2FA login flow by sending a verification code via email.

- **POST** `/auth/users/login/confirm`  
  Finalize login with the code; receive a JWT.

- **POST** `/auth/users/password-reset/initiate`  
  Start the password reset process; a reset code is emailed to the user.

- **POST** `/auth/users/password-reset/confirm`  
  Complete the reset with the provided code and new password.

- **GET** `/auth/users/me`  
  Fetch details for the currently authenticated user.

- **PATCH** `/auth/users/me`  
  Update personal information (fullname, email, phone, etc.).

---

### **Admin Routes**

- **GET** `/admin/farmers` / **GET** `/admin/buyers`  
  List all farmers or all buyers (admin-only).

- **PATCH** `/admin/{user_id}/approve`  
  Approve or reject a farmer’s profile (admin-only).

- **GET** `/admin/users` / **GET** `/admin/users/{user_id}`  
  Fetch all users or a specific user (admin-only).

- **PATCH** `/admin/users/{user_id}` / **DELETE** `/admin/users/{user_id}`  
  Update or delete users (admin-only).

---

### **Profiles**

- **POST** `/profiles/farmer` / **POST** `/profiles/buyer`  
  Create a farmer or buyer profile (depending on user role).

- **GET** `/profiles/me`  
  Retrieve the current user’s profile.

- **PATCH** `/profiles/update`  
  Update your own user info (phone, email, etc.).

---

### **Products**

- **POST** `/products/`  
  Create a product (Farmer/Admin).

- **GET** `/products/`  
  Retrieve all products.

- **GET** `/products/{product_id}`  
  Fetch a single product by ID.

- **PATCH** `/products/{product_id}`  
  Update a product (Farmer/Admin).

- **DELETE** `/products/{product_id}`  
  Delete a product (Farmer/Admin).

- **GET** `/products/farmer/{farmer_id}`  
  List products belonging to a specific farmer.

- **GET** `/products/search/`  
  Search products by name, category, location, or price range.

---

### **Cart**

- **GET** `/cart/`  
  View the authenticated user’s cart.

- **POST** `/cart/`  
  Add an item to the cart.

- **PUT** `/cart/{product_id}`  
  Update the quantity of a cart item.

- **DELETE** `/cart/{product_id}`  
  Remove an item from the cart.

- **DELETE** `/cart/`  
  Clear the entire cart.

- **GET** `/cart/total`  
  Get the cart’s total price.

---

### **Orders**

- **GET** `/orders/`  
  List orders for the current user.

- **GET** `/orders/{order_id}`  
  Get a specific order (buyer or admin).

- **PATCH** `/orders/{order_id}`  
  Update order status (buyer or admin).

- **DELETE** `/orders/{order_id}`  
  Delete an order (admin only).

---

### **Comments**

- **POST** `/comments/products/{product_id}/comments`  
  Create a comment for a product.

- **GET** `/comments/products/{product_id}/comments`  
  Retrieve all comments for a product.

- **PATCH** `/comments/products/{product_id}/comments/{comment_id}`  
  Update a comment (owner or admin).

- **DELETE** `/comments/products/{product_id}/comments/{comment_id}`  
  Delete a comment (owner or admin).

---

### **Chat**

- **POST** `/chat/chats/{farmer_id}`  
  (Buyer) create/open a chat with a farmer.

- **GET** `/chat/chats/` or **GET** `/chat/chats/{chat_id}`  
  List or retrieve chat details.

- **WebSocket** `/chat/ws/chat/{chat_id}?token=<JWT>`  
  Real-time chat endpoint (the user’s JWT is validated here).

---

### **Checkout & Webhooks**

- **POST** `/checkout/create-checkout-session`  
  Create a Stripe checkout session from the user’s cart.

- **POST** `/webhooks/webhook`  
  Handle Stripe webhook events: on successful payment, orders are created and the cart is cleared.




## Authors ##

Backend developed by Dinmukhamed Albek and Adilet Shildebayev

Frontend developed by Dastan Tynyshtyq and Aizhar Kudenova

Mobile developed by Manu.
