# 📋 Manual Demo Account Setup Guide

## Step-by-Step Account Creation

### Method 1: Use the Application UI (RECOMMENDED)

#### Step 1: Create Dairy Owner Account

1. **Start your application:**
   ```bash
   npm run dev
   ```

2. **Open browser:** http://localhost:3000

3. **Click "Sign Up" or "Register"**

4. **Fill the registration form:**
   ```
   Email: demo.dairy@ksheera.com
   Password: demo123456
   Name: Demo Dairy Owner
   Business Name: Fresh Valley Dairy
   Role: Dairy Owner
   Phone: +91 98765 43210
   Address: Fresh Valley Farm, Dairy Street, Milk City, Karnataka 560001
   ```

5. **Submit and login**

---

#### Step 2: Create Client Accounts

After logging in as Dairy Owner:

##### Client 1: Rajesh Sharma
1. Go to **"Clients"** section
2. Click **"Add New Client"**
3. Fill the form:
   ```
   Name: Rajesh Sharma
   Phone: +91 98765 11111
   Address: A-101, Sunshine Apartments, MG Road, Bangalore 560001
   Email: rajesh.sharma@email.com
   Milk Quantity: 2 Liters
   Delivery Time: 07:00 AM
   Rate per Liter: ₹50
   Status: Active ✓
   ```
4. Click **"Add Client"**

##### Client 2: Priya Patel
1. Click **"Add New Client"** again
2. Fill the form:
   ```
   Name: Priya Patel
   Phone: +91 98765 22222
   Address: B-205, Royal Heights, Indiranagar, Bangalore 560038
   Email: priya.patel@email.com
   Milk Quantity: 3 Liters
   Delivery Time: 06:30 AM
   Rate per Liter: ₹55
   Status: Active ✓
   ```
3. Click **"Add Client"**

##### Client 3: Amit Kumar
1. Click **"Add New Client"** again
2. Fill the form:
   ```
   Name: Amit Kumar
   Phone: +91 98765 33333
   Address: C-12, Green Villas, Koramangala, Bangalore 560034
   Email: amit.kumar@email.com
   Milk Quantity: 1.5 Liters
   Delivery Time: 08:00 AM
   Rate per Liter: ₹48
   Status: Active ✓
   ```
3. Click **"Add Client"**

---

#### Step 3: Create Client Login Accounts (Optional)

If your app supports client registration:

1. **Logout** from Dairy Owner account
2. Click **"Sign Up"**
3. Register each client with their email (from above)
4. Use password: `client123456` for all

**OR** use the authentication panel in Firebase Console to create these users manually.

---

### Method 2: Firebase Console (If Registration UI is not available)

1. **Open Firebase Console:** https://console.firebase.google.com
2. **Select your project:** (your project name)
3. **Go to Authentication** → Users
4. **Click "Add User"**

#### Create Dairy Owner:
```
Email: demo.dairy@ksheera.com
Password: demo123456
```

Then go to **Firestore Database** → **users** collection → Create Document:
```json
{
  "uid": "auto-generated-uid",
  "email": "demo.dairy@ksheera.com",
  "displayName": "Demo Dairy Owner",
  "businessName": "Fresh Valley Dairy",
  "role": "dairy_owner",
  "phone": "+91 98765 43210",
  "address": "Fresh Valley Farm, Dairy Street, Milk City, Karnataka 560001",
  "isActive": true,
  "createdAt": "current timestamp",
  "updatedAt": "current timestamp"
}
```

#### Create Clients (repeat for each):
1. Add user in Authentication
2. Create document in `users` collection
3. Create document in `clients` collection (link to dairy owner)

---

### Method 3: Quick Test with Google Account (Backup)

If email/password signup has issues during demo:

1. **Enable Google Sign-In** in Firebase Console
2. Sign in with your Google account
3. Use that for demo (less ideal but works)

---

## ✅ Verification Checklist

After creating accounts, verify:

- [ ] Dairy Owner can login successfully
- [ ] Dairy Owner dashboard shows statistics
- [ ] All 3 clients appear in Client Management
- [ ] Client details are correct (name, phone, quantity, rate)
- [ ] You can edit client details
- [ ] You can search clients
- [ ] Bills can be generated
- [ ] Analytics show data

---

## 🔧 If Something Goes Wrong

### Issue: Can't create accounts
**Solution:** 
- Check Firebase Console → Authentication is enabled
- Verify Email/Password provider is enabled
- Check browser console for errors

### Issue: Clients not showing
**Solution:**
- Check Firestore rules allow read/write
- Verify user is logged in
- Check browser network tab for errors

### Issue: Wrong data showing
**Solution:**
- Clear browser cache: Ctrl + Shift + Delete
- Logout and login again
- Check Firestore data in Firebase Console

---

## 📊 Expected Data After Setup

### Dashboard should show:
- **Active Clients:** 3
- **Total Clients:** 3
- **Daily Revenue:** ₹(2×50) + (3×55) + (1.5×48) = ₹337
- **Average Order Value:** ₹112.33

### Client List should show:
1. Rajesh Sharma - 2L @ ₹50 - 07:00 AM
2. Priya Patel - 3L @ ₹55 - 06:30 AM
3. Amit Kumar - 1.5L @ ₹48 - 08:00 AM

---

## 🎯 Quick Test After Setup

1. **Login as Dairy Owner** ✓
2. **View Dashboard** ✓
3. **See 3 clients in list** ✓
4. **Add a 4th test client** ✓
5. **Edit any client** ✓
6. **Generate a bill** ✓
7. **View analytics** ✓
8. **Logout** ✓
9. **Login as Client** (if supported) ✓

---

## 💡 Pro Tips for Demo

1. **Pre-create accounts** the night before
2. **Test login** for all accounts before presentation
3. **Keep Firebase Console open** in another tab (to show database)
4. **Take screenshots** of successful setup as backup
5. **Export Firestore data** as backup (JSON format)

---

## 📞 Emergency Contact

If you face issues during setup:
- Check: COLLEGE_DEMO_GUIDE.md for troubleshooting
- Check: Firebase Console for authentication errors
- Check: Browser console (F12) for JavaScript errors

---

**Remember:** It's better to create accounts manually and test them thoroughly than to rely on automated scripts during the presentation!

Good luck! 🚀
