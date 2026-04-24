# Authentication System Documentation

## Overview

The Green Land Power Inc. website features two distinct authentication systems:

1. **Admin Authentication** (Demo-based - no Firebase required)
2. **User Authentication** (Firebase Firestore-based)

---

## Admin Authentication

### Purpose
Allows admin users to manage website content (hero section, footer, services, portfolio, team, and view submissions).

### Implementation
- **Type**: Session-based demo authentication
- **Location**: `lib/demoAuth.ts`
- **Storage**: Browser sessionStorage
- **Credentials**: Hardcoded (demo only)

### Demo Credentials
```
Email: admin@greenland.com
Password: demo123456
```

### Files Involved
- `app/admin/login/page.tsx` - Admin login page
- `app/admin/dashboard/page.tsx` - Admin dashboard
- `components/admin/admin-nav.tsx` - Admin sidebar navigation
- `components/admin/admin-*.tsx` - Various admin editors

### How It Works

1. User navigates to `/admin/login`
2. Enters credentials
3. `demoLogin()` function validates credentials
4. Session is stored in `sessionStorage`
5. User is redirected to `/admin/dashboard`
6. Dashboard checks session on mount
7. If session valid, shows dashboard
8. If session invalid, redirects to login

### Functions

```typescript
// Check credentials and return user object
demoLogin(email: string, password: string): DemoUser | null

// Store user session
setDemoSession(user: DemoUser): void

// Get current session
getDemoSession(): DemoUser | null

// Clear session
demoLogout(): void

// Check if user is authenticated
isDemoAuthed(): boolean
```

### Migration to Real Auth

When ready to use Firebase Auth:

1. Update `app/admin/login/page.tsx`:
   ```typescript
   import { signInWithEmailAndPassword } from 'firebase/auth';
   import { auth } from '@/lib/firebase';
   
   // Replace demoLogin with:
   await signInWithEmailAndPassword(auth, email, password);
   ```

2. Update `app/admin/dashboard/page.tsx`:
   ```typescript
   import { onAuthStateChanged } from 'firebase/auth';
   import { auth } from '@/lib/firebase';
   
   // Replace getDemoSession with:
   onAuthStateChanged(auth, (currentUser) => {
     if (currentUser) setUser(currentUser);
     else router.push('/admin/login');
   });
   ```

---

## User Authentication

### Purpose
Allows customers to:
- Create accounts
- Login to access their profile
- Submit quotes and messages
- Track their submissions (future feature)

### Implementation
- **Type**: Custom authentication with Firestore
- **Location**: `lib/useAuth.ts`, `lib/firebaseService.ts`
- **Storage**: Browser localStorage
- **Database**: Firebase Firestore (`users` collection)

### Routes

#### Sign Up
- **Path**: `/auth/signup`
- **Component**: `app/auth/signup/page.tsx`
- **Features**:
  - Collect name, email, phone, company
  - Validate input with client-side validation
  - Create user account in Firestore
  - Auto-login after signup
  - Redirect to dashboard

#### Login
- **Path**: `/auth/login`
- **Component**: `app/auth/login/page.tsx`
- **Features**:
  - Query Firestore for user by email
  - Validate credentials
  - Store user in localStorage
  - Redirect to dashboard

#### User Dashboard
- **Path**: `/auth/dashboard`
- **Component**: `app/auth/dashboard/page.tsx`
- **Features**:
  - Display user profile
  - Quick action buttons (message, quote)
  - Logout functionality
  - Protected route (redirects to login if not authenticated)

### User Data Structure

