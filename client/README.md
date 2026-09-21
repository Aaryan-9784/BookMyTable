<div align="center">

# 🍽️ BookMyTable — Frontend Client SPA

[![Status](https://img.shields.io/badge/STATUS-PRODUCTION%20READY-00C853?style=for-the-badge&logo=rocket&logoColor=white)](#)
[![Release](https://img.shields.io/badge/RELEASE-V1.0.0-536DFE?style=for-the-badge&logo=github&logoColor=white)](#)
[![Frontend](https://img.shields.io/badge/FRONTEND-REACT%2018%20%7C%20VITE%206-00BCD4?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Styling](https://img.shields.io/badge/STYLING-TAILWIND%20CSS%203.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/LICENSE-MIT-1976D2?style=for-the-badge)](#)
[![Vercel Deployment](https://img.shields.io/badge/LIVE%20APP-VERCEL%20DEPLOYED-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://book-my-table-dun.vercel.app)

<br/>

**[🌐 Live Application](https://book-my-table-dun.vercel.app)** • **[🚀 Backend API](https://bookmytable-dbmn.onrender.com)** • **[🩺 Health Check](https://bookmytable-dbmn.onrender.com/health)**

</div>

---

## 🌐 Live Deployments & Edge Infrastructure

| Service Layer | Infrastructure | Live URL | Status |
|---|---|---|:---:|
| **Frontend Web App (SPA)** | Vercel Global Edge | [book-my-table-dun.vercel.app](https://book-my-table-dun.vercel.app) | ![Vercel](https://img.shields.io/badge/Live-Ready-00C853) |
| **Connected REST API** | Render Cloud | [bookmytable-dbmn.onrender.com](https://bookmytable-dbmn.onrender.com) | ![Render](https://img.shields.io/badge/Live-Healthy-46E3B7) |
| **API Health Check** | Render `/health` | [bookmytable-dbmn.onrender.com/health](https://bookmytable-dbmn.onrender.com/health) | ![200 OK](https://img.shields.io/badge/Status-200%20OK-00C853) |

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Configure Environment
Create a `.env` file in the `client/` directory:
```env
VITE_API_URL=http://localhost:5000
```
> For production builds on Vercel:
> `VITE_API_URL=https://bookmytable-dbmn.onrender.com`

### 3. Start Development Server
```bash
npm run dev
```

### 4. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 📁 Architecture & Directory Structure

```
client/
├── public/                 # Static assets, favicon, icons
├── src/
│   ├── assets/             # Brand illustrations & imagery
│   ├── components/         # Reusable UI component library
│   │   ├── common/         # Navbar, Footer, Modal, Loader, Toast
│   │   ├── restaurant/     # Table map, zone selector, review card
│   │   └── admin/          # Approval tables, user management
│   ├── context/            # React Context providers (Auth, Cart/Booking)
│   ├── hooks/              # Custom hooks (useSSE, useAuth, useDebounce)
│   ├── pages/              # Primary route views
│   │   ├── Home.jsx        # Venue discovery & faceted search
│   │   ├── Restaurant.jsx  # Detailed menu, photos & table hold
│   │   ├── Booking.jsx     # Zone selection & deposit checkout
│   │   ├── RestaurantAdmin.jsx # Partner operations hub (/restaurant)
│   │   └── AdminDashboard.jsx  # Platform governance portal (/admin)
│   ├── services/           # Axios API client with CSRF interceptors
│   ├── App.jsx             # React Router hierarchy & layout wrappers
│   └── main.jsx            # React root mount & global styles
├── tailwind.config.js      # Luxury obsidian theme design tokens
└── vite.config.js          # Vite build & proxy configuration
```

---

## 📄 License
Licensed under the [MIT License](../LICENSE).
