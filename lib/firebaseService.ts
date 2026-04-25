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
  Testimonial,
  ContactInfo,
  ContactSubmission,
  QuoteRequest,
  AdminSettings,
  User,
  UserAccount,
  UserRole,
} from './types';

// Demo Data
const DEMO_SERVICES: Service[] = [
  {
    id: 'demo-1',
    title: 'Residential Electrical Installation',
    description: 'Complete electrical wiring and installation services for homes and apartments.',
    icon: 'Home',
    features: ['New Construction Wiring', 'Electrical Panel Upgrades', 'Lighting Installation'],
  },
  {
    id: 'demo-2',
    title: 'Commercial Electrical Solutions',
    description: 'Comprehensive electrical services for businesses, offices, and commercial buildings.',
    icon: 'Building',
    features: ['Commercial Wiring Systems', 'Emergency Generator Installation', 'Scheduled Maintenance'],
  },
  {
    id: 'demo-3',
    title: 'Solar Power Systems',
    description: 'Solar panel installation and renewable energy solutions for sustainable power generation.',
    icon: 'Sun',
    features: ['Solar Panel Installation', 'Battery Storage Systems', 'Grid-Tie Integration'],
  },
];

const DEMO_PORTFOLIO: Portfolio[] = [
  {
    id: 'demo-1',
    title: 'Monrovia Office Complex',
    description: 'Complete electrical installation for a 5-story commercial office building in downtown Monrovia.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    category: 'Commercial',
    completionDate: '2024-03',
    client: 'Liberia Business Center',
    result: 'Successfully installed 500+ electrical outlets and backup generator system.',
  },
  {
    id: 'demo-2',
    title: 'Sinkor Residential Development',
    description: 'Electrical wiring for 50-unit residential apartment complex in Sinkor.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    category: 'Residential',
    completionDate: '2024-02',
    client: 'Golden Homes Ltd.',
    result: 'Completed full electrical installation including smart home features.',
  },
];

const DEMO_TEAM: TeamMember[] = [
  {
    id: 'demo-1',
    name: 'James K. Wilson',
    position: 'Chief Executive Officer & Founder',
    bio: 'Electrical engineer with 18+ years of experience in power systems and renewable energy.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    email: 'j.wilson@greenlandpower.com.lr',
  },
  {
    id: 'demo-2',
    name: 'Sarah M. Johnson',
    position: 'Operations Manager',
    bio: 'Expertise in project management and electrical operations with 10 years of experience.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    email: 's.johnson@greenlandpower.com.lr',
  },
];

const DEMO_TESTIMONIALS: Testimonial[] = [
  {
    id: 'demo-1',
    name: 'Robert Tweh',
    position: 'Hotel Manager',
    company: 'Ocean View Hotel',
    content: 'Green Land Power provided exceptional service during our full electrical system upgrade. Their team was professional, efficient, and ensured we had minimal downtime.',
    rating: 5,
    isFeatured: true,
  },
  {
    id: 'demo-2',
    name: 'Marie Kollie',
    position: 'Homeowner',
    content: 'The solar installation they did for my home has been a life-changer. Reliable power at last! I highly recommend their renewable energy solutions.',
    rating: 5,
    isFeatured: true,
  },
  {
    id: 'demo-3',
    name: 'John Flomo',
    position: 'Facility Director',
    company: 'Monrovia Shopping Mall',
    content: 'Excellent industrial electrical work. They handled our complex wiring and backup generator systems with great expertise.',
    rating: 5,
    isFeatured: true,
  },
];

const DEMO_ADMIN_SETTINGS: AdminSettings = {
  heroSection: {
    title: "Professional Electrical Solutions Powering Liberia's Future",
    subtitle: "Expert electrical engineering services for residential, commercial, and industrial sectors. Solar power systems, generator installations, and sustainable energy solutions.",
    ctaText: "Get a Free Quote",
    ctaLink: "/contact",
    backgroundImage: "/hero-green-power.jpg"
  },
  footerContent: {
    companyName: "Green Land Power Inc.",
    description: "Liberia's leading electrical engineering firm providing professional solutions for residential and industrial sectors.",
    address: "Monrovia, Liberia",
    phone: "+231 77 000 0000",
    email: "info@greenlandpower.com",
    socialLinks: {
      facebook: "#",
      twitter: "#",
      linkedin: "#",
      instagram: "#",
      whatsapp: "https://wa.me/231770000000"
    },
    copyrightText: "© 2024 Green Land Power Inc. All rights reserved."
  },
  contactInfo: {
    address: "Monrovia, Liberia",
    phone: "+231 77 000 0000",
    whatsapp: "+231 77 000 0000",
    email: "info@greenlandpower.com",
    workingHours: "Mon - Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127111.45892543944!2d-10.8222629393046!3d6.29177114620023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTcnMzAuNCJOIDEwwrA0NycxMi44Ilc!5e0!3m2!1sen!2slr!4v1714000000000!5m2!1sen!2slr"
  },
  companyEmail: "info@greenlandpower.com",
  companyPhone: "+231 77 000 0000"
};

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

