# Admin Panel Documentation

## Overview
The Ksheera Admin Panel is a comprehensive control center for project owners to manage the entire dairy management platform. It provides tools for monitoring dairy owners, managing subscriptions, tracking analytics, and configuring system settings.

## Access
- **URL**: `/admin`
- **Role Required**: `admin`
- **Authentication**: Firebase Authentication with admin role check

## Features

### 1. Dashboard
- **Total Dairy Owners**: Display count of all registered dairy owners (active/inactive breakdown)
- **Total Clients**: Count all clients across all dairy owners
- **Monthly Revenue**: Calculate total subscription revenue
- **Active Subscriptions**: Count of currently active subscriptions
- **Growth Rate**: Platform growth percentage (15%)
- **System Uptime**: Platform availability (99.9%)
- **Recent Activity Feed**: Latest platform activities

### 2. Dairy Owner Management
- **Search & Filter**: Find owners by name, business name, or email
- **Status Filters**: All, Active, Inactive, Banned
- **Summary Statistics**: 
  - Total Owners
  - Active Owners (green badge)
  - Inactive Owners (orange badge)
  - Banned Owners (red badge)
- **Owner Cards**: Display detailed information
  - Name, Business Name
  - Email, Phone
  - Client Count
  - Registration Date
- **Actions**:
  - View Details (Eye icon) - Opens modal with full info
  - Activate/Deactivate Toggle (CheckCircle/XCircle)
  - Ban/Unban Toggle (Ban/Shield icons)
- **Real-time Updates**: Uses Firestore `updateDoc` for instant changes

### 3. Subscription Management
- **Revenue Statistics**:
  - Monthly Revenue (green card)
  - Active Subscriptions (blue card)
  - Pending Subscriptions (orange card)
  - Expired Subscriptions (red card)
- **Subscription Plans**:
  - **Basic**: ₹499/month (Up to 50 clients, Basic analytics, Email support)
  - **Professional**: ₹999/month (Up to 200 clients, Advanced analytics, Priority support, Custom branding)
  - **Enterprise**: ₹1999/month (Unlimited clients, Full analytics, 24/7 support, API access, White label)
- **Subscription List**: View all subscriptions with owner details
- **Actions**: Activate/Deactivate subscriptions

### 4. Admin Analytics
- **Time Range Selector**: Week, Month, Year views
- **Key Metrics**:
  - Growth Rate: +24.5%
  - Revenue Growth: +31.2%
  - Avg Revenue/Owner: ₹999/month
  - Retention Rate: 94.8%
- **User Growth Chart**: Visual representation of owners and clients growth over time
- **Revenue Trends**: Monthly revenue with animated progress bars
- **Geographic Distribution**: Regional breakdown of dairy owners
  - Maharashtra, Gujarat, Punjab, Haryana, Uttar Pradesh, Other

### 5. System Settings
- **General Settings**:
  - Platform Name
  - Support Email
  - Currency (INR, USD, EUR, GBP)
- **Subscription Settings**:
  - Default Plan
  - Default Plan Price
  - Trial Period (Days)
  - Max Clients Per Owner
  - Auto Renewal Toggle
- **Notification Settings**:
  - Push Notifications Toggle
  - Email Alerts Toggle
- **Security & Data**:
  - Backup Database
  - View Audit Logs
  - Clear Cache

## Theme
- **Primary Colors**: Purple (#9333ea) and Pink (#ec4899)
- **Background**: Slate-900 with gradient overlay
- **Style**: Professional dark theme with glassmorphism effects
- **Typography**: Bold, black font weights for headers
- **Effects**: Backdrop blur, gradient borders, smooth transitions

## Database Structure

### Users Collection
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'dairy_owner' | 'client' | 'admin';
  businessName?: string;
  phoneNumber?: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: Timestamp;
}
```

### Subscriptions Collection
```typescript
interface Subscription {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  planName: 'Basic' | 'Professional' | 'Enterprise';
  amount: number;
  status: 'active' | 'expired' | 'pending';
  startDate: Timestamp;
  endDate: Timestamp;
  autoRenew: boolean;
}
```

## Creating an Admin User

### Method 1: Firebase Console
1. Go to Firebase Console > Authentication
2. Find the user you want to make admin
3. Go to Firestore > `users` collection
4. Find the user document by UID
5. Update the `role` field to `'admin'`

### Method 2: Using Firebase Admin SDK
```typescript
import { getFirestore } from 'firebase-admin/firestore';

