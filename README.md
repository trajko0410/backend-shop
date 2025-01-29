# Backend for Webshop Application

## Table of Contents
1. [Overview](#overview)  
2. [Features](#features)  
3. [Technologies Used](#technologies-used)  
4. [Prerequisites](#prerequisites)  
5. [Environment Variables](#environment-variables)  
6. [How to Obtain the Keys](#how-to-obtain-the-keys)  
7. [API Endpoints](#api-endpoints)
    - [Items](#items)
    - [GET /items/all](#get-itemsall)
    - [GET /items/standard](#get-itemsstandard)
    - [GET /items/:id](#get-itemsid)
    - [POST /items](#post-items)
    - [PATCH /items/:id](#patch-itemsid)
    - [DELETE /items/:id](#delete-itemsid)
    - [Users](#users)
    - [GET /users/allUsers](#get-usersallusers)
    - [GET /users/search](#get-userssearch)
    - [POST /users/register](#post-usersregister)
    - [PATCH /users/update/{id}](#patch-usersupdateid)
    - [DELETE /users/update/{id}](#delete-usersupdateid)
    - [PATCH /users/role/{id}](#patch-usersroleid)
    - [Auth](#auth)
    - [POST /auth/refresh-token](#post-authrefresh-token)
    - [POST /auth/sign-in](#post-authsign-in)
    - [Newsletter](#newsletter)
    - [POST /newsletter/subscribe](#post-newslettersubscribe)
    - [POST /newsletter/send-newsletter](#post-newslettersend-newsletter)
    - [Checkout](#checkout)
    - [POST /checkout/webhooks/stripe](#post-checkoutwebhooksstripe)
    - [POST /checkout](#post-checkout)

---

## Overview
This is the backend for an e-commerce webshop built using **NestJS** and **TypeScript**. The project includes features like authentication, payment integration, image uploads, email notifications, item management, and role-based access control for users (Admin, Public, User). 

---

## Features
- **JWT Authentication**: Secure login and token management using JSON Web Tokens.
- **Stripe Payment Integration**: Process payments securely using Stripe API with webhook support.
- **Role-Based Access Control**: Guards to manage access for Admins, Users, and Public roles.
- **Item Management**: CRUD operations for items, including handling images, descriptions, and prices.
- **Checkout Process**: Supports purchases with payment integration and optional discounts.
- **Email Notifications**: Sends emails for various events such as successful orders or newsletter subscriptions using Mailtrap.
- **Image Uploads**: Supports item photo uploads using **Cloudinary**.
- **MongoDB Database**: Uses MongoDB for persistent data storage, including user and item management.
- **Swagger Documentation**: Auto-generated API documentation for easy reference and testing.
- **Pagination**: Implemented pagination on API endpoints for handling large datasets efficiently.

---

## Technologies Used
- **NestJS**
- **TypeScript**
- **MongoDB/Mongoose**
- **Stripe**
- **Cloudinary**
- **Mailtrap**
- **JWT (JSON Web Tokens)**
- **Webhooks**
  

---

## Prerequisites
Before running the project, make sure you have the following installed:
- **Node.js** (v16 or higher)
- **MongoDB** (or MongoDB Atlas for cloud storage)
- **Stripe Account** (for payment functionality)
- **Cloudinary Account** (for image storage)
- **Mailtrap Account** (for email functionality)

---

## Environment Variables
Create a `.env` file in the root directory and add the following:

```plaintext
# MongoDB
DATABASE_URL="mongodb+srv://<username>:<password>@webshop.mongodb.net/?retryWrites=true&w=majority"
DATABASE_NAME="WebShop"

# Cloudinary
CLOUD_NAME="<your-cloudinary-cloud-name>"
API_KEY="<your-cloudinary-api-key>"
API_SECRET="<your-cloudinary-api-secret>"

# Mailtrap
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT=2525
MAILTRAP_USER="<your-mailtrap-user>"
MAILTRAP_PASS="<your-mailtrap-password>"

# JWT
JWT_SECRET="secret"
JWT_AUDIENCE="http://localhost:3000"
JWT_ISSUER="http://localhost:3000"
JWT_ACCESS_TOKEN_TTL=3600
JWT_REFRESH_TOKEN_TTL=86400

# Stripe
STRIPE_API_SECRET_KEY="<your-stripe-secret-key>"
STRIPE_WEBHOOK_ENDPOINT_SECRET_KEY="<your-stripe-webhook-secret-key>"
```

---

## How to Obtain the Keys
- **MongoDB Atlas**: Sign up and create a cluster. Get the connection string from the **Connect** button.
- **Cloudinary**: Create an account and find credentials in the **Dashboard**.
- **Mailtrap**: Create an account and get SMTP credentials from the **Inbox Settings** page.
- **Stripe**: Create an account and retrieve secret API keys from the **Dashboard**.

---

## API Endpoints
## Items

### **GET /items/all**

#### **Description:**
Fetch all standard items with pagination. Available for **Admin, User, and Public** roles.

#### **Parameters:**
- **page** *(optional, number)*: The page number to fetch (default: `1`).
- **pageSize** *(optional, number)*: The number of items per page (default: `3`).

#### **Request Example:**
```http
GET /items/all?page=1&pageSize=5
Authorization: Bearer <your-jwt-token> //optional can be acces by public
```

##### **Responses:**

##### **200 OK - Items fetched successfully**
```json
{
    "items": [
    {
      "id": "65f23abcde78901234567890",
      "name": "MacBook Pro 16-inch",
      "shortDescription": "Powerful laptop with M2 Max chip",
      "price": 2999,
      "category": "Mac",
      "mainPhoto": [
        "https://example.com/macbook-front.jpg",
        "https://example.com/macbook-back.jpg"
      ],
      "available": true,
      "variant": "M2 Max - 32GB RAM",
      "description": "The ultimate pro laptop with a stunning Liquid Retina XDR display and next-gen performance.",
      "memory": [
        {
          "memory": "16GB",
          "price": "250"
        },
        {
          "memory": "32GB",
          "price": "500"
        }
      ],
      "colorName": "Space Gray",
      "colorCode": "#3B3B3B",
      "colorPhotos": [
        "https://example.com/macbook-spacegray.jpg"
      ]
    }
  ],
  "paginationMeta": {
    "currentPage": 1,
    "pageSize": 5,
    "totalPages": 10,
    "totalItems": 50
  },
  "message": "All standard items fetched successfully",
  "statusCode": 200
}
```

##### **400 Bad Request - Invalid pagination parameters**
```json
{
  
  "message": "Invalid pagination parameters.",
  "statusCode": 400

}
```

##### **500 Internal Server Error - Unexpected server issue**
```json
{
    "message": "Error fetching items",
  "description": "An unexpected error occurred while fetching items from the database. Please try again later.",
  "statusCode": 500
}
```

---

### **GET /items/standard**

### **Description**  
This endpoint fetches a paginated list of all standard items from the database. Available for **Admin, User, and Public** roles.

#### **Parameters:**
- **page** *(optional, number)*: The page number to fetch (default: `1`).
- **pageSize** *(optional, number)*: The number of items per page (default: `3`).


#### **Request Example:**
```http
GET /items/standard?page=1&pageSize=5
Authorization: Bearer <your-jwt-token> //optional can be acces by public
```

### **Response**
#### **Success (200)**  
Returns a paginated list of standard items with metadata about the pagination.
```json
{
    "items": [
    {
      "id": "65f23abcde78901234567890",
      "name": "MacBook Pro 16-inch",
      "shortDescription": "Powerful laptop with M2 Max chip",
      "price": 2999,
      "category": "Mac",
      "mainPhoto": [
        "https://example.com/macbook-front.jpg",
        "https://example.com/macbook-back.jpg"
      ],
      "available": true,
      "variant": "M2 Max - 32GB RAM",
      "description": "The ultimate pro laptop with a stunning Liquid Retina XDR display and next-gen performance.",
      "memory": [
        {
          "memory": "16GB",
          "price": "250"
        },
        {
          "memory": "32GB",
          "price": "500"
        }
      ],
      "colorName": "Space Gray",
      "colorCode": "#3B3B3B",
      "colorPhotos": [
        "https://example.com/macbook-spacegray.jpg"
      ]
    } ],
  "paginationMeta": {
    "totalCount": 100,
    "page": 1,
    "pageSize": 3,
    "totalPages": 34
  },
  "message": "All standard items fetched successfully",
  "statusCode": 200
}
```

##### **500 Internal Server Error - Unexpected server issue**
```json
{
"message": "Error fetching items",
  "description": "An unexpected error occurred while fetching items from the database. Please try again later.",
  "statusCode": 500
}
```
---

### **GET /items/:id**

### **Description**  
This endpoint fetches an item by its id and then retrieves all related variants by the item's name. Available for **Admin, User, and Public** roles.

#### **Parameters:**
- **id** *(required, string)*: The ID of the item to fetch.



#### **Request Example:**
```http
GET /items/65f23abcde78901234567890
Authorization: Bearer <your-jwt-token> // optional, can be accessed by public
```

### **Response**

#### **Success (200)**  
```json
{
   "relatedItems": [
    {
      "id": "65f23abcde78901234567891",
      "name": "MacBook Pro 16-inch",
      "shortDescription": "Powerful laptop with M2 Max chip",
      "price": 2999,
      "category": "Mac",
      "mainPhoto": [
        "https://example.com/macbook-front.jpg"
      ],
      "available": true,
      "variant": "M2 Max - 32GB RAM",
      "description": "The ultimate pro laptop with a stunning Liquid Retina XDR display.",
      "memory": [
        {
          "memory": "16GB",
          "price": "250"
        }
      ]
    },
    {
      "id": "65f23abcde78901234567892",
      "name": "MacBook Pro 16-inch",
      "shortDescription": "Powerful laptop with M2 Pro chip",
      "price": 2499,
      "category": "Mac",
      "mainPhoto": [
        "https://example.com/macbook-front.jpg"
      ],
      "available": true,
      "variant": "M2 Pro - 16GB RAM",
      "description": "High-performance laptop with a brilliant Retina display.",
      "memory": [
        {
          "memory": "16GB",
          "price": "200"
        }
      ]
    }
  ],
  "message": "All variants fetched successfully",
  "statusCode": 200
}
```

##### **400 Bad Request - Item Not Found - If the item with the provided ID does not exist, the response will be:**
```json
{
  "message": "Item with id of 65f23abcde78901234567890 does not exist!",
  "statusCode": 400
}
```

##### **500 Internal Server Error - Unexpected server issue**
```json
{
 "message": "Error fetching items",
  "description": "An unexpected error occurred while fetching items from the database. Please try again later.",
  "statusCode": 500
}
```

---

### **POST /items**

### **Description**  
This endpoint allows the Admin to create a new item. It requires the submission of item data along with photo uploads. The photos can include a main photo and multiple color photos. Accesable only by admins.

#### **Parameters:**
Body (required): The item details, including name, category, price, and other properties.
- mainPhoto (required, file): Main photo of the item.
- colorPhotos (optional, file): Additional photos of the item showing different colors



#### **Request Example:**
```http
POST /items
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data
```

#### **Body Example:**
```json
{
  "name": "iPhone 13 Pro",
  "shortDescription": "Latest iPhone model with improved features",
  "price": 1099,
  "category": "iPhone",
  "available": true,
  "variant": "standard/variant",
  "mainPhoto": "<file>",
  "colorPhotos": ["<file1>", "<file2>"],
  "memory": [
    { "memory": "128GB", "price": 150 },
    { "memory": "256GB", "price": 250 }
  ]
}
```

### **Response**

#### **Success (201)**  Returns a confirmation message along with the created item details.
```json
{
 "item": {
    "id": "65f23abcde78901234567890",
    "name": "iPhone 13",
    "shortDescription": "Latest iPhone model",
    "price": 999,
    "category": "iPhone",
    "available": true,
    "variant": "standard/variant",
    "mainPhoto": [
      "https://example.com/iphone13-main.jpg"
    ],
    "colorPhotos": [
      "https://example.com/iphone13-red.jpg",
      "https://example.com/iphone13-blue.jpg"
    ],
    "memory": [
      { "memory": "128GB", "price": 100 },
      { "memory": "256GB", "price": 200 }
    ]
  },
  "message": "Item created successfully!",
  "statusCode": 201
}
```

##### **400 Bad Request - Invalid File Upload If the file upload fails or invalid files are submitted, the response will be:**
```json
{
   "message": "Failed to upload main photo",
  "statusCode": 400
}
```

##### **500 Internal Server Error - Unexpected server issue. If an error occurs while saving the item to the database or uploading photos:**
```json
{
  "message": "An error occurred while saving the item! Please try again later.",
  "statusCode": 500
}
```
---
### **PATCH /items/:id**

### **Description**  
This endpoint allows an Admin to update an existing item by its id. It supports updating item properties such as the name, description, price, and photos. If the photos are changed, the old photos will be deleted from Cloudinary. The UpdateItemDto is the same as CreateItemDto with additional flexibility for updating existing items. Acces only by admins.

#### **Parameters:**
- id (required): The ID of the item to update.
- Body (required): The item data to update. This should follow the UpdateItemDto, which is the same as CreateItemDto for the required properties.
- mainPhoto (optional, file): New main photo for the item.
- colorPhotos (optional, file): New color photos for the item.
- Query (optional): updateVariants (string). If set to "true", related items (variants) will have their name updated when the main item name is updated.


#### **Request Example:**
```http
PATCH /items/65f23abcde78901234567890?updateVariants=true
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data
```

#### **Body Example:**
```json
{
  "name": "iPhone 13 Pro",
  "shortDescription": "Latest iPhone model with improved features",
  "price": 1099,
  "category": "iPhone",
  "available": true,
  "variant": "standard/variant",
  "mainPhoto": "<file>",
  "colorPhotos": ["<file1>", "<file2>"],
  "memory": [
    { "memory": "128GB", "price": 150 },
    { "memory": "256GB", "price": 250 }
  ]
}
```

### **Response**

#### **Success (200)**  Returns a confirmation message with the updated item details.
```json
{
  "updatedItem": {
    "id": "65f23abcde78901234567890",
    "name": "iPhone 13 Pro",
    "shortDescription": "Latest iPhone model with improved features",
    "price": 1099,
    "category": "iPhone",
    "available": true,
    "variant": "standard/variant",
    "mainPhoto": [
      "https://example.com/iphone13-pro-main.jpg"
    ],
    "colorPhotos": [
      "https://example.com/iphone13-pro-red.jpg",
      "https://example.com/iphone13-pro-blue.jpg"
    ],
    "memory": [
      { "memory": "128GB", "price": 150 },
      { "memory": "256GB", "price": 250 }
    ]
  },
  "statusCode": 200,
  "message": "Item updated successfully"
}
```

##### **400 Bad Request - Invalid File Upload If the file upload fails or invalid files are submitted, the response will be:**
```json
{
   "message": "Failed to upload main photo",
  "statusCode": 400
}
```

##### **500 Internal Server Error - Unexpected server issue. If an error occurs while saving the item to the database or uploading photos:**
```json
{
  "message": "An error occurred while saving the item! Please try again later.",
  "statusCode": 500
}
```

### **Additional Notes**
If the main photo or color photos are updated, the old photos will be deleted from Cloudinary.
The UpdateItemDto is the same as CreateItemDto, allowing for flexibility in updating the item details.
If the item name is updated and updateVariants is set to "true", all related variants will also have their name updated accordingly.

---
### **DELETE /items/:id**

### **Description**  
This endpoint allows an Admin to delete an item by its id. If the deleteVariants query parameter is set to "true", related variants (items with the same name) will also be deleted. Additionally, all associated photos, including main photos and color photos, will be deleted from Cloudinary.

#### **Parameters:**
- id (required): The ID of the item to delete.
- Query (optional):
- deleteVariants (optional, string): If set to "true", all variants of the item (those with the same name) will be deleted along with the main item.



#### **Request Example:**
```http
DELETE /items/65f23abcde78901234567890?deleteVariants=true
Authorization: Bearer <your-jwt-token>

```

### **Response**

#### **Success (204)**  Returns a confirmation message that the item and optionally its variants have been deleted, along with a status code.
```json
{
  "deleted": true,
  "id": "65f23abcde78901234567890",
  "statusCode": 204,
  "message": "Item deleted successfully"
}
```

##### **400 Bad Request - Invalid Item ID
If the provided item ID does not exist in the database::**
```json
{
"message": "Item Id does not exist",
  "statusCode": 400
}
```

##### **500 Internal Server Error - Database Issue or cloudinary
If there is an error while connecting to the database or deleting the item:**
```json
{
    "message": "Unable to process your request at the moment. Try again later.",
  "statusCode": 500
}
```
---
## Users

### **GET /users/allUsers**

#### **Description:**
Fetch all registered users (**Admin Only**). This endpoint requires a valid JWT token with an Admin role.

#### **Parameters:**
- **page** *(optional, number)*: The page number to fetch (default: `1`).
- **pageSize** *(optional, number)*: The number of users per page (default: `10`).

#### **Request Example:**
```http
GET /users/allUsers?page=1&pageSize=10
Authorization: Bearer <your-jwt-token> 
```

##### **Responses:**


##### **200 OK - Users fetched successfully**
```json
{
  "users": [
    {
      "_id": "678a8d8dc5104b7712cae8d2",
      "name": "Filip",
      "lastname": "Trajkovic",
      "email": "filiptrajkovic01@gmail.com",
      "role": "Admin",
      "createDate": "1737133453571",
      "address": [],
      "__v": 0
    }
  ],
  "message": "All users fetched successfully",
  "statusCode": 200
}
```

##### **401 Unauthorized - Missing or invalid Bearer token**
```json
{
  "message": "Unauthorized. Bearer token is missing or invalid.",
  "statusCode": 401
}
```

##### **403 Forbidden - Only Admins can access this route**
```json
{
  "message": "Forbidden. Only Admin users are allowed to access this route.",
  "statusCode": 403
}
```

##### **500 Internal Server Error - Unexpected server issue**
```json
{
  "message": "Error fetching items",
  "description": "An unexpected error occurred while fetching users from the database. Please try again later.",
  "statusCode": 500
}
```

---

### **GET /users/search**

#### **Description:**
Fetch a user by email (**Admin Only**). This endpoint requires a valid JWT token with an Admin role.

#### **Parameters:**
- **email** *(required, string)*: The email address to search for.

#### **Request Example:**
```http
GET /users/search?email=example@domain.com
Authorization: Bearer <your-jwt-token>
```

#### **Responses:**

##### **200 OK - User found successfully**
```json
{
  "_id": "678a8d8dc5104b7712cae8d2",
  "name": "filip",
  "passwordHash": "$2b$10$5aZ5HeoL0H66Vx4qhBRl6OPFShXRrV8tIWClY2rvVRGs4xYzPO1CO",
  "lastname": "trajkovic",
  "email": "filiptrajkovic01@gmail.com",
  "role": "Admin",
  "createDate": "1737133453571",
  "address": []
}
```

##### **400 Bad Request - Email parameter is required**
```json
{
  "message": "Bad Request. Email parameter is required.",
  "statusCode": 400
}
```

##### **401 Unauthorized - Missing or invalid Bearer token**
```json
{
  "message": "Unauthorized. Bearer token is missing or invalid.",
  "statusCode": 401
}
```

##### **403 Forbidden - Only Admins can access this route**
```json
{
  "message": "Forbidden. Only Admin users are allowed to access this route.",
  "statusCode": 403
}
```

##### **404 Not Found - No users found with the provided email**
```json
{
  "message": "No users found with the provided email address.",
  "statusCode": 404
}
```

##### **500 Internal Server Error - Unexpected issue**
```json
{
  "message": "Internal Server Error. Failed to search for users.",
  "statusCode": 500
}
```

---

### **POST /users/register**

#### **Description:**
Register a new user. Public users can create an account by providing valid credentials.
Avatar is photo file and it gets upladed to cloudinary and it is saved in database as url to cloudinary

#### **Request Example:**
```http
POST /users/register
```

#### **Request Body:**

The avatar image is uploaded to Cloudinary and stored in the database as a URL pointing to the uploaded file
```json
{
  "name": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123",
  "repeatpassword": "Password123"
}
```

#### **Responses:**
##### **200 OK - User successfully registered**
```json
{
  "message": "User Created",
  "statusCode": 200,
  "createUser": {
    "name": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "role": "User"
  }
}
```
##### **400 Bad Request** (e.g., email already exists or passwords don't match)
##### **500 Internal Server Error**

---

### **PATCH /users/update/{id}**

#### **Description:**
Update user profile (**Admin/User**). This API can be accessed by both logged-in users and admins. Only the user themself or an Admin can make updates. Avatar images are handled using **Cloudinary**.

#### **Parameters:**
- **id** *(required, string, path)*: ID of the user to update.

  #### **Request Example:**
```http
PATCH /users/update/:id
Authorization: Bearer <your-jwt-token>
```

#### **Request Body:**
The avatar image is uploaded to Cloudinary and stored in the database as a URL pointing to the uploaded file.

```json
{
  "name": "John",
  "lastname": "Doe",
  "address": [
    {
      "street": "123 Main St",
      "city": "New York",
      "country": "USA",
      "postalCode": "10001"
    }
  ],
  "avatar": [
    "avatar1.jpg"
  ]
}
```

#### **Responses:**
##### **200 OK - User updated successfully**
```json
{
  "updatedUser": {
    "_id": "678a8d8dc5104b7712cae8d2",
    "name": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "avatar": [
      "http://res.cloudinary.com/dqovsaval/image/upload/v1738092580/avatars/avatar1.jpg"
    ],
    "role": "User",
    "createDate": "2025-01-28T12:00:00Z",
    "address": [
      {
        "street": "123 Main St",
        "city": "New York",
        "country": "USA",
        "postalCode": "10001",
        "_id": "679930240a2afc53bbecf5f1"
      }
    ]
  },
  "statusCode": 200,
  "message": "User updated successfully"
}
```
##### **400 Bad Request** (e.g., invalid user ID or missing required fields)
##### **403 Forbidden - Users can only update their own account**
##### **500 Internal Server Error**

---

### **DELETE /users/update/{id}**
#### Delete User Profile (Admin Only)
This endpoint allows an Admin to delete a user by their email address. Ensure that you include a valid JWT token in the `Authorization` header as a Bearer token. The request will only be processed if the user is logged in as an Admin. Additionally, if the user has an avatar image saved in Cloudinary, it will be deleted from the cloud storage before removing the user from the database. The deletion is based on the provided email address, and the system will verify the email to ensure the correct user is being deleted.

**Parameters:**
- `email` (path) - The email address of the user to delete

#### **Request Example:**
```http
DELETE /users/delete/:email
Authorization: Bearer <your-jwt-token>
```

#### **Responses:**
##### **204**: User deleted successfully.
```json
      {
        "deleted": true,
        "statusCode": 204,
        "message": "User with email:johndoe@example.com deleted successfully"
      }
 ```
  ##### **400**: User email does not exist.
```json
      {
        "statusCode": 400,
        "message": "User email does not exist."
      }
```
  ##### **500**: Error deleting the user.
```json
      {
        "statusCode": 500,
        "message": "Unable to delete the user. Try again later."
      }
 ```

---

### PATCH /users/role/{id}
#### Update User Role (Admin Only)
Only an Admin can update a user’s role. To perform this action, ensure that you include a valid JWT token in the `Authorization` header, formatted as a Bearer token.

#### **Parameters:**
- `id` (path) - ID of the user to update

- #### **Request Example:**
```http
PATCH /users/role/:id
Authorization: Bearer <your-jwt-token>
```

#### **Request Body:**
- `role` (string) - New role to assign to the user (e.g., `Admin`, `User`)

#### **Example Request Body:**
```json
{
  "role": "User"
}

```

#### **Responses:**
##### **200**: User role updated successfully.
 ```json
      {
         "message": "User role updated successfully.",
      "updatedUser": {
        "id": "12345",
        "role": "Admin"
      },
      "statusCode": 200
      }
```
  ##### **400**: User with this  id does not exist.
 ```json
      {
      "statusCode": 400,
      "message": "User with ID 12345 does not exist."
      }
```
 ##### **500**: Error updating user role.
 ```json
      {
      "statusCode": 500,
      "message": "Failed to update the user role. Please try again later."
      }
```

---

## AUTH

### POST /auth/sign-in
#### Sign in a user

This endpoint allows a user to sign in by providing their email and password. It returns an access token and refresh token if the credentials are correct.

#### **Parameters:**
- No parameters

#### **Request Example:**
```http
POST /auth/sign-in
Content-Type: application/json
```

#### **Example Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}

```

#### **Responses:**
##### **200**: User successfully logged in, and tokens returned.
 ```json
      {
       "tokens": {
        "accessToken": "your-access-token",
        "refreshToken": "your-refresh-token"
      },
      "userId": "12345",
      "message": "User logged-In."
      }
```
  ##### **400**: Invalid password.
```json
      {
       "statusCode": 400,
      "message": "Inserted password is incorrect."
      }
```
  ##### **401**: User not found or unauthorized access.
 ```json
      {
       "statusCode": 401,
      "message": "User not found."
      }
 ```
  ##### **500**: Internal server error while generating tokens.
 ```json
      {
      "statusCode": 500,
      "message": "Error generating access token."
      }
```
---

### POST /auth/refresh-token
#### Refresh user tokens

This endpoint allows a user to refresh their access and refresh tokens by providing a valid refresh token.

#### **Parameters:**
- No parameters

#### **Request Example:**
refreshToken (string) - The refresh token used to generate new tokens.
```http
POST /auth/refresh-token
Content-Type: application/json
```

#### **Example Request Body:**
```json
{
  "refreshToken": "refresh-token"
}

```

#### **Responses:**
##### **200**: Tokens refreshed successfully.
```json
      {
      "accessToken": "new-access-token",
      "refreshToken": "new-refresh-token",
      "message": "Tokens refreshed successfully."
      }
```
 ##### **400**: Invalid or expired refresh token.
 ```json
      {
      "statusCode": 400,
      "message": "Invalid or expired refresh token."
      }
```
  ##### **401**: Refresh token is missing or user not found.
 ```json
      {  "statusCode": 401,
      "message": "Refresh token is required."
      }
```
---

## Newsletter

### POST /newsletter/subscribe
#### Subscribe to the newsletter

This endpoint allows a user to subscribe to the newsletter by providing their email address. After successful subscription, a welcoming email will be sent using Mailtrap.

#### **Parameters:**
- No parameters

#### **Request Example:**
```http
POST /newsletter/subscribe
Content-Type: application/json
```

#### **Example Request Body:**
```json
{
 "email": "john.doe@example.com"
}

```

#### **Responses:**
##### **200**: Successfully subscribed to the newsletter.
```json
      {
      "subscribe": {
        "email": "user@example.com"
      },
      "message": "Successfully Subscribed!",
      "statusCode": 200
      }
 ```
  ##### **400**:  The user with this email is already subscribed.
```json
      {
         "statusCode": 400,
      "message": "The user with this email is already subscribed, please try again with a different email."
      }
 ```
  ##### **408**: Request timed out while trying to connect to the database.
```json
      {
       "statusCode": 408,
      "message": "Unable to process your request at the moment, please try again later."
      }
```

   ##### **500**:  Internal server error while saving subscription.
```json
      {
      "statusCode": 500,
      "message": "Error saving user to database."
      }
 ```
---

### POST /newsletter/send-newsletter
#### Send a newsletter to all subscribers (Admin Only)

This endpoint allows administrators to send a newsletter email to all subscribers. It uses an EJS template for the content and supports optional attachments. The request must include a valid authentication token in the header.

#### **Parameters:**
- No parameters

#### **Request Example:**
```http
POST /newsletter/send-newsletter
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data
```

#### **Example Request Body:**

- subject (string) - Subject of the newsletter email (required).
- text (string) - Plain text body of the newsletter email (required).
- ejsFiles (array) - Array of EJS files for the newsletter (optional).
- attachments (array) - Optional array of attachments.

```json
{
  "subject": "Exciting News from Our Company!",
  "text": "Hello, we have some exciting updates for you. Stay tuned!",
  "ejsFiles": ["newsletter_template.ejs"],
  "attachments": ["attachment1.pdf", "attachment2.jpg"]
}

```

#### **Responses:**
##### **200**: Newsletter sent successfully.
 ```json
      {
      "message": "Newsletter sent successfully."
      }
 ```
  ##### **400**:  Validation errors (e.g., missing EJS file or invalid attachments)
```json
      {
      "statusCode": 400,
      "message": "EJS file is required."
      }
```
  ##### **408**: Request timeout due to database connectivity issues.
```json
      {
       "statusCode": 408,
      "message": "Unable to process your request at the moment, please try again later."
      }
 ```

  ##### **500**:  Internal server error while sending email.
 ```json
      {
      "statusCode": 500,
      "message": "An error occurred while sending the email."
      }
```
---

## Checkout

### POST /checkout
#### Create a checkout session

This endpoint allows a user to proceed to checkout by providing the item details, shipping information, and generating a payment intent.

#### **Parameters:**
- No parameters

#### **Request Example:**
```http
POST /checkout
Content-Type: application/json
```
#### **Example Request Body:**

- name (string) - The user's first name.
- lastname (string) - The user's last name.
- email (string) - The user's email address.
- adress (string) - The shipping address.
- city (string) - The city for shipping.
- postalcode (integer) - The postal code for shipping.
- country (string) - The country for shipping.
- item (array) - List of items being purchased, including:
- itemID (string) - Unique identifier for the item.
- amount (integer) - Quantity of the item.
- memory (string) - Memory specification of the item (optional, based on item).
- userId (string) - The user's ID for the transaction.
```json
{
   "name": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "adress": "1234 Elm Street",
  "city": "Springfield",
  "postalcode": 12345,
  "country": "USA",
  "item": [
    {
      "itemID": "abc123",
      "amount": 2,
      "memory": "16GB"
    }
  ],
  "userId": "user123"
}

```

#### **Responses:**
##### **201**: Checkout session created successfully with payment intent details.
```json
      {
         "totalPrice": 150,
      "discount": 7.5,
      "itemDetails": [
        {
          "itemID": "abc123",
          "name": "Laptop",
          "memory": "16GB",
          "unitPrice": 750,
          "quantity": 2,
          "totalPrice": 1500
        }
      ],
      "userExists": "userId || null",
      "clientSecret": "payment_intent(pi_1342134242)"
      }
 ```
  ##### **400**:   Invalid request data or payment processing failed
```json
      {
        "statusCode": 400,
      "message": "Invalid request data or payment processing failed."
      }
```
  ##### **404**: Item not found.
```json
      {
       "statusCode": 404,
      "message": "Item not found."
      }
 ```
---


### POST /checkout/webhooks/stripe
#### Handle Stripe Webhook

This endpoint is triggered by Stripe events (such as payment success or failure). It processes the event and saves order details if the payment succeeds.

This webhook needs to be registered in your Stripe account for it to receive events. It only works in the live environment or while using Stripe CLI to send events for testing. The raw request body from Stripe is sent along with the `stripe-signature` header, which must be validated using webhook secrete which is available when we register webhook on stripe or stripe cli.

#### **Parameters:**
- `stripe-signature` (header) - The signature sent by Stripe to verify the authenticity of the event.

#### **Request Example:**
```http
POST /checkout/webhooks/stripe
Content-Type: application/json
stripe-signature: <your-stripe-signature>
```
#### **Example Request Body:**

- payload: req.body raw which will be send back by stripe
- signature: also sent back by stripe
```json
    {
    "payload": "req.body",
    "signature": "stripe-signature"
    }

```

#### **Responses:**
##### **201**:  Successfully received and processed the Stripe event.
```json
      {
      "recived": "true"
      "message": "Order recived"
      }
```
##### **400**:   Invalid request data or payment processing failed
```json
      {
      "statusCode": 400,
      "message": "Somthing went wrong on stripe side, your paymend did not go true. Try again later!."
      }
```
---

