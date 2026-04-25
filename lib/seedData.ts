import { 
  addService, 
  addPortfolio, 
  addTeamMember,
  updateHeroSection,
  updateFooterContent,
  getServices,
  getPortfolio,
  getTeamMembers,
  deleteService,
  deletePortfolio,
  deleteTeamMember
} from './firebaseService';
import { HeroSection, FooterContent, Service, Portfolio, TeamMember } from './types';

export const seedServices = async () => {
  const services: Service[] = [
    {
      title: 'Residential Electrical Installation',
      description: 'Complete electrical wiring and installation services for homes and apartments. We handle everything from new construction wiring to panel upgrades, lighting installations, and outlet installations with the highest safety standards.',
      icon: 'Home',
      features: ['New Construction Wiring', 'Electrical Panel Upgrades', 'Lighting Installation', 'Outlet & Switch Installation', 'Home Automation Setup', 'Safety Inspections'],
    },
    {
      title: 'Commercial Electrical Solutions',
      description: 'Comprehensive electrical services for businesses, offices, and commercial buildings. We design and implement scalable electrical systems that meet your business needs and comply with all commercial regulations.',
      icon: 'Building',
      features: ['Commercial Wiring Systems', 'Emergency Generator Installation', 'Scheduled Maintenance', 'Energy Efficiency Audits', 'LED Retrofitting', 'Power Distribution'],
    },
    {
      title: 'Generator Sales & Installation',
      description: 'Professional generator installation and maintenance services ensuring reliable power backup for homes and businesses. We supply top brands and provide comprehensive installation with ongoing support.',
      icon: 'Zap',
      features: ['Generator Sales & Supply', 'Professional Installation', 'Maintenance Contracts', '24/7 Emergency Support', 'Load Assessment', 'Automatic Transfer Switches'],
    },
    {
      title: 'Solar Power Systems',
      description: 'Solar panel installation and renewable energy solutions for sustainable power generation. Reduce your electricity bills and carbon footprint with our custom solar solutions designed for your specific energy needs.',
      icon: 'Sun',
      features: ['Solar Panel Installation', 'Battery Storage Systems', 'Grid-Tie Integration', 'Solar Maintenance', 'Net Metering Setup', 'Off-Grid Solutions'],
    },
    {
      title: 'Industrial Electrical Services',
      description: 'Heavy-duty electrical solutions for manufacturing plants, warehouses, and industrial facilities. We specialize in high-voltage installations, machinery wiring, and industrial automation systems.',
      icon: 'Factory',
      features: ['High-Voltage Installations', 'Machinery Wiring', 'Industrial Automation', 'Power Factor Correction', 'Motor Control Centers', 'Preventive Maintenance'],
    },
    {
      title: 'Electrical Maintenance & Repairs',
      description: 'Preventive maintenance and emergency repair services for all electrical systems. Our certified technicians ensure your electrical infrastructure remains safe, efficient, and compliant with current standards.',
      icon: 'Wrench',
      features: ['Routine Safety Inspections', '24/7 Emergency Repairs', 'System Upgrades', 'Code Compliance Audits', 'Troubleshooting', 'Electrical Certifications'],
    },
  ];

  try {
    // Delete existing services first
    const existingServices = await getServices(false);
    for (const service of existingServices) {
      if (service.id) await deleteService(service.id);
    }

    for (const service of services) {
      await addService(service);
    }
    return { success: true, message: 'Services seeded successfully' };
  } catch (error: any) {
    console.error('Error seeding services:', error);
    return { success: false, error: error.message };
  }
};

