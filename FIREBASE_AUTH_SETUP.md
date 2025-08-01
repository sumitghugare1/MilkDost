# FIREBASE AUTHENTICATION SETUP GUIDE

## Issue: Cannot login with demo account (auth/invalid-credential)

### Step 1: Enable Authentication in Firebase Console
1. Go to https://console.firebase.google.com
2. Select your "milkdost" project
3. Go to Authentication → Sign-in method
4. Enable "Email/Password" provider
5. **Important**: Enable "Email link (passwordless sign-in)" if needed

### Step 2: Create Test User Account
1. Go to Authentication → Users
2. Click "Add user"
3. Email: demo@milkdost.com
4. Password: demo123456
5. Click "Add user"

### Step 3: Check Firestore Security Rules
Go to Firestore Database → Rules and use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Authenticated users can read/write all business data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 4: Restart Development Server
After making Firebase console changes:
```bash
npm run dev
```

### Alternative: Use Firebase Auth Emulator (Development Only)
If you want to use local auth for development:
```bash
npm install -g firebase-tools
firebase login
firebase init emulators
firebase emulators:start --only auth
```

Then update firebase.ts to connect to emulator in development.
