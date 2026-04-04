# BookMyTable

Production-oriented **MERN** stack app for restaurant table reservations: **React (Vite) + Tailwind**, **Express + Mongoose**, **Amazon Cognito** (JWT auth), **Amazon S3** (images), and **Amazon SES** (booking confirmation email).

## Root file structure

```
BookMyTable/
├── .env.example
├── .gitignore
├── README.md
├── client/
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── public/
│   │   └── favicon.svg
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── components/
│       │   ├── BookingForm.jsx
│       │   ├── Footer.jsx
│       │   ├── Loader.jsx
│       │   ├── Navbar.jsx
│       │   ├── PrivateRoute.jsx
│       │   └── RestaurantCard.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── hooks/
│       │   └── useAuth.js
│       ├── pages/
│       │   ├── BookTable.jsx
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── MyBookings.jsx
│       │   ├── RestaurantDetails.jsx
│       │   ├── Restaurants.jsx
│       │   └── Signup.jsx
│       ├── services/
│       │   └── api.js
│       └── utils/
│           ├── constants.js
│           └── formatDate.js
└── server/
    ├── app.js
    ├── loadEnv.js
    ├── package.json
    ├── server.js
    ├── config/
    │   ├── awsClients.js
    │   └── db.js
    ├── controllers/
    │   ├── bookingController.js
    │   ├── restaurantController.js
    │   └── uploadController.js
    ├── middleware/
    │   ├── errorHandler.js
    │   ├── requireAdmin.js
    │   ├── uploadImage.js
    │   └── verifyCognitoToken.js
    ├── models/
    │   ├── Booking.js
    │   ├── Restaurant.js
    │   └── User.js
    ├── routes/
    │   ├── bookingRoutes.js
    │   ├── restaurantRoutes.js
    │   └── uploadRoutes.js
    └── utils/
        ├── fetchJwks.js
        ├── s3Upload.js
        ├── sesEmail.js
        └── verifyCognitoJwt.js
```

## API routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/restaurants` | Public | List restaurants |
| GET | `/api/restaurants/:id` | Public | Get one restaurant |
| POST | `/api/restaurants` | Cognito JWT + admin | Create restaurant |
| POST | `/api/bookings` | Cognito JWT | Create booking (triggers SES email) |
| GET | `/api/bookings/my` | Cognito JWT | Current user’s bookings |
| POST | `/api/upload` | Cognito JWT + admin | Multipart `image` → S3, returns `{ url }` |

Admin access: user’s email must appear in `ADMIN_EMAILS` (comma-separated) in `server/.env`, or MongoDB `User.role` must be `admin`.

## Environment variables

See **`.env.example`** at the repository root. Create:

- **`server/.env`** — copy server-related keys from `.env.example`.
- **`client/.env`** — set `VITE_API_URL`, `VITE_AWS_REGION`, `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`.

**Critical:** `COGNITO_APP_CLIENT_ID` on the server must match `VITE_COGNITO_CLIENT_ID` on the client (same Cognito app client). The backend verifies the **ID token** audience against this value.

---

## Setup guide

### 1. MongoDB

- Install [MongoDB Community](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas).
- Local example URI: `mongodb://127.0.0.1:27017/bookmytable`
- Set `MONGODB_URI` in `server/.env`.

### 2. AWS Cognito (User Pool + app client)

1. In **AWS Console** → **Cognito** → **User pools** → **Create user pool**.
2. Sign-in options: enable **Email**.
3. Password policy: per your security needs.
4. **Self-registration** enabled if you want open signup from the app.
5. **Required attributes**: ensure **email** is available (standard attribute).
6. Create **App integration** → **App client** (public client, no secret). Note **Client ID** and **User Pool ID**.
7. Set **Hosted UI** only if you use it; this app uses **amazon-cognito-identity-js** against the pool directly.
8. Put in **`server/.env`**: `AWS_REGION`, `COGNITO_USER_POOL_ID`, `COGNITO_APP_CLIENT_ID`.
9. Put in **`client/.env`**: `VITE_AWS_REGION`, `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID` (same client ID).

JWKS URL used by the server (for reference):

`https://cognito-idp.<region>.amazonaws.com/<userPoolId>/.well-known/jwks.json`

### 3. AWS S3 (restaurant images)

1. Create an S3 bucket in the same region as the app (or your chosen region).
2. **Block Public Access**: many teams keep buckets private and use CloudFront; this template builds a **virtual-hosted–style URL** `https://<bucket>.s3.<region>.amazonaws.com/<key>`. For objects to be readable in the browser, add a **bucket policy** allowing `s3:GetObject` for the prefix you use (e.g. `restaurants/*`) or front the bucket with CloudFront.
3. Example bucket policy fragment (adjust bucket name and optional prefix):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadRestaurants",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/restaurants/*"
    }
  ]
}
```

4. IAM user or role used by the API needs **`s3:PutObject`** (and usually **`s3:PutObjectAcl`** only if you use ACLs; this code does **not** set ACLs).
5. Set `S3_BUCKET_NAME`, `AWS_REGION`, and credentials (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`) or use an instance role on EC2/ECS/Lambda.

### 4. AWS SES (email)

1. **SES** → **Verified identities** → verify your **domain** or **email** (`SES_FROM_EMAIL`).
2. New accounts are often in **sandbox**: you can only send **to** verified addresses. Verify a test recipient or request production access.
3. IAM permissions: **`ses:SendEmail`** (and `ses:SendRawEmail` if you switch to raw API later).
4. Set `SES_FROM_EMAIL` and optionally `SES_REGION` in `server/.env`.

### 5. Admin user

- Add your Cognito user’s **email** to `ADMIN_EMAILS` in `server/.env` so you can:
  - `POST /api/upload` (image to S3)
  - `POST /api/restaurants` (create listing; set `imageUrl` from upload response)

### 6. Run the backend

```bash
cd server
npm install
# Create server/.env from .env.example (root) — server keys only
npm run dev
```

API default: `http://localhost:5000` — try `GET http://localhost:5000/health`.

### 7. Run the frontend

```bash
cd client
npm install
# Create client/.env — VITE_* keys
npm run dev
```

Open `http://localhost:5173`. Set `VITE_API_URL=http://localhost:5000` so the SPA calls your API.

---

## Run instructions (quick)

1. MongoDB running (or Atlas URI in `server/.env`).
2. `server/.env` and `client/.env` filled from `.env.example`.
3. Terminal A: `cd server && npm install && npm run dev`
4. Terminal B: `cd client && npm install && npm run dev`
5. Sign up / log in via Cognito → browse restaurants → book a table → confirm email via SES (if configured and not blocked by sandbox).

---

## Security notes

- Secrets live only in **`.env`** files (not committed — see `.gitignore`).
- API validates Cognito **JWT** (RS256, issuer, audience, expiry) and attaches `req.user`.
- Booking and upload routes use **express-validator** / multer limits where applicable.
- Use **HTTPS** in production; tighten **CORS** to your real origin.

## License

Use and modify freely for your product.
