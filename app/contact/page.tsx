'use client';

import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import ContactForm from '@/components/contact-form';
import QuoteForm from '@/components/quote-form';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone',
      value: '+1 (555) 123-4567',
      href: 'tel:+15551234567',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'info@greenlandpower.com',
      href: 'mailto:info@greenlandpower.com',
    },
    {
      icon: MapPin,
      label: 'Address',
      value: '123 Power Street, Energy City, EC 12345',
      href: '#',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-green-100 text-lg">
            Get in touch with our team for your electrical needs
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <div
                  key={info.label}
                  className="bg-white p-6 rounded-lg shadow-md text-center"
                >
                  <Icon className="w-8 h-8 text-green-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 mb-2">{info.label}</h3>
                  <a
                    href={info.href}
                    className="text-gray-600 hover:text-green-600 transition-colors"
                  >
                    {info.value}
                  </a>
                </div>
              );
            })}
          </div>

          {/* Map Placeholder */}
          <div className="bg-gray-300 h-96 rounded-lg overflow-hidden shadow-lg mb-16">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.1234567!2d-74.0060!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjIiTiA3NMKwMDAnMjEuNiJX!5e0!3m2!1sen!2sus!4v1234567890"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <ContactForm />
            </div>

            {/* Quote Request Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Request a Quote</h2>
              <QuoteForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
