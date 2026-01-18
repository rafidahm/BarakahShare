# Google OAuth Setup Guide for IIUCShare

This guide will walk you through setting up Google OAuth credentials for IIUCShare. You'll need these credentials for both the frontend and backend.

## 📋 Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## 🚀 Step-by-Step Instructions

### Step 1: Create or Select a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click **"New Project"** (or select an existing project)
4. Enter a project name (e.g., "IIUCShare")
5. Click **"Create"** (or **"Select"** if using existing project)

### Step 2: Enable Required APIs (Optional but Recommended)

**Important Note:** Google Identity Services (the newer API used by `@react-oauth/google`) is automatically available when you set up OAuth credentials. You typically **don't need to manually enable it** in the API Library.

However, if you want to be thorough or if you encounter issues:

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Identity Services"** or **"Google Sign-In API"**
   - You might see results like "Cloud Identity" or other related APIs
   - Look for APIs related to authentication/identity
3. If you find **"Google Identity Services"**, click on it and click **"Enable"**
4. (Optional) Search for **"Google+ API"** and enable it (legacy API, but won't hurt)

**What you're seeing:** If you search for "Google Sign-In API" and see results like "Cloud Identity", "Stackdriver API", etc., that's normal. Google Identity Services is often integrated into the OAuth system automatically.

**You can skip this step** and proceed directly to Step 3 (OAuth Consent Screen) - the OAuth credentials will work without explicitly enabling these APIs in most cases.

### Step 3: Configure OAuth Consent Screen / Google Auth Platform

**Note:** Google has updated their interface. You may see either:
- **New Interface**: "Google Auth Platform" (what you're likely seeing)
- **Old Interface**: "OAuth consent screen" (under APIs & Services)

#### If you see "Google Auth Platform" (New Interface):

1. You should see an **"OAuth Overview"** page with a message "Google Auth Platform not configured yet"
2. Click the blue **"Get started"** button
3. You'll be guided through setup:
   - **App name**: `IIUCShare` (or your preferred name)
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Select **"External"** user type (unless you have a Google Workspace account)
5. Complete the setup wizard:
   - **Branding**: Add app name and logo (optional)
   - **Audience**: Choose "External" 
   - **Scopes**: No need to add scopes for basic sign-in (skip or continue)
   - **Test users**: Add test users if in testing mode (emails ending with `@ugrad.iiuc.ac.bd`)
6. Complete the setup

#### If you see "OAuth consent screen" (Old Interface):

1. In the left sidebar, go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have a Google Workspace account, then you can use "Internal")
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: `IIUCShare` (or your preferred name)
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **"Save and Continue"**
6. On the **Scopes** page, click **"Save and Continue"** (no need to add scopes for basic sign-in)
7. On the **Test users** page:
   - Add test users if you're in testing mode (emails ending with `@ugrad.iiuc.ac.bd`)
   - Click **"Save and Continue"**
8. Review and click **"Back to Dashboard"**

**Important:** If your app is in "Testing" mode, only test users can sign in. To allow all users, you'll need to publish your app (requires verification for production).

### Step 4: Create OAuth 2.0 Credentials

#### Option A: Using Google Auth Platform (New Interface)

1. In the left sidebar, click on **"Clients"** (under Google Auth Platform)
2. Click **"+ CREATE CLIENT"** or **"Create OAuth client ID"**
3. Select **"Web application"** as the application type
4. Fill in the form:

   **Name**: `IIUCShare Web Client` (or any name you prefer)

   **Authorized JavaScript origins**:
   - Click **"+ ADD URI"** and add: `http://localhost:5173`
   - For production: Add `https://yourdomain.com` (add when deploying)
   
   **Authorized redirect URIs**:
   - Click **"+ ADD URI"** and add: `http://localhost:5173`
   - For production: Add `https://yourdomain.com` (add when deploying)

5. Click **"CREATE"** or **"Save"**
6. **IMPORTANT**: A popup or dialog will appear with your credentials:
   - **Client ID**: Copy this immediately (you won't see it again easily)
   - **Client Secret**: Copy this immediately (you won't see it again easily)

#### Option B: Using Traditional Credentials Page (Old Interface)

1. In the left sidebar, go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. If prompted, select **"Web application"** as the application type
5. Fill in the form (same as Option A above)
6. Click **"Create"**
7. **IMPORTANT**: A popup will appear with your credentials:
   - **Client ID**: Copy this immediately (you won't see it again easily)
   - **Client Secret**: Copy this immediately (you won't see it again easily)

### Step 5: Save Your Credentials

**⚠️ Security Warning**: Never commit these credentials to Git!

1. **Backend `.env` file** (`backend/.env`):
   ```env
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```

2. **Frontend `.env` file** (`frontend/.env`):
   ```env
   VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```

**Note**: 
- The **Client ID** goes in BOTH files
- The **Client Secret** goes ONLY in the backend file
- Frontend uses `VITE_` prefix for environment variables in Vite

### Step 6: Verify Your Setup

1. **Backend verification**:
   - Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are in `backend/.env`
   - The backend uses these to verify Google ID tokens server-side

2. **Frontend verification**:
   - Make sure `VITE_GOOGLE_CLIENT_ID` is in `frontend/.env`
   - The frontend uses this to show the Google Sign-In button

3. **Restart your servers**:
   - Stop both frontend and backend servers
   - Start them again to load the new environment variables

## 🔍 Finding Your Credentials Later

If you need to find your credentials again:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **"APIs & Services"** → **"Credentials"**
3. Click on your OAuth 2.0 Client ID
4. You'll see the **Client ID** (always visible)
5. To see the **Client Secret**, click **"Show"** next to it (you may need to re-authenticate)

## 🧪 Testing Your Setup

1. Start your backend: `cd backend && npm run dev`
2. Start your frontend: `cd frontend && npm run dev`
3. Navigate to `http://localhost:5173/login`
4. You should see the Google Sign-In button
5. Click it and sign in with an `@ugrad.iiuc.ac.bd` email
6. If successful, you'll be redirected to the dashboard

## ⚠️ Common Issues & Solutions

### Issue: "Error 400: redirect_uri_mismatch"

**Solution**: 
- Make sure `http://localhost:5173` is added to **Authorized redirect URIs** in Google Console
- Check that there are no trailing slashes
- Restart your frontend server after changing `.env`

### Issue: "Only IIUC undergraduate students can access IIUCShare"

**Solution**: 
- This is expected! The backend enforces domain restriction
- Make sure you're using an email ending with `@ugrad.iiuc.ac.bd`
- If testing, add your test email to the OAuth consent screen test users

### Issue: "Invalid client" or "Client ID not found"

**Solution**:
- Verify the Client ID is correct in both `.env` files
- Make sure there are no extra spaces or quotes
- Restart both servers after updating `.env`

### Issue: Google Sign-In button doesn't appear

**Solution**:
- Check browser console for errors
- Verify `VITE_GOOGLE_CLIENT_ID` is set in `frontend/.env`
- Make sure the frontend server was restarted after adding the variable
- Check that `GoogleOAuthProvider` in `main.jsx` is receiving the client ID

### Issue: "Access blocked: This app's request is invalid"

**Solution**:
- Your app might be in "Testing" mode
- Add your email to the test users list in OAuth consent screen
- Or publish your app (requires verification for production use)

## 🔒 Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use different credentials for production** - Create separate OAuth clients for production
3. **Rotate secrets regularly** - Especially if they're exposed
4. **Restrict origins** - Only add the exact URLs you need
5. **Use environment variables** - Never hardcode credentials in your code

## 📝 Production Deployment

When deploying to production:

1. Create a **new OAuth client** in Google Console (or use the same one)
2. Add your production domain to:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com`
3. Update your production environment variables
4. Make sure your OAuth consent screen is published (if you want public access)

## 🎯 Quick Checklist

- [ ] Google Cloud project created/selected
- [ ] Required APIs enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 Client ID created
- [ ] Client ID added to `backend/.env` (as `GOOGLE_CLIENT_ID`)
- [ ] Client Secret added to `backend/.env` (as `GOOGLE_CLIENT_SECRET`)
- [ ] Client ID added to `frontend/.env` (as `VITE_GOOGLE_CLIENT_ID`)
- [ ] `http://localhost:5173` added to authorized origins and redirect URIs
- [ ] Both servers restarted
- [ ] Test login with `@ugrad.iiuc.ac.bd` email

## 📚 Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 for Client-side Web Applications](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Need Help?** Check the main README.md for general setup instructions or review the error messages in your browser console and server logs.
