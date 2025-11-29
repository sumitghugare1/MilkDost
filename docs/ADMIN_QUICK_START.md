# 🚀 Admin Panel Quick Start Guide

## Prerequisites
- Firebase project configured
- Next.js app running
- Firebase Authentication enabled

## Setup in 3 Steps

### Step 1: Create Your First Admin User

Run the admin creation script:
```bash
npx ts-node scripts/createAdmin.ts
```

**Default Credentials Created:**
- Email: `admin@dairymate.com`
- Password: `Admin@123456`

> ⚠️ **IMPORTANT:** Change the password after first login!

### Step 2: Login as Admin

1. Open your app in the browser
2. Click "Sign In"
3. Use the admin credentials:
   - Email: `admin@dairymate.com`
   - Password: `Admin@123456`

### Step 3: Access Admin Panel

Navigate to: **`http://localhost:3000/admin`**

You should see the Ksheera Admin Control Panel! 🎉

---

## Making an Existing User Admin

If you already have a user account and want to make it admin:

1. Open `scripts/makeUserAdmin.ts`
2. Update the `USER_EMAIL` variable with your email:
   ```typescript
   const USER_EMAIL = 'your-email@example.com';
   ```
3. Run the script:
   ```bash
   npx ts-node scripts/makeUserAdmin.ts
   ```

---

## Admin Panel Features

### 📊 Dashboard Tab
- View total dairy owners and clients
- Monitor monthly revenue
- Track active subscriptions
- See growth rate and system uptime

### 👥 Dairy Owners Tab
- Search owners by name, business, or email
- Filter by status (active, inactive, banned)
- View owner details
- Activate/Deactivate owner accounts
- Ban/Unban owners

### 💳 Subscriptions Tab
- View subscription plans (Basic, Professional, Enterprise)
- Monitor active/pending/expired subscriptions
- Manage subscription billing
- Activate/Deactivate subscriptions

### 📈 Analytics Tab
- Track user growth over time
- Monitor revenue trends
- View geographic distribution
- See key metrics (growth rate, retention, etc.)

### ⚙️ Settings Tab
- Configure platform settings
- Set subscription defaults
- Manage notifications
- Access security features

---

## Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| **Basic** | ₹499/month | Up to 50 clients, Basic analytics, Email support |
| **Professional** | ₹999/month | Up to 200 clients, Advanced analytics, Priority support, Custom branding |
| **Enterprise** | ₹1999/month | Unlimited clients, Full analytics, 24/7 support, API access, White label |

---

## Troubleshooting

### Can't access /admin page?
- ✅ Make sure you're logged in
- ✅ Verify your user has `role: 'admin'` in Firestore
- ✅ Check Firebase Console > Firestore > users collection

### TypeScript errors?
- The app might need to recompile
- Restart your development server:
  ```bash
  npm run dev
  ```

### Script not working?
- Make sure Firebase is configured in `src/lib/firebase.ts`
- Check that you have internet connection
- Verify Firebase project is active

### Access denied message?
- Your user role is not 'admin'
- Run the `makeUserAdmin.ts` script with your email
- Or manually update role in Firebase Console

---

## Manual Admin Setup (Firebase Console)

If scripts don't work, you can manually set admin role:

1. Go to **Firebase Console** > **Firestore Database**
2. Find the **users** collection
3. Locate your user document by email
4. Click on the document
5. Find the **role** field
6. Change it from `dairy_owner` or `client` to `admin`
7. Save changes

---

## Next Steps

1. ✅ Login with admin credentials
2. ✅ Access `/admin` panel
3. ✅ Explore all 5 tabs
4. ✅ Test ban/activate features
5. ✅ Review subscription plans
6. ✅ Check analytics dashboard
7. ✅ Update system settings
8. ✅ Change admin password

---

## Security Best Practices

- 🔐 Change default admin password immediately
- 🔐 Don't share admin credentials
- 🔐 Use strong passwords (min 12 characters)
- 🔐 Enable 2FA in Firebase if possible
- 🔐 Regularly review admin activity logs
- 🔐 Limit admin access to trusted users only

---

## Support

- 📖 **Full Documentation:** `ADMIN_PANEL_DOCUMENTATION.md`
- 📋 **Implementation Details:** `ADMIN_PANEL_SUMMARY.md`
- 🐛 **Issues:** Check console logs and Firebase errors

---

**You're all set! Enjoy managing your dairy platform! 🎉**