export const updateContactInfo = async (contactData: ContactInfo) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return { success: true };
    }
    const adminRef = doc(db, 'admin', 'settings');
    await setDoc(
      adminRef,
      {
        contactInfo: contactData,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating contact info:', error);
    throw error;
  }
};

export const getAdminSettings = async (): Promise<AdminSettings | null> => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return DEMO_ADMIN_SETTINGS;
    }
    const adminRef = doc(db, 'admin', 'settings');
    const docSnap = await getDoc(adminRef);
    if (docSnap.exists()) {
      return docSnap.data() as AdminSettings;
    }
    return DEMO_ADMIN_SETTINGS;
  } catch (error) {
    console.error('Error getting admin settings:', error);
    return DEMO_ADMIN_SETTINGS;
  }
};

export const onAdminSettingsChange = (callback: (data: AdminSettings | null) => void) => {
  try {
    if (!db) {
      console.info('Firebase not initialized. Demo mode.');
      return () => {};
    }
    const adminRef = doc(db, 'admin', 'settings');
    return onSnapshot(adminRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data() as AdminSettings);
        } else {
          callback(DEMO_ADMIN_SETTINGS);
        }
      },
      (error) => {
        console.error('Error in admin settings listener:', error);
        callback(DEMO_ADMIN_SETTINGS);
      }
    );
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
      return DEMO_SERVICES;
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
    return DEMO_SERVICES;
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
      },
      (error) => {
        console.error('Error in services listener:', error);
        callback(DEMO_SERVICES);
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
    
    // Get current count to set default order
    const portfolios = await getPortfolios(false);
    const order = portfolioData.order ?? portfolios.length;

    const docRef = await addDoc(collection(db, 'portfolio'), {
      ...portfolioData,
      order,
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

export const updatePortfolioOrder = async (portfolios: Portfolio[]) => {
  try {
    if (!db) return;
    const batch: any[] = []; // In a real app we'd use a writeBatch
    
    for (let i = 0; i < portfolios.length; i++) {
      const p = portfolios[i];
      if (p.id) {
        const docRef = doc(db, 'portfolio', p.id);
        await updateDoc(docRef, { order: i, updatedAt: Timestamp.now() });
      }
    }
    FirebaseCache.clear(CACHE_KEYS.PORTFOLIO);
  } catch (error) {
    console.error('Error updating portfolio order:', error);
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
      return DEMO_PORTFOLIO;
    }
    const querySnapshot = await getDocs(
      query(collection(db, 'portfolio'), orderBy('order', 'asc'))
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
    return DEMO_PORTFOLIO;
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
      query(collection(db, 'portfolio'), orderBy('order', 'asc')),
      (querySnapshot) => {
        const portfolio = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Portfolio[];
        callback(portfolio);
      },
      (error) => {
        console.error('Error in portfolio listener:', error);
        callback(DEMO_PORTFOLIO);
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
      return DEMO_TEAM;
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
    return DEMO_TEAM;
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
      },
      (error) => {
        console.error('Error in team listener:', error);
        callback(DEMO_TEAM);
      }
    );
  } catch (error) {
    console.error('Error setting up team listener:', error);
    throw error;
  }
};

// Testimonials
export const addTestimonial = async (testimonialData: Testimonial) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return 'demo-testimonial-id';
    }
    const docRef = await addDoc(collection(db, 'testimonials'), {
      ...testimonialData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    FirebaseCache.clear(CACHE_KEYS.TESTIMONIALS);
    return docRef.id;
  } catch (error) {
    console.error('Error adding testimonial:', error);
    throw error;
  }
};

export const updateTestimonial = async (id: string, testimonialData: Partial<Testimonial>) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return;
    }
    const docRef = doc(db, 'testimonials', id);
    await updateDoc(docRef, {
      ...testimonialData,
      updatedAt: Timestamp.now(),
    });
    FirebaseCache.clear(CACHE_KEYS.TESTIMONIALS);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    throw error;
  }
};

