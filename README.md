# 🍽️ BookMyTable

A full-stack luxury restaurant reservation platform built with the MERN stack. Users can browse curated restaurants, make table reservations, and receive email confirmations — all wrapped in a premium dark-gold UI.

**Live stack:** React + Vite + Tailwind CSS · Express.js + Mongoose · Amazon Cognito · Amazon S3 + CloudFront · Amazon SES · AWS Elastic Beanstalk · AWS Amplify

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    AWS Cloud                        │
│                                                     │
│  ┌──────────────┐        ┌─────────────────────┐   │
│  │ AWS Amplify  │        │  Elastic Beanstalk  │   │
│  │  (Frontend)  │◄──────►│     (Backend API)   │   │
│  │  React/Vite  │        │    Express/Node.js   │   │
│  └──────────────┘        └──────────┬──────────┘   │
│                                     │               │
│  ┌──────────────┐        ┌──────────▼──────────┐   │
│  │  CloudFront  │        │    MongoDB Atlas     │   │
│  │    + S3      │        │     (Database)       │   │
│  │  (Images)    │        └─────────────────────┘   │
│  └──────────────┘                                   │
│                                                     │
│  ┌──────────────┐        ┌─────────────────────┐   │
│  │   Cognito    │        │    Amazon SES        │   │
│  │    (Auth)    │        │    (Emails)          │   │
│  └──────────────┘        └─────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Features

- 🔐 **Authentication** — Sign up, log in, email verification via Amazon Cognito
- 🍴 **Restaurant browsing** — Search, filter by cuisine / price / rating / location, sort
- 📅 **Table booking** — Pick date, time slot, and guest count; instant confirmation
- 📧 **Email confirmation** — Booking and cancellation emails via Amazon SES
- 👤 **User profile** — View stats, recent reservations, manage account
- 🛡️ **Admin panel** — Add/edit/delete restaurants, manage bookings and users
- 🖼️ **Image uploads** — Restaurant photos stored on S3, served via CloudFront CDN
- 💎 **Luxury UI** — Dark obsidian + gold design system, glassmorphism, smooth animations

---

## 🗂️ Project Structure

```
BookMyTable/
├── client/                     # React frontend (Vite)
│   ├── public/
│   │   └── _redirects          # Amplify SPA routing fix
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
│   ├── .platform/              # EB nginx config (upload size, timeouts)
│   ├── config/                 # DB + AWS SDK clients
│   ├── controllers/            # Route handlers
│   ├── middleware/             # Auth, error handling, upload
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routers
│   ├── utils/                  # S3, SES, JWT helpers
│   ├── Procfile                # EB process definition
│   ├── .ebignore               # Files excluded from EB zip
│   ├── .env                    # Server env vars (never commit)
│   └── package.json
│
├── amplify.yml                 # Amplify monorepo build spec
├── .gitignore
└── README.md
```

---

## 🔧 Prerequisites

| Tool | Version |
|------|---------|
| Node.js | v18+ |
| npm | v9+ |
| Git | Any |

AWS services needed:
- Amazon Cognito (auth)
- Amazon S3 + CloudFront (image storage + CDN)
- Amazon SES (transactional email)
- AWS Elastic Beanstalk (backend hosting)
- AWS Amplify (frontend hosting)
- MongoDB Atlas (database)

---

## ⚙️ Environment Variables

### `server/.env`

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/bookmytable

AWS_REGION=us-east-1

COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=your_app_client_id

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

S3_BUCKET_NAME=your-bucket-name

SES_FROM_EMAIL=you@yourdomain.com

ADMIN_EMAILS=admin@example.com

# CORS — set to your Amplify URL in production
CLIENT_URL=http://localhost:5173

SES_SANDBOX_FALLBACK_TO_SENDER=true
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5000
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_COGNITO_CLIENT_ID=your_app_client_id
```

> Never commit `.env` files — they are in `.gitignore`.

---

## 🚀 Local Development

### 1. Clone

```bash
git clone https://github.com/your-username/BookMyTable.git
cd BookMyTable
```

### 2. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Set up AWS services (see sections below)

### 4. Run

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Open `http://localhost:5173`

---

## ☁️ AWS Setup

### Amazon Cognito

1. AWS Console → Cognito → Create user pool
2. Sign-in: Email
3. Required attributes: `email`, `name`
4. App integration → create App client (Public client, no secret)
5. Note: **User Pool ID** and **Client ID**

