# 🍽️ BookMyTable — Backend API

[![Render Backend](https://img.shields.io/badge/Render-Live-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://bookmytable-dbmn.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Cron Keep-Alive](https://img.shields.io/badge/Cron--Job.org-Active-blue)](https://cron-job.org)

High-performance, secure REST API server powering the BookMyTable platform. Built with Node.js, Express (ES Modules), MongoDB Atlas, Mongoose, and Redis with an in-memory caching fallback.

---

## 🌐 Live Deployment & Health

- **Production API Gateway**: [https://bookmytable-dbmn.onrender.com](https://bookmytable-dbmn.onrender.com)
- **Health Check Endpoint**: [https://bookmytable-dbmn.onrender.com/health](https://bookmytable-dbmn.onrender.com/health)
- **Hosting Platform**: Render (Web Service)
- **Keep-Alive Cron**: Automated ping every 10 minutes via `cron-job.org` (`*/10 * * * *`)
- **Connected Frontend Client**: [https://book-my-table-dun.vercel.app](https://book-my-table-dun.vercel.app)

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in the required credentials (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL=http://localhost:5173`, etc.).

### 3. Start Development Server
```bash
npm run dev
```

### 4. Start Production Server
```bash
npm start
```

---

## 🛡️ Security Architecture

1. **Native JWT Authentication**: Secure HTTP-only cookies and Bearer token support.
2. **Double-Submit Cookie CSRF**: Protection against cross-site request forgery with `csrf-csrf`.
3. **Multi-Tier Rate Limiting**: Dedicated limiters for Auth, OTP, Uploads, and Admin operations.
4. **Input Sanitization**: Automated XSS sanitization and NoSQL injection neutralization.
5. **Role-Based Access Control (RBAC)**: Strict permission enforcement (`customer`, `restaurant`, `admin`).

---

## 📡 API Endpoints Overview

| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| `GET` | `/health` | Public | Real-time database & service health check |
| `POST` | `/api/auth/register` | Public | Register customer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `POST` | `/api/auth/send-otp` | Public | Send 6-digit email OTP |
| `POST` | `/api/auth/verify-otp` | Public | Verify OTP code |
| `GET` | `/api/restaurants` | Public | Search restaurants with filters & pagination |
| `GET` | `/api/restaurants/:id/tables` | Public | Real-time table status by dining zone |
| `POST` | `/api/bookings` | User | Reserve table & hold seats |
| `GET` | `/api/bookings/my` | User | View user reservation history |
| `GET` | `/api/restaurant-dashboard/*` | Partner | Table management, approvals, revenue KPIs |
| `GET` | `/api/admin/*` | Admin | KYC approvals, user audit, platform metrics |
| `GET` | `/api/notifications/stream` | User | Server-Sent Events (SSE) push alerts |

---

## 📄 License
Licensed under the [MIT License](../LICENSE).
