'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { onAdminSettingsChange, getServices, getPortfolio } from '@/lib/firebaseService';
import { HeroSection, Service, Portfolio } from '@/lib/types';
import { Zap, Leaf, Shield, ArrowRight } from 'lucide-react';

const defaultHero: HeroSection = {
  title: 'Professional Electrical Solutions for Liberia',
  subtitle: 'Residential, Commercial & Industrial Electrical Services | Generator Installation & Solar Power Systems',
  ctaText: 'Get a Free Quote',
  ctaLink: '/contact',
  backgroundImage: '/images/hero/electrical-engineering-hero.jpg',
};

const defaultServices: Service[] = [
  {
    title: 'Residential Electrical',
    description: 'Complete electrical wiring and installation services for homes and apartments in Liberia.',
    features: ['New Construction Wiring', 'Electrical Panel Upgrades', 'Lighting Installation', 'Generator Installation'],
  },
  {
    title: 'Commercial Solutions',
    description: 'Comprehensive electrical services for businesses, offices, and commercial buildings.',
    features: ['Commercial Wiring', 'Generator Installation', 'Electrical Maintenance', 'Energy Audits'],
  },
  {
    title: 'Generator & Solar Power',
    description: 'Professional generator installation and solar power systems for reliable energy solutions.',
    features: ['Generator Sales & Installation', 'Solar Panel Installation', 'Battery Storage', '24/7 Support'],
  },
];

const defaultPortfolios: Portfolio[] = [
  {
    title: 'Monrovia Corporate Tower',
    description: 'Complete electrical installation for 15-story commercial building with backup generators.',
    category: 'Commercial',
    client: 'Monrovia Development Corp',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  },
  {
    title: 'Solar Farm Installation',
    description: '500kW solar power system for agricultural processing facility.',
    category: 'Solar',
    client: 'Liberia AgriTech',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
  },
  {
    title: 'Hospital Power Upgrade',
    description: 'Emergency electrical upgrade with backup systems for regional hospital.',
    category: 'Healthcare',
    client: 'JFK Medical Center',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&q=80',
  },
];

export default function Home() {
  const [heroData, setHeroData] = useState<HeroSection>(defaultHero);
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [portfolios, setPortfolios] = useState<Portfolio[]>(defaultPortfolios);
  const [loading, setLoading] = useState(true);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  useEffect(() => {
    // Subscribe to hero section updates
    const unsubscribe = onAdminSettingsChange((settings) => {
      if (settings?.heroSection) {
        setHeroData(settings.heroSection);
      }
    });

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    // Fetch services on mount
    const fetchServices = async () => {
      try {
        const fetchedServices = await getServices();
        if (fetchedServices.length > 0) {
          setServices(fetchedServices);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    // Fetch portfolios on mount
    const fetchPortfolios = async () => {
      try {
        const fetchedPortfolios = await getPortfolio();
        if (fetchedPortfolios.length > 0) {
          setPortfolios(fetchedPortfolios);
        }
        setPortfolioLoading(false);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
        setPortfolioLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 pt-16"
        style={{
          backgroundImage: heroData.backgroundImage
            ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroData.backgroundImage})`
            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {heroData.title}
          </h1>
          <p className="text-lg sm:text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            {heroData.subtitle}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100 font-bold"
          >
            <Link href={heroData.ctaLink}>{heroData.ctaText}</Link>
          </Button>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 text-lg">
              Comprehensive electrical solutions tailored to your needs
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading services...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {services.slice(0, 3).map((service) => (
                <div
                  key={service.id}
                  className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  {service.features && service.features.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {service.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-700">
                          <Zap className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Link href="/services" className="flex items-center gap-2">
                View All Services <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Portfolio
            </h2>
            <p className="text-gray-600 text-lg">
              Showcasing our completed projects and successful installations
            </p>
          </div>

          {portfolioLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading portfolio...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {portfolios.slice(0, 3).map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {portfolio.image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={portfolio.image}
                        alt={portfolio.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{portfolio.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{portfolio.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded">
                        {portfolio.category}
                      </span>
                      {portfolio.client && (
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded">
                          {portfolio.client}
                        </span>
                      )}
                    </div>

                    {portfolio.result && (
                      <p className="text-green-600 text-sm font-medium">
                        <strong>Result:</strong> {portfolio.result}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              asChild
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Link href="/portfolio" className="flex items-center gap-2">
                View All Projects <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Green Land Power
            </h2>
            <p className="text-gray-600 text-lg">
              Excellence in service, dedication to sustainability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: 'Sustainable Solutions',
                description:
                  'Committed to eco-friendly electrical practices and renewable energy integration.',
              },
              {
                icon: Shield,
                title: 'Certified & Insured',
                description:
                  'Fully licensed professionals with comprehensive insurance coverage for peace of mind.',
              },
              {
                icon: Zap,
                title: 'Expert Team',
                description:
                  'Years of experience delivering high-quality electrical services across all sectors.',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <Icon className="w-12 h-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Contact us today for a free consultation and let&apos;s discuss your electrical needs.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100 font-bold"
          >
            <Link href="/contact">Request a Quote</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
