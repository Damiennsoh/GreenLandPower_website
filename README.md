# Green Land Power Inc. - Professional Website

A modern, fully-featured Next.js website for Green Land Power Inc. with an integrated Firebase backend and comprehensive admin dashboard.

## Features

### Public Website
- **Home Page**: Hero section with dynamic content, services preview, and call-to-action sections
- **Services Page**: Comprehensive listing of all electrical services with detailed descriptions
- **Portfolio/Projects**: Showcase of completed projects with images, client info, and results
- **Team Page**: Display of team members with bios and contact information
- **About Us**: Company story, values, and statistics
- **Contact Page**: Two-part contact system:
  - General contact form for inquiries
  - Quote request form for project quotations
  - Google Maps integration placeholder
  - Quick contact information

### Admin Dashboard
- **Authentication**: Demo-based admin login system (no Firebase Auth required initially)
- **Dashboard Overview**: Statistics cards showing messages, portfolio items, and team members
- **Hero Section Editor**: Update website hero title, subtitle, CTA, and background image
- **Footer Content Editor**: Manage footer text, contact information, and social media links
- **Services Manager**: Add, edit, and delete electrical services with features
- **Portfolio Manager**: Manage project portfolio with image uploads
- **Team Manager**: Add and manage team member profiles with photos
- **Submissions Viewer**: Real-time view of contact forms and quote requests with read/unread status

### User Authentication System
- **User Sign Up**: Customers can create accounts to submit quotes and messages
- **User Login**: Registered users can access their accounts
- **User Dashboard**: Personalized dashboard with quick actions to send messages or request quotes

## Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner

## Setup Instructions

### 1. Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable the following services:
   - Firestore Database
   - Authentication (Email/Password)
   - Cloud Storage

3. Create an admin user in Firebase Authentication

4. Create Firestore collections:
   - `admin` (document: `settings`)
   - `services`
   - `portfolio`
   - `team`
   - `submissions/contact/messages`
   - `submissions/quotes/requests`

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Visit `http://localhost:3000` to see the website.

## Usage

### Accessing Admin Dashboard

1. Navigate to `/admin/login`
2. Use demo credentials:
   - Email: `admin@greenland.com`
   - Password: `demo123456`
3. Edit content from the dashboard

### User Authentication

**Sign Up**:
1. Navigate to `/auth/signup`
2. Create an account with name, email, and password
3. Access your personalized dashboard at `/auth/dashboard`

**Login**:
1. Navigate to `/auth/login`
2. Sign in with your email and password
3. Access your account and submit quotes/messages

### Updating Website Content

**Hero Section**:
- Go to Admin Dashboard → Hero Section
- Update title, subtitle, CTA text, and upload background image

**Footer Content**:
- Go to Admin Dashboard → Footer Content
- Update company info, contact details, and social media links

**Services**:
- Go to Admin Dashboard → Services
- Add new services, edit descriptions, and manage features

**Portfolio**:
- Go to Admin Dashboard → Portfolio
- Upload project images and manage project information

**Team**:
- Go to Admin Dashboard → Team Members
- Add team members with photos and contact information

**Submissions**:
- Go to Admin Dashboard → Submissions
- View and manage contact forms and quote requests

## Project Structure

```
/app
  /admin
    /dashboard        # Admin dashboard main page
    /login            # Admin login page
  /services           # Services listing page
  /portfolio          # Portfolio/Projects page
  /team               # Team members page
  /about              # About us page
  /contact            # Contact & quote forms page
  page.tsx            # Home page
  layout.tsx          # Root layout
  globals.css         # Global styles

/components
  /admin              # Admin components
  header.tsx          # Navigation header
  footer.tsx          # Footer with dynamic content
  contact-form.tsx    # Contact form component
  quote-form.tsx      # Quote request form component

/lib
  firebase.ts         # Firebase initialization
  firebaseService.ts  # Firebase CRUD operations
  types.ts            # TypeScript types
  utils.ts            # Utility functions

/public               # Static assets
```

## Firebase Data Structure

### Admin Settings
```
admin/settings {
  heroSection: {
    title: string
    subtitle: string
    ctaText: string
    ctaLink: string
    backgroundImage?: string
  }
  footerContent: {
    companyName: string
    description: string
    address: string
    phone: string
    email: string
    socialLinks: {
      facebook?: string
      twitter?: string
      linkedin?: string
      instagram?: string
    }
    copyrightText: string
  }
}
```

### Services
```
services/{id} {
  title: string
  description: string
  icon?: string
  image?: string
  features?: string[]
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Portfolio
```
portfolio/{id} {
  title: string
  description: string
  image: string
  category: string
  completionDate?: string
  client?: string
  result?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Team
```
team/{id} {
  name: string
  position: string
  bio?: string
  image?: string
  email?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Contact Submissions
```
submissions/contact/messages/{id} {
  name: string
  email: string
  phone: string
  serviceType?: string
  message: string
  createdAt: timestamp
  read: boolean
}
```

### Quote Requests
```
submissions/quotes/requests/{id} {
  name: string
  email: string
  phone: string
  projectDescription: string
  projectScope?: string
  budget?: string
  timeline?: string
  createdAt: timestamp
  read: boolean
}
```

## Color Scheme

- **Primary**: Green (#059669, #10b981)
- **Secondary**: Gray (various shades)
- **Background**: White
- **Accent**: White text on green backgrounds

## Real-time Features

The website uses Firebase's real-time listeners for instant updates:

- Hero section changes reflect immediately on the home page
- Footer content updates in real-time across all pages
- Admin can see new submissions as they arrive
- Portfolio, services, and team changes update instantly

## Security Notes

- Admin authentication is required for dashboard access
- Firebase security rules should be configured to protect Firestore data
- Only authenticated admins can modify content
- Client-side validation is in place, but server-side security rules are essential

## Deployment

The website can be deployed to Vercel:

```bash
# Push to GitHub, then connect to Vercel
# Or use Vercel CLI:
pnpm install -g vercel
vercel
```

Make sure to add environment variables in Vercel project settings.

## Support & Maintenance

For questions or issues:
1. Check Firebase console for data structure
2. Review browser console for error messages
3. Verify Firebase configuration and permissions
4. Ensure admin user exists in Firebase Authentication

## License

All rights reserved - Green Land Power Inc. 2024
