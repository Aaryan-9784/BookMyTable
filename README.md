# BookMyTable

A full-stack restaurant table reservation platform. Customers browse and book tables, restaurant partners manage their operations through a dedicated console, and admins oversee everything from a central panel — all wrapped in a dark-gold luxury UI.

**Live:** [bookmytable.me](https://bookmytable.me)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [User Roles](#user-roles)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Common Issues](#common-issues)

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework & build tool |
| Tailwind CSS | Utility-first styling |
| React Router v6 | Client-side routing |
| Framer Motion | Page & component animations |
| Axios | HTTP client with interceptors |
| Supabase Auth | User authentication |
| react-hot-toast | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js 18+ + Express 4 | REST API server |
| Mongoose | MongoDB ODM |
| jsonwebtoken + jwk-to-pem | JWT verification |
| express-validator | Input validation |
| Cloudinary | Image storage & CDN |
| Nodemailer + Resend | Transactional emails |
| Multer | Multipart file uploads |
| Helmet + CORS | Security headers |
| Morgan | HTTP request logging |
| Server-Sent Events (SSE) | Real-time push notifications |

### Infrastructure
| Service | Purpose |
|---|---|
| AWS Amplify | Frontend hosting + CI/CD |
| AWS Elastic Beanstalk | Backend hosting (Node.js) |
| MongoDB Atlas | Cloud database |
| Supabase | Authentication provider |

---

## Project Structure

```
BookMyTable/
├── client/                          # React frontend (Vite)
│   ├── public/
│   │   ├── _redirects               # Amplify/Netlify SPA routing fix
│   │   └── *.jpg                    # Static assets
│   ├── src/
│   │   ├── admin/                   # Admin portal (role-gated)
│   │   │   ├── components/          # Admin-specific UI (DataTable, StatsCard, etc.)
│   │   │   ├── pages/               # Dashboard, Restaurants CRUD, Users
│   │   │   ├── services/            # adminApi.js
│   │   │   ├── utils/               # CSV export
│   │   │   ├── AdminLayout.jsx      # Admin shell with sidebar + navbar
│   │   │   └── AdminProtectedRoute.jsx
│   │   ├── restaurant/              # Restaurant partner portal (role-gated)
│   │   │   ├── components/          # RestaurantNavbar, RestaurantSidebar
│   │   │   ├── pages/               # Dashboard, Tables, Bookings, Analytics, Settings
│   │   │   ├── services/            # restaurantApi.js
│   │   │   ├── utils/               # CSV export
│   │   │   ├── RestaurantLayout.jsx
│   │   │   └── RestaurantProtectedRoute.jsx
│   │   ├── components/              # Shared UI components
│   │   │   ├── BookingForm.jsx
│   │   │   ├── Navbar.jsx / Footer.jsx
│   │   │   ├── RestaurantCard.jsx
│   │   │   ├── SearchInput.jsx
│   │   │   └── UserProtectedRoute.jsx
│   │   ├── config/
│   │   │   └── supabase.js          # Supabase client initialisation
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Auth state, login/signup/logout actions
│   │   │   └── NotificationContext.jsx # SSE notification state
│   │   ├── hooks/
│   │   │   ├── useAuth.js           # Convenience hook for AuthContext
│   │   │   └── useDebounce.js
│   │   ├── pages/                   # Public + customer pages
│   │   │   ├── Home.jsx
│   │   │   ├── Restaurants.jsx      # Browse & filter restaurants
│   │   │   ├── RestaurantDetails.jsx
│   │   │   ├── BookTable.jsx        # Booking flow
│   │   │   ├── MyBookings.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx / Signup.jsx / ForgotPassword.jsx
│   │   ├── services/
│   │   │   └── api.js               # Axios instance with auth interceptor
│   │   ├── utils/
│   │   │   ├── authSession.js       # Session event helpers
│   │   │   ├── constants.js         # localStorage keys, shared constants
│   │   │   ├── formatDate.js
│   │   │   └── timeSlots.js         # Generates bookable time slot options
│   │   ├── App.jsx                  # Route tree (all three portals)
│   │   ├── main.jsx                 # React root
│   │   └── index.css                # Tailwind base + custom design tokens
│   ├── .env                         # Client env vars (VITE_*)
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vercel.json
│
├── server/                          # Express backend
│   ├── config/
│   │   └── db.js                    # MongoDB Atlas connection
│   ├── controllers/                 # Route handler logic
│   │   ├── restaurantController.js
│   │   ├── bookingController.js
│   │   ├── userController.js
│   │   ├── adminController.js
│   │   ├── restaurantDashboardController.js
│   │   ├── authController.js        # OTP send/verify, welcome email
│   │   └── uploadController.js      # Cloudinary upload handler
│   ├── middleware/
│   │   ├── verifyCognitoToken.js    # JWT decode + MongoDB user upsert
│   │   ├── requireAdmin.js          # Role check: admin only
│   │   ├── requireRole.js           # Role check: parameterised
│   │   ├── uploadImage.js           # Multer config for image uploads
│   │   ├── asyncHandler.js          # Wraps async controllers
│   │   └── errorHandler.js          # 404 + global error responses
│   ├── models/
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── Booking.js
│   │   └── Table.js
│   ├── routes/
│   │   ├── restaurantRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── userRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── restaurantDashboardRoutes.js
│   │   ├── authRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── notificationRoutes.js
│   ├── utils/
│   │   ├── sseManager.js            # In-process SSE broker (push to user / broadcast)
│   │   ├── verifyCognitoJwt.js      # JWKS-based Cognito fallback verifier
│   │   ├── emailService.js          # Nodemailer + Resend helpers
│   │   └── cloudinaryUpload.js      # Cloudinary upload utility
│   ├── scripts/                     # One-off DB maintenance scripts
│   ├── .env                         # Server env vars (never commit)
│   ├── app.js                       # Express app setup (routes, middleware)
│   ├── server.js                    # HTTP server entry point
│   └── package.json
│
├── amplify.yml                      # Amplify monorepo build spec
├── .gitignore
└── README.md
```

---

## Features

### Customer
- Browse restaurants with search and filters (cuisine, location, price range, rating)
- View restaurant details, gallery, reviews, and opening hours
- Book a table — choose date, time slot, and guest count
- Token fee system — a small refundable deposit is collected per booking
- View and cancel bookings from the "My Bookings" page
- User profile management with password change

### Restaurant Partner
- Dedicated dashboard at `/restaurant-dashboard` with KPI stats
- Table management — add/edit/delete tables with zone, capacity, and token fee
- Bookings management — view all reservations, update statuses in real time
- Token fee analytics — track earnings from confirmed bookings
- Restaurant settings — update opening hours, description, seating capacity
- Export dashboard analytics as CSV

### Admin
- Central panel at `/admin` for platform oversight
- Full restaurant CRUD with approve / reject workflow
- User management — view all users, change roles, delete accounts
- Booking oversight — list and delete any booking
- Platform-wide stats on the dashboard

### Platform
- Real-time notifications via Server-Sent Events (SSE)
- Email notifications — booking confirmation, cancellation, welcome email
- Image uploads via Cloudinary (JPEG / PNG / WebP / GIF, max 5 MB)
- Dark obsidian + gold design system with glassmorphism and smooth animations

---

## User Roles

| Role | Access |
|---|---|
| `customer` | Public pages + booking flow + profile |
| `restaurant` | All above + `/restaurant-dashboard` portal |
| `admin` | All above + `/admin` panel + full CRUD on all data |

Roles are assigned automatically:
- Emails listed in `ADMIN_EMAILS` → `admin`
- Emails listed in `RESTAURANT_EMAILS` → `restaurant`
- Everyone else → `customer`

Role is determined on every request by the `verifyCognitoToken` middleware and stored in MongoDB.

---

## Data Models

### User
```
email       String   unique, indexed
password    String   bcrypt-hashed, not returned in queries
name        String
phone       String
role        Enum     customer | restaurant | admin
restaurantId ObjectId  ref → Restaurant (for restaurant owners)
```

### Restaurant
```
name              String   required
location          String   required
description       String
imageUrl          String   primary image (Cloudinary URL)
imageUrls         [String] gallery images
category          String   e.g. "Indian", "Italian"
priceRange        Number   1 (₹) to 4 (₹₹₹₹)
rating            Number   0–5
reviews           [{author, text, rating, date}]
tokenFee          Number   booking deposit in ₹ (default 150)
totalSeatingCapacity Number
openingHours      String   e.g. "11:00 AM – 11:00 PM"
ownerId           ObjectId ref → User
approvalStatus    Enum     pending | approved | rejected
rejectionReason   String
```

### Booking
```
userId        ObjectId  ref → User, required
restaurantId  ObjectId  ref → Restaurant, required
date          String    e.g. "2026-08-15"
time          String    e.g. "7:00 PM"
guests        Number    1–50
status        Enum      confirmed | cancelled
```
Unique index on `(userId, restaurantId, date, time)` where `status = confirmed` — prevents double-booking the same slot.

### Table
```
restaurantId  ObjectId  ref → Restaurant, required
tableNumber   String    required, unique per restaurant
capacity      Number    1–30 (default 4)
zone          Enum      Main Hall | Outdoor Terrace | VIP Private Dining | Rooftop | Bar Counter
status        Enum      Available | Reserved | Maintenance
tokenFee      Number    per-table override (default 150)
```

---

## API Reference

### Public

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/restaurants` | List restaurants (filterable, paginated) |
| GET | `/api/restaurants/:id` | Single restaurant |

**Query params for `GET /api/restaurants`**

| Param | Example | Description |
|---|---|---|
| `q` | `?q=pizza` | Full-text search (name / location / category) |
| `category` | `?category=Indian` | Filter by cuisine type |
| `location` | `?location=Mumbai` | Filter by city |
| `minPrice` | `?minPrice=2` | Min price range (1–4) |
| `maxPrice` | `?maxPrice=3` | Max price range (1–4) |
| `minRating` | `?minRating=4` | Minimum rating |
| `sort` | `?sort=rating` | `newest`, `rating`, `price_asc`, `price_desc` |
| `page` | `?page=2` | Page number (default 1) |
| `limit` | `?limit=12` | Results per page (default 9) |

### Auth (Public)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/send-login-otp` | Send OTP to email |
| POST | `/api/auth/verify-login-otp` | Verify OTP |
| POST | `/api/auth/send-welcome-email` | Trigger welcome email |

### Customer (requires JWT)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/profile` | Get own profile |
| PATCH | `/api/users/profile` | Update name / phone |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/my` | List own bookings |
| PATCH | `/api/bookings/:id/cancel` | Cancel a booking |
| GET | `/api/notifications/stream` | Open SSE stream (`?token=<jwt>`) |

### Admin (requires JWT + admin role)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard/stats` | Platform stats |
| GET | `/api/admin/restaurants` | All restaurants |
| POST | `/api/admin/restaurants` | Create restaurant |
| PUT | `/api/admin/restaurants/:id` | Update restaurant |
| PUT | `/api/admin/restaurants/:id/approve` | Approve restaurant |
| PUT | `/api/admin/restaurants/:id/reject` | Reject restaurant |
| DELETE | `/api/admin/restaurants/:id` | Delete restaurant |
| GET | `/api/admin/bookings` | All bookings |
| DELETE | `/api/admin/bookings/:id` | Delete booking |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/:id/role` | Change user role |
| DELETE | `/api/admin/users/:id` | Delete user |
| POST | `/api/upload` | Upload image to Cloudinary |

### Restaurant Dashboard (requires JWT + restaurant or admin role)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/restaurant-dashboard/stats` | Dashboard KPIs |
| GET | `/api/restaurant-dashboard/tables` | List tables |
| POST | `/api/restaurant-dashboard/tables` | Add table |
| PUT | `/api/restaurant-dashboard/tables/:id` | Update table |
| DELETE | `/api/restaurant-dashboard/tables/:id` | Delete table |
| GET | `/api/restaurant-dashboard/bookings` | List bookings |
| PUT | `/api/restaurant-dashboard/bookings/:id/status` | Update booking status |
| GET | `/api/restaurant-dashboard/analytics` | Token fee analytics |
| GET | `/api/restaurant-dashboard/settings` | Get settings |
| PUT | `/api/restaurant-dashboard/settings` | Update settings |

---

## Local Development

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | v18+ |
| npm | v9+ |
| Git | Any |

You will also need:
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works fine)
- A [Supabase](https://supabase.com) project for authentication (free tier, 50k MAU)
- A [Cloudinary](https://cloudinary.com) account for image uploads (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/BookMyTable.git
cd BookMyTable
```

### 2. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure environment variables

Copy the examples below into `server/.env` and `client/.env`, then fill in your values (see the [Environment Variables](#environment-variables) section).

### 4. Start both servers

```bash
# Terminal 1 — backend (runs on port 5000)
cd server
npm run dev

# Terminal 2 — frontend (runs on port 5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 5. Set up an admin account

Add your email to `ADMIN_EMAILS` in `server/.env`:

```env
ADMIN_EMAILS=you@example.com
```

Log in with that email and you will automatically get the `admin` role.

---

## Environment Variables

### `server/.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/bookmytable

# Supabase (optional — used for JWKS verification fallback)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Roles — comma-separated email lists
ADMIN_EMAILS=admin@example.com
RESTAURANT_EMAILS=owner@restaurant.com

# Cloudinary — image uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (choose one or both)
GMAIL_USER=you@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=BookMyTable <noreply@bookmytable.me>

# CORS — set to your frontend URL in production
CLIENT_URL=http://localhost:5173
```

### `client/.env`

```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# Supabase Auth — get these from your Supabase project settings
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> Never commit `.env` files. They are listed in `.gitignore`.

---

## Deployment

### Frontend — AWS Amplify

The repo includes `amplify.yml` at the root configured for the monorepo layout.

1. AWS Console → Amplify → Create new app → Host web app
2. Connect GitHub → select `BookMyTable` → branch `main`
3. Amplify auto-detects `amplify.yml` (builds from the `client/` folder)
4. Add environment variables:
   - `VITE_API_URL` → your Elastic Beanstalk URL
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
5. Deploy — Amplify auto-deploys on every push to `main`

### Backend — AWS Elastic Beanstalk

Create the deployment zip (PowerShell):

```powershell
$source = "path\to\BookMyTable\server"
$dest   = "path\to\BookMyTable\bookmytable-api.zip"

if (Test-Path $dest) { Remove-Item $dest }

$excludeNames = @("node_modules", ".env", ".git", "scripts", ".elasticbeanstalk")

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($dest, 'Create')

Get-ChildItem -Path $source -Recurse | Where-Object {
    $rel = $_.FullName.Substring($source.Length + 1)
    $top = $rel.Split('\')[0]
    $top -notin $excludeNames -and $_.Name -ne ".env" -and $_.Extension -ne ".pem"
} | ForEach-Object {
    if (-not $_.PSIsContainer) {
        $rel = $_.FullName.Substring($source.Length + 1).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel) | Out-Null
    }
}
$zip.Dispose()
```

Deploy on EB Console:
1. Elastic Beanstalk → Create application → Name: `bookmytable-api`
2. Platform: Node.js 20+ on Amazon Linux 2023
3. Upload `bookmytable-api.zip`
4. Configuration → Software → Environment properties — add all vars from `server/.env` and set:
   - `NODE_ENV` = `production`
   - `PORT` = `8080`
   - `CLIENT_URL` = your Amplify URL

Verify the backend is running: `http://your-eb-url.elasticbeanstalk.com/health` should return `{"ok":true}`.

---

## Auth Flow

```
Client (Supabase Auth)
  │
  │  signInWithPassword() → JWT access token
  │
  └──► Axios request with Authorization: Bearer <token>
         │
         └──► verifyCognitoToken middleware (server)
                │  1. Decode JWT payload
                │  2. Extract email + sub
                │  3. Upsert User in MongoDB
                │  4. Assign role from ADMIN_EMAILS / RESTAURANT_EMAILS env
                └──► req.user attached → controller runs
```

A local JWT fallback is available for development when Supabase is not configured — the client generates a simple base64-encoded token that the server can decode without signature verification.

---

## Common Issues

**MongoDB connection refused**
→ Whitelist `0.0.0.0/0` in MongoDB Atlas → Network Access, or add your current IP.

**Images not uploading / not showing**
→ Check `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `server/.env`.

**Emails not delivered**
→ For Gmail, make sure you are using an App Password (not your account password) and that 2FA is enabled on the Google account.

**Login fails silently**
→ Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `client/.env`. The dev fallback only works when these are set to the placeholder values.

**Admin panel not accessible**
→ Add your email to `ADMIN_EMAILS` in `server/.env` and restart the server.

**CORS error in production**
→ `CLIENT_URL` in `server/.env` (or EB environment properties) must exactly match your Amplify domain — no trailing slash.

**Amplify build fails with "Monorepo spec provided without applications key"**
→ Ensure `amplify.yml` uses the `applications:` array format (already set up in this repo).

**SSE notifications not connecting**
→ The SSE stream passes the JWT as `?token=<jwt>` in the query string — make sure your reverse proxy or load balancer does not strip query params from the `/api/notifications/stream` path.

---

## License

Free to use and modify for personal and commercial projects.