### Amazon S3 + CloudFront

#### S3 Bucket

1. AWS Console → S3 → Create bucket
2. Region: `us-east-1`
3. Uncheck "Block all public access"
4. Permissions → Bucket policy:

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

#### CloudFront Distribution (for fast image delivery)

1. AWS Console → CloudFront → Create distribution
2. Origin domain: select your S3 bucket
3. Origin access: "Origin access control settings (recommended)"
   - Create new OAC → Sign requests → Create
4. Viewer protocol policy: "Redirect HTTP to HTTPS"
5. Cache policy: `CachingOptimized`
6. Create distribution — note the **Distribution domain** (e.g. `dxxxxxxxxx.cloudfront.net`)
7. After creation, CloudFront will prompt you to update the S3 bucket policy — click "Copy policy" and paste it into your S3 bucket policy (replaces the public one above)

Now update `server/utils/s3Upload.js` to return CloudFront URLs instead of S3 URLs:

```js
// Replace the return line in uploadBufferToS3:
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN; // e.g. dxxxxxxxxx.cloudfront.net

const safeKey = key.split('/').map(encodeURIComponent).join('/');
return CLOUDFRONT_DOMAIN
  ? `https://${CLOUDFRONT_DOMAIN}/${safeKey}`
  : `https://${bucket}.s3.${region}.amazonaws.com/${safeKey}`;
```

Add to `server/.env`:
```env
CLOUDFRONT_DOMAIN=dxxxxxxxxx.cloudfront.net
```

### Amazon SES

1. AWS Console → SES → Verified identities → Create identity
2. Choose Email address → enter your email → verify the link
3. Set `SES_FROM_EMAIL` in `server/.env`

> SES sandbox only sends to verified addresses. Request production access in SES → Account dashboard to send to anyone.

### IAM Credentials

1. AWS Console → IAM → Users → Create user
2. Attach policies: `AmazonS3FullAccess`, `AmazonSESFullAccess`
3. Security credentials → Create access key → copy into `server/.env`

---

## � Production Deployment

### Backend — AWS Elastic Beanstalk

#### Create the deployment zip (PowerShell)

```powershell
$source = "path\to\BookMyTable\server"
$dest   = "path\to\BookMyTable\bookmytable-api.zip"

if (Test-Path $dest) { Remove-Item $dest }

$excludeNames = @("node_modules", ".env", ".git", "scripts", ".elasticbeanstalk", ".ebignore", "*.pem")

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

#### Deploy on EB Console

1. AWS Console → Elastic Beanstalk → Create application
   - Name: `bookmytable-api`
2. Create environment
   - Tier: Web server
   - Platform: Node.js 20+ on Amazon Linux 2023
   - Upload: `bookmytable-api.zip`
   - Preset: Single instance (free tier)
3. Configure → Software → Environment properties — add all vars from `server/.env` plus:
   - `NODE_ENV` = `production`
   - `PORT` = `8080`
   - `CLIENT_URL` = your Amplify URL
   - `CLOUDFRONT_DOMAIN` = your CloudFront domain
4. Create environment

Verify: `http://your-eb-domain.elasticbeanstalk.com/health` → `{"ok":true}`

#### Re-deploying after changes

Re-create the zip and use "Upload and deploy" in the EB console with a new version label.

---

### Frontend — AWS Amplify

The repo includes `amplify.yml` at the root for monorepo builds.

1. AWS Console → Amplify → Create new app → Host web app
2. Connect GitHub → select `BookMyTable` repo → branch `main`
3. Amplify auto-detects `amplify.yml`
4. Environment variables — add:
   - `VITE_API_URL` = `http://your-eb-domain.elasticbeanstalk.com`
   - `VITE_AWS_REGION` = `us-east-1`
   - `VITE_COGNITO_USER_POOL_ID` = your pool ID
   - `VITE_COGNITO_CLIENT_ID` = your client ID
5. Save and deploy

Amplify auto-deploys on every push to `main`.

#### After Amplify is live

Update `CLIENT_URL` on EB to your Amplify URL:
- EB Console → your environment → Configuration → Software → Edit → update `CLIENT_URL`

Update Cognito callback URLs:
- Cognito → User Pools → your pool → App integration → App clients → your client
- Add your Amplify URL to "Allowed callback URLs" and "Allowed sign-out URLs"