```typescript
interface User {
  id: string;           // Firestore document ID
  name: string;
  email: string;
  phone?: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### useAuth Hook

Custom React hook for managing user authentication on the client:

```typescript
const { 
  user,                    // Current user object or null
  loading,                 // Initial auth check in progress
  error,                   // Error message if any
  isAuthenticated,         // Boolean: user is logged in
  login(userData),         // Login user
  logout(),               // Logout user
  signup(userData),       // Create new user
  setError(message)       // Set error message
} = useAuth();
```

### Firebase Service Functions

```typescript
// User Management
createUserAccount(userData)     // Create new user in Firestore
getUserByEmail(email)          // Find user by email
getUserById(userId)            // Get user by ID
updateUserAccount(userId, data) // Update user profile
```

### Contact Forms & Submissions

Users can submit two types of forms:

#### 1. Contact Form
- **Path**: `/contact`
- **Component**: `components/contact-form.tsx`
- **Fields**: name, email, phone, serviceType, message
- **Storage**: `submissions/contact/messages` collection
- **Admin View**: Admin Dashboard → Submissions

#### 2. Quote Request
- **Path**: `/contact`
- **Component**: `components/quote-form.tsx`
- **Fields**: name, email, phone, projectDescription, projectScope, budget, timeline
- **Storage**: `submissions/quotes/requests` collection
- **Admin View**: Admin Dashboard → Submissions

### Form Submission Flow

1. User fills form (authenticated or not)
2. Form validates input
3. Data sent to Firestore via `addContactSubmission()` or `addQuoteRequest()`
4. User receives confirmation toast
5. Admin sees submission in dashboard

---

## Data Flow

### User Signup Flow
```
User visits /auth/signup
    ↓
Fills signup form
    ↓
Form validates input
    ↓
createUserAccount() creates Firestore document
    ↓
useAuth().signup() stores user in localStorage
    ↓
Redirect to /auth/dashboard
```

### User Login Flow
```
User visits /auth/login
    ↓
Enters email & password
    ↓
getUserByEmail() queries Firestore
    ↓
useAuth().login() stores user in localStorage
    ↓
Redirect to /auth/dashboard
```

### Form Submission Flow
```
User visits /contact
    ↓
Fills contact/quote form
    ↓
Form validates
    ↓
addContactSubmission() or addQuoteRequest()
    ↓
Data stored in Firestore
    ↓
Success notification
    ↓
Admin sees in dashboard
```

---

## Security Considerations

### Current Implementation (Dev/Demo)

- Demo admin credentials stored in code (OK for dev)
- User passwords NOT stored in Firestore
- No password encryption (OK since no passwords stored)
- Session data in sessionStorage (cleared on browser close)
- User data in localStorage (persistent)

### Production Recommendations

1. **Replace Demo Admin Auth**:
   - Use Firebase Authentication
   - Enable MFA for admin
   - Store admin credentials in Firebase only

2. **Enhanced User Auth**:
   - Hash passwords before storage (if storing)
   - Use Firebase Auth instead of custom
   - Implement email verification
   - Add password reset functionality

3. **Database Security**:
   - Implement Row-Level Security (RLS)
   - Restrict data access by user ID
   - Encrypt sensitive data at rest

4. **Form Submissions**:
   - Add reCAPTCHA to prevent spam
   - Implement rate limiting
   - Add email verification before processing

---

## Environment Variables

No additional environment variables needed for user authentication.

Required for Firebase (already in `.env.example`):
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

---

## Testing

### Test Admin Login
1. Go to `/admin/login`
2. Use: admin@greenland.com / demo123456
3. Should see dashboard
4. Edit content
5. Click logout

### Test User Signup
1. Go to `/auth/signup`
2. Fill form with test data
3. Submit
4. Should redirect to `/auth/dashboard`
5. Check Firestore for new user

### Test User Login
1. Create account first
2. Go to `/auth/login`
3. Login with created email
4. Should see dashboard

### Test Form Submissions
1. Go to `/contact`
2. Fill contact form
3. Submit
4. Check Firestore `submissions/contact/messages`
5. Check admin dashboard submissions

---

## Future Enhancements

- [ ] Email verification on signup
- [ ] Password reset functionality
- [ ] User submission history in dashboard
- [ ] Admin approval workflow for quotes
- [ ] Email notifications on form submission
- [ ] Two-factor authentication for admin
- [ ] User profile editing
- [ ] Social media authentication (Google, GitHub)
- [ ] Newsletter subscription
- [ ] Password strength indicator

---

## Troubleshooting

### User Can't Sign Up
- Check Firestore `users` collection exists
- Check Security Rules allow create
- Check console for Firestore errors

### User Can't Login
- Verify user email is in Firestore
- Check Firestore query results
- Clear localStorage and try again

### Form Submission Fails
- Check `submissions` collection exists
- Verify Security Rules
- Check console for errors

### Admin Dashboard Not Loading
- Clear sessionStorage
- Check demo credentials
- Verify localStorage not conflicting
