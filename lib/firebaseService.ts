'use client';

import {
  db,
  storage,
} from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FirebaseCache, CACHE_KEYS } from './firebaseCache';
import {
  HeroSection,
  FooterContent,
  Service,
  Portfolio,
  TeamMember,
  ContactSubmission,
  QuoteRequest,
  AdminSettings,
  User,
  UserAccount,
  UserRole,
} from './types';

// Admin Settings
export const updateHeroSection = async (heroData: HeroSection) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return { success: true };
    }
    const adminRef = doc(db, 'admin', 'settings');
    await setDoc(
      adminRef,
      {
        heroSection: heroData,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating hero section:', error);
    throw error;
  }
};

export const updateFooterContent = async (footerData: FooterContent) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return { success: true };
    }
    const adminRef = doc(db, 'admin', 'settings');
    await setDoc(
      adminRef,
      {
        footerContent: footerData,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating footer:', error);
    throw error;
  }
};

export const getAdminSettings = async (): Promise<AdminSettings | null> => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return null;
    }
    const adminRef = doc(db, 'admin', 'settings');
    const docSnap = await getDoc(adminRef);
    if (docSnap.exists()) {
      return docSnap.data() as AdminSettings;
    }
    return null;
  } catch (error) {
    console.error('Error getting admin settings:', error);
    throw error;
  }
};

export const onAdminSettingsChange = (callback: (data: AdminSettings | null) => void) => {
  try {
    if (!db) {
      console.info('Firebase not initialized. Demo mode.');
      return () => {};
    }
    const adminRef = doc(db, 'admin', 'settings');
    return onSnapshot(adminRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as AdminSettings);
      } else {
        callback(null);
      }
    });
  } catch (error) {
    console.error('Error setting up admin settings listener:', error);
    throw error;
  }
};

// Services
export const addService = async (serviceData: Service) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return '';
    }
    const docRef = await addDoc(collection(db, 'services'), {
      ...serviceData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    // Clear cache after adding
    FirebaseCache.clear(CACHE_KEYS.SERVICES);
    return docRef.id;
  } catch (error) {
    console.error('Error adding service:', error);
    throw error;
  }
};

export const updateService = async (id: string, serviceData: Partial<Service>) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return;
    }
    const docRef = doc(db, 'services', id);
    await updateDoc(docRef, {
      ...serviceData,
      updatedAt: Timestamp.now(),
    });
    // Clear cache after update
    FirebaseCache.clear(CACHE_KEYS.SERVICES);
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

export const deleteService = async (id: string) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return;
    }
    await deleteDoc(doc(db, 'services', id));
    // Clear cache after deletion
    FirebaseCache.clear(CACHE_KEYS.SERVICES);
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

export const getServices = async (useCache = true): Promise<Service[]> => {
  try {
    // Check cache first
    if (useCache) {
      const cached = FirebaseCache.get<Service[]>(CACHE_KEYS.SERVICES);
      if (cached) {
        console.info('Using cached services data');
        return cached;
      }
    }
    
    if (!db) {
      console.info('Firebase not initialized. Demo mode.');
      return [];
    }
    
    const querySnapshot = await getDocs(
      query(collection(db, 'services'), orderBy('createdAt', 'desc'))
    );
    const services = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Service[];
    
    // Cache the results
    FirebaseCache.set(CACHE_KEYS.SERVICES, services);
    
    return services;
  } catch (error) {
    console.error('Error getting services:', error);
    return [];
  }
};

export const onServicesChange = (callback: (data: Service[]) => void) => {
  try {
    if (!db) {
      console.info('Firebase not initialized. Demo mode.');
      return () => {};
    }
    return onSnapshot(
      query(collection(db, 'services'), orderBy('createdAt', 'desc')),
      (querySnapshot) => {
        const services = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Service[];
        callback(services);
      }
    );
  } catch (error) {
    console.error('Error setting up services listener:', error);
    throw error;
  }
};

