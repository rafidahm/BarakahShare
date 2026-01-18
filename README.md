# IIUCShare

**Share Knowledge, Share Barakah**

A charity-driven platform where IIUC (International Islamic University Chittagong) undergraduate students can donate, lend, and request academic items. Built with React (Vite) + Tailwind CSS for the frontend and Node.js + Express + PostgreSQL (Prisma) for the backend.

## 🎯 Features

- **Google OAuth Authentication** - Secure login with domain restriction (@ugrad.iiuc.ac.bd only)
- **Item Management** - Donate or lend academic items (books, laptops, calculators, notes, etc.)
- **Request System** - Request items from other students with approval workflow
- **Islamic Aesthetic** - Minimal, clean UI with green-based color palette
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Quote Box** - Rotating Islamic quotes and motivational messages on every page

## 🏗️ Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- @react-oauth/google for Google authentication
- Axios for API calls
- Heroicons for icons

### Backend
- Node.js with Express
- PostgreSQL database
- Prisma ORM
- JWT for authentication
- google-auth-library for server-side token verification
- CORS enabled for frontend communication

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**
- **Google Cloud Console** account (for OAuth credentials)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd IIUC-Share
```

### 2. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```bash
# Using psql
createdb iiucshare

# Or using SQL
psql -U postgres
CREATE DATABASE iiucshare;
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Required: DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database
npm run prisma:seed

# Start the server
npm run dev
```

The backend will run on `http://localhost:4000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Required: VITE_GOOGLE_CLIENT_ID, VITE_API_URL

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 5. Running Both Services

You can run both services concurrently using npm workspaces or a process manager:

**Option 1: Using concurrently (recommended)**

Install concurrently globally:
```bash
npm install -g concurrently
```

Then from the root directory:
```bash
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

**Option 2: Using separate terminals**

- Terminal 1: `cd backend && npm run dev`
- Terminal 2: `cd frontend && npm run dev`

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/iiucshare?schema=public"

# JWT Secret (use a strong random string in production)
JWT_SECRET="super-secret-placeholder-change-in-production"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Server
PORT=4000
NODE_ENV=development

# CORS (frontend URL)
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)

```env
# API Base URL
VITE_API_URL=http://localhost:4000/api

# Google OAuth Client ID (for frontend)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## 🔑 Google OAuth Setup

**📖 For detailed step-by-step instructions, see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)**

Quick summary:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** and **Google Identity Services**
4. Configure the **OAuth consent screen**
5. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
6. Choose **Web application**
7. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Your production domain (for deployment)
8. Add authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - Your production domain (for deployment)
9. Copy the **Client ID** and **Client Secret**
10. Add them to your `.env` files:
    - **Backend**: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
    - **Frontend**: `VITE_GOOGLE_CLIENT_ID` (Client ID only)

**Important:** The backend enforces domain restriction. Only emails ending with `@ugrad.iiuc.ac.bd` are allowed to access the platform.

## 📊 Database Schema

The Prisma schema includes three main models:

- **User** - Stores user information (name, email, picture, role)
- **Item** - Stores donated/lent items (name, category, condition, type, description, contact)
- **Request** - Stores item requests (status: Pending/Approved/Rejected)

See `backend/prisma/schema.prisma` for the complete schema.

## 🧪 Testing with cURL

### 1. Exchange Google ID Token for JWT

```bash
curl -X POST http://localhost:4000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"<google-id-token>"}'
```

**Response:**
```json
{
  "token": "<jwt-token>",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "picture": "...",
    "role": "user"
  }
}
```

### 2. Get Current User Info

```bash
curl -X GET http://localhost:4000/api/users/me \
  -H "Authorization: Bearer <jwt-token>"
```

### 3. Create an Item

```bash
curl -X POST http://localhost:4000/api/items \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Physics 101 Book",
    "category": "Books",
    "condition": "Good",
    "type": "Donate",
    "description": "Used but fine condition",
    "contact": "017XXXXXXXX"
  }'
```

### 4. Browse Items

```bash
curl -X GET "http://localhost:4000/api/items?category=Books&type=Donate&limit=10"
```

