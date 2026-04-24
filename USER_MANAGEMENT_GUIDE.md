# User Management System Guide

## 🎯 **How the System Works**

### **Automatic Role Assignment**
1. **First User** → Automatically becomes **SuperAdmin** 🌟
2. **Subsequent Users** → Automatically become **Users** 👤
3. **SuperAdmin** can promote Users to **Admin** or **SuperAdmin** 👑
4. **Admins** can manage regular users and content 📋

## 🚀 **Setup Process**

### **Step 1: First User Setup**
1. **Clear all existing users** from Firestore (if any)
2. **Sign up** with any email address
3. **Automatically becomes SuperAdmin** ✨
4. **Access admin dashboard** at `/admin/dashboard`

### **Step 2: User Registration**
1. **New users sign up** → Get 'user' role automatically
2. **Can access their profile** at `/profile`
3. **Cannot access admin dashboard** yet

### **Step 3: Admin Management**
1. **SuperAdmin** goes to `/admin/dashboard` → **Users tab**
2. **Promote users** to Admin or SuperAdmin
3. **Manage user status** (active/inactive)
4. **Assign roles** based on permissions needed

## 📋 **Role Permissions**

### **SuperAdmin** 👑
- ✅ Create/remove Admins and SuperAdmins
- ✅ Manage all users and content
- ✅ Access entire admin dashboard
- ✅ Delete users
- ✅ Full system control

### **Admin** 🛡️
- ✅ Manage content (Hero, Footer, Services, Portfolio, Team)
- ✅ Manage regular users (activate/deactivate)
- ✅ View contact submissions and quote requests
- ✅ Promote users to Admin (but not SuperAdmin)
- ❌ Cannot manage other Admins or SuperAdmins

### **User** 👤
- ✅ View public content
- ✅ Update own profile
- ✅ Change password
- ✅ Upload profile picture
- ❌ Cannot access admin dashboard

## 🔧 **Security Rules Logic**

The Firestore security rules now:

1. **First User Detection**: `!exists(/databases/$(database)/documents/users)`
   - If users collection is empty → Allow SuperAdmin creation

2. **Regular User Creation**: `request.resource.data.role in ['user', 'admin']`
   - Anyone can create user or admin accounts for themselves

3. **Role Management**: Only SuperAdmins can create other SuperAdmins
   - Prevents privilege escalation

## 🚨 **Important Notes**

### **First User Setup**
- **Must start with empty users collection**
- **First signup automatically gets SuperAdmin**
- **No manual role assignment needed**

### **User Promotion**
- **SuperAdmin** can promote anyone to any role
- **Admin** can only promote users to Admin
- **Users cannot change their own role**

### **Security**
- **Users can only create their own account** (UID must match)
- **Role changes are restricted** by hierarchy
- **Authentication required** for all operations

## 🧪 **Testing Steps**

### **1. Fresh Setup**
```bash
# Clear existing users (if any)
# Go to Firestore Console → users collection → Delete all documents

# Sign up as first user
# Should automatically become SuperAdmin
```

### **2. Test User Registration**
```bash
# Sign up with different email
# Should automatically become regular User
# Should not access admin dashboard
```

### **3. Test Role Management**
```bash
# As SuperAdmin, go to admin dashboard
# Navigate to Users tab
# Promote a regular user to Admin
# Test their new permissions
```

## 🔍 **Troubleshooting**

### **First User Not Getting SuperAdmin**
- Check if users collection was empty before signup
- Verify security rules are deployed
- Check browser console for errors

### **Users Cannot Sign Up**
- Verify security rules allow user creation
- Check Firebase Auth configuration
- Ensure environment variables are correct

### **Permission Denied Errors**
- Verify user roles in Firestore
- Check security rules deployment
- Ensure user is authenticated

## 🎉 **Success Indicators**

✅ **First user** gets SuperAdmin automatically  
✅ **Subsequent users** get User role automatically  
✅ **SuperAdmin can promote** users to Admin  
✅ **Admins can manage** regular users  
✅ **Users can manage** their own profiles  

---

🚀 **Your user management system is now self-organizing and secure!**
