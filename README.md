# 🍽️ BookMyTable

A **full-stack luxury restaurant reservation platform** built with the MERN stack. Users can browse curated restaurants, make table reservations, and receive email confirmations — all wrapped in a premium dark-gold UI.

**Live tech stack:** React + Vite + Tailwind CSS · Express.js + Mongoose · Amazon Cognito (auth) · Amazon S3 (images) · Amazon SES (emails)

---

## 📸 Preview

> Homepage hero with full-screen background, glassmorphism search bar, and luxury card grid.

---

## ✨ Features

- 🔐 **Authentication** — Sign up, log in, email verification via Amazon Cognito
- 🍴 **Restaurant browsing** — Search, filter by cuisine / price / rating / location, sort
- 📅 **Table booking** — Pick date, time slot, and guest count; instant confirmation
- 📧 **Email confirmation** — Booking confirmation sent via Amazon SES
- 👤 **User profile** — View stats, recent reservations, manage account
- 🛡️ **Admin panel** — Add/edit/delete restaurants, manage bookings and users
- 🖼️ **Image uploads** — Restaurant photos stored on Amazon S3
- 💎 **Luxury UI** — Dark obsidian + gold design system, glassmorphism, smooth animations

---

## 🗂️ Project Structure

```
BookMyTable/
├── client/                     # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── admin/              # Admin-only pages & components
│   │   ├── components/         # Shared UI components
│   │   ├── context/            # Auth context (Cognito)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Route-level pages
│   │   ├── services/           # Axios API client
│   │   └── utils/              # Helpers (date, time slots, etc.)
│   ├── .env                    # Client env vars (VITE_*)
│   └── package.json
│
├── server/                     # Express backend
│   ├── config/                 # DB + AWS SDK clients
│   ├── controllers/            # Route handlers
│   ├── middleware/             # Auth, error handling, upload
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routers
│   ├── utils/                  # S3, SES, JWT helpers
│   ├── .env                    # Server env vars
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔧 Prerequisites

Make sure you have these installed before starting:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v18+ | [nodejs.org](https://nodejs.org) |
| npm | v9+ | Comes with Node |
| Git | Any | [git-scm.com](https://git-scm.com) |
| MongoDB | Local or Atlas | [mongodb.com](https://www.mongodb.com) |

You also need **AWS accounts** for:
- Amazon Cognito (free tier)
- Amazon S3 (free tier)
- Amazon SES (free tier)

---

## ⚙️ Environment Variables

You need **two** `.env` files — one for the server, one for the client.

### `server/.env`

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/bookmytable

# AWS Region (must match Cognito pool region)
AWS_REGION=us-east-1

# Amazon Cognito
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=your_app_client_id

# AWS IAM credentials (for S3 + SES)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# S3 bucket name
S3_BUCKET_NAME=your-bucket-name

# SES verified sender email
SES_FROM_EMAIL=you@yourdomain.com

# Comma-separated admin emails
ADMIN_EMAILS=admin@example.com

# Your frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Set to true to redirect emails to sender in SES sandbox
SES_SANDBOX_FALLBACK_TO_SENDER=true
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=your_app_client_id
```

> ⚠️ **Never commit `.env` files.** They are already in `.gitignore`.

---

## 🚀 Local Setup — Step by Step

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-username/BookMyTable.git
cd BookMyTable
```

### Step 2 — Set up MongoDB

**Option A — MongoDB Atlas (recommended for beginners)**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → create a free cluster
2. Click **Connect** → **Connect your application** → copy the URI
3. Replace `<user>` and `<password>` in the URI
4. Paste it as `MONGODB_URI` in `server/.env`

**Option B — Local MongoDB**
1. Install [MongoDB Community](https://www.mongodb.com/try/download/community)
2. Start it: `mongod`
3. Use URI: `mongodb://127.0.0.1:27017/bookmytable`

### Step 3 — Set up Amazon Cognito