export const deleteTestimonial = async (id: string) => {
  try {
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return;
    }
    await deleteDoc(doc(db, 'testimonials', id));
    FirebaseCache.clear(CACHE_KEYS.TESTIMONIALS);
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    throw error;
  }
};

export const getTestimonials = async (useCache = true): Promise<Testimonial[]> => {
  try {
    if (useCache) {
      const cached = FirebaseCache.get<Testimonial[]>(CACHE_KEYS.TESTIMONIALS);
      if (cached) return cached;
    }
    
    if (!db) {
      console.info('Firebase not initialized. Returning demo testimonials.');
      return DEMO_TESTIMONIALS;
    }
    const querySnapshot = await getDocs(
      query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))
    );
    const testimonials = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Testimonial[];
    
    FirebaseCache.set(CACHE_KEYS.TESTIMONIALS, testimonials);
    return testimonials;
  } catch (error) {
    console.error('Error getting testimonials:', error);
    return DEMO_TESTIMONIALS;
  }
};

export const onTestimonialsChange = (callback: (data: Testimonial[]) => void) => {
  try {
    if (!db) {
      console.info('Firebase not initialized. Demo mode.');
      return () => {};
    }
    return onSnapshot(
      query(collection(db, 'testimonials'), orderBy('createdAt', 'desc')),
      (querySnapshot) => {
        const testimonials = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Testimonial[];
        callback(testimonials);
      },
      (error) => {
        console.error('Error in testimonials listener:', error);
        callback(DEMO_TESTIMONIALS);
      }
    );
  } catch (error) {
    console.error('Error setting up testimonials listener:', error);
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
      },
      (error) => {
        console.error('Error in contact submissions listener:', error);
        callback([]);
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
      },
      (error) => {
        console.error('Error in quote requests listener:', error);
        callback([]);
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
    
    // Generate a doc ref so we can embed the uid in the data
    const newDocRef = doc(collection(db, 'users'));
    const uid = newDocRef.id;

    await setDoc(newDocRef, {
      ...userData,
      uid,
      role: 'user',
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    FirebaseCache.clear(CACHE_KEYS.USERS);
    return uid;
  } catch (error) {
    console.error('Error creating user account:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    if (!db) {
      console.info('Firebase not initialized. Demo mode.');
      return null;
    }
    // Query userAccounts (the primary user store) first
    const accountsSnapshot = await getDocs(
      query(collection(db, 'userAccounts'), where('email', '==', email))
    );
    if (!accountsSnapshot.empty) {
      const userDoc = accountsSnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    }
    // Fallback: check legacy users collection
    const usersSnapshot = await getDocs(
      query(collection(db, 'users'), where('email', '==', email))
    );
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const getUsers = async (useCache = true): Promise<User[]> => {
  try {
    if (!db) {
      console.info('Firebase not initialized. Returning demo users.');
      return [
        { uid: 'demo-admin-uid', email: 'admin@greenland.com', name: 'Admin User', role: 'superAdmin', isActive: true },
        { uid: 'demo-user-uid', email: 'user@example.com', name: 'Regular User', role: 'user', isActive: true },
      ];
    }
    
    if (useCache) {
      const cached = FirebaseCache.get<User[]>(CACHE_KEYS.USERS);
      if (cached && cached.length > 0) return cached;
    }
    
    // Single source of truth: the 'users' collection
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = querySnapshot.docs.map((d) => ({
      uid: d.id,
      ...d.data(),
    })) as User[];
    
    FirebaseCache.set(CACHE_KEYS.USERS, users);
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const updateUserRole = async (userId: string, role: UserRole) => {
  try {
    if (!db) { console.warn('Firebase not initialized. Demo mode.'); return; }
    await updateDoc(doc(db, 'users', userId), { role, updatedAt: Timestamp.now() });
    FirebaseCache.clear(CACHE_KEYS.USERS);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  try {
    if (!db) { console.warn('Firebase not initialized. Demo mode.'); return; }
    await updateDoc(doc(db, 'users', userId), { isActive, updatedAt: Timestamp.now() });
    FirebaseCache.clear(CACHE_KEYS.USERS);
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    if (!db) { console.warn('Firebase not initialized. Demo mode.'); return; }
    await deleteDoc(doc(db, 'users', userId));
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
    if (!db) {
      console.warn('Firebase not initialized. Demo mode.');
      return;
    }
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
