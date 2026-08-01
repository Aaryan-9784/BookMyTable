# 🚀 How to Start BookMyTable Project

## Prerequisites
- Node.js installed (v18 or higher)
- MongoDB connection (configured in `.env`)
- Ports 5000 (backend) and 5173 (frontend) available

---

## Step 1: Start Backend Server

Open Terminal 1 (PowerShell):

```powershell
cd server
npm run dev
```

**Expected output:**
```
✅ MongoDB connected successfully
✅ Redis connected successfully (or using memory fallback)
✅ BookMyTable API listening on port 5000
✅ Environment: development
```

---

## Step 2: Start Frontend Development Server

Open Terminal 2 (PowerShell):

```powershell
cd client
npm run dev
```

**Expected output:**
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Step 3: Open Browser

Navigate to: **http://localhost:5173**

You should see the BookMyTable homepage!

---

## 🐛 Troubleshooting

### Issue: "lucide-react" not found
**Solution:** Already fixed! Package installed.

### Issue: Redis connection errors (red logs)
**Solution:** Ignore them - Redis is optional in development. Using in-memory storage.

### Issue: Port 5000 already in use
**Solution:** 
```powershell
# Find process using port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Or change PORT in server/.env
PORT=5001
```

### Issue: Port 5173 already in use
**Solution:** Vite will automatically use next available port (5174, 5175, etc.)

---

## 📝 Current Services Configuration

### ✅ **Active Services:**
- **MongoDB Atlas** - Database
- **Supabase** - Authentication
- **Cloudinary** - Image storage
- **Gmail SMTP** - Email delivery
- **Resend** - Alternative email service

### ❌ **Not Active:**
- **AWS Services** - Not configured (using alternatives)
- **Redis** - Not running (using memory fallback in dev)

---

## 🔑 Test Accounts

### Admin Access:
- Email: `aaryanpatel9784@gmail.com`
- Use Supabase authentication

### Creating New Users:
1. Go to Signup page
2. Register with valid email
3. Check email for verification

---

## 🎯 Next Steps After Starting

1. ✅ Browse restaurants at http://localhost:5173/restaurants
2. ✅ Test signup/login flow
3. ✅ Make a test booking
4. ✅ Check admin panel at http://localhost:5173/admin
5. ✅ Test restaurant dashboard at http://localhost:5173/restaurant-dashboard

---

## 🛑 Stopping the Project

In each terminal:
- Press `Ctrl + C`
- Confirm with `Y` if prompted

---

**Need help?** Check the main README.md or server logs for detailed error messages.
