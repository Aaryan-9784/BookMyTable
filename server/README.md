<div align="center">

# 🍽️ BookMyTable — Backend API Gateway

[![Status](https://img.shields.io/badge/STATUS-PRODUCTION%20READY-00C853?style=for-the-badge&logo=rocket&logoColor=white)](#)
[![Release](https://img.shields.io/badge/RELEASE-V1.0.0-536DFE?style=for-the-badge&logo=github&logoColor=white)](#)
[![Node.js](https://img.shields.io/badge/NODE.JS-%3E%3D18.0.0-2E7D32?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Backend](https://img.shields.io/badge/BACKEND-EXPRESS.JS-1A1A1A?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/DATABASE-MONGODB%20ATLAS-4CAF50?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Cron Keep-Alive](https://img.shields.io/badge/CRON--JOB.ORG-ACTIVE-536DFE?style=for-the-badge&logo=clockify&logoColor=white)](https://cron-job.org)
[![Render Backend](https://img.shields.io/badge/LIVE%20API-RENDER%20ACTIVE-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://bookmytable-dbmn.onrender.com)

<br/>

**[🚀 Live API Gateway](https://bookmytable-dbmn.onrender.com)** • **[🩺 Health Check](https://bookmytable-dbmn.onrender.com/health)** • **[🌐 Client Application](https://book-my-table-dun.vercel.app)**

</div>

---

## 🌐 Live Deployment & Health Matrix

| Service Layer | Infrastructure | Live URL | Status |
|---|---|---|:---:|
| **Primary Backend API** | Render Cloud | [bookmytable-dbmn.onrender.com](https://bookmytable-dbmn.onrender.com) | ![Render](https://img.shields.io/badge/Live-Healthy-46E3B7) |
| **Health Check Endpoint** | Render `/health` | [bookmytable-dbmn.onrender.com/health](https://bookmytable-dbmn.onrender.com/health) | ![200 OK](https://img.shields.io/badge/Status-200%20OK-00C853) |
| **Automated Keep-Alive** | cron-job.org | Scheduled ping every 10 min (`*/10 * * * *`) | ![Active](https://img.shields.io/badge/Cron-Running-536DFE) |
| **Connected Client** | Vercel Global Edge | [book-my-table-dun.vercel.app](https://book-my-table-dun.vercel.app) | ![Vercel](https://img.shields.io/badge/Live-Ready-00C853) |

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
