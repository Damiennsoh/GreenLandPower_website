# Firebase Integration Setup Guide

## 🚀 Overview
This guide will help you integrate the Green Land Power website with Firebase Authentication and Firestore database, including user management with admin roles.

## 📋 Prerequisites
- Node.js and npm installed
- Firebase project created (you already have the config)
- Firebase CLI installed: `npm install -g firebase-tools`

## 🔥 Firebase Setup

### 1. Initialize Firebase
```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select options:
# ? Which Firebase features do you want to set up? 
# ◯ Firestore: Configure security rules and indexes
# ◯ Hosting: Configure and deploy to Firebase sites
# ◯ Storage: Configure security rules

# ? Use an existing project? Yes
# ? Select your project: glp-website-5639a

# ? What file should be used for Firestore rules? firestore.rules
# ? What file should be used for Storage rules? storage.rules
# ? What do you want to use as public directory? out
# ? Configure as a single-page app? Yes
# ? Set up automatic builds? No
```

### 2. Deploy Firestore Security Rules
```bash
# Deploy the security rules
firebase deploy --only firestore:rules
```

### 3. Create Super Admin User
After deploying, create the first super admin user:

1. **Via Firebase Console:**
   - Go to Firebase Console → Firestore Database
   - Create a document in `users` collection with:
   ```javascript
   {
     uid: "YOUR_AUTH_UID", // Get this after first user signs up
     email: "admin@greenland.com",
     name: "Admin User",
     role: "superAdmin",
     isActive: true,
     createdAt: new Date(),
     updatedAt: new Date()
   }
   ```

2. **Or via code after first signup:**
   - Sign up with any email first
   - Then update the user role in Firestore console to `superAdmin`

## 📊 Firestore Security Rules

Copy and paste these rules in Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superAdmin'];
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superAdmin';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isActiveUser(userId) {
      return get(/databases/$(database)/documents/users/$(userId)).data.isActive == true;
    }

    // Users collection - SuperAdmin can create admin users, Admins can create regular users
    match /users/{userId} {
      // Read rules
      allow read: if isOwner(userId) || isAdmin();
      
      // Create rules - SuperAdmin can create any user, Admins can create regular users
      allow create: if isSuperAdmin() || 
                     (isAdmin() && request.resource.data.role == 'user') ||
                     (isAuthenticated() && isOwner(userId) && request.resource.data.role == 'user');
      
      // Update rules - Users can update their own profile (except role), Admins can update regular users, SuperAdmin can update anyone
      allow update: if (isOwner(userId) && 
                      request.resource.data.role == resource.data.role && // Can't change own role
                      request.resource.data.uid == resource.data.uid) || // Can't change own uid
                     (isAdmin() && resource.data.role == 'user') ||
                     isSuperAdmin();
      
      // Delete rules - Only SuperAdmin can delete users
      allow delete: if isSuperAdmin();
    }

    // Admin settings - Only admins can access
    match /admin/{document} {
      allow read, write: if isAdmin();
    }

    // Services collection - Admins can manage, everyone can read
    match /services/{serviceId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Portfolio collection - Admins can manage, everyone can read
    match /portfolio/{portfolioId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Team collection - Admins can manage, everyone can read
    match /team/{teamId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Contact submissions - Anyone can create, admins can read/update
    match /submissions/contact/messages/{messageId} {
      allow create: if true;
      allow read, update: if isAdmin();
    }

    // Quote requests - Anyone can create, admins can read/update
    match /submissions/quotes/requests/{requestId} {
      allow create: if true;
      allow read, update: if isAdmin();
    }

    // User profiles for profile images - Users can manage their own
    match /userProfiles/{userId} {
      allow read, write: if isOwner(userId) || isAdmin();
    }
  }
}
```

## 👥 User Role System

### Role Hierarchy:
1. **Super Admin** - Can manage everything, including creating/removing admins
2. **Admin** - Can manage content and regular users
3. **User** - Regular user with basic access

### Role Permissions:
- **Super Admin**: All permissions + can assign/remove admin roles
- **Admin**: Content management + can manage regular users
- **User**: View content, update own profile

## 🔧 Environment Variables

Your `.env.local` file should already contain:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDiYI-AV0_dPP178bAZFUafT-8TcJOVbG8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=glp-website-5639a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=glp-website-5639a
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=glp-website-5639a.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=459610981003
NEXT_PUBLIC_FIREBASE_APP_ID=1:459610981003:web:11c9bdaa6bb3c31f614a8e
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-T8JZ3N018Y
```

## 🚀 Deployment Options

### Option 1: Firebase Hosting
```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy
```

### Option 2: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# For continuous deployment, connect your GitHub repo to Vercel
```

## 📱 Features Implemented

### ✅ Authentication System
- Firebase Authentication integration
- User registration and login
- Password reset functionality
- Profile management with image upload

### ✅ User Management
- Role-based access control (User, Admin, Super Admin)
- User statistics dashboard
- Admin can manage regular users
- Super Admin can manage admins

### ✅ Admin Dashboard
- Content management (Hero, Footer, Services, Portfolio, Team)
- User management with role assignment
- Contact form submissions
- Quote requests management
- Real-time statistics

### ✅ Security Features
- Firestore security rules
- Role-based permissions
- Protected routes
- Input validation

## 🧪 Testing

1. **First User Setup:**
   - Navigate to `/auth` and sign up with any email
   - Go to Firebase Console → Firestore → users collection
   - Update the user's role to `superAdmin`
   - Log out and log back in

2. **Admin Features:**
   - Access `/admin/dashboard`
   - Test user management
   - Test content management
   - Test role assignments

3. **User Profile:**
   - Navigate to `/profile`
   - Test profile updates
   - Test password changes
   - Test image uploads

## 🐛 Troubleshooting

### Common Issues:
1. **Permission Denied Errors**: Check Firestore security rules
2. **Auth Not Working**: Verify Firebase config in `.env.local`
3. **Deploy Failures**: Check build output in `out` directory

### Debug Steps:
1. Check browser console for errors
2. Verify Firebase project settings
3. Check Firestore rules in Firebase Console
4. Ensure environment variables are correct

## 📞 Support

If you encounter issues:
1. Check Firebase Console for errors
2. Verify all configuration steps
3. Review browser console logs
4. Ensure proper user roles are set in Firestore

---

🎉 **Your Green Land Power website is now ready with full Firebase integration!**