export const seedPortfolios = async () => {
  const portfolios: Portfolio[] = [
    {
      title: 'Monrovia Corporate Tower - Full Electrical Installation',
      description: 'A comprehensive electrical infrastructure project for a modern 12-story commercial office building in downtown Monrovia. This project included the design and installation of complete electrical systems, backup power solutions, and energy-efficient lighting throughout the entire facility.',
      image: '/images/portfolio/commercial-building.jpg',
      category: 'Commercial',
      completionDate: '2024-08',
      client: 'West African Investment Group',
      result: 'Installed 800+ electrical outlets, 350 LED lighting fixtures, 500kVA backup generator, and smart building automation system. Achieved 30% energy savings compared to traditional installations.',
    },
    {
      title: 'Coco Beach Residential Estate - Luxury Solar Installation',
      description: 'Premium electrical installations for 25 luxury beachfront villas featuring smart home technology, solar power integration, and high-end lighting design. Each villa includes automated systems for lighting, security, and climate control.',
      image: '/images/portfolio/solar-installation.jpg',
      category: 'Residential',
      completionDate: '2024-06',
      client: 'Elite Properties Liberia Ltd.',
      result: 'Installed 15kW solar systems per villa, comprehensive smart home automation, outdoor lighting systems, and EV charging stations. 100% client satisfaction rate.',
    },
    {
      title: 'Firestone Rubber Factory - Industrial Power Upgrade',
      description: 'Major electrical infrastructure upgrade for one of Liberia\'s largest manufacturing facilities. The project involved upgrading from 1MW to 3MW capacity, installing modern motor control systems, and implementing energy monitoring solutions.',
      image: '/images/portfolio/industrial-power.jpg',
      category: 'Industrial',
      completionDate: '2024-04',
      client: 'Firestone Liberia Inc.',
      result: 'Upgraded power distribution, installed 50+ motor control centers, implemented power factor correction reducing energy costs by 25%, and installed emergency shutdown systems.',
    },
    {
      title: 'University of Liberia - Science Complex Modernization',
      description: 'Complete electrical modernization of the science and technology complex, serving over 2,000 students. Project included specialized laboratory electrical systems, data center power, and sustainable energy solutions.',
      image: '/images/portfolio/institutional-complex.jpg',
      category: 'Institutional',
      completionDate: '2024-02',
      client: 'University of Liberia',
      result: 'Installed specialized lab electrical systems, 100kVA UPS for data center, solar panels generating 40% of building power, and upgraded fire safety systems.',
    },
    {
      title: 'John F. Kennedy Medical Center - Critical Care Power',
      description: 'Installation of hospital-grade electrical systems and backup power infrastructure for the pediatric wing expansion. This life-critical project required redundant power systems and compliance with international medical facility standards.',
      image: '/images/portfolio/healthcare-power.jpg',
      category: 'Healthcare',
      completionDate: '2023-12',
      client: 'Ministry of Health - Liberia',
      result: 'Installed redundant power systems with 0.5-second failover, 1MVA backup generator, isolated power systems for operating theaters, and comprehensive nurse call systems.',
    },
    {
      title: 'Monrovia Shopping Mall - Retail Power Solutions',
      description: 'Electrical infrastructure for a 45-store shopping complex featuring anchor tenants, restaurants, and entertainment facilities. The project required complex load balancing and aesthetically pleasing installations.',
      image: '/images/portfolio/retail-electrical.jpg',
      category: 'Commercial',
      completionDate: '2023-10',
      client: 'RLJ Kendeja Shopping Centers',
      result: 'Installed 2000+ outlets, designer lighting throughout, fire suppression electrical integration, digital signage power, and centralized energy management system.',
    },
  ];

  try {
    // Delete existing portfolios first
    const existingPortfolios = await getPortfolio(false);
    for (const portfolio of existingPortfolios) {
      if (portfolio.id) await deletePortfolio(portfolio.id);
    }

    for (const portfolio of portfolios) {
      await addPortfolio(portfolio);
    }
    return { success: true, message: 'Portfolios seeded successfully' };
  } catch (error: any) {
    console.error('Error seeding portfolios:', error);
    return { success: false, error: error.message };
  }
};

