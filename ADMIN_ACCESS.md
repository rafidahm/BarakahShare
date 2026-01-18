# Admin Access Guide for IIUCShare

## Current Admin Functionality

The admin role (`role: "admin"`) provides additional permissions:

1. **Approve/Reject Requests** - Admins can approve or reject any item request, even if they don't own the item
2. **Admin Middleware** - `requireAdmin` middleware available for future admin-only routes

## How to Set a User as Admin

### Method 1: Using the Seed Script (Development)

The seed script already creates one admin user:
- **Email**: `ahmed.hasan@ugrad.iiuc.ac.bd`
- **Role**: `admin`

To use this admin account:
1. Make sure you've run the seed script: `npm run prisma:seed` in the backend directory
2. Login with the email: `ahmed.hasan@ugrad.iiuc.ac.bd` (you'll need to create this Google account or use it if it exists)

### Method 2: Using Prisma Studio (Recommended)

1. Open Prisma Studio:
   ```powershell
   cd backend
   npm run prisma:studio
   ```

2. Navigate to the `User` model

3. Find the user you want to make admin

4. Edit the `role` field and change it from `user` to `admin`

5. Save the changes

### Method 3: Using SQL/psql

```sql
-- Connect to your database
psql -U postgres -d iiucshare

-- Update user to admin (replace email with actual email)
UPDATE "User" SET role = 'admin' WHERE email = 'your-email@ugrad.iiuc.ac.bd';
```

### Method 4: Using Prisma Client (Node.js script)

Create a temporary script `backend/make-admin.js`:

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin(email) {
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'admin' }
  });
  console.log(`✅ ${user.name} (${user.email}) is now an admin`);
}

// Replace with your email
makeAdmin('your-email@ugrad.iiuc.ac.bd')
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run it:
```powershell
cd backend
node make-admin.js
```

## Current Admin Capabilities

### 1. Approve/Reject Any Request

Admins can approve or reject item requests through the API:

**Approve Request:**
```bash
curl -X PATCH http://localhost:4000/api/requests/<request-id>/approve \
  -H "Authorization: Bearer <admin-jwt-token>"
```

**Reject Request:**
```bash
curl -X PATCH http://localhost:4000/api/requests/<request-id>/reject \
  -H "Authorization: Bearer <admin-jwt-token>"
```

### 2. Check Admin Status

When you login, check your user object - it will have `role: "admin"` if you're an admin. The Dashboard currently shows your role.

## Admin Features in Frontend

Currently, the frontend doesn't have a dedicated admin page, but:
- Your role is displayed in the Dashboard
- Admins see the same interface as regular users
- Admin privileges work automatically through the API

## Future Admin Features (Not Yet Implemented)

You could extend admin functionality to include:
- Admin dashboard with statistics
- User management (view/edit users)
- Item management (moderate items)
- Request management interface
- Analytics and reports

## Quick Admin Setup Checklist

1. ✅ Run seed script: `cd backend && npm run prisma:seed`
2. ✅ Or update your user role to "admin" using one of the methods above
3. ✅ Login with your admin account
4. ✅ Check Dashboard - role should show "admin"
5. ✅ Test admin privileges (approve/reject requests via API or frontend)

## Security Notes

- ⚠️ Only grant admin role to trusted users
- ⚠️ Admin users can approve/reject any request
- ⚠️ Consider adding audit logging for admin actions
- ⚠️ In production, use a more secure method to manage admin roles