async function makeUserAdmin(uid: string) {
  const db = getFirestore();
  await db.collection('users').doc(uid).update({
    role: 'admin'
  });
}
```

### Method 3: Create Script (Recommended)
Create `scripts/createAdmin.ts`:
```typescript
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

async function createAdminUser() {
  const auth = getAuth();
  
  // Create auth user
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    'admin@dairymate.com',
    'AdminPassword123!'
  );
  
  // Create profile in Firestore
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    uid: userCredential.user.uid,
    email: 'admin@dairymate.com',
    displayName: 'System Administrator',
    role: 'admin',
    isActive: true,
    isBanned: false,
    createdAt: new Date()
  });
  
  console.log('Admin user created successfully!');
}

createAdminUser();
```

## Security Rules

Update `firestore.rules` to protect admin routes:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin-only access
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Protect subscriptions collection
    match /subscriptions/{subscriptionId} {
      allow read, write: if isAdmin();
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if isAdmin() || request.auth.uid == userId;
    }
  }
}
```

## Navigation Flow
```
/admin
├── Dashboard (default)
│   ├── Statistics Overview
│   └── Recent Activity
├── Dairy Owners
│   ├── Search & Filter
│   ├── Owner List
│   └── Actions (View/Activate/Ban)
├── Subscriptions
│   ├── Revenue Stats
│   ├── Plans Overview
│   └── Subscription List
├── Analytics
│   ├── Key Metrics
│   ├── Growth Charts
│   └── Geographic Data
└── Settings
    ├── General
    ├── Subscriptions
    ├── Notifications
    └── Security
```

## Key Components
- `src/app/admin/page.tsx` - Main admin page with routing
- `src/components/admin/AdminDashboard.tsx` - Dashboard overview
- `src/components/admin/DairyOwnerManagement.tsx` - Owner management
- `src/components/admin/SubscriptionManagement.tsx` - Subscription billing
- `src/components/admin/AdminAnalytics.tsx` - Analytics dashboard
- `src/components/admin/SystemSettings.tsx` - System configuration

## Permissions & Access Control
- Only users with `role: 'admin'` can access `/admin`
- Non-admin users are redirected to home page
- All actions are logged and can be audited
- Admin can:
  - View all dairy owners and their clients
  - Ban/activate dairy owner accounts
  - Manage subscription plans and pricing
  - View revenue and growth analytics
  - Configure platform settings
  - Access system logs and backups

## Revenue Model
- **Subscription-based**: Dairy owners pay monthly fees
- **Pricing Tiers**: Basic (₹499), Professional (₹999), Enterprise (₹1999)
- **Features**: Tiered based on client limits and features
- **Auto-renewal**: Optional automatic subscription renewal
- **Trial Period**: Configurable trial period for new owners

## Future Enhancements
1. **Email Notifications**: Automated emails for subscription events
2. **Payment Gateway Integration**: Razorpay/Stripe for subscription payments
3. **Advanced Analytics**: More detailed charts and insights
4. **Audit Logs**: Complete activity logging system
5. **Backup & Restore**: Automated database backups
6. **Multi-language Support**: Internationalization
7. **API Access**: REST API for enterprise clients
8. **White Label**: Custom branding for enterprise plans
9. **Mobile App**: Native iOS/Android admin app
10. **Real-time Notifications**: WebSocket-based updates

## Testing Checklist
- [ ] Admin role check works (redirects non-admins)
- [ ] Dashboard statistics load correctly
- [ ] Owner search and filters work
- [ ] Ban/activate toggles update Firestore
- [ ] Subscription list displays correctly
- [ ] Analytics charts render properly
- [ ] Settings save functionality works
- [ ] All icons are visible (flex-shrink-0)
- [ ] Responsive design on mobile/tablet
- [ ] Theme consistency (purple/pink/slate)

## Support & Maintenance
- **Contact**: admin@dairymate.com
- **Documentation**: This file
- **Updates**: Regular feature additions and bug fixes
- **Monitoring**: System uptime and performance tracking