// Portfolio
export const addPortfolio = async (portfolioData: Portfolio) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return '';
    }
    const docRef = await addDoc(collection(db, 'portfolio'), {
      ...portfolioData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    // Clear cache after adding
    FirebaseCache.clear(CACHE_KEYS.PORTFOLIO);
    return docRef.id;
  } catch (error) {
    console.error('Error adding portfolio:', error);
    throw error;
  }
};

export const updatePortfolio = async (id: string, portfolioData: Partial<Portfolio>) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return;
    }
    const docRef = doc(db, 'portfolio', id);
    await updateDoc(docRef, {
      ...portfolioData,
      updatedAt: Timestamp.now(),
    });
    // Clear cache after update
    FirebaseCache.clear(CACHE_KEYS.PORTFOLIO);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    throw error;
  }
};

export const deletePortfolio = async (id: string) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return;
    }
    await deleteDoc(doc(db, 'portfolio', id));
    // Clear cache after deletion
    FirebaseCache.clear(CACHE_KEYS.PORTFOLIO);
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    throw error;
  }
};

export const getPortfolios = async (useCache = true): Promise<Portfolio[]> => {
  try {
    // Check cache first
    if (useCache) {
      const cached = FirebaseCache.get<Portfolio[]>(CACHE_KEYS.PORTFOLIO);
      if (cached) {
        console.info('Using cached portfolio data');
        return cached;
      }
    }
    
    if (!db) {
      console.info('Firebase not initialized. Returning demo portfolio data.');
      return [
        {
          id: '1',
          title: 'Monrovia Office Complex',
          description: 'Complete electrical installation for a 5-story commercial office building in downtown Monrovia.',
          image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
          category: 'Commercial',
          completionDate: '2024-03',
          client: 'Liberia Business Center',
          result: 'Successfully installed 500+ electrical outlets, 200 lighting fixtures, and backup generator system.',
        },
        {
          id: '2',
          title: 'Sinkor Residential Development',
          description: 'Electrical wiring for 50-unit residential apartment complex in Sinkor.',
          image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
          category: 'Residential',
          completionDate: '2024-02',
          client: 'Golden Homes Ltd.',
          result: 'Completed full electrical installation including smart home features and solar water heating.',
        },
        {
          id: '3',
          title: 'Freeport Industrial Facility',
          description: 'Heavy-duty electrical installation for manufacturing facility at Freeport.',
          image: 'https://images.unsplash.com/photo-1565514020176-db98eb4e5f5d?w=800&q=80',
          category: 'Industrial',
          completionDate: '2024-01',
          client: 'Liberia Manufacturing Co.',
          result: 'Installed 3-phase power systems, heavy machinery wiring, and comprehensive safety systems.',
        },
        {
          id: '4',
          title: 'Paynesville School Project',
          description: 'Electrical systems for new educational facility serving 1000+ students.',
          image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
          category: 'Institutional',
          completionDate: '2023-12',
          client: 'Ministry of Education',
          result: 'Provided complete electrical infrastructure including computer labs and security systems.',
        },
        {
          id: '5',
          title: 'Benson Street Hospital',
          description: 'Critical electrical systems for medical facility with backup power solutions.',
          image: 'https://images.unsplash.com/photo-1587351021759-3e566b9af923?w=800&q=80',
          category: 'Healthcare',
          completionDate: '2023-11',
          client: 'Liberia Medical Center',
          result: 'Installed hospital-grade electrical systems with redundant power for life support equipment.',
        },
      ];
    }
    const querySnapshot = await getDocs(
      query(collection(db, 'portfolio'), orderBy('createdAt', 'desc'))
    );
    const portfolios = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Portfolio[];
    
    // Cache the results
    FirebaseCache.set(CACHE_KEYS.PORTFOLIO, portfolios);
    
    return portfolios;
  } catch (error) {
    console.error('Error getting portfolio:', error);
    return [];
  }
};

export const getPortfolio = async (): Promise<Portfolio[]> => {
  return getPortfolios();
};

