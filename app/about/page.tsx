'use client';

import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Award, Users, Zap, Leaf } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-green-100 text-lg">
            Leading the way in sustainable electrical solutions
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Green Land Power Inc. was founded with a vision to transform the electrical industry
                through sustainable practices and innovative solutions. With over two decades of
                experience, we&apos;ve become a trusted partner for residential and commercial
                electrical projects.
              </p>
              <p className="text-gray-600 mb-4">
                Our commitment to excellence, safety, and environmental responsibility has earned us
                the trust of hundreds of satisfied clients across the region.
              </p>
              <p className="text-gray-600">
                We believe in powering a sustainable future, one project at a time.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-lg h-80"></div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: 'Excellence',
                description:
                  'We maintain the highest standards in every project and service we deliver.',
              },
              {
                icon: Users,
                title: 'Integrity',
                description:
                  'Honest communication and transparent practices in all our dealings.',
              },
              {
                icon: Leaf,
                title: 'Sustainability',
                description:
                  'Committed to eco-friendly solutions and renewable energy integration.',
              },
              {
                icon: Zap,
                title: 'Innovation',
                description:
                  'Staying ahead with cutting-edge technology and best practices.',
              },
            ].map((value, idx) => {
              const Icon = value.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-lg shadow-md text-center">
                  <Icon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '500+', label: 'Projects Completed' },
              { number: '20+', label: 'Years Experience' },
              { number: '1000+', label: 'Happy Clients' },
              { number: '24/7', label: 'Support Available' },
            ].map((stat, idx) => (
              <div key={idx}>
                <p className="text-4xl font-bold text-green-600 mb-2">{stat.number}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Let&apos;s Work Together
          </h2>
          <p className="text-green-100 text-lg mb-8">
            Experience the Green Land Power Inc. difference in your next electrical project.
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-green-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Contact Us Now
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
