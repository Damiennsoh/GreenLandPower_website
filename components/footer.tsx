'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { onAdminSettingsChange } from '@/lib/firebaseService';
import { FooterContent } from '@/lib/types';

const defaultFooter: FooterContent = {
  companyName: 'Green Land Power Inc.',
  description: 'Leading provider of sustainable electrical solutions for Liberia and West Africa.',
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

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterContent>(defaultFooter);

  useEffect(() => {
    const unsubscribe = onAdminSettingsChange((settings) => {
      if (settings?.footerContent) {
        setFooterData(settings.footerContent);
      }
    });

    return () => unsubscribe?.();
  }, []);

  const socialIcons = [
    { icon: Facebook, url: footerData.socialLinks?.facebook, label: 'Facebook' },
    { icon: Twitter, url: footerData.socialLinks?.twitter, label: 'Twitter' },
    { icon: Linkedin, url: footerData.socialLinks?.linkedin, label: 'LinkedIn' },
    { icon: Instagram, url: footerData.socialLinks?.instagram, label: 'Instagram' },
  ].filter((item) => item.url);

  return (
    <footer className="bg-gray-900 text-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GLP</span>
              </div>
              <h3 className="text-lg font-bold">{footerData.companyName}</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">{footerData.description}</p>
            {socialIcons.length > 0 && (
              <div className="flex gap-3">
                {socialIcons.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="text-gray-400 hover:text-green-500 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-green-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-green-500 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-400 hover:text-green-500 transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-green-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                  Residential Electrical
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                  Commercial Solutions
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                  Renewable Energy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                  Maintenance
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-white mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-400">{footerData.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                <a
                  href={`tel:${footerData.phone}`}
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  {footerData.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-500 flex-shrink-0" />
                <a
                  href={`mailto:${footerData.email}`}
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  {footerData.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>{footerData.copyrightText}</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-green-500 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-green-500 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