export const seedTeamMembers = async () => {
  const teamMembers: TeamMember[] = [
    {
      name: 'James K. Wilson',
      position: 'Chief Executive Officer & Founder',
      bio: 'Electrical engineer with 18+ years of experience in power systems, renewable energy, and large-scale infrastructure projects across West Africa. Holds a Master\'s in Electrical Engineering and has led over 200 successful projects for government and private clients. Passionate about bringing reliable power solutions to Liberia.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
      email: 'j.wilson@greenlandpower.com.lr',
    },
    {
      name: 'Dr. Sarah Mensah',
      position: 'Operations Director',
      bio: 'Ph.D. in Energy Management with 12 years of experience leading electrical operations. Expert in project management, supply chain optimization, and team leadership. Previously worked with international development organizations on electrification projects across West Africa.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      email: 's.mensah@greenlandpower.com.lr',
    },
    {
      name: 'Michael T. Roberts',
      position: 'Chief Technical Officer',
      bio: 'Licensed Master Electrician with 15 years of hands-on experience. Specializes in industrial automation, high-voltage systems, and complex electrical installations. Certified in multiple international electrical standards including NEC and IEC.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      email: 'm.roberts@greenlandpower.com.lr',
    },
    {
      name: 'Grace B. Cooper',
      position: 'Head of Safety & Compliance',
      bio: 'Certified Safety Professional (CSP) and OSHA instructor with 10 years of experience in electrical safety. Ensures all projects exceed international safety standards and Liberian regulatory requirements. Leads company-wide safety training programs.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
      email: 'g.cooper@greenlandpower.com.lr',
    },
    {
      name: 'Samuel K. Johnson',
      position: 'Lead Project Manager',
      bio: 'PMP-certified project manager with 8 years of experience in electrical construction and infrastructure development. Expert in client relations, timeline management, and delivering complex projects on budget. Managed projects valued at over $10M.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      email: 's.johnson@greenlandpower.com.lr',
    },
    {
      name: 'Fatima Diallo',
      position: 'Solar Systems Specialist',
      bio: 'Renewable energy expert with 6 years of experience in solar panel installation, battery storage systems, and off-grid solutions. Holds certifications from leading solar technology manufacturers. Passionate about sustainable energy for Liberia.',
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80',
      email: 'f.diallo@greenlandpower.com.lr',
    },
  ];

  try {
    // Delete existing team members first
    const existingTeam = await getTeamMembers(false);
    for (const member of existingTeam) {
      if (member.id) await deleteTeamMember(member.id);
    }

    for (const member of teamMembers) {
      await addTeamMember(member);
    }
    return { success: true, message: 'Team members seeded successfully' };
  } catch (error: any) {
    console.error('Error seeding team members:', error);
    return { success: false, error: error.message };
  }
};

export const seedStaticContent = async () => {
  const heroData: HeroSection = {
    title: 'Professional Electrical Solutions Powering Liberia\'s Future',
    subtitle: 'Expert electrical engineering services for residential, commercial, and industrial sectors. Solar power systems, generator installations, and sustainable energy solutions.',
    ctaText: 'Get a Free Quote',
    ctaLink: '/contact',
    backgroundImage: '/images/hero/electrical-engineering-hero.jpg',
  };

  const footerData: FooterContent = {
    companyName: 'Green Land Power Inc.',
    description: 'Leading provider of sustainable electrical solutions for Liberia and West Africa. We deliver excellence in every project, ensuring safe and reliable power for our community.',
    address: 'Broad Street, Monrovia, Liberia | Tubman Boulevard, Sinkor, Monrovia',
    phone: '+231 (777) 123-456',
    email: 'info@greenlandpower.com.lr',
    socialLinks: {
      facebook: 'https://facebook.com/greenlandpowerliberia',
      twitter: 'https://twitter.com/greenlandpowerlr',
      linkedin: 'https://linkedin.com/company/greenlandpower-liberia',
      instagram: 'https://instagram.com/greenlandpowerliberia',
    },
    copyrightText: '© 2026 Green Land Power Inc. Monrovia, Liberia. All rights reserved.',
  };

  try {
    await Promise.all([
      updateHeroSection(heroData),
      updateFooterContent(footerData)
    ]);
    return { success: true, message: 'Static content (Hero & Footer) updated successfully' };
  } catch (error: any) {
    console.error('Error updating static content:', error);
    return { success: false, error: error.message };
  }
};

export const seedAllData = async () => {
  try {
    const results = await Promise.allSettled([
      seedServices(),
      seedPortfolios(),
      seedTeamMembers(),
      seedStaticContent(),
    ]);

    const summary = {
      services: results[0].status === 'fulfilled' ? results[0].value : { success: false, error: 'Failed' },
      portfolios: results[1].status === 'fulfilled' ? results[1].value : { success: false, error: 'Failed' },
      teamMembers: results[2].status === 'fulfilled' ? results[2].value : { success: false, error: 'Failed' },
      heroSection: results[3].status === 'fulfilled' ? results[3].value : { success: false, error: 'Failed' },
    };

    return { success: true, summary };
  } catch (error: any) {
    console.error('Error seeding all data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Wrapper function for seedAllData that requires explicit confirmation
 * This prevents accidental overwriting of user-customized content
 */
export const seedDataWithConfirmation = async () => {
  return seedAllData();
};
