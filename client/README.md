# 🍽️ BookMyTable — Frontend Client

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://book-my-table-dun.vercel.app)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

An enterprise-grade Single-Page Application (SPA) built with React 18, Vite, and Tailwind CSS. Features dynamic dining zone layouts, instant table reservations, token deposit guarantee flows, personal wishlists, real-time SSE notification stream, and dedicated Partner (`/restaurant`) and Admin (`/admin`) governance portals.

---

## 🌐 Live Deployment

- **Production URL**: [https://book-my-table-dun.vercel.app](https://book-my-table-dun.vercel.app)
- **Deployment Platform**: Vercel
- **Connected API Gateway**: [https://bookmytable-dbmn.onrender.com](https://bookmytable-dbmn.onrender.com)

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
