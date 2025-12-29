<div align="center">

# 🖼️ Artstore 3.0 - Backend

**A full-featured E-commerce platform designed for buying and selling art.**

</div>

---

## 🔥 Overview

This repository contains the complete backend source code for Artstore, a full-featured e-commerce platform designed for buying and selling art. Built with Node.js and Express, it provides a robust RESTful API to support all application functionalities, from user authentication and product management to order processing and payments.

---

## ✨ Core Features

- **Unified Auth System:** A single, secure authentication system for both Buyers and Sellers using secure cookies,access and refresh token.
- **Product Catalog:** Full CRUD (Create, Read, Update, Delete) capabilities for art listings.
- **Shopping Cart & Wishlist:** Persistent cart with support for multiple wishlists for a seamless user experience.
- **Order & Address Management:** End-to-end order processing and multi-address support for users.
- **Seller Profiles:** Dedicated pages for sellers to manage their profiles and listings.

---

## 📚 API Documentation

Our API is documented using Postman. You can access the complete and interactive documentation for both buyer and seller endpoints via the links below:

- **Buyer API Documentation:**
  https://documenter.getpostman.com/view/19675500/2sBXVbGZAs

- **Seller API Documentation:**
 https://documenter.getpostman.com/view/19675500/2sBXVbFt47



## 🛠️ Tech Stack

- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JSON Web Tokens (JWT) with Access and Refresh Tokens
- **Payment Gateway:** Razorpay
- **Image Storage:** Cloudinary
- **Validation:** Joi


---

## 📁 Folder Structure

```
artstore3.0_backend/
├── src/
│   ├── config/             # Database, payment gateway, etc.
│   ├── controllers/        # Request handling and business logic
│   ├── helpers/            # Helper functions
│   ├── middlewares/        # Express middlewares (auth, error handling)
│   ├── models/             # Mongoose schemas and models
│   ├── routes/             # API route definitions
│   ├── utils/              # Utility classes (ApiError, ApiResponse)
│   └── validations/        # Joi validation schemas
├── .env.example            # Example environment variables
├── app.js                  # Express app setup and middlewares
├── server.js               # Server entry point
└── package.json
```

---

## ⚙️ Prerequisites

- Node.js (v18.x or higher)
- npm
- MongoDB (running instance or connection URI)
- Cloudinary Account
- Razorpay Account

---

## 🚀 Installation Guide

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/artstore3.0_backend.git
    cd artstore3.0_backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add the necessary environment variables. You can use `.env.example` as a template.
    ```
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    CORS_ORIGIN=http://localhost:5173

    ACCESS_TOKEN_SECRET=your_access_token_secret
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    REFRESH_TOKEN_EXPIRY=10d

    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret

    RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret
    ```

---

## ⚡️ Available Scripts

- **To start the server in development mode (with hot-reloading):**
  ```bash
  npm run dev
  ```

- **To start the server in production mode:**
  ```bash
  npm start
  ```
- **To run prettier**
  ```bash
  npm run prettier
  ```

---