export const onPortfolioChange = (callback: (data: Portfolio[]) => void) => {
  try {
    if (!db) {
      console.info('Firebase not initialized. Demo mode.');
      return () => {};
    }
    return onSnapshot(
      query(collection(db, 'portfolio'), orderBy('createdAt', 'desc')),
      (querySnapshot) => {
        const portfolio = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Portfolio[];
        callback(portfolio);
      }
    );
  } catch (error) {
    console.error('Error setting up portfolio listener:', error);
    throw error;
  }
};

// Team Members
export const addTeamMember = async (memberData: TeamMember) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return 'demo-team-id';
    }
    const docRef = await addDoc(collection(db, 'team'), {
      ...memberData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    // Clear cache after adding
    FirebaseCache.clear(CACHE_KEYS.TEAM);
    return docRef.id;
  } catch (error) {
    console.error('Error adding team member:', error);
    throw error;
  }
};

export const updateTeamMember = async (id: string, memberData: Partial<TeamMember>) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return;
    }
    const docRef = doc(db, 'team', id);
    await updateDoc(docRef, {
      ...memberData,
      updatedAt: Timestamp.now(),
    });
    // Clear cache after update
    FirebaseCache.clear(CACHE_KEYS.TEAM);
  } catch (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
};

export const deleteTeamMember = async (id: string) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return;
    }
    await deleteDoc(doc(db, 'team', id));
    // Clear cache after deletion
    FirebaseCache.clear(CACHE_KEYS.TEAM);
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
};

export const getTeamMembers = async (useCache = true): Promise<TeamMember[]> => {
  try {
    // Check cache first
    if (useCache) {
      const cached = FirebaseCache.get<TeamMember[]>(CACHE_KEYS.TEAM);
      if (cached) {
        console.info('Using cached team data');
        return cached;
      }
    }
    
    if (!db) {
      console.info('Firebase not initialized. Returning demo team data.');
      return [
        {
          id: '1',
          name: 'James K. Wilson',
          position: 'Chief Executive Officer & Founder',
          bio: 'Electrical engineer with 18+ years of experience in power systems, renewable energy, and large-scale infrastructure projects across West Africa.',
          image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
          email: 'j.wilson@greenlandpower.com.lr',
        },
        {
          id: '2',
          name: 'Sarah M. Johnson',
          position: 'Operations Manager',
          bio: 'Expertise in project management and electrical operations with 10 years of experience in Liberia\'s energy sector.',
          image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
          email: 's.johnson@greenlandpower.com.lr',
        },
        {
          id: '3',
          name: 'Robert B. Williams',
          position: 'Lead Electrical Engineer',
          bio: 'Licensed electrical engineer specializing in commercial and industrial electrical systems design and implementation.',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
          email: 'r.williams@greenlandpower.com.lr',
        },
        {
          id: '4',
          name: 'Grace T. Cooper',
          position: 'Safety & Compliance Officer',
          bio: 'Certified safety professional ensuring all projects meet international electrical safety standards and Liberian regulations.',
          image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
          email: 'g.cooper@greenlandpower.com.lr',
        },
      ];
    }
    const querySnapshot = await getDocs(
      query(collection(db, 'team'), orderBy('createdAt', 'desc'))
    );
    const team = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TeamMember[];
    
    // Cache the results
    FirebaseCache.set(CACHE_KEYS.TEAM, team);
    
    return team;
  } catch (error) {
    console.error('Error getting team members:', error);
    return [];
  }
};

export const onTeamMembersChange = (callback: (data: TeamMember[]) => void) => {
  try {
    if (!db) {
      console.info('Firebase not initialized. Demo mode.');
      return () => {};
    }
    return onSnapshot(
      query(collection(db, 'team'), orderBy('createdAt', 'desc')),
      (querySnapshot) => {
        const team = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TeamMember[];
        callback(team);
      }
    );
  } catch (error) {
    console.error('Error setting up team listener:', error);
    throw error;
  }
};

