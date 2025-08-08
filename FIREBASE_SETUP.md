# Firebase Setup Instructions for DairyMate

## Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing project "milkdost"
3. Enable Firestore Database
4. Enable Authentication (Email/Password)

## Step 2: Environment Variables

Create a `.env.local` file in the root directory with your Firebase config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=milkdost.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=milkdost
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=milkdost.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 3: Firestore Collections

The app will automatically create these collections when you add data:

- `clients` - Client management
- `deliveries` - Daily deliveries
- `buffaloes` - Buffalo care tracking
- `feedings` - Feeding schedules
- `bills` - Monthly billing
- `productions` - Milk production records

## Step 4: Firestore Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 5: Required Firestore Indexes

If you encounter index errors, create these composite indexes in the Firebase Console:

### Bills Collection Index (REQUIRED)
- Collection: `bills`
- Fields: `month` (Ascending), `year` (Ascending), `createdAt` (Descending)

**Quick Setup:** Click the index creation link from the error message or manually create in Firebase Console:
1. Go to Firebase Console > Firestore Database > Indexes
2. Click "Create Index"
3. Collection ID: `bills`
4. Add fields:
   - Field: `month`, Order: Ascending
   - Field: `year`, Order: Ascending  
   - Field: `createdAt`, Order: Descending
5. Click "Create"

### Deliveries Collection Index
- Collection: `deliveries`
- Fields: `date` (Ascending), `clientId` (Ascending)

### Feedings Collection Index
- Collection: `feedings`
- Fields: `date` (Ascending), `buffaloId` (Ascending)` (Descending)

### Deliveries Collection Index
- Collection: `deliveries`
- Fields: `date` (Ascending), `clientId` (Ascending)

### Feedings Collection Index
- Collection: `feedings`
- Fields: `date` (Ascending), `buffaloId` (Ascending)

## Step 6: Test the Setup

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Try adding a client, buffalo, or delivery to test Firebase integration

## Troubleshooting

### Common Issues:

1. **Index Required Error**: 
   - Follow the link in the error message to create the required index
   - Or use the manual index creation steps above

2. **Authentication Error**:
   - Check your Firebase project settings
   - Verify environment variables are correct

3. **Permission Denied**:
   - Update Firestore security rules
   - Ensure user is authenticated

4. **Undefined Field Values**:
   - This has been fixed in the codebase
   - Firebase doesn't accept `undefined` values, only `null` or omitted fields

### Firebase Console Links:
- [Firestore Database](https://console.firebase.google.com/project/milkdost/firestore)
- [Authentication](https://console.firebase.google.com/project/milkdost/authentication)
- [Project Settings](https://console.firebase.google.com/project/milkdost/settings/general)

## Data Validation

The app now properly handles optional fields by:
- Only including fields with actual values in Firestore documents
- Converting dates to Firestore timestamps
- Avoiding `undefined` values that cause Firebase errors

## Production Deployment

When deploying to production:
1. Update environment variables on your hosting platform
2. Set up proper Firebase security rules
3. Consider enabling Firestore offline persistence for better mobile experience
