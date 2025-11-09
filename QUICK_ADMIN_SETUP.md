# 🚀 Quick Admin Setup - Browser Console Method

## Fastest Way to Create Admin Login

Since the Node.js script has TypeScript loader issues, here's the quickest method using your browser:

### Step 1: Start Your App
```powershell
npm run dev
```

### Step 2: Open Browser Console
1. Open your app at `http://localhost:3000`
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab

### Step 3: Run This Script in Console

Copy and paste this entire script into the browser console and press Enter:

```javascript
// Quick Admin Creation Script - Run in Browser Console
(async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...');
    
    // Import Firebase functions (if not already available)
    const { getAuth, createUserWithEmailAndPassword } = window.firebase?.auth || 
          await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { getFirestore, doc, setDoc } = window.firebase?.firestore || 
          await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Use your existing Firebase app
    const auth = getAuth();
    const db = getFirestore();
    
    const ADMIN_EMAIL = 'admin@dairymate.com';
    const ADMIN_PASSWORD = 'Admin@123456';
    const ADMIN_NAME = 'System Administrator';
    
    console.log('📧 Creating user:', ADMIN_EMAIL);
    
    // Create authentication user
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const user = userCredential.user;
    
    console.log('✅ Auth user created:', user.uid);
    
    // Create Firestore profile with admin role
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      role: 'admin', // Important: admin role
      isActive: true,
      isBanned: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Firestore profile created with admin role');
    console.log('');
    console.log('🎉 ADMIN USER CREATED SUCCESSFULLY!');
    console.log('');
    console.log('📝 Login credentials:');
    console.log('   Email: ' + ADMIN_EMAIL);
    console.log('   Password: ' + ADMIN_PASSWORD);
    console.log('');
    console.log('🚀 Access admin panel at: /admin');
    console.log('');
    console.log('⚠️ IMPORTANT: Change password after first login!');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('');
      console.log('💡 Email already exists! Making existing user admin...');
      
      try {
        // Get current user's UID by email (requires manual lookup)
        console.log('❌ Cannot auto-upgrade existing user from console');
        console.log('');
        console.log('🔧 Manual fix:');
        console.log('1. Go to Firebase Console > Authentication');
        console.log('2. Find user: admin@dairymate.com');
        console.log('3. Copy their UID');
        console.log('4. Go to Firestore > users collection');
        console.log('5. Find document with that UID');
        console.log('6. Set role field to: admin');
      } catch (upgradeError) {
        console.error('❌ Error upgrading user:', upgradeError);
      }
    } else {
      console.error('❌ Error creating admin:', error);
      console.log('');
      console.log('🔧 Try manual creation:');
      console.log('1. Go to Firebase Console > Authentication > Add user');
      console.log('2. Email: admin@dairymate.com');
      console.log('3. Password: Admin@123456');
      console.log('4. Then go to Firestore > users > create document');
      console.log('5. Document ID: [user UID from step 3]');
      console.log('6. Fields: { role: "admin", email: "admin@dairymate.com", displayName: "System Administrator", isActive: true, isBanned: false }');
    }
  }
})();
```

### Step 4: Login and Access Admin Panel
1. If successful, you'll see: "🎉 ADMIN USER CREATED SUCCESSFULLY!"
2. Go to your app and click "Sign In"
3. Use credentials:
   - **Email**: `admin@dairymate.com`
   - **Password**: `Admin@123456`
4. Navigate to: `http://localhost:3000/admin`

## Alternative: Manual Firebase Console Method

If the browser script doesn't work:

### Method A: Firebase Authentication Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **milkdost**
3. Go to **Authentication** > **Users**
4. Click **Add user**
5. Enter:
   - Email: `admin@dairymate.com`
   - Password: `Admin@123456`
6. Click **Add user**

### Method B: Firestore Console
1. Go to **Firestore Database**
2. Find or create **users** collection
3. Click **Add document**
4. Document ID: [UID from step A6]
5. Add fields:
   ```
   role: admin
   email: admin@dairymate.com
   displayName: System Administrator
   isActive: true
   isBanned: false
   createdAt: [current timestamp]
   ```

## Troubleshooting

### Can't access /admin?
- ✅ Make sure you're logged in with admin credentials
- ✅ Check the role field in Firestore users collection
- ✅ Clear browser cache and try again

### Script errors in console?
- ✅ Make sure your Next.js app is running
- ✅ Try refreshing the page first
- ✅ Use the manual Firebase Console method instead

### "Access denied" message?
- ✅ Your user role is not set to 'admin' in Firestore
- ✅ Check Firestore > users > [your-uid] > role field

---

**Once you have admin access, you can manage the entire platform from `/admin`! 🎉**