// Contact Submissions
export const addContactSubmission = async (submission: Omit<ContactSubmission, 'id'>) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return 'demo-contact-id';
    }
    const docRef = await addDoc(collection(db, 'submissions', 'contact', 'messages'), {
      ...submission,
      createdAt: Timestamp.now(),
      read: false,
    });
    // Clear cache after adding new submission
    FirebaseCache.clear(CACHE_KEYS.SUBMISSIONS);
    return docRef.id;
  } catch (error) {
    console.error('Error adding contact submission:', error);
    throw error;
  }
};

export const getContactSubmissions = async (useCache = true): Promise<ContactSubmission[]> => {
  try {
    // Check cache first
    if (useCache) {
      const cached = FirebaseCache.get<ContactSubmission[]>(CACHE_KEYS.SUBMISSIONS);
      if (cached) {
        console.info('Using cached submissions data');
        return cached;
      }
    }
    
    if (!db) {
      console.info('Firebase not initialized. Returning demo contact submissions.');
      return [];
    }
    
    const querySnapshot = await getDocs(
      query(
        collection(db, 'submissions', 'contact', 'messages'),
        orderBy('createdAt', 'desc')
      )
    );
    const submissions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ContactSubmission[];
    
    // Cache the results
    FirebaseCache.set(CACHE_KEYS.SUBMISSIONS, submissions);
    
    return submissions;
  } catch (error) {
    console.error('Error getting contact submissions:', error);
    return [];
  }
};

export const markContactAsRead = async (id: string) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return;
    }
    const docRef = doc(db, 'submissions', 'contact', 'messages', id);
    await updateDoc(docRef, { read: true });
    // Clear cache after marking as read
    FirebaseCache.clear(CACHE_KEYS.SUBMISSIONS);
  } catch (error) {
    console.error('Error marking contact as read:', error);
    throw error;
  }
};

export const onContactSubmissionsChange = (callback: (data: ContactSubmission[]) => void) => {
  try {
    if (!db) {
      console.info('Firebase not initialized. Demo mode.');
      return () => {};
    }
    return onSnapshot(
      query(
        collection(db, 'submissions', 'contact', 'messages'),
        orderBy('createdAt', 'desc')
      ),
      (querySnapshot) => {
        const submissions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ContactSubmission[];
        callback(submissions);
      }
    );
  } catch (error) {
    console.error('Error setting up contact submissions listener:', error);
    throw error;
  }
};

// Quote Requests
export const addQuoteRequest = async (request: Omit<QuoteRequest, 'id'>) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return 'demo-quote-id';
    }
    const docRef = await addDoc(collection(db, 'submissions', 'quotes', 'requests'), {
      ...request,
      createdAt: Timestamp.now(),
      read: false,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding quote request:', error);
    throw error;
  }
};

export const getQuoteRequests = async (): Promise<QuoteRequest[]> => {
  try {
    if (!db) {
      console.info('Firebase not initialized. Returning demo quote requests.');
      return [];
    }
    const querySnapshot = await getDocs(
      query(
        collection(db, 'submissions', 'quotes', 'requests'),
        orderBy('createdAt', 'desc')
      )
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QuoteRequest[];
  } catch (error) {
    console.error('Error getting quote requests:', error);
    return [];
  }
};

export const markQuoteAsRead = async (id: string) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return;
    }
    const docRef = doc(db, 'submissions', 'quotes', 'requests', id);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    console.error('Error marking quote as read:', error);
    throw error;
  }
};

export const onQuoteRequestsChange = (callback: (data: QuoteRequest[]) => void) => {
  try {
    if (!db) {
      console.info('Firebase not initialized. Demo mode.');
      return () => {};
    }
    return onSnapshot(
      query(
        collection(db, 'submissions', 'quotes', 'requests'),
        orderBy('createdAt', 'desc')
      ),
      (querySnapshot) => {
        const requests = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as QuoteRequest[];
        callback(requests);
      }
    );
  } catch (error) {
    console.error('Error setting up quote requests listener:', error);
    throw error;
  }
};

