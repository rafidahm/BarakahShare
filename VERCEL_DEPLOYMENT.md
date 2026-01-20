# Vercel Configuration for Full-Stack Deployment

This project uses a simplified Vercel configuration that deploys the frontend as a static site and the backend as serverless API functions.

## Project Structure

```
BarakahShare/
├── frontend/          # React + Vite frontend
├── backend/           # Express backend
│   └── api/
│       └── index.js   # Serverless entry point
└── vercel.json        # Vercel configuration
```

## How It Works

1. **Frontend**: Built as static files and served from `frontend/dist`
2. **Backend**: Deployed as serverless function at `backend/api/index.js`
3. **Routing**: 
   - `/api/*` → Backend serverless function
   - `/uploads/*` → Backend serverless function
   - Everything else → Frontend static files

## Important Notes

- Only ONE Vercel project should be connected to this repository
- The root `vercel.json` handles routing for both frontend and backend
- Environment variables must be set in Vercel Dashboard

## Deployment

Push to GitHub and Vercel will automatically deploy both frontend and backend together.
