'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import ContactForm from '@/components/contact-form';
import QuoteForm from '@/components/quote-form';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { onAdminSettingsChange } from '@/lib/firebaseService';
import { ContactInfo as ContactInfoType } from '@/lib/types';

export default function ContactPage() {
  const [contactData, setContactData] = useState<ContactInfoType | null>(null);

  useEffect(() => {
    const unsubscribe = onAdminSettingsChange((settings) => {
      if (settings?.contactInfo) {
        setContactData(settings.contactInfo);
      }
    });
    return () => unsubscribe?.();
  }, []);

  const contactCards = contactData ? [
    {
      icon: Phone,
      label: 'Phone',
      value: contactData.phone,
      href: `tel:${contactData.phone.replace(/\s+/g, '')}`,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      icon: MessageSquare,
      label: 'WhatsApp',
      value: contactData.whatsapp,
      href: `https://wa.me/${contactData.whatsapp.replace(/[^0-9]/g, '')}`,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      icon: Mail,
      label: 'Email',
      value: contactData.email,
      href: `mailto:${contactData.email}`,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      icon: MapPin,
      label: 'Address',
      value: contactData.address,
      href: '#',
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-24 sm:py-32 mt-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-6xl font-black mb-6 tracking-tight">Get In Touch</h1>
          <p className="text-green-50 max-w-2xl mx-auto text-lg sm:text-xl font-medium opacity-90">
            Whether you need a simple repair or a large-scale industrial installation, 
            our expert team is ready to power your next project.
          </p>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16 -mt-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((info) => {
              const Icon = info.icon;
              return (
                <div
                  key={info.label}
                  className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 text-center hover:scale-105 transition-transform duration-300"
                >
                  <div className={`w-14 h-14 ${info.bg} ${info.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-2">{info.label}</h3>
                  <a
                    href={info.href}
                    target={info.label === 'WhatsApp' ? '_blank' : undefined}
                    rel={info.label === 'WhatsApp' ? 'noopener noreferrer' : undefined}
                    className="text-gray-900 font-bold text-lg hover:text-green-600 transition-colors break-words"
                  >
                    {info.value}
                  </a>
                </div>
              );
            })}
          </div>

          {/* Working Hours & Map Section */}
          <div className="mt-16 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-green-600 rounded-3xl p-10 text-white shadow-xl shadow-green-200/50 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white">
                  <ClockIcon className="w-5 h-5" />
                </span>
                Business Hours
              </h3>
              <div className="space-y-4">
                <p className="text-green-50 text-lg leading-relaxed">
                  {contactData?.workingHours || "Monday - Friday: 8:00 AM - 5:00 PM"}
                </p>
                <div className="pt-6 border-t border-white/20">
                  <p className="text-green-100 text-sm font-medium">
                    Emergency services available 24/7 for contract clients.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 h-[450px]">
              {contactData?.mapEmbedUrl ? (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  src={contactData.mapEmbedUrl}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-400">Map location not set</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-gray-50/50 p-8 sm:p-12 rounded-3xl border border-gray-100">
              <div className="mb-10">
                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Send us a Message</h2>
                <p className="text-gray-500 font-medium">Have a general question? Fill out the form and we&apos;ll get back to you within 24 hours.</p>
              </div>
              <ContactForm />
            </div>

            {/* Quote Request Form */}
            <div className="bg-white p-2 rounded-3xl">
              <div className="mb-10">
                <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Request a Quote</h2>
                <p className="text-gray-500 font-medium">Ready to start a project? Tell us your requirements for a detailed professional estimate.</p>
              </div>
              <QuoteForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ClockIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