// Image Upload
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    if (!storage) {
      console.warn('Firebase not initialized. Demo mode.');
      return '/images/demo-placeholder.jpg';
    }
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (imagePath: string) => {
  try {
    if (!storage) {
      console.warn('Firebase not initialized. Demo mode.');
      return;
    }
    const storageRef = ref(storage, imagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// User Management (for customers who sign up)
export const createUserAccount = async (userData: { email: string; name: string; phone?: string; company?: string }) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return 'demo-user-id';
    }
    
    // Store in userAccounts collection for proper user management
    const docRef = await addDoc(collection(db, 'userAccounts'), {
      ...userData,
      role: 'user', // Default role for new accounts
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    // Also maintain backward compatibility by storing in users collection
    await addDoc(collection(db, 'users'), {
      ...userData,
      role: 'user',
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    // Clear user cache to force refresh
    FirebaseCache.clear(CACHE_KEYS.USERS);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating user account:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    if (!db) {
      console.info('Firebase not initialized. Demo mode.');
      // Return demo user for admin credentials
      if (email === 'admin@greenland.com') {
        return {
          id: 'demo-admin-id',
          email: 'admin@greenland.com',
          name: 'Admin User',
          phone: '+231-777-123-456',
          company: 'Green Land Power Inc.',
        };
      }
      return null;
    }
    const querySnapshot = await getDocs(
      query(collection(db, 'users'), where('email', '==', email))
    );
    if (querySnapshot.empty) {
      return null;
    }
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const getUsers = async (useCache = true): Promise<User[]> => {
  try {
    if (!db) {
      console.info('Firebase not initialized. Returning demo users.');
      return [
        {
          uid: 'demo-admin-uid',
          email: 'admin@greenland.com',
          name: 'Admin User',
          role: 'superAdmin',
          isActive: true,
        },
        {
          uid: 'demo-user-uid',
          email: 'user@example.com',
          name: 'Regular User',
          role: 'user',
          isActive: true,
        },
      ];
    }
    
    // Check cache first (only if useCache is true)
    if (useCache) {
      const cached = FirebaseCache.get<User[]>(CACHE_KEYS.USERS);
      if (cached && cached.length > 0) {
        console.info('Using cached users data:', cached.length, 'users');
        return cached;
      }
    }
    
    console.info('Fetching users from Firebase...');
    // Fetch from userAccounts collection for proper user management
    const querySnapshot = await getDocs(collection(db, 'userAccounts'));
    console.info('Firebase users query returned', querySnapshot.docs.length, 'documents');
    
    const users = querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    })) as User[];
    
    console.info('Mapped users:', users.length, 'users');
    
    // Cache the results
    FirebaseCache.set(CACHE_KEYS.USERS, users);
    
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const updateUserRole = async (userId: string, role: UserRole) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return;
    }
    const docRef = doc(db, 'userAccounts', userId);
    await updateDoc(docRef, {
      role,
      updatedAt: Timestamp.now(),
    });
    FirebaseCache.clear(CACHE_KEYS.USERS);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return;
    }
    const docRef = doc(db, 'userAccounts', userId);
    await updateDoc(docRef, {
      isActive,
      updatedAt: Timestamp.now(),
    });
    // Clear cache after update
    FirebaseCache.clear(CACHE_KEYS.USERS);
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return;
    }
    const docRef = doc(db, 'userAccounts', userId);
    await deleteDoc(docRef);
    // Clear cache after deletion
    FirebaseCache.clear(CACHE_KEYS.USERS);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const getUserById = async (userId: string) => {
  try {
    if (!db) {
      console.info('Firebase not initialized. Demo mode.');
      return null;
    }
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

export const updateUserAccount = async (userId: string, userData: Partial<any>) => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...userData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user account:', error);
    throw error;
  }
};
