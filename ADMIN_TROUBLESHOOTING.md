# Admin Access Troubleshooting

## Problem: "Admin access required" (403 Error)

If you're seeing `Failed to load users: Admin access required. Status: 403`, this means your JWT token doesn't have the admin role even though your database user does.

## Root Cause

JWT tokens are signed with user information at login time and don't automatically update when the database changes. If you:
1. Logged in as a regular user
2. Then updated your role to "admin" in the database
3. Your JWT token still contains `role: "user"`

## Solution 1: Logout and Login Again (Recommended)

**This is the quickest fix:**

1. Click the **Logout** button in the navbar
2. Login again with your Google account
3. You'll get a fresh JWT token with the correct `role: "admin"`
4. Try accessing `/admin` again

## Solution 2: Verify Your Admin Role

1. Check if your user actually has `role: "admin"` in the database:

```powershell
cd backend
npm run prisma:studio
```

2. In Prisma Studio:
   - Open the `User` table
   - Find your user by email
   - Check the `role` field - it should be `admin` (not `user`)

3. If it's not `admin`, update it:
   - Click on your user record
   - Change `role` from `user` to `admin`
   - Save

4. Then **logout and login again** to get a fresh token

## Solution 3: Verify JWT Token

1. Open browser console (F12)
2. In Console, type:
   ```javascript
   const token = localStorage.getItem('token');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Current role in token:', payload.role);
   ```
3. If it shows `"user"` instead of `"admin"`, you need to logout and login again

## How to Check Your Current Role

### In Frontend:
1. Go to Dashboard
2. Check the "Role" card - it should show "Admin"
3. Check the Profile section - if it shows "user", your JWT is outdated

### In Backend (using API):
```bash
curl -X GET http://localhost:4000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Look at the `role` field in the response.

## Quick Test

1. **Logout** from the app
2. **Login** again with your `@ugrad.iiuc.ac.bd` email
3. Check **Dashboard** - Role should show "Admin"
4. Click **Admin** link in navbar
5. It should now work!

## Why This Happens

JWT tokens are stateless and contain user information at the time of login:
- Login → User info (including role) is embedded in JWT
- Update role in database → JWT token still has old role
- Next request → Backend checks JWT, sees old role, denies access

**The fix:** Get a new JWT by logging out and logging back in.

## Prevention

For production, consider:
1. **Token refresh mechanism** - Automatically refresh tokens when role changes
2. **Role verification endpoint** - Check current role from database, not just JWT
3. **Token invalidation** - Force re-login when critical fields (like role) change

## Still Having Issues?

1. Check browser console (F12) for detailed error messages
2. Check backend terminal for server errors
3. Verify backend is running on `http://localhost:4000`
4. Verify your email ends with `@ugrad.iiuc.ac.bd`
5. Make sure you ran the database migration after schema changes
