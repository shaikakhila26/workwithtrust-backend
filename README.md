# WorkWithTrust - Backend (Express + MongoDB)

A secure and scalable freelance marketplace backend built with **Node.js**, **Express**, **MongoDB**, and **JWT**. Supports user authentication, gig management, order processing, messaging, reviews, file uploads, and payment integration.

## 📁 Folder Structure

workwithtrust-backend/

 1. controllers/      # Core business logic (auth, gigs, orders, messages, reviews, earnings)
 2. middleware/       # JWT Auth, upload, and other middleware
 3. models/           # Mongoose schemas (User, Gig, Order, Message, Review)
 4. routes/           # Express routes (auth, gigs, orders, messages, reviews, payments, webhooks)
 5. utils/            # Utility functions (stripe, helpers)
 6. uploads/          # Uploaded files (excluded in .gitignore)
 7. config/           # Database and cloudinary config
 8. .env              # Environment variables
 9. index.js          # Entry point
10. socketServer.js   # Real-time socket server

## 🚀 Features

- JWT Authentication (Login/Register)
- Secure file upload (Multer + Cloudinary)
- Gig CRUD (create, read, update, delete)
- Order management and tracking
- Messaging between users
- Reviews and ratings
- Earnings tracking for freelancers
- Stripe payment integration
- Webhook support
- MongoDB Atlas integration
- Render-compatible deployment

---

## 🧪 API Endpoints

### Auth
- `POST /api/auth/register` → Register user
- `POST /api/auth/login` → Login user
- `GET /api/auth/me` → Get current user

### Gigs
- `POST /api/gigs/` → Create gig
- `GET /api/gigs/` → List gigs
- `GET /api/gigs/:id` → Get gig details
- `PUT /api/gigs/:id` → Update gig
- `DELETE /api/gigs/:id` → Delete gig

### Orders
- `POST /api/orders/` → Create order
- `GET /api/orders/` → List orders
- `GET /api/orders/:id` → Get order details
- `PUT /api/orders/:id` → Update order

### Messages
- `POST /api/messages/` → Send message
- `GET /api/messages/:orderId` → Get messages for order

### Reviews
- `POST /api/reviews/` → Add review
- `GET /api/reviews/:gigId` → Get reviews for gig

### Earnings
- `GET /api/earnings/` → Get freelancer earnings

### Payments
- `POST /api/payments/stripe` → Create Stripe payment intent
- `POST /api/webhook` → Stripe webhook

---

## 📦 Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- Multer + Cloudinary (file upload)
- JWT + Bcrypt (auth)
- Stripe (payments)
- Socket.io (real-time messaging)

## 🛠 Deployment Notes

- Backend deployed on **Render**
- Enable CORS for frontend origin
- Store sensitive keys in `.env`

---

## ✅ Author

**Shaik Akhila** (Kidoo26)
Computer Science | MERN Developer | Loves building full-stack apps
