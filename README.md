<div align="center">

# 🍽️ BookMyTable

### **Enterprise Full-Stack MERN Restaurant Reservation & Venue Management Platform**

*An enterprise-grade, high-concurrency table reservation and operations engine engineered with React 18, Node.js, Express, and MongoDB Atlas. Features native JWT authentication, multi-tier Role-Based Access Control (RBAC), dining zone seating inventory, real-time Server-Sent Events (SSE), automated transactional emails, and an obsidian luxury design system.*

<br/>

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://book-my-table-dun.vercel.app)
[![Render Backend](https://img.shields.io/badge/Render-Live-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://bookmytable-dbmn.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br/>

**[🌐 Live Frontend (Vercel)](https://book-my-table-dun.vercel.app)** • **[🚀 Backend API (Render)](https://bookmytable-dbmn.onrender.com)** • **[🩺 API Health Check](https://bookmytable-dbmn.onrender.com/health)** • **[⚡ Quick Start](#-quick-start-guide)** • **[🏗️ System Architecture](#-system-architecture)** • **[📡 API Specification](#-api-specification--payload-contracts)**

</div>

---

## 🌐 Live Deployments

| Component | Platform | Live URL | Status |
|---|---|---|:---:|
| **Frontend Web App** | Vercel | [book-my-table-dun.vercel.app](https://book-my-table-dun.vercel.app) | ![Vercel](https://img.shields.io/badge/Live-Ready-brightgreen) |
| **Backend REST API** | Render | [bookmytable-dbmn.onrender.com](https://bookmytable-dbmn.onrender.com) | ![Render](https://img.shields.io/badge/Live-Healthy-brightgreen) |
| **API Health Check** | Render | [bookmytable-dbmn.onrender.com/health](https://bookmytable-dbmn.onrender.com/health) | ![200 OK](https://img.shields.io/badge/Status-200%20OK-success) |
| **Cron Keep-Alive** | cron-job.org | Scheduled every 10 min (`*/10 * * * *`) | ![Active](https://img.shields.io/badge/Cron-Active-blue) |

---

## 📌 Executive Summary

**BookMyTable** is a high-availability digital reservation and operational venue management ecosystem designed to bridge the operational gap between diners, venue operators, and platform supervisors.

### 💡 The Problem & The Solution
- **The Industry Problem**: Hospitality venues suffer substantial revenue attrition from reservation no-shows, rigid legacy booking systems lack zone-level seat customization (*Main Hall, Outdoor Terrace, VIP Private Dining, Rooftop, Bar Counter*), and diners face slow, opaque booking confirmations.
- **The BookMyTable Solution**:
  - **For Diners**: Instant multi-zone discovery, real-time availability checks, token deposit guarantees (default ₹150) protecting against no-shows, personal wishlists, and real-time SSE reservation alerts.
  - **For Restaurant Operators**: Turnkey partner dashboard (`/restaurant`) to configure dining zones, monitor live table occupancy, track guest check-in/check-out durations, view token revenue metrics, and export data to CSV.
  - **For Platform Admins**: Centralized command center (`/admin`) for venue onboarding KYC approvals, user privilege management, and global booking oversight.

---

## 🔑 Demo & Test Credentials

| Role | Interface | Email / Account | Access Level |
|---|---|---|---|
| **Platform Super Admin** | `/admin` | `aaryanpatel9784@gmail.com` | Full governance, restaurant verification, user role elevation/demotion |
| **Restaurant Partner** | `/restaurant` | Assigned via Admin Panel | Floor plan layout, table capacity, zone inventory, booking approvals |
| **Customer (Diner)** | `/` | Any self-registered user | Faceted search, table hold, token fee payment, wishlist, profile |

---

## 📋 Table of Contents

1. [System Architecture & Data Flow](#-system-architecture)
2. [Architectural Decisions & Rationale](#-architectural-decisions--rationale)
3. [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
4. [Key Features by User Persona](#-key-features-by-user-persona)
5. [Technology Stack](#-technology-stack)
6. [Repository Structure](#-repository-structure)
7. [Quick Start Guide](#-quick-start-guide)
8. [Environment Configuration Reference](#-environment-configuration-reference)
9. [Database Models & ERD](#-database-models--erd)
10. [API Specification & Payload Contracts](#-api-specification--payload-contracts)
11. [Security & Production Hardening](#-security--production-hardening)
12. [Concurrency & Double-Booking Prevention](#-concurrency--double-booking-prevention)
13. [Testing & Quality Verification](#-testing--quality-verification)
14. [Production Deployment Runbook](#-production-deployment-runbook)
15. [Troubleshooting & Operational FAQs](#-troubleshooting--operational-faqs)
16. [Contributing & License](#-contributing--license)

---

## 🏗️ System Architecture

BookMyTable implements a decoupled, three-tier architecture separating the single-page client interface, secure API gateway, stateless domain controllers, and cloud persistence layers:

```mermaid
flowchart TD
    subgraph ClientTier["🖥️ Presentation Layer (React 18 + Vite SPA)"]
        UI_Customer["Customer Portal<br/>(Discovery, Booking, Wishlist, Profile)"]
        UI_Partner["Partner Operations Hub<br/>(/restaurant - Tables, Bookings, Analytics)"]
        UI_Admin["Admin Governance Console<br/>(/admin - Approvals, Users, Metrics)"]
    end

    subgraph GatewayTier["🛡️ API Gateway & Security Pipeline (Express.js)"]
        MW_CORS["CORS & Helmet HTTP Security Headers"]
        MW_RateLimit["Tiered Express Rate Limiters<br/>(Auth: 10/15m, OTP: 5/15m, Upload: 20/h)"]
        MW_CSRF["Double-Submit Cookie CSRF Protection"]
        MW_Sanitize["Input Sanitizer (XSS & NoSQL Neutralization)"]
        MW_Auth["authMiddleware<br/>(JWT HS256 Verification & MongoDB User Hydration)"]
    end

    subgraph ServiceTier["⚙️ Application & Business Services"]
        SVC_Auth["Auth & OTP Service"]
        SVC_Reservation["Reservation & Table Hold Engine"]
        SVC_Partner["Venue & Table Inventory Service"]
        SVC_Admin["Platform Governance & Metrics Engine"]
        SVC_SSE["Real-Time SSE Broker (In-Process Event Stream)"]
        SVC_Email["Nodemailer SMTP Dispatch Engine"]
    end

    subgraph PersistenceTier["🗄️ Persistence & Infrastructure Layer"]
        DB_Mongo[("MongoDB Atlas Cluster<br/>(Users, Restaurants, Tables, Bookings, Wishlists)")]
        CDN_Cloudinary["Cloudinary CDN<br/>(High-Res Image Optimization & Storage)"]
        CACHE_Fallback["In-Memory Cache Engine<br/>(Resilient Dev Fallback)"]
    end

    ClientTier --> MW_CORS
    MW_CORS --> MW_RateLimit
    MW_RateLimit --> MW_CSRF
    MW_CSRF --> MW_Sanitize
    MW_Sanitize --> MW_Auth

    MW_Auth --> SVC_Auth
    MW_Auth --> SVC_Reservation
    MW_Auth --> SVC_Partner
    MW_Auth --> SVC_Admin

    SVC_Reservation -. Push Notification .-> SVC_SSE
    SVC_SSE -. Real-Time Stream .-> ClientTier

    SVC_Auth --> DB_Mongo
    SVC_Reservation --> DB_Mongo
    SVC_Partner --> DB_Mongo
    SVC_Admin --> DB_Mongo

    SVC_Auth --> SVC_Email
    SVC_Reservation --> SVC_Email
    SVC_Partner --> CDN_Cloudinary
    SVC_Auth --> CACHE_Fallback
```

---

## ⚖️ Architectural Decisions & Rationale

| Architecture Choice | Alternative Considered | Engineering Justification |
|---|---|---|
| **Vite 6 + React 18** | Create React App / Webpack | Instant Hot Module Replacement (HMR) powered by native ES modules; builds in under 3 seconds compared to 30+ seconds on Webpack. |
| **Native JWT + Bcrypt** | AWS Cognito / Supabase | Eliminates external vendor lock-in, reduces latency by verifying tokens locally with `JWT_SECRET`, and keeps all user records unified in MongoDB. |
| **Server-Sent Events (SSE)** | WebSockets (Socket.io) | Reservation notifications are strictly unidirectional (server $\to$ client). SSE operates natively over HTTP/2, auto-reconnects, bypasses restrictive corporate firewalls, and consumes zero connection handshake overhead. |
| **MongoDB Atlas** | PostgreSQL / MySQL | Flexible document structure effortlessly accommodates nested restaurant media arrays, dynamic operating hours, dining zones, and review sub-documents while maintaining compound indexed queries. |
| **In-Memory Cache Fallback** | Hard Redis Dependency | Automatically detects Redis availability in local/staging environments, providing zero-downtime in-memory caching without connection retry spam. |
| **Double-Submit CSRF** | Header-only Origin checks | Protects state-changing endpoints against cross-site exploitation across all browsers without requiring server-side session persistence. |

---

## 👥 Role-Based Access Control (RBAC)

The platform enforces a strict three-tier authorization hierarchy:

```
                      ┌──────────────────────────────┐
                      │        Platform Admin        │
                      │           ("admin")          │
                      │  • Full system audit & stats │
                      │  • Approve/reject venues     │
                      │  • Promote/demote user roles │
                      └──────────────▲───────────────┘
                                     │
                        Promoted by Admin via /admin
                                     │
                      ┌──────────────┴───────────────┐
                      │      Restaurant Partner      │
                      │        ("restaurant")        │
                      │  • Access /restaurant portal │
                      │  • Manage tables & zones     │
                      │  • Confirm/cancel bookings   │
                      └──────────────▲───────────────┘
                                     │
                         Default Role on Registration
                                     │
                      ┌──────────────┴───────────────┐
                      │       Standard Customer      │
                      │         ("customer")         │
                      │  • Search & filter venues    │
                      │  • Book tables with token fee│
                      │  • Personal wishlist         │
                      └──────────────────────────────┘
```

### Authorization Enforcement Matrix

| User Role | Default Landing | Protected Frontend Guard | Backend Security Middlewares |
|---|---|---|---|
| **`customer`** | `/` (Home) | `<UserProtectedRoute>` | [`authMiddleware.js`](file:///d:/Projects/BookMyTable/server/middleware/authMiddleware.js) |
| **`restaurant`** | `/restaurant` | `<RestaurantProtectedRoute>` | `authMiddleware`, [`requireRole(['admin', 'restaurant'])`](file:///d:/Projects/BookMyTable/server/middleware/requireRole.js) |
| **`admin`** | `/admin` | `<AdminProtectedRoute>` | `authMiddleware`, [`requireAdmin.js`](file:///d:/Projects/BookMyTable/server/middleware/requireAdmin.js) |

### Role Lifecycle Rules
1. **New User Self-Registration**: Every account registered natively via `POST /api/auth/register` automatically receives `role: "customer"`.
2. **Super Admin Assignment**: Any account whose email matches the server's `ADMIN_EMAILS` environment variable (e.g. `aaryanpatel9784@gmail.com`) automatically inherits the `admin` role upon token generation.
3. **Partner Elevation Workflow**: Only an authenticated `admin` has permissions to promote a `customer` to `restaurant` (or demote a partner back to `customer`) through the Admin Console (`PUT /api/admin/users/:id/role`).
4. **Token Persistence**: Changing a user's role in MongoDB dynamically re-hydrates their permissions across subsequent authenticated requests without requiring token re-issuance.

---

## 🎯 Key Features by User Persona

### 👤 1. For Customers (Diners)
- 🔍 **Faceted Discovery Engine**: Instant debounced search filtering by cuisine, city location, price tier (₹ to ₹₹₹₹), and minimum customer ratings.
- 🪑 **Atmospheric Seating Zones**: Select preferred dining zones (*Main Hall, Outdoor Terrace, VIP Private Dining, Rooftop, Bar Counter*) with customized token deposits.
- 💰 **Deposit Guarantee Mechanism**: Per-seat token deposit calculation (default ₹150) that secures reservation slots and minimizes venue no-show rates.
- ❤️ **Real-Time Wishlist**: Bookmark venues with instant optimistic UI toggling and badge count synchronization.
- 🔔 **Zero-Latency SSE Notifications**: Long-lived Server-Sent Events connection delivering live push alerts when reservations are confirmed, completed, or cancelled.
- 📧 **Automated Transactional Emails**: HTML booking confirmation receipts, cancellation updates, and secure one-time verification passcodes (OTPs).

### 🏪 2. For Restaurant Partners
- 📊 **Partner Dashboard (`/restaurant`)**: Real-time KPI summaries covering today's bookings, occupancy rates, table turnaround, and token revenue.
- 🪑 **Visual Table & Zone Inventory**: Create, update, and manage tables with custom seating capacities and zone allocations (`Available`, `Reserved`, `Maintenance`).
- 📋 **Reservation Pipeline**: Review incoming reservations, confirm seating requests, mark dining sessions completed, or process cancellations.
- 📤 **One-Click CSV Export**: Download complete guest attendance sheets and reservation histories for accounting and operational reviews.
- 🖼️ **Venue Customization**: Configure business hours, capacity limits, descriptions, and upload high-resolution venue photos directly to Cloudinary CDN.

### 👨‍💼 3. For Platform Administrators
- 🎛️ **Central Command Center (`/admin`)**: Bird's-eye metrics on platform GMV, total active users, registered dining venues, and system throughput.
- 🏢 **Restaurant Verification Pipeline**: Review pending onboarding submissions with one-click **Approve** and **Reject** mechanisms.
- 👥 **User Role Management**: Inspect all registered user accounts with administrative capability to promote customers to `restaurant` partners or demote accounts safely.
- 📑 **Global Booking Oversight**: Search, inspect, and monitor reservations across all partner venues platform-wide.

---

## 🛠️ Technology Stack

```
Frontend:   React 18  │  Vite 6  │  Tailwind CSS 3.4  │  React Router 6  │  Axios  │  Lucide Icons
Backend:    Node.js 18+  │  Express 4.18  │  MongoDB Atlas  │  Mongoose 8  │  JWT  │  BcryptJS
Cloud/Svc:  Cloudinary CDN  │  Nodemailer (SMTP)  │  Server-Sent Events (SSE)  │  Razorpay
Security:   CSRF Double-Submit  │  Tiered Express Rate Limiters  │  Input Sanitizer (XSS)
```

---

## 📁 Repository Structure

```
BookMyTable/
├── client/                               # Frontend Single Page Application (React 18 + Vite)
│   ├── public/                           # Static assets, SVG icons, and favicon
│   ├── src/
│   │   ├── admin/                        # Admin Portal Module (Role: admin)
│   │   │   ├── components/               # AdminNavbar, AdminSidebar, ConfirmModal
│   │   │   ├── pages/                    # Dashboard, RestaurantsAdmin, UsersAdmin, Add/Edit
│   │   │   ├── services/                 # adminApi.js
│   │   │   └── utils/                    # exportCSV.js
│   │   ├── restaurant/                   # Restaurant Partner Module (Role: restaurant)
│   │   │   ├── components/               # RestaurantHeader, RestaurantSidebar, TimeSpentModal
│   │   │   ├── pages/                    # RestaurantDashboard, TablesManagement, Bookings, Settings
│   │   │   ├── services/                 # restaurantApi.js
│   │   │   └── utils/                    # exportCSV.js
│   │   ├── components/                   # Reusable UI (Navbar, Footer, BookingForm, RestaurantCard)
│   │   ├── context/                      # React Contexts (AuthContext, NotificationContext, WishlistContext)
│   │   ├── hooks/                        # Custom React Hooks (useDebounce)
│   │   ├── pages/                        # Public Pages (Home, Restaurants, Details, Booking, Profile)
│   │   ├── services/                     # Central Axios API Client (api.js)
│   │   ├── utils/                        # Toast helpers, date formatters, zone calculations
│   │   ├── App.jsx                       # Route layout and route guards
│   │   ├── index.css                     # Global design tokens and obsidian theme
│   │   └── main.jsx                      # React DOM root entrypoint
│   ├── .env.example                      # Client environment template
│   ├── .gitignore                        # Client Git ignore rules
│   ├── package.json                      # Client dependencies & scripts
│   ├── tailwind.config.js                # Tailwind styling extensions
│   └── vite.config.js                    # Vite bundler and dev server configuration
│
├── server/                               # Backend REST API Server (Node.js + Express)
│   ├── config/                           # Database & caching connections (db.js, redis.js)
│   ├── controllers/                      # Route business logic handlers
│   │   ├── adminController.js            # Admin analytics, approvals & user management
│   │   ├── authController.js             # Native signup, login, OTP verification, password reset
│   │   ├── bookingController.js          # Table bookings, cancellations & status management
│   │   ├── restaurantController.js       # Restaurant searching, detail retrieval & reviews
│   │   ├── restaurantDashboardController.js # Partner table inventory & booking processing
│   │   ├── uploadController.js           # Cloudinary media uploads
│   │   ├── userController.js             # User profiles & password changes
│   │   └── wishlistController.js         # Wishlist bookmarking operations
│   ├── middleware/                       # Request processing middleware
│   │   ├── asyncHandler.js               # Async exception forwarding
│   │   ├── authMiddleware.js             # Native JWT authentication & Mongo user hydration
│   │   ├── csrfProtection.js             # Double-Submit Cookie CSRF defense
│   │   ├── errorHandler.js               # Global error handler with formatted JSON responses
│   │   ├── inputSanitizer.js             # Input sanitization against XSS & NoSQL injection
│   │   ├── passwordValidator.js          # Password complexity enforcement
│   │   ├── rateLimiter.js                # Rate limiters (Auth, OTP, API, Upload)
│   │   ├── requireAdmin.js               # Admin authorization assertion
│   │   ├── requireRole.js                # Multi-role access control
│   │   └── uploadImage.js                # Multer memory storage & file type validation
│   ├── models/                           # Mongoose data schemas (User, Restaurant, Table, Booking, Wishlist)
│   ├── routes/                           # Modular Express route declarations
│   ├── services/                         # External services (otpService.js)
│   ├── utils/                            # Core utilities (emailService, AppError, logger, sseManager)
│   ├── app.js                            # Express application setup & middleware pipeline
│   ├── server.js                         # Server listener and startup diagnostics
│   ├── .env.example                      # Backend environment template
│   ├── .gitignore                        # Backend Git ignore rules
│   └── package.json                      # Backend dependencies & scripts
│
├── .gitignore                            # Enterprise repository Git ignore rules
└── README.md                             # Comprehensive project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have the following installed locally:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- A **MongoDB Atlas** cluster URI (or local MongoDB daemon)

### 1. Clone the Repository
```bash
git clone https://github.com/Aaryan-9784/BookMyTable.git
cd BookMyTable
```

### 2. Install Dependencies
```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 3. Initialize Environment Files
Generate your `.env` files from the provided templates:

**On Windows (PowerShell):**
```powershell
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
```

**On macOS / Linux (Bash):**
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 4. Run Development Servers
Open two terminal windows:

```bash
# Terminal 1: Backend Server (http://localhost:5000)
cd server
npm run dev
```

```bash
# Terminal 2: Frontend Client (http://localhost:5173)
cd client
npm run dev
```

Navigate to **`http://localhost:5173`** in your browser.

---

## 🔐 Environment Configuration Reference

### Backend Configuration (`server/.env`)

| Variable | Required | Description | Example / Default |
|---|:---:|---|---|
| `PORT` | No | Listening port for Express API | `5000` |
| `NODE_ENV` | **Yes** | Execution mode (`development` or `production`) | `development` |
| `CLIENT_URL` | **Yes** | Origin URL of frontend (enforces CORS & CSRF) | `http://localhost:5173` |
| `MONGODB_URI` | **Yes** | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/bookmytable` |
| `JWT_SECRET` | **Yes** | 64+ char secret used to sign HS256 tokens | `c2a89f...` (random hex string) |
| `JWT_EXPIRES_IN` | No | Expiration duration for signed JWTs | `7d` |
| `ADMIN_EMAILS` | **Yes** | Comma-separated list of Super Admin emails | `aaryanpatel9784@gmail.com` |
| `GMAIL_USER` | No | Gmail address used for Nodemailer SMTP | `your-email@gmail.com` |
| `GMAIL_APP_PASSWORD` | No | 16-character Google Account App Password | `xxxx xxxx xxxx xxxx` |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud account name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | No | Cloudinary API access key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret key | `your_api_secret` |
| `RAZORPAY_KEY_ID` | No | Razorpay merchant API key | `rzp_test_xxxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | No | Razorpay merchant secret | `your_razorpay_secret` |

### Frontend Configuration (`client/.env`)

| Variable | Required | Description | Example / Default |
|---|:---:|---|---|
| `VITE_API_URL` | **Yes** | Base API URL pointing to Express backend | `http://localhost:5000` |
| `VITE_RAZORPAY_KEY_ID` | No | Public checkout key for Razorpay | `rzp_test_xxxxxxxxx` |

---

## 🗄️ Database Models & ERD

```mermaid
erDiagram
    USER ||--o{ BOOKING : places
    USER ||--o{ WISHLIST : saves
    RESTAURANT ||--o{ TABLE : contains
    RESTAURANT ||--o{ BOOKING : receives
    RESTAURANT ||--o{ WISHLIST : bookmarked_by

    USER {
        ObjectId _id PK
        string email UK "Unique, indexed"
        string password "Hashed with bcrypt (10 rounds)"
        string name "Full name"
        string phone "Contact number"
        string role "customer | restaurant | admin"
        ObjectId restaurantId FK "Linked venue if partner"
        date createdAt
    }

    RESTAURANT {
        ObjectId _id PK
        string name "Venue name"
        string location "Address / City"
        string description
        string category "Cuisine type"
        number priceRange "1 (₹) to 4 (₹₹₹₹)"
        number rating "1.0 to 5.0"
        number tokenFee "Default deposit per seat"
        number totalSeatingCapacity
        string openingHours "e.g. 10:00 AM - 11:00 PM"
        string approvalStatus "pending | approved | rejected"
        ObjectId ownerId FK "Partner user reference"
    }

    TABLE {
        ObjectId _id PK
        ObjectId restaurantId FK
        string tableNumber "e.g. T-101"
        number capacity "Number of seats"
        string zone "Main Hall | Outdoor Terrace | VIP Private Dining | Rooftop | Bar Counter"
        string status "Available | Reserved | Maintenance"
        number tokenFee "Custom per-seat fee"
    }

    BOOKING {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId restaurantId FK
        string date "YYYY-MM-DD"
        string time "07:00 PM"
        number guests "1 to 50"
        string diningZone "Selected seating atmosphere"
        number tokenFeePaid "Total token deposit (₹)"
        string status "confirmed | cancelled | completed"
        date createdAt
    }

    WISHLIST {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId restaurantId FK
        date createdAt
    }
```

---

## 📡 API Specification & Payload Contracts

### 1. Authentication Endpoints (`/api/auth`)

#### `POST /api/auth/register` — Register Account
```json
// Request Body:
{
  "name": "Aaryan Patel",
  "email": "aaryan@example.com",
  "password": "SecurePassword123!"
}

// Response (201 Created):
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f3d8a9b2c3d4e5f6a7b8c9",
    "name": "Aaryan Patel",
    "email": "aaryan@example.com",
    "role": "customer"
  }
}
```

#### `POST /api/auth/login` — Authenticate User
```json
// Request Body:
{
  "email": "aaryan@example.com",
  "password": "SecurePassword123!"
}

// Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f3d8a9b2c3d4e5f6a7b8c9",
    "name": "Aaryan Patel",
    "email": "aaryan@example.com",
    "role": "customer"
  }
}
```

---

### 2. Table Reservation Endpoints (`/api/bookings`)

#### `POST /api/bookings` — Create Table Hold & Booking
```json
// Headers:
// Authorization: Bearer <JWT_TOKEN>
// x-csrf-token: <CSRF_TOKEN>

// Request Body:
{
  "restaurantId": "65f3c1a2b3c4d5e6f7a8b9c0",
  "date": "2026-09-20",
  "time": "08:00 PM",
  "guests": 4,
  "diningZone": "VIP Private Dining",
  "guestName": "Aaryan Patel",
  "guestEmail": "aaryan@example.com",
  "guestPhone": "+91 9876543210"
}

// Response (201 Created):
{
  "message": "Booking confirmed successfully",
  "booking": {
    "_id": "65f3e2b1a0b9c8d7e6f5a4b3",
    "restaurantId": "65f3c1a2b3c4d5e6f7a8b9c0",
    "date": "2026-09-20",
    "time": "08:00 PM",
    "guests": 4,
    "diningZone": "VIP Private Dining",
    "tokenFeePaid": 600,
    "status": "confirmed"
  }
}
```

---

### 3. Complete Endpoint Reference Matrix

| Category | Method | Route | Access | Description |
|---|---|---|:---:|---|
| **Auth** | `POST` | `/api/auth/register` | Public | Register new account (defaults to `role: "customer"`) |
| | `POST` | `/api/auth/login` | Public | Authenticate with credentials and receive JWT |
| | `POST` | `/api/auth/send-otp` | Public | Dispatch email verification OTP code |
| | `POST` | `/api/auth/verify-otp` | Public | Validate OTP code |
| | `POST` | `/api/auth/reset-password` | Public | Set new password with verified OTP |
| | `GET` | `/api/auth/me` | Authenticated | Retrieve profile for authenticated user |
| | `POST` | `/api/auth/logout` | Authenticated | Terminate user session and clear cookies |
| | `GET` | `/api/auth/csrf-token` | Public | Fetch CSRF Double-Submit token |
| **Restaurants**| `GET` | `/api/restaurants` | Public | Query venues with faceted filters and search |
| | `GET` | `/api/restaurants/:id` | Public | Fetch detailed profile, hours, and photos |
| | `GET` | `/api/restaurants/:id/tables` | Public | Fetch real-time table availability by zone |
| | `POST` | `/api/restaurants/:id/reviews`| Authenticated | Submit verified customer review and rating |
| **Bookings** | `POST` | `/api/bookings` | Authenticated | Reserve table with zone selection |
| | `GET` | `/api/bookings/my` | Authenticated | List all bookings for authenticated user |
| | `GET` | `/api/bookings/:id` | Authenticated | Retrieve specific reservation details |
| | `PATCH` | `/api/bookings/:id/cancel` | Authenticated | Cancel an active reservation |
| **Wishlist** | `GET` | `/api/wishlist` | Authenticated | Fetch list of bookmarked venues |
| | `POST` | `/api/wishlist/toggle/:restaurantId` | Authenticated | Toggle venue in personal wishlist |
| | `GET` | `/api/wishlist/check/:restaurantId` | Authenticated | Check if restaurant is bookmarked |
| **Real-Time** | `GET` | `/api/notifications/stream` | Authenticated | Long-lived SSE push alert stream (`?token=<jwt>`) |
| **Partner** | `GET` | `/api/restaurant-dashboard/stats` | Partner/Admin | Operational KPIs, occupancy & token revenue |
| | `GET` | `/api/restaurant-dashboard/tables` | Partner/Admin | List venue tables categorized by zone |
| | `POST` | `/api/restaurant-dashboard/tables` | Partner/Admin | Add new table to inventory |
| | `PUT` | `/api/restaurant-dashboard/tables/:id`| Partner/Admin | Update table capacity, zone, or status |
| | `DELETE`| `/api/restaurant-dashboard/tables/:id`| Partner/Admin | Remove table from inventory |
| | `GET` | `/api/restaurant-dashboard/bookings` | Partner/Admin | Venue guest booking log |
| | `PUT` | `/api/restaurant-dashboard/bookings/:id/status`| Partner/Admin | Update reservation state (`confirmed`, `cancelled`, `completed`) |
| | `GET` | `/api/restaurant-dashboard/settings` | Partner/Admin | Get venue settings and hours |
| | `PUT` | `/api/restaurant-dashboard/settings` | Partner/Admin | Update venue profile, fees, and photo gallery |
| **Admin** | `GET` | `/api/admin/dashboard/stats` | Admin Only | Platform-wide volume, GMV, and analytics |
| | `GET` | `/api/admin/restaurants` | Admin Only | List all venues including pending approvals |
| | `POST` | `/api/admin/restaurants` | Admin Only | Create verified restaurant directly |
| | `PUT` | `/api/admin/restaurants/:id/approve` | Admin Only | Approve pending restaurant application |
| | `PUT` | `/api/admin/restaurants/:id/reject` | Admin Only | Reject pending restaurant application |
| | `DELETE`| `/api/admin/restaurants/:id` | Admin Only | Permanently delete venue listing |
| | `GET` | `/api/admin/users` | Admin Only | Audit registered user accounts |
| | `PUT` | `/api/admin/users/:id/role` | Admin Only | Promote / demote user role (`customer` ↔ `restaurant`) |
| | `DELETE`| `/api/admin/users/:id` | Admin Only | Delete user account |
| **Uploads** | `POST` | `/api/upload` | Partner / Admin | Upload single image to Cloudinary (multipart, max 5MB) |

---

## 🔒 Security & Production Hardening

BookMyTable implements a multi-tier defense-in-depth security model:

1. **CSRF Protection (Double-Submit Cookie Pattern)**:
   - State-modifying requests (`POST`, `PUT`, `PATCH`, `DELETE`) require an `x-csrf-token` header matching the signed CSRF cookie issued via `GET /api/auth/csrf-token`.
2. **Tiered Rate Limiting**:
   - `authLimiter`: 10 requests / 15 minutes (Mitigates credential stuffing).
   - `otpLimiter`: 5 OTP attempts / 15 minutes (Prevents OTP brute-force).
   - `uploadLimiter`: 20 uploads / hour per IP (Prevents media storage abuse).
   - `adminLimiter`: 100 requests / 15 minutes.
3. **Input Sanitization**:
   - Middleware automatically strips malicious script tags and neutralizes dangerous NoSQL operator injection across all request bodies and query parameters.
4. **Password Cryptography**:
   - Enforces a minimum of 8 characters requiring uppercase, lowercase, numbers, and symbols.
   - Passwords hashed with **Bcrypt using 10 computation rounds**.
5. **Resilient Caching Fallback**:
   - In development environments without Redis, the server automatically switches to an in-process cache, preventing connection retry loops.

---

## ⚡ Concurrency & Double-Booking Prevention

To eliminate race conditions when multiple users attempt to reserve the same table or slot simultaneously:
1. **Compound Unique Indexing**: MongoDB enforces unique constraints across reservation composites to ensure idempotency.
2. **Zone Capacity Locking**: Booking operations aggregate currently confirmed reservations against total zone table thresholds before persisting, preventing over-allocation.
3. **Atomic State Transitions**: Status changes (`confirmed` $\to$ `completed` / `cancelled`) utilize atomic Mongoose operations (`findOneAndUpdate`), guaranteeing that concurrent requests cannot mutate an already processed booking.

---

## 🧪 Testing & Quality Verification

To verify codebase health and build integrity across both workspaces:

```bash
# 1. Syntax check all server files (0 errors)
Get-ChildItem -Path "server" -File -Recurse -Filter *.js | Where-Object { $_.FullName -notmatch "node_modules" } | ForEach-Object { node --check $_.FullName }

# 2. Production build verification for frontend
cd client
npm run build

# 3. Clean built dist folder after verification
Remove-Item -Recurse -Force "dist"
```

---

## 🚢 Production Deployment Runbook

### Frontend Deployment (Vercel)
- **Live URL**: [https://book-my-table-dun.vercel.app](https://book-my-table-dun.vercel.app)
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: `VITE_API_URL=https://bookmytable-dbmn.onrender.com`

### Backend Deployment (Render)
- **Live API**: [https://bookmytable-dbmn.onrender.com](https://bookmytable-dbmn.onrender.com)
- **Health Check**: [https://bookmytable-dbmn.onrender.com/health](https://bookmytable-dbmn.onrender.com/health)
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Keep-Alive**: Scheduled cron job on `cron-job.org` (`*/10 * * * *` pinging `/health`)

---

## 🐛 Troubleshooting & Operational FAQs

<details>
<summary><b>1. MongoDB Authentication Failed (bad auth : authentication failed)</b></summary>

- **Symptom:** Server halts on startup with `bad auth : authentication failed`.
- **Cause:** The database username or password in `MONGODB_URI` does not match the Database User credentials in MongoDB Atlas.
- **Solution:**
  1. Go to [cloud.mongodb.com](https://cloud.mongodb.com).
  2. Navigate to **Security** → **Database Access**.
  3. Verify the user exists or click **Edit** → **Edit Password** to reset it.
  4. If your password contains special characters (e.g. `@`, `#`, `%`), URL-encode them.
  5. Go to **Network Access** and ensure your IP or `0.0.0.0/0` is whitelisted.
</details>

<details>
<summary><b>2. CSRF Validation Error (403 Forbidden)</b></summary>

- **Symptom:** Forms fail with `Invalid or missing CSRF token`.
- **Cause:** The `CLIENT_URL` in `server/.env` does not match the client origin or cookies are blocked.
- **Solution:** Ensure `CLIENT_URL=http://localhost:5173` is set in `server/.env` and Axios sends requests with `withCredentials: true`.
</details>

<details>
<summary><b>3. Email OTP Not Received</b></summary>

- **Symptom:** No verification email arrives during password resets.
- **Cause:** Standard Google Account passwords cannot be used for SMTP authentication.
- **Solution:** Enable 2-Step Verification on your Google Account, generate a 16-character **App Password**, and set it in `GMAIL_APP_PASSWORD`.
</details>

---

## 📄 Contributing & License

Contributions are welcome! Please follow standard pull request workflows:

1. Fork the Project repository
2. Create your Feature Branch (`git checkout -b feature/NewFeature`)
3. Commit your Changes (`git commit -m 'Add NewFeature'`)
4. Push to the Branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

This project is open-source and licensed under the **MIT License**.

<div align="center">

Crafted with ❤️ by the **BookMyTable** Engineering Team

[⬆ Back to Top](#-bookmytable)

</div>