1. Go to [AWS Console](https://console.aws.amazon.com) → search **Cognito**
2. Click **Create user pool**
3. Sign-in options: select **Email**
4. Keep defaults for password policy
5. Enable **Self-registration** (so users can sign up from the app)
6. Required attributes: make sure **email** and **name** are included
7. App integration → create an **App client** (type: Public client, no secret)
8. Note down:
   - **User Pool ID** → `COGNITO_USER_POOL_ID`
   - **Client ID** → `COGNITO_APP_CLIENT_ID` and `VITE_COGNITO_CLIENT_ID`

### Step 4 — Set up Amazon S3

1. Go to AWS Console → **S3** → **Create bucket**
2. Choose a unique name and your region
3. **Uncheck** "Block all public access" (so images load in the browser)
4. After creating, go to **Permissions** → **Bucket policy** → paste this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

Replace `YOUR_BUCKET_NAME` with your actual bucket name.

5. Set `S3_BUCKET_NAME` in `server/.env`

### Step 5 — Set up Amazon SES

1. Go to AWS Console → **SES** → **Verified identities**
2. Click **Create identity** → choose **Email address**
3. Enter your email → click the verification link sent to your inbox
4. Set `SES_FROM_EMAIL` in `server/.env` to that same email

> 📝 New AWS accounts are in **SES sandbox** — you can only send emails to verified addresses. To send to anyone, request production access in the SES console.

### Step 6 — Create AWS IAM credentials

1. Go to AWS Console → **IAM** → **Users** → **Create user**
2. Attach these permissions:
   - `AmazonS3FullAccess` (or a custom policy with `s3:PutObject`)
   - `AmazonSESFullAccess` (or `ses:SendEmail`)
3. Go to the user → **Security credentials** → **Create access key**
4. Copy `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` into `server/.env`

### Step 7 — Install dependencies and run

**Terminal 1 — Backend:**
```bash
cd server
npm install
npm run dev
```
You should see: `Server running on port 5000` and `MongoDB connected`

**Terminal 2 — Frontend:**
```bash
cd client
npm install
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 🌐 API Reference

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/restaurants` | No | List all restaurants (supports filters) |
| GET | `/api/restaurants/:id` | No | Get single restaurant details |
| POST | `/api/restaurants` | Admin | Create a new restaurant |
| PUT | `/api/restaurants/:id` | Admin | Update a restaurant |
| DELETE | `/api/restaurants/:id` | Admin | Delete a restaurant |
| POST | `/api/bookings` | User | Create a booking |
| GET | `/api/bookings/my` | User | Get current user's bookings |
| PATCH | `/api/bookings/:id/cancel` | User | Cancel a booking |
| POST | `/api/upload` | Admin | Upload image to S3 |
| GET | `/api/users/profile` | User | Get user profile + stats |

**Query params for `GET /api/restaurants`:**

| Param | Example | Description |
|-------|---------|-------------|
| `q` | `?q=pizza` | Search by name/location/category |
| `category` | `?category=Indian` | Filter by cuisine |
| `location` | `?location=Mumbai` | Filter by city |
| `minPrice` | `?minPrice=2` | Min price range (1–4) |
| `maxPrice` | `?maxPrice=3` | Max price range (1–4) |
| `minRating` | `?minRating=4` | Minimum rating |
| `sort` | `?sort=rating` | Sort: `newest`, `rating`, `price_asc`, `price_desc` |
| `page` | `?page=2` | Pagination |
| `limit` | `?limit=12` | Results per page |

---

## 👑 Admin Access

To make a user an admin:

1. Sign up normally through the app
2. Add that user's email to `ADMIN_EMAILS` in `server/.env`:
   ```
   ADMIN_EMAILS=admin@example.com,another@example.com
   ```
3. Restart the server

Admins can access `/admin` in the app to:
- Add / edit / delete restaurants
- Upload restaurant images to S3
- View and manage all bookings
- View all users

---

## 🏗️ Tech Stack Details

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| React Router v6 | Client-side routing |
| Axios | HTTP requests |
| amazon-cognito-identity-js | Cognito auth in browser |
| react-hot-toast | Toast notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | API server |
| Mongoose | MongoDB ODM |
| AWS SDK v3 | S3 + SES integration |
| express-validator | Input validation |
| multer | Multipart file uploads |
| jose / jwks | JWT verification |

---

## 🔒 Security Notes

- All `.env` files are gitignored — never commit secrets
- Cognito ID tokens are verified server-side (RS256, issuer, audience, expiry)
- Admin routes require both a valid JWT and admin role check
- File uploads are limited by multer (type + size)
- Use HTTPS in production and tighten CORS to your real domain

---

## 🐛 Common Issues

**"MongoDB connection failed"**
→ Check your `MONGODB_URI` is correct. If using Atlas, whitelist your IP in Network Access.

**"Restaurant images not loading"**
→ Your S3 bucket is blocking public access. Follow Step 4 above to add the bucket policy.

**"Email not received after booking"**
→ SES sandbox only sends to verified emails. Verify the recipient's email in SES or set `SES_SANDBOX_FALLBACK_TO_SENDER=true` to redirect to your own inbox.

**"Login fails / token error"**
→ Make sure `COGNITO_APP_CLIENT_ID` in `server/.env` matches `VITE_COGNITO_CLIENT_ID` in `client/.env`. They must be identical.

**"Admin panel not accessible"**
→ Add your email to `ADMIN_EMAILS` in `server/.env` and restart the server.

---

## 📄 License

Free to use and modify for personal and commercial projects.

---

## 🙌 Author

Built with ❤️ using React, Express, and AWS services.
