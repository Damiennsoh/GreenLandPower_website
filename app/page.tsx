'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import PortfolioImage from '@/components/portfolio-image';
import { Button } from '@/components/ui/button';
import { onAdminSettingsChange, getServices, getPortfolio } from '@/lib/firebaseService';
import { HeroSection, HeroSlide, Service, Portfolio } from '@/lib/types';
import { Zap, Leaf, Shield, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import TestimonialsSection from '@/components/testimonials-section';

const defaultHeroSlides: HeroSlide[] = [
  {
    id: 'default-1',
    title: 'Professional Electrical Solutions Powering Liberia\'s Future',
    subtitle: 'Expert electrical engineering services for residential, commercial, and industrial sectors. Solar power systems, generator installations, and sustainable energy solutions.',
    ctaText: 'Get a Free Quote',
    ctaLink: '/contact',
    backgroundImage: '/images/hero/electrical-engineering-hero.jpg',
    order: 0,
  }
];

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

export default function Home() {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  useEffect(() => {
    // Subscribe to hero section updates
    const unsubscribe = onAdminSettingsChange((settings) => {
      if (settings?.heroSection?.slides && settings.heroSection.slides.length > 0) {
        setHeroSlides(settings.heroSection.slides);
      } else if (settings?.heroSection?.title) {
        // Fallback for legacy single hero data
        setHeroSlides([{
          id: 'legacy',
          title: settings.heroSection.title,
          subtitle: settings.heroSection.subtitle,
          ctaText: settings.heroSection.ctaText,
          ctaLink: settings.heroSection.ctaLink,
          backgroundImage: settings.heroSection.backgroundImage || '',
          order: 0
        }]);
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
          // getPortfolio already returns them sorted by order asc
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

  // Auto-slide effect
  useEffect(() => {
    if (!carouselApi) return;

    const intervalId = setInterval(() => {
      carouselApi.scrollNext();
    }, 6000);

    return () => clearInterval(intervalId);
  }, [carouselApi]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero Carousel Section */}
      <section className="relative w-full h-[calc(100vh-4rem)] mt-16 overflow-hidden">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            loop: true,
            duration: 40,
          }}
          className="w-full h-full"
        >
          <CarouselContent className="h-full ml-0">
            {heroSlides.map((slide) => (
              <CarouselItem key={slide.id} className="relative h-full pl-0">
                <div 
                  className="absolute inset-0 z-0 transition-transform duration-1000 scale-105"
                  style={{
                    backgroundImage: slide.backgroundImage
                      ? `linear-gradient(135deg, rgba(5, 150, 105, 0.7) 0%, rgba(0, 0, 0, 0.6) 100%), url(${slide.backgroundImage})`
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] text-balance drop-shadow-2xl">
                        {slide.title}
                      </h1>
                      <p className="text-lg sm:text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl mx-auto text-pretty drop-shadow-lg leading-relaxed font-medium">
                        {slide.subtitle}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          asChild
                          size="lg"
                          className="bg-white text-green-700 hover:bg-green-50 font-bold shadow-2xl text-lg px-10 py-7 rounded-full transition-all hover:scale-105 active:scale-95"
                        >
                          <Link href={slide.ctaLink}>{slide.ctaText}</Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          size="lg"
                          className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-10 py-7 rounded-full transition-all"
                        >
                          <Link href="/services">Our Services</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {heroSlides.length > 1 && (
            <>
              <div className="hidden md:block">
                <CarouselPrevious className="absolute left-8 top-1/2 -translate-y-1/2 h-14 w-14 border-2 border-white/30 bg-white/10 text-white hover:bg-white hover:text-green-700 transition-all rounded-full shadow-2xl" />
                <CarouselNext className="absolute right-8 top-1/2 -translate-y-1/2 h-14 w-14 border-2 border-white/30 bg-white/10 text-white hover:bg-white hover:text-green-700 transition-all rounded-full shadow-2xl" />
              </div>
              
              {/* Custom Dots */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => carouselApi?.scrollTo(i)}
                    className={`h-2 transition-all rounded-full ${
                      carouselApi?.selectedScrollSnap() === i ? 'w-10 bg-white' : 'w-2 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </Carousel>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Our Professional Services
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto font-medium">
              Comprehensive electrical solutions tailored to power Liberia&apos;s growth
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 font-medium tracking-wide uppercase text-xs">Loading services...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-10">
              {services.slice(0, 3).map((service, idx) => (
                <div
                  key={idx}
                  className="group p-10 bg-white rounded-3xl hover:bg-green-600 transition-all duration-500 border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col h-full"
                >
                  <div className="w-14 h-14 bg-green-50 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mb-8 transition-colors">
                    <Zap className="w-7 h-7 text-green-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-4 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-green-50 mb-8 leading-relaxed transition-colors">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mt-auto">
                    {service.features?.slice(0, 4).map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-sm font-semibold text-gray-700 group-hover:text-white transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 group-hover:bg-white" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <Button
              asChild
              variant="outline"
              className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-bold h-14 px-8 rounded-full transition-all"
            >
              <Link href="/services" className="flex items-center gap-3">
                Explore All Services <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Portfolio Preview - RESPECTS ORDER */}
      <section className="py-24 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-900/20 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight">
                Featured Projects
              </h2>
              <p className="text-gray-400 text-xl font-medium">
                Our latest and most impactful electrical installations across Liberia.
              </p>
            </div>
            <Button
              asChild
              variant="ghost"
              className="text-green-400 hover:text-green-300 hover:bg-white/5 font-bold p-0 text-lg"
            >
              <Link href="/portfolio" className="flex items-center gap-2">
                View Full Portfolio <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>

          {portfolioLoading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Shows TOP 3 based on custom order */}
              {portfolios.slice(0, 3).map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="bg-white/5 rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-green-500/50 transition-all duration-500 group flex flex-col h-full"
                >
                  <div className="relative h-64 overflow-hidden">
                    {portfolio.image && (
                      <PortfolioImage
                        src={portfolio.image}
                        alt={portfolio.title}
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute top-6 left-6">
                      <span className="bg-green-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl">
                        {portfolio.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold mb-4 line-clamp-2 leading-snug group-hover:text-green-400 transition-colors">
                      {portfolio.title}
                    </h3>
                    <p className="text-gray-400 mb-8 line-clamp-3 leading-relaxed">
                      {portfolio.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {portfolio.completionDate || 'Recent'}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-green-600 transition-all duration-500">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <TestimonialsSection />

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <Shield className="w-4 h-4" /> Why Choose Us
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-8 leading-[1.2] tracking-tight">
                Reliable Power for a <span className="text-green-600">Sustainable</span> Future
              </h2>
              <div className="space-y-8">
                {[
                  {
                    icon: Leaf,
                    title: 'Sustainable Solutions',
                    description: 'Committed to eco-friendly electrical practices and renewable energy integration in all our projects.',
                  },
                  {
                    icon: Shield,
                    title: 'Safety First Culture',
                    description: 'Fully licensed professionals adhering to strict international safety standards and Liberian regulations.',
                  },
                  {
                    icon: Zap,
                    title: 'Expert Engineering',
                    description: 'Years of deep technical expertise delivering high-quality electrical services across residential and industrial sectors.',
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex gap-6 items-start">
                      <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-green-200">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed font-medium">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gray-100 overflow-hidden shadow-2xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1621905235292-05749155eddb?w=800&q=80" 
                  alt="Team working" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white">
                    <p className="text-2xl font-bold mb-1">15+ Years</p>
                    <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Experience in Liberia</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-600 rounded-full flex flex-col items-center justify-center text-white shadow-2xl animate-pulse">
                <p className="text-3xl font-black">24/7</p>
                <p className="text-[10px] font-bold uppercase tracking-tighter">Emergency Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-green-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 border-4 border-white rounded-full" />
          <div className="absolute top-0 right-1/4 w-64 h-64 border-4 border-white rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-6xl font-extrabold text-white mb-8 tracking-tight">
            Ready to Power Your Next Project?
          </h2>
          <p className="text-green-50 text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Partner with Liberia&apos;s leading electrical engineering firm. Request your free professional consultation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-green-700 hover:bg-gray-100 font-bold h-16 px-12 text-xl rounded-full shadow-2xl transition-all"
            >
              <Link href="/contact">Request a Free Quote</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold h-16 px-12 text-xl rounded-full transition-all"
            >
              <a href="tel:+231777123456" className="flex items-center gap-3">
                Call Us Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
