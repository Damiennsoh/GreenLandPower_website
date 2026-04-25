export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  order: number;
}

export interface HeroSection {
  id?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
  slides?: HeroSlide[];
}

export interface FooterContent {
  id?: string;
  companyName: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  copyrightText: string;
}

export interface Service {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  features?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Portfolio {
  id?: string;
  title: string;
  description: string;
  image: string;
  category: string;
  completionDate?: string;
  client?: string;
  result?: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TeamMember {
  id?: string;
  name: string;
  position: string;
  bio?: string;
  image?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  serviceType?: string;
  createdAt?: Date;
  read: boolean;
}

export interface QuoteRequest {
  id?: string;
  name: string;
  email: string;
  phone: string;
  projectDescription: string;
  projectScope?: string;
  budget?: string;
  timeline?: string;
  createdAt?: Date;
  read: boolean;
}

export interface AdminSettings {
  id?: string;
  heroSection: HeroSection;
  footerContent: FooterContent;
  companyEmail: string;
  companyPhone: string;
  updatedAt?: Date;
}

export type UserRole = 'user' | 'admin' | 'superAdmin';

export interface User {
  id?: string;
  uid: string; // Firebase Auth UID
  email: string;
  name: string;
  phone?: string;
  company?: string;
  role: UserRole;
  profileImage?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserAccount {
  id?: string;
  userId: string;
  email: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
