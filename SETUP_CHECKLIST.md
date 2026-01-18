# IIUCShare Setup Checklist

## ✅ Pre-Setup Requirements

- [ ] Node.js (v18+) installed
- [ ] PostgreSQL (v12+) installed and running
- [ ] Google Cloud Console account access
- [ ] Git installed (optional)

## 🔧 Backend Setup

1. [ ] Navigate to `backend/` directory
2. [ ] Run `npm install`
3. [ ] Copy `.env.example` to `.env`
4. [ ] Configure `.env`:
   - [ ] Set `DATABASE_URL` (PostgreSQL connection string)
   - [ ] Set `JWT_SECRET` (strong random string)
   - [ ] Set `GOOGLE_CLIENT_ID` (from Google Console)
   - [ ] Set `GOOGLE_CLIENT_SECRET` (from Google Console)
   - [ ] Set `FRONTEND_URL` (default: http://localhost:5173)
5. [ ] Run `npm run prisma:generate`
6. [ ] Run `npm run prisma:migrate` (creates database tables)
7. [ ] Run `npm run prisma:seed` (adds sample data)
8. [ ] Run `npm run dev` (starts server on port 4000)

## 🎨 Frontend Setup

1. [ ] Navigate to `frontend/` directory
2. [ ] Run `npm install`
3. [ ] Copy `.env.example` to `.env`
4. [ ] Configure `.env`:
   - [ ] Set `VITE_API_URL` (default: http://localhost:4000/api)
   - [ ] Set `VITE_GOOGLE_CLIENT_ID` (same as backend)
5. [ ] Run `npm run dev` (starts on port 5173)

## 🔑 Google OAuth Setup

1. [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
2. [ ] Create/select a project
3. [ ] Enable Google+ API and Google Identity Services
4. [ ] Create OAuth 2.0 Client ID (Web application)
5. [ ] Add authorized origins:
   - [ ] `http://localhost:5173` (development)
   - [ ] Your production domain (if deploying)
6. [ ] Add authorized redirect URIs:
   - [ ] `http://localhost:5173` (development)
   - [ ] Your production domain (if deploying)
7. [ ] Copy Client ID and Client Secret
8. [ ] Add to both `.env` files

## 🧪 Testing

1. [ ] Backend health check: `curl http://localhost:4000/health`
2. [ ] Frontend loads: Open `http://localhost:5173`
3. [ ] Login with @ugrad.iiuc.ac.bd email
4. [ ] Test item creation
5. [ ] Test item browsing
6. [ ] Test request creation

## 🚀 Ready to Use!

Once all checkboxes are complete, you should be able to:
- Login with IIUC email
- Donate/lend items
- Browse available items
- Request items
- View your requests

## 📝 Notes

- Database must be running before backend starts
- Google OAuth requires valid credentials
- Domain restriction is enforced server-side
- Seed data includes 2 users, 6 items, 3 requests