---

## 🌐 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/api/restaurants` | No | List restaurants (filterable) |
| GET | `/api/restaurants/:id` | No | Single restaurant |
| POST | `/api/restaurants` | Admin | Create restaurant |
| PUT | `/api/restaurants/:id` | Admin | Update restaurant |
| DELETE | `/api/restaurants/:id` | Admin | Delete restaurant |
| POST | `/api/bookings` | User | Create booking |
| GET | `/api/bookings/my` | User | My bookings |
| PATCH | `/api/bookings/:id/cancel` | User | Cancel booking |
| POST | `/api/upload` | Admin | Upload image to S3 |
| GET | `/api/users/profile` | User | Get profile |
| PATCH | `/api/users/profile` | User | Update profile |
| GET | `/api/admin/dashboard/stats` | Admin | Dashboard stats |
| GET | `/api/admin/restaurants` | Admin | All restaurants |
| GET | `/api/admin/bookings` | Admin | All bookings |
| GET | `/api/admin/users` | Admin | All users |

**Query params for `GET /api/restaurants`:**

| Param | Example | Description |
|-------|---------|-------------|
| `q` | `?q=pizza` | Search name/location/category |
| `category` | `?category=Indian` | Filter by cuisine |
| `location` | `?location=Mumbai` | Filter by city |
| `minPrice` | `?minPrice=2` | Min price range (1–4) |
| `maxPrice` | `?maxPrice=3` | Max price range (1–4) |
| `minRating` | `?minRating=4` | Minimum rating |
| `sort` | `?sort=rating` | `newest`, `rating`, `price_asc`, `price_desc` |
| `page` | `?page=2` | Pagination |
| `limit` | `?limit=12` | Results per page |

---

## 👑 Admin Access

Add your email to `ADMIN_EMAILS` in `server/.env` (comma-separated for multiple):

```env
ADMIN_EMAILS=admin@example.com,another@example.com
```

On EB, update via Configuration → Software → Environment properties. Admins get access to `/admin` in the app.

---

## 🔒 Security Notes

- All `.env` files are gitignored
- Cognito ID tokens verified server-side (RS256, issuer, audience, expiry)
- Admin routes require valid JWT + admin role
- File uploads limited by type (JPEG/PNG/WebP/GIF) and size (5MB)
- Images served via CloudFront (not direct S3 URLs) in production
- CORS locked to `CLIENT_URL` env var

---

## 🐛 Common Issues

**"MongoDB connection failed"**
→ Whitelist `0.0.0.0/0` in MongoDB Atlas → Network Access.

**"Restaurant images not loading"**
→ Check S3 bucket policy allows public `GetObject`, or verify CloudFront OAC policy is applied.

**"Email not received after booking"**
→ SES sandbox only sends to verified emails. Set `SES_SANDBOX_FALLBACK_TO_SENDER=true` or request SES production access.

**"Login fails / token error"**
→ `COGNITO_APP_CLIENT_ID` in `server/.env` must match `VITE_COGNITO_CLIENT_ID` in `client/.env`.

**"Admin panel not accessible"**
→ Add your email to `ADMIN_EMAILS` and redeploy.

**"CORS error in production"**
→ `CLIENT_URL` on EB must exactly match your Amplify domain (no trailing slash).

**Amplify build fails with "Monorepo spec provided without applications key"**
→ Ensure `amplify.yml` uses the `applications:` array format (already configured in this repo).

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| amazon-cognito-identity-js | Cognito auth |
| Framer Motion | Animations |
| react-hot-toast | Notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | API server |
| Mongoose | MongoDB ODM |
| AWS SDK v3 | S3 + SES |
| express-validator | Input validation |
| multer | File uploads |
| jsonwebtoken + jwk-to-pem | JWT verification |
| helmet + cors | Security |

### Infrastructure
| Service | Purpose |
|---------|---------|
| AWS Elastic Beanstalk | Backend hosting (Node.js) |
| AWS Amplify | Frontend hosting + CI/CD |
| Amazon S3 | Image storage |
| Amazon CloudFront | Image CDN |
| Amazon Cognito | Authentication |
| Amazon SES | Transactional email |
| MongoDB Atlas | Database |

---

## 📄 License

Free to use and modify for personal and commercial projects.
