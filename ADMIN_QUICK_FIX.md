# Admin Access Quick Fix

## Problem: "Admin access required" (403 Error)

**Solution:** Logout and Login again.

## Steps:

1. Click **Logout** in the navbar (arrow icon in top right)
2. Click **Login** button
3. Sign in with Google using your `@ugrad.iiuc.ac.bd` email
4. Access `/admin` - it should work now!

## Why?

Your JWT token has an outdated role. When you update your role in the database, you need to get a fresh token by logging in again.

## Check Your Token Role:

Open browser console (F12) and run:
```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Current role:', payload.role);
```

If it says `"user"` but you're supposed to be admin:
1. Logout
2. Login again
3. Check token again - should say `"admin"`