### 5. Create a Request

```bash
curl -X POST http://localhost:4000/api/requests \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "<item-id>",
    "message": "I need this for my exam"
  }'
```

### 6. Get My Requests

```bash
curl -X GET http://localhost:4000/api/requests/my \
  -H "Authorization: Bearer <jwt-token>"
```

### 7. Approve a Request (Owner or Admin only)

```bash
curl -X PATCH http://localhost:4000/api/requests/<request-id>/approve \
  -H "Authorization: Bearer <jwt-token>"
```

## 📁 Project Structure

```
IIUC-Share/
├── backend/
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication middleware
│   │   └── errorHandler.js  # Global error handler
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── users.js         # User routes
│   │   ├── items.js         # Item routes
│   │   └── requests.js      # Request routes
│   ├── utils/
│   │   ├── jwt.js           # JWT token generation
│   │   └── googleAuth.js    # Google token verification
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # Seed script
│   ├── server.js            # Express server entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── QuoteBox.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Modal.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DonateItem.jsx
│   │   │   ├── BrowseItems.jsx
│   │   │   ├── RequestItem.jsx
│   │   │   ├── MyRequests.jsx
│   │   │   ├── About.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   ├── api.js       # Axios instance
│   │   │   └── auth.js       # Auth helpers
│   │   ├── utils/
│   │   │   └── quotes.js     # Quote data
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
└── README.md
```

## 🎨 UI/UX Features

- **Islamic Aesthetic**: Green-based color palette (#0f9d58) with clean, minimal design
- **Responsive**: Mobile-first design that works on all screen sizes
- **Quote Box**: Rotating Islamic quotes on every page with refresh button
- **Persistent Navbar & Footer**: Available on all pages
- **Modal Dialogs**: For success messages and confirmations
- **Status Badges**: Visual indicators for item types and request statuses

## 🔒 Security Features

- **Server-side Google Token Verification**: All Google tokens are verified on the backend
- **Domain Restriction**: Only @ugrad.iiuc.ac.bd emails are allowed (enforced server-side)
- **JWT Authentication**: Secure token-based authentication with 7-day expiry
- **Protected Routes**: All write operations require authentication
- **Input Validation**: Server-side validation for all user inputs
- **CORS Configuration**: Restricted to frontend origin only

**Note:** For production, consider migrating from localStorage to httpOnly cookies for better security and CSRF protection.

## 🚢 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Set up a PostgreSQL database (Neon, Supabase, or Railway)
2. Set all environment variables in your hosting platform
3. Run migrations: `npx prisma migrate deploy`
4. Seed the database (optional): `node prisma/seed.js`
5. Deploy your backend code

### Frontend Deployment (Vercel/Netlify)

1. Set environment variables in your hosting platform
2. Build the project: `npm run build`
3. Deploy the `dist` folder

### Database Options

- **Neon** (Recommended): Serverless PostgreSQL
- **Supabase**: PostgreSQL with additional features
- **Railway**: Easy PostgreSQL setup
- **Heroku Postgres**: Traditional option

## 📝 Available Scripts

### Backend

- `npm run dev` - Start development server with watch mode
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with mock data
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check DATABASE_URL format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
- Verify database exists: `psql -l` or `\l` in psql

### Google OAuth Issues

- Verify Client ID and Secret are correct
- Check authorized origins and redirect URIs in Google Console
- Ensure domain restriction is working (test with @ugrad.iiuc.ac.bd email)

### CORS Errors

- Verify FRONTEND_URL in backend .env matches your frontend URL
- Check browser console for specific CORS error messages

### Prisma Issues

- Run `npx prisma generate` after schema changes
- Run `npx prisma migrate dev` to create migrations
- Use `npx prisma studio` to inspect database

## 🤝 Contributing

This is a starter template. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- Built with Islamic principles of charity and community support
- Inspired by the need for accessible academic resources
- Designed for IIUC undergraduate students

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review the API documentation in this README
- Ensure all environment variables are properly configured

---

**Built with ❤️ for IIUC students**
