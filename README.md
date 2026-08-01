<div align="center">

# 🍽️ BookMyTable

### Premium Restaurant Reservation Platform

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Live Demo:** [bookmytable.me](https://bookmytable.me)

A full-stack MERN restaurant reservation system with multi-role dashboards, real-time notifications, and a luxury dark-gold UI.

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [API Docs](#-api-reference) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [User Roles](#-user-roles)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

BookMyTable is a comprehensive restaurant booking platform serving three user types:

- **👤 Customers** — Browse restaurants, make reservations, manage bookings
- **🏪 Restaurant Partners** — Dedicated dashboard to manage tables, bookings, and analytics
- **👨‍💼 Admins** — Central panel to oversee restaurants, users, and platform operations

### Key Highlights

✅ Real-time Notifications via Server-Sent Events (SSE)  
✅ Token Fee System with refundable booking deposits  
✅ Multi-Dashboard Architecture for each user role  
✅ Cloudinary CDN integration for optimized images  
✅ Automated Email Notifications via Nodemailer & Resend  
✅ Advanced Search & Filters (cuisine, location, price, rating)  
✅ Dark Obsidian + Gold UI with Glassmorphism  
✅ Secure Authentication with Supabase Auth & JWT

---

## ✨ Features

### For Customers 👥
- 🔍 Smart search with filters (cuisine, location, price, rating)
- 📅 Easy booking flow (date, time slot, guest count)
- 💰 Token fee system (₹150 refundable deposit)
- 📱 Manage bookings (view, cancel reservations)
- 👤 Profile management with password change
- 🔔 Real-time booking notifications
- 📧 Automated email confirmations

### For Restaurant Partners 🏪
- 📊 Analytics dashboard with KPIs
- 🪑 Table management (zones: VIP, Rooftop, Outdoor, etc.)
- 📋 Booking management with status updates
- 💵 Token fee revenue tracking
- ⚙️ Restaurant settings (hours, description, capacity)
- 📤 CSV export for reports

### For Admins 👨‍💼
- 🎛️ Central dashboard with platform-wide stats
- 🏢 Full restaurant CRUD (create, edit, approve, reject, delete)
- 👥 User management (roles, account deletion)
- 📑 Booking oversight across all restaurants
- 📊 Platform analytics and growth tracking

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework & blazing-fast build tool |
| Tailwind CSS | Utility-first styling |
| React Router v6 | Client-side routing & navigation |
| Framer Motion | Smooth page & component animations |
| Axios | HTTP client with interceptors |
| Supabase Auth | User authentication provider |

### Backend
| Technology | Purpose |
|---|---|
| Node.js 18+ + Express 4 | REST API server |
| Mongoose | MongoDB ODM with schema validation |
| jsonwebtoken | JWT authentication |
| Cloudinary | Image storage & CDN |
| Nodemailer + Resend | Transactional emails |
| Multer | File upload handling |
| Helmet + CORS | Security headers & middleware |
| Server-Sent Events (SSE) | Real-time push notifications |

### Infrastructure
| Service | Purpose |
|---|---|
| AWS Amplify | Frontend hosting + CI/CD pipeline |
| AWS Elastic Beanstalk | Backend hosting (Node.js) |
| MongoDB Atlas | Cloud database (free tier: 512MB) |
| Supabase | Authentication (free tier: 50k MAU) |
| Cloudinary | Image CDN (free tier: 25GB) |

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Download Link |
|-------------|---------|---------------|
| Node.js | 18.x+ | [nodejs.org](https://nodejs.org/) |
| npm | 9.x+ | Included with Node.js |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### Required Services (All Have Free Tiers)

1. **[MongoDB Atlas](https://www.mongodb.com/atlas)** → Database (Free: 512MB)
2. **[Supabase](https://supabase.com)** → Authentication (Free: 50k MAU)
3. **[Cloudinary](https://cloudinary.com)** → Image Storage (Free: 25GB)

### Installation

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/BookMyTable.git
cd BookMyTable
```

#### 2. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

#### 3. Configure Environment

**Server** (`server/.env`):
```bash
cp .env.example .env
# Then edit .env with your credentials
```

**Client** (`client/.env`):
```bash
cp .env.example .env
# Then edit .env with your credentials
```

> 💡 See [Environment Setup](#-environment-setup) for detailed configuration guide

#### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev  # Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev  # Runs on http://localhost:5173
```

#### 5. Access Application

Open your browser:
```
http://localhost:5173
```

#### 6. Create Admin Account

1. Add your email to `ADMIN_EMAILS` in `server/.env`:
   ```env
   ADMIN_EMAILS=youremail@example.com
   ```

2. Restart backend server

3. Sign up/login with that email

4. Access admin dashboard at `/admin`

---

## 🔐 Environment Setup

### Backend Variables (`server/.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookmytable

# Authentication
JWT_SECRET=your-64-char-secure-secret  # Generate: openssl rand -base64 64
ADMIN_EMAILS=admin@example.com
RESTAURANT_EMAILS=restaurant@example.com

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Gmail)
GMAIL_USER=youremail@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# CORS
CLIENT_URL=http://localhost:5173
```

> 📖 See `.env.example` files for complete documentation

### Frontend Variables (`client/.env`)

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Supabase (Public keys only!)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Getting API Keys

<details>
<summary><b>🔑 MongoDB Atlas</b></summary>

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Click **Connect** → **Connect your application**
4. Copy connection string and replace:
   - `<password>` with your database password
   - `<dbname>` with `bookmytable`
</details>

<details>
<summary><b>🔑 Supabase</b></summary>

1. Create project at [Supabase](https://supabase.com)
2. Go to **Settings** → **API**
3. Copy:
   - **URL** → Both `.env` files
   - **anon public** → `client/.env` only
   - **service_role** → `server/.env` only
</details>

<details>
<summary><b>🔑 Cloudinary</b></summary>

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Go to **Dashboard**
3. Copy Cloud Name, API Key, and API Secret
</details>

<details>
<summary><b>🔑 Gmail App Password</b></summary>

1. Enable 2FA on your Google account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Create new app password for "Mail"
4. Copy the 16-character password
</details>

---

## 👥 User Roles

| Role | Access Level | Description |
|------|-------------|-------------|
| **customer** | Basic | Browse, book, manage own reservations |
| **restaurant** | Partner | All above + restaurant dashboard |
| **admin** | Full | All above + platform management |

### Role Assignment

Roles are automatically assigned based on email:

- Emails in `ADMIN_EMAILS` → **admin** role
- Emails in `RESTAURANT_EMAILS` → **restaurant** role  
- All other users → **customer** role

---

## 🗄️ Database Schema

### User Model
```javascript
{
  email: String (unique, indexed),
  password: String (bcrypt-hashed),
  name: String,
  phone: String,
  role: Enum ['customer', 'restaurant', 'admin'],
  restaurantId: ObjectId (ref: Restaurant)
}
```

### Restaurant Model
```javascript
{
  name: String (required),
  location: String (required),
  description: String,
  imageUrl: String,
  imageUrls: [String],
  category: String,
  priceRange: Number (1-4),
  rating: Number (0-5),
  reviews: [{author, text, rating, date}],
  tokenFee: Number (default: 150),
  totalSeatingCapacity: Number,
  openingHours: String,
  ownerId: ObjectId (ref: User),
  approvalStatus: Enum ['pending', 'approved', 'rejected']
}
```

### Booking Model
```javascript
{
  userId: ObjectId (ref: User, required),
  restaurantId: ObjectId (ref: Restaurant, required),
  date: String,  // "2026-08-15"
  time: String,  // "7:00 PM"
  guests: Number (1-50),
  status: Enum ['confirmed', 'cancelled']
}
// Unique index: (userId, restaurantId, date, time) where status='confirmed'
```

### Table Model
```javascript
{
  restaurantId: ObjectId (ref: Restaurant, required),
  tableNumber: String (required),
  capacity: Number (1-30, default: 4),
  zone: Enum ['Main Hall', 'Outdoor Terrace', 'VIP Private Dining', 'Rooftop', 'Bar Counter'],
  status: Enum ['Available', 'Reserved', 'Maintenance'],
  tokenFee: Number (default: 150)
}
```

---

## 📡 API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/restaurants` | List all restaurants (with filters) |
| GET | `/api/restaurants/:id` | Get single restaurant |

#### Query Parameters for `/api/restaurants`

| Parameter | Example | Description |
|-----------|---------|-------------|
| `q` | `?q=pizza` | Search by name/location/category |
| `category` | `?category=Indian` | Filter by cuisine |
| `location` | `?location=Mumbai` | Filter by city |
| `minPrice` | `?minPrice=2` | Min price range (1-4) |
| `maxPrice` | `?maxPrice=3` | Max price range (1-4) |
| `minRating` | `?minRating=4` | Minimum rating |
| `sort` | `?sort=rating` | Sort by: newest/rating/price_asc/price_desc |
| `page` | `?page=2` | Page number (default: 1) |
| `limit` | `?limit=12` | Results per page (default: 9) |

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-login-otp` | Send OTP to email |
| POST | `/api/auth/verify-login-otp` | Verify OTP code |
| POST | `/api/auth/send-welcome-email` | Send welcome email |

### Customer Endpoints (Requires JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get own profile |
| PATCH | `/api/users/profile` | Update profile |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my` | List own bookings |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |
| GET | `/api/notifications/stream` | SSE stream (append `?token=jwt`) |

### Admin Endpoints (Requires JWT + Admin Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard/stats` | Platform statistics |
| GET | `/api/admin/restaurants` | List all restaurants |
| POST | `/api/admin/restaurants` | Create restaurant |
| PUT | `/api/admin/restaurants/:id` | Update restaurant |
| PUT | `/api/admin/restaurants/:id/approve` | Approve restaurant |
| PUT | `/api/admin/restaurants/:id/reject` | Reject restaurant |
| DELETE | `/api/admin/restaurants/:id` | Delete restaurant |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id/role` | Change user role |
| DELETE | `/api/admin/users/:id` | Delete user |

### Restaurant Dashboard Endpoints (Requires JWT + Restaurant Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurant-dashboard/stats` | Dashboard KPIs |
| GET | `/api/restaurant-dashboard/tables` | List tables |
| POST | `/api/restaurant-dashboard/tables` | Add table |
| PUT | `/api/restaurant-dashboard/tables/:id` | Update table |
| DELETE | `/api/restaurant-dashboard/tables/:id` | Delete table |
| GET | `/api/restaurant-dashboard/bookings` | List bookings |
| PUT | `/api/restaurant-dashboard/bookings/:id/status` | Update booking status |
| GET | `/api/restaurant-dashboard/analytics` | Token fee analytics |

---

## 📁 Project Structure

```
BookMyTable/
├── client/                 # React frontend (Vite)
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── admin/          # Admin portal (role-gated)
│   │   ├── restaurant/     # Restaurant dashboard (role-gated)
│   │   ├── components/     # Shared UI components
│   │   ├── pages/          # Public & customer pages
│   │   ├── context/        # Auth & Notification contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client (axios)
│   │   └── utils/          # Helper functions
│   └── package.json
│
├── server/                 # Express backend
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth & validation
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── utils/              # SSE, email, Cloudinary
│   └── package.json
│
├── amplify.yml             # AWS Amplify build config
└── README.md
```

---

## 🚢 Deployment

### Frontend - AWS Amplify

1. **Connect Repository**
   - AWS Console → Amplify → Create new app
   - Connect GitHub → Select `BookMyTable` repo → Branch: `main`

2. **Configure Build**
   - Amplify auto-detects `amplify.yml` 
   - Builds from `client/` folder

3. **Add Environment Variables**
   ```
   VITE_API_URL=https://your-api-url.elasticbeanstalk.com
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Deploy**
   - Auto-deploys on every push to `main`

### Backend - AWS Elastic Beanstalk

1. **Create Deployment Zip**
   ```powershell
   # PowerShell script to create deployment package
   cd server
   # Zip all files except node_modules, .env, .git
   ```

2. **Deploy on EB Console**
   - Create application: `bookmytable-api`
   - Platform: Node.js 20+ on Amazon Linux 2023
   - Upload zip file

3. **Configure Environment**
   - Configuration → Software → Environment properties
   - Add all variables from `server/.env`
   - Set `NODE_ENV=production` and `PORT=8080`

4. **Verify Deployment**
   ```
   https://your-eb-url.elasticbeanstalk.com/health
   ```

---

## 🐛 Troubleshooting

### Common Issues

<details>
<summary><b>MongoDB Connection Refused</b></summary>

**Solution:**
- Go to MongoDB Atlas → Network Access
- Add IP Address: `0.0.0.0/0` (allow from anywhere)
- Or add your current IP address
</details>

<details>
<summary><b>Images Not Uploading/Showing</b></summary>

**Solution:**
- Verify Cloudinary credentials in `server/.env`
- Check if `CLOUDINARY_CLOUD_NAME`, `API_KEY`, and `API_SECRET` are correct
- Ensure image size is under 5MB
</details>

<details>
<summary><b>Emails Not Being Sent</b></summary>

**Solution:**
- For Gmail: Use App Password, not regular password
- Enable 2FA on Google account first
- Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` are correct
</details>

<details>
<summary><b>Login Fails Silently</b></summary>

**Solution:**
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `client/.env`
- Verify Supabase project is active
- Check browser console for errors
</details>

<details>
<summary><b>Admin Panel Not Accessible</b></summary>

**Solution:**
- Add your email to `ADMIN_EMAILS` in `server/.env`
- Restart backend server
- Clear browser cache and login again
</details>

<details>
<summary><b>CORS Error in Production</b></summary>

**Solution:**
- Set `CLIENT_URL` in `server/.env` to match your Amplify domain exactly
- No trailing slash
- Example: `https://main.d3xxxxxxxxx.amplifyapp.com`
</details>

<details>
<summary><b>SSE Notifications Not Working</b></summary>

**Solution:**
- JWT token must be passed as query param: `?token=<jwt>`
- Check if load balancer allows query params
- Verify `/api/notifications/stream` path is accessible
</details>

---

## 📝 License

This project is open source and available for personal and commercial use.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">

Made with ❤️ by BookMyTable Team

[⬆ Back to Top](#️-bookmytable)

</div>
