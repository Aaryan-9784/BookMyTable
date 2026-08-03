<div align="center">

# 🍽️ BookMyTable

### Premium Full-Stack MERN Restaurant Reservation & Management Platform

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.0-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![AWS](https://img.shields.io/badge/AWS-Amplify%20%7C%20Beanstalk-232F3E?style=flat-square&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)

**Live Demo:** [bookmytable.me](https://bookmytable.me)

A full-stack, enterprise-grade restaurant reservation platform built with modern web technologies, multi-role access control, real-time notification streams, wishlist tracking, dining zone seating management, and a luxury dark-gold obsidian design system.

[Overview](#-overview) • [Key Features](#-key-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Environment Setup](#-environment-setup) • [API Reference](#-api-reference) • [Database Schema](#-database-schema) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [User Roles & Security](#-user-roles--security)
- [Database Schemas](#-database-schemas)
- [API Reference](#-api-reference)
- [Deployment Guide](#-deployment-guide)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)
- [License & Contributing](#-license--contributing)

---

## 🎯 Overview

**BookMyTable** bridges the gap between hungry diners, restaurant managers, and platform administrators. Built with performance, security, and visual elegance in mind, it provides an end-to-end booking experience backed by real-time notification capabilities and automated transactional emails.

### Targeted Workflows

- 👤 **Customers**: Discover top-rated dining experiences, filter by cuisine/location/price, reserve tables in specific dining zones, save favorites to personal wishlists, and manage reservations.
- 🏪 **Restaurant Partners**: Manage dining capacity and layout across custom zones (VIP, Rooftop, Main Hall, Outdoor), process reservations in real time, review guest metrics, and export analytics.
- 👨‍💼 **Platform Admins**: Monitor platform metrics, audit users and partner restaurants, approve or reject new restaurant onboardings, and enforce platform standards.

---

## ✨ Key Features

### 👤 Customer Experience
- 🔍 **Advanced Search & Discovery**: Multi-faceted filtering by cuisine category, city location, price range (₹ to ₹₹₹₹), and minimum star ratings.
- 📅 **Dynamic Booking Flow**: Interactive date selection, time slot pickers, and seat capacity controls with instant fee calculation.
- ❤️ **Personal Wishlist**: Save favorite venues for quick access with real-time toggle states and counts.
- 💰 **Refundable Token Deposit**: Deposit guarantee system (₹150 default) to reduce no-shows and streamline table holds.
- 🔔 **Real-Time SSE Notifications**: Instant push notifications via Server-Sent Events for booking status changes and reminders.
- 📧 **Automated Email Confirmations**: Seamless transactional emails via Nodemailer with Gmail/Resend integration.

### 🏪 Restaurant Partner Management
- 📊 **Partner Dashboard & Analytics**: Visual metrics for occupancy rates, booking throughput, and token revenue.
- 🪑 **Zone-Based Table Management**: Configure seating capacities across custom dining areas (*VIP Private Dining, Rooftop, Outdoor Terrace, Main Hall, Bar Counter*).
- 📋 **Live Booking Management**: Approve, complete, or cancel bookings with automated customer notification triggers.
- 📤 **Report Data Export**: Export booking history and guest details directly to CSV format.
- ⚙️ **Restaurant Customization**: Update opening hours, seating capacity, high-resolution media, and descriptions.

### 👨‍💼 Platform Administration
- 🎛️ **Central Command Panel**: Comprehensive metrics covering total revenue, active users, total restaurants, and booking totals.
- 🏢 **Restaurant Verification Pipeline**: Review pending restaurant applications with one-click Approval/Rejection workflows.
- 👥 **User & Partner Audit**: Manage account privileges, user roles (`customer`, `restaurant`, `admin`), and handle account deletions safely.
- 📑 **Global Booking Oversight**: Search and monitor reservations across all registered partner locations.

### 🔒 Enterprise Security & Resilience
- 🛡️ **Multi-Layered Security**: CSRF Double-Submit Cookie protection, helmet HTTP security headers, and input sanitization to prevent XSS/SQLi attacks.
- ⚡ **Rate Limiting Engine**: IP and email-based rate limiters protecting auth, OTP verification, and image upload endpoints against brute-force attacks.
- 🔑 **Flexible Authentication**: Native JWT support with AWS Cognito / Supabase token validation and environment-locked local development auth bypass modes.
- 🖼️ **Cloudinary Image CDN**: Secure multipart image uploads with format validation and instant CDN delivery.

---

## 🛠️ Tech Stack

### Frontend Architecture
| Technology | Purpose |
|---|---|
| **React 18** | High-performance declarative component UI library |
| **Vite 5** | Lightning-fast module bundler and dev server |
| **Tailwind CSS 3.4** | Utility-first styling with modern dark-gold obsidian design tokens |
| **Framer Motion** | Fluid page transitions, modal animations, and micro-interactions |
| **Axios** | HTTP client with centralized error interceptors & CSRF token injection |
| **Lucide React** | Clean, consistent vector icons |

### Backend Architecture
| Technology | Purpose |
|---|---|
| **Node.js 18+** | Asynchronous event-driven runtime environment |
| **Express.js 4** | Modular RESTful API routing framework |
| **MongoDB Atlas + Mongoose** | Cloud document database with strict schema validation |
| **JSONWebToken (JWT)** | Secure stateful / stateless user session management |
| **AWS Cognito / Supabase** | External identity provider integration |
| **Server-Sent Events (SSE)** | Low-latency server-to-client real-time push streaming |
| **Cloudinary & Multer** | Cloud media storage, file parsing, and image optimization |
| **Nodemailer** | HTML transactional email generation & dispatch |

---

## 📁 Project Architecture

```
BookMyTable/
├── client/                      # Front-End (React + Vite + Tailwind CSS)
│   ├── public/                  # Static web assets & favicons
│   ├── src/
│   │   ├── admin/               # Admin Management Portal (Role-Gated)
│   │   │   ├── components/      # Admin tables, stats, and audit cards
│   │   │   └── pages/           # Platform metrics & partner approval pages
│   │   ├── restaurant/          # Partner Dashboard (Role-Gated)
│   │   │   ├── components/      # Table zone controls, booking lists
│   │   │   └── pages/           # Partner analytics & table management
│   │   ├── components/          # Shared components (Navbar, Footer, Modals, Cards)
│   │   ├── config/              # Environment & API client configurations
│   │   ├── context/             # React Contexts (AuthContext, NotificationContext)
│   │   ├── hooks/               # Custom hooks (useAuth, useNotification, useWishlist)
│   │   ├── pages/               # Public pages (Home, RestaurantDetail, Booking, Wishlist, Profile)
│   │   ├── services/            # Axios API wrappers (auth, booking, restaurant, admin)
│   │   ├── utils/               # Formatters, date handlers, helpers
│   │   ├── App.jsx              # Main App layout & route definitions
│   │   ├── index.css            # Custom design tokens & global CSS styles
│   │   └── main.jsx             # App initialization entrypoint
│   ├── index.html               # Main HTML host
│   ├── package.json             # Front-end dependencies
│   ├── tailwind.config.js       # Tailwind theme extensions & custom color palette
│   └── vite.config.js           # Vite development server & proxy settings
│
├── server/                      # Back-End REST API (Node.js + Express + Mongoose)
│   ├── config/                  # DB connection, Cloudinary, AWS Cognito configs
│   ├── controllers/             # Business logic handlers
│   │   ├── adminController.js   # Admin platform statistics & management
│   │   ├── authController.js    # OTP email verification & authentication
│   │   ├── bookingController.js # Reservation lifecycle management
│   │   ├── devAuthController.js # Development mode auth bypass logic
│   │   ├── restaurantController.js # Public restaurant search & detail handlers
│   │   ├── restaurantDashboardController.js # Partner table & booking handlers
│   │   ├── uploadController.js  # Image uploads to Cloudinary
│   │   ├── userController.js    # Profile & wishlist handlers
│   │   └── wishlistController.js# Wishlist CRUD handlers
│   ├── middleware/              # Express middlewares
│   │   ├── asyncHandler.js      # Async error wrapper
│   │   ├── csrfProtection.js    # Double-submit CSRF cookie guard
│   │   ├── errorHandler.js      # Centralized HTTP exception handler
│   │   ├── imageValidator.js    # File MIME type & size verification
│   │   ├── inputSanitizer.js    # XSS & injection sanitizer
│   │   ├── passwordValidator.js # Password complexity validator
│   │   ├── rateLimiter.js       # IP/Email express rate limiters
│   │   ├── requireAdmin.js      # Admin privilege assertion
│   │   ├── requireRole.js       # Dynamic role validator middleware
│   │   ├── uploadImage.js       # Multer storage configuration
│   │   └── verifyCognitoToken.js# AWS Cognito / JWT token verifier
│   ├── models/                  # Mongoose MongoDB schemas
│   │   ├── Booking.js           # Booking schema & seat allocation
│   │   ├── Restaurant.js        # Restaurant details & approval state
│   │   ├── Table.js             # Table seating schema by zone
│   │   ├── User.js              # User account & role schema
│   │   └── Wishlist.js          # Customer saved restaurant mapping
│   ├── routes/                  # Express route declarations
│   ├── scripts/                 # Database seed & utility scripts
│   ├── services/                # External services (Email, SSE Stream)
│   ├── utils/                   # Helper functions
│   ├── app.js                   # Express application setup
│   ├── server.js                # Server entrypoint & port listener
│   └── package.json             # Back-end dependencies
│
├── .gitignore                   # Master repository git ignore configuration
├── README.md                    # Platform documentation
└── amplify.yml                  # AWS Amplify deployment pipeline manifest
```

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed on your local development system:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Git**: Latest version

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/BookMyTable.git
cd BookMyTable
```

### 2. Install Dependencies

Install packages for both back-end and front-end workspaces:

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 3. Environment Configuration

Create `.env` files in both the `server` and `client` directories by copying their `.env.example` templates:

```bash
# Server Environment
cd ../server
cp .env.example .env

# Client Environment
cd ../client
cp .env.example .env
```

*(Refer to the [Environment Setup](#-environment-setup) section below for parameter descriptions).*

### 4. Run Development Servers

**Option A: Separate Terminal Windows (Recommended)**

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client
npm run dev
```

**Option B: Access the Web App**

Navigate to `http://localhost:5173` in your browser.

---

## 🔐 Environment Setup

### Server Configuration (`server/.env`)

```env
# Server Runtime
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bookmytable?retryWrites=true&w=majority

# Security & Authentication
JWT_SECRET=your-secure-64-character-random-secret-key
ADMIN_EMAILS=admin@bookmytable.me,leadadmin@example.com
RESTAURANT_EMAILS=partner@restaurant.com

# Development Authentication Bypass (Only set true for local testing)
DEV_AUTH_ENABLED=true

# AWS Cognito / External Identity Provider (Optional)
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_REGION=us-east-1

# Cloudinary CDN Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Transactional Email (Gmail App Password)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

### Client Configuration (`client/.env`)

```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000

# Supabase / External Auth (Public Key)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 👥 User Roles & Security

| Role | Access Permissions | Primary UI Interfaces |
|---|---|---|
| **customer** | Browse restaurants, book tables, manage personal bookings, manage wishlist, receive SSE alerts | Customer Home, Detail Page, Booking Flow, Wishlist, Profile |
| **restaurant** | All customer privileges + managing venue seating capacity, table zones, partner bookings, revenue stats | Restaurant Partner Dashboard (`/restaurant`) |
| **admin** | Full platform access + user management, restaurant approval/rejection, global booking monitoring | Admin Control Panel (`/admin`) |

### Role Assignment Logic
1. Accounts registering with emails matched inside `ADMIN_EMAILS` in `server/.env` automatically gain the **admin** role.
2. Accounts matching `RESTAURANT_EMAILS` gain the **restaurant** partner role.
3. All other sign-ups default to the **customer** role.

---

## 🗄️ Database Schemas

### User Schema (`server/models/User.js`)
```javascript
{
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String }, // Hashed with bcrypt
  name: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['customer', 'restaurant', 'admin'], default: 'customer' },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' }
}
```

### Restaurant Schema (`server/models/Restaurant.js`)
```javascript
{
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: String,
  imageUrl: String,
  imageUrls: [String],
  category: String,
  priceRange: { type: Number, min: 1, max: 4, default: 2 },
  rating: { type: Number, default: 4.5 },
  tokenFee: { type: Number, default: 150 },
  totalSeatingCapacity: { type: Number, default: 50 },
  openingHours: String,
  ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }
}
```

### Table Schema (`server/models/Table.js`)
```javascript
{
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableNumber: { type: String, required: true },
  capacity: { type: Number, default: 4 },
  zone: { 
    type: String, 
    enum: ['Main Hall', 'Outdoor Terrace', 'VIP Private Dining', 'Rooftop', 'Bar Counter'],
    default: 'Main Hall'
  },
  status: { type: String, enum: ['Available', 'Reserved', 'Maintenance'], default: 'Available' },
  tokenFee: { type: Number, default: 150 }
}
```

### Booking Schema (`server/models/Booking.js`)
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  time: { type: String, required: true }, // "07:00 PM"
  guests: { type: Number, required: true, min: 1, max: 50 },
  status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' }
}
```

### Wishlist Schema (`server/models/Wishlist.js`)
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true }
} // Compound unique index on (userId, restaurantId)
```

---

## 📡 API Reference

### System & Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | None | System health check endpoint |
| `GET` | `/api/auth/csrf-token` | None | Fetch CSRF protection token |
| `POST` | `/api/auth/send-login-otp` | Rate Limited | Send 2FA login OTP email |
| `POST` | `/api/auth/verify-login-otp` | Rate Limited | Verify OTP code and issue token |
| `POST` | `/api/dev-auth/login` | Dev Mode Only | Instant developer login token generation |
| `POST` | `/api/dev-auth/signup` | Dev Mode Only | Instant developer account creation |

### Public Restaurant Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/restaurants` | None | List restaurants with search (`q`), category, location, min/max price, rating, sorting & pagination |
| `GET` | `/api/restaurants/:id` | None | Fetch complete details for a single restaurant |

### Customer Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/users/profile` | User Token | Retrieve active user profile |
| `PATCH` | `/api/users/profile` | User Token | Update profile details / password |
| `POST` | `/api/bookings` | User Token | Reserve a table at a restaurant |
| `GET` | `/api/bookings/my` | User Token | Fetch all bookings for logged-in user |
| `PATCH` | `/api/bookings/:id/cancel` | User Token | Cancel an active reservation |
| `GET` | `/api/wishlist` | User Token | Get list of user's saved wishlist restaurants |
| `POST` | `/api/wishlist/toggle/:restaurantId` | User Token | Toggle saved state for a restaurant |
| `GET` | `/api/wishlist/check/:restaurantId` | User Token | Check if restaurant is saved in wishlist |
| `GET` | `/api/notifications/stream` | Token Query | Real-Time SSE stream (`?token=<jwt>`) |

### Restaurant Partner Dashboard Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/restaurant-dashboard/stats` | Partner Token | Retrieve KPI summary & occupancy rates |
| `GET` | `/api/restaurant-dashboard/tables` | Partner Token | Get table list categorized by zone |
| `POST` | `/api/restaurant-dashboard/tables` | Partner Token | Create new table seating option |
| `PUT` | `/api/restaurant-dashboard/tables/:id` | Partner Token | Update table capacity or status |
| `DELETE` | `/api/restaurant-dashboard/tables/:id` | Partner Token | Remove table from inventory |
| `GET` | `/api/restaurant-dashboard/bookings` | Partner Token | List all guest bookings for venue |
| `PUT` | `/api/restaurant-dashboard/bookings/:id/status` | Partner Token | Update booking state (confirmed/cancelled/completed) |

### Admin Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard/stats` | Admin Token | Get system-wide metrics and growth stats |
| `GET` | `/api/admin/restaurants` | Admin Token | List all restaurants including pending approvals |
| `POST` | `/api/admin/restaurants` | Admin Token | Create new restaurant listing |
| `PUT` | `/api/admin/restaurants/:id/approve` | Admin Token | Approve pending restaurant application |
| `PUT` | `/api/admin/restaurants/:id/reject` | Admin Token | Reject pending restaurant application |
| `DELETE` | `/api/admin/restaurants/:id` | Admin Token | Remove restaurant from platform |
| `GET` | `/api/admin/users` | Admin Token | Fetch list of all registered platform accounts |
| `PUT` | `/api/admin/users/:id/role` | Admin Token | Update user authorization role |
| `DELETE` | `/api/admin/users/:id` | Admin Token | Delete user account |

### Image Upload Endpoint

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/upload` | Partner / Admin | Upload single image to Cloudinary (multipart/form-data) |

---

## 🚢 Deployment Guide

### Front-End: AWS Amplify

1. **Connect Repository**: Open AWS Amplify Console -> **New App** -> **Host web app** -> Connect GitHub repository `BookMyTable` on branch `main`.
2. **Build Settings**: Amplify will automatically detect the root `amplify.yml` manifest:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd client
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: client/dist
       files:
         - '**/*'
     cache:
       paths:
         - client/node_modules/**/*
   ```
3. **Environment Variables**: Add front-end environment variables under Amplify **Environment Variables** settings (`VITE_API_URL`, etc.).

### Back-End: AWS Elastic Beanstalk

1. **Prepare ZIP Bundle**:
   ```powershell
   cd server
   # Create production deployment zip excluding node_modules and .env
   Compress-Archive -Path * -Exclusion "*.env*", "node_modules*" -DestinationPath ../server-deploy.zip
   ```
2. **Deploy Application**:
   - Platform: **Node.js 18 or 20 on Amazon Linux 2023**
   - Upload `server-deploy.zip`
   - Set environment configuration variables in Elastic Beanstalk Software settings.

---

## 🐛 Troubleshooting & FAQs

<details>
<summary><b>1. MongoDB Connection Failed / Timeout</b></summary>

- Check that your `MONGODB_URI` string in `server/.env` contains valid cluster credentials.
- Navigate to MongoDB Atlas **Network Access** settings and whitelist IP `0.0.0.0/0` or your host server IP address.
</details>

<details>
<summary><b>2. CSRF Validation Error</b></summary>

- Ensure `CLIENT_URL` in `server/.env` matches your front-end domain URL (e.g. `http://localhost:5173`).
- Confirm Axios sends credentials with requests (`withCredentials: true`).
</details>

<details>
<summary><b>3. Image Upload Fails (Cloudinary Error)</b></summary>

- Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` credentials in `server/.env`.
- Ensure uploaded files are valid image extensions (`.png`, `.jpg`, `.jpeg`, `.webp`) under 5MB.
</details>

<details>
<summary><b>4. Dev Auth Not Working</b></summary>

- Confirm `DEV_AUTH_ENABLED=true` is present in `server/.env`. (Note: dev auth endpoints are disabled automatically in production mode).
</details>

---

## 📝 License & Contributing

This project is open-source and released under the MIT License.

### Contributing
1. Fork the project repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add AmazingFeature'`).
4. Push to your branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request for review.

---

<div align="center">

Crafted with ❤️ by the **BookMyTable** Engineering Team

[⬆ Back to Top](#-bookmytable)

</div>
