# Green Land Power Inc. - Complete Setup Guide

This guide will help you set up the Green Land Power Inc. website with Firebase backend integration.

## Quick Start (Without Firebase - Demo Mode)

If you want to test the website quickly without setting up Firebase, follow these steps:

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the website.

### 3. Test Admin Dashboard

Navigate to `http://localhost:3000/admin/login` and use:
- Email: `admin@greenland.com`
- Password: `demo123456`

**Note**: Without Firebase, the admin dashboard will not persist data. Form submissions will fail. Follow the Firebase setup below to enable full functionality.

---

## Full Setup (With Firebase)

### 1. Create Firebase Project

1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Get Started" and create a new project
3. Fill in your project name (e.g., "Green Land Power")
4. Accept terms and create the project
5. Wait for the project to initialize

### 2. Enable Required Services

In your Firebase Console:

1. **Firestore Database**:
   - Go to Build → Firestore Database
   - Click "Create Database"
   - Choose "Start in production mode"
   - Select your region (closest to your users)
   - Click "Create"

2. **Authentication** (Optional for now - using demo auth):
   - Go to Build → Authentication
   - Click "Get Started"
   - Enable "Email/Password" provider
   - Click "Save"

3. **Cloud Storage** (for image uploads):
   - Go to Build → Cloud Storage
   - Click "Get started"
   - Start in production mode
   - Select your region
   - Click "Done"

### 3. Get Firebase Credentials

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon `</>` to create a web app
4. Register app with a name (e.g., "Green Land Power Website")
5. Copy the Firebase config object
6. You'll see something like:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Set Environment Variables

1. Open your project folder
2. Rename `.env.example` to `.env.local`
3. Fill in your Firebase credentials:

```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

### 5. Create Firestore Collections

In Firebase Console → Firestore Database:

Create the following collection structure:

```
admin/
  └── settings (document)
       ├── heroSection (object)
       ├── footerContent (object)
       └── updatedAt (timestamp)

services/
  └── (auto-generated documents)

portfolio/
  └── (auto-generated documents)

team/
  └── (auto-generated documents)

submissions/
  └── contact/
       └── messages/ (collection)
  └── quotes/
       └── requests/ (collection)

users/
  └── (auto-generated documents for user accounts)
```

### 6. Set Firestore Security Rules

Go to Firestore Database → Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to public collections
    match /services/{document=**} {
      allow read;
    }
    match /portfolio/{document=**} {
      allow read;
    }
    match /team/{document=**} {
      allow read;
    }
    match /admin/{document=**} {
      allow read;
    }
    
    // Allow submissions from anyone
    match /submissions/{document=**} {
      allow create;
      allow read, write: if false;
    }
    
    // Users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
      allow create;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 7. Set Cloud Storage Rules

Go to Cloud Storage → Rules and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all files
    match /{allPaths=**} {
      allow read;
      allow write: if request.auth != null;
    }
  }
}
```

### 8. Install Dependencies and Run

```bash
pnpm install
pnpm dev
```

### 9. Test the Setup

1. Visit `http://localhost:3000` - you should see the home page
2. Go to `/admin/login` and test admin login with demo credentials
3. Create a user account at `/auth/signup`
4. Submit a contact form at `/contact`
5. Check Firestore Console to see submissions

---

## Email Notifications Setup (Optional)

To send email notifications when users submit forms:

### Option 1: Firebase Cloud Functions

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

2. Create a function to send emails on form submission
3. Use Nodemailer or SendGrid for email delivery

### Option 2: Third-Party Integration

1. Use Zapier to connect Firestore to email
2. Or use Formspree/Basin for form handling
3. Or integrate with your preferred email service

---

## Admin Dashboard Features

Once set up with Firebase, the admin can:

- **Update Hero Section**: Change website headline, subtitle, and CTA
- **Manage Footer**: Update contact info and social links
- **Add Services**: Create and manage service offerings
- **Portfolio Management**: Upload and showcase completed projects
- **Team Management**: Add team members with photos and bios
- **View Submissions**: See all contact form and quote request submissions

---

## User Features

Users can:

1. **Sign Up**: Create an account at `/auth/signup`
2. **Login**: Access account at `/auth/login`
3. **Dashboard**: View their profile at `/auth/dashboard`
4. **Submit Forms**: Fill contact forms or request quotes
5. **Track Submissions**: View their submissions (coming soon)

---

## Troubleshooting

### Admin Dashboard Not Loading
- Check browser console for errors
- Verify `.env.local` has correct Firebase credentials
- Clear browser cache and reload

### Firestore Data Not Saving
- Check Firestore Security Rules
- Verify collection structure matches code expectations
- Check browser console for permission errors

### Images Not Uploading
- Check Cloud Storage Rules
- Verify Storage bucket name in `.env.local`
- Check browser console for upload errors

### Users Can't Sign Up
- Ensure `users` collection exists in Firestore
- Check Security Rules allow user creation
- Verify email validation in form

---

## Production Deployment

### To Deploy on Vercel:

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel project settings
4. Enable "Build Output Caching"
5. Deploy

### Additional Configurations:

- Set up custom domain
- Configure HTTPS (automatic on Vercel)
- Enable analytics in Vercel dashboard
- Set up monitoring and error tracking

---

## Support & Updates

For issues or questions:
- Check Firebase console logs
- Review browser console for errors
- Check network requests in DevTools
- Review Firestore security rules

Happy coding! 🚀
