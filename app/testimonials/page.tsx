'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { onTestimonialsChange } from '@/lib/firebaseService';
import { Testimonial } from '@/lib/types';
import { Star, Quote, Search, Home } from 'lucide-react';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured'>('all');

  useEffect(() => {
    const unsubscribe = onTestimonialsChange((all) => {
      setTestimonials(all);
      setIsLoading(false);
    });
    return () => unsubscribe?.();
  }, []);

  const filtered = testimonials.filter((t) => {
    const matchesSearch =
      searchQuery === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.company || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFeatured = filterFeatured === 'all' || t.isFeatured;
    return matchesSearch && matchesFeatured;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Page Hero */}
      <section className="bg-slate-900 text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
            <Quote className="w-3 h-3" />
            Client Stories
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6">
            What Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              Clients
            </span>{' '}
            Say
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            Real feedback from businesses and homeowners we&apos;ve powered across Liberia.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap justify-center gap-12 mt-16">
            {[
              { value: `${testimonials.length}+`, label: 'Happy Clients' },
              { value: '5.0', label: 'Avg. Rating' },
              { value: '100%', label: 'Satisfaction Rate' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="bg-gray-50 py-8 border-b border-gray-100 sticky top-16 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, company, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>
          {/* Filter tabs */}
          <div className="flex gap-2 p-1 bg-white border border-gray-200 rounded-xl">
            {(['all', 'featured'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterFeatured(f)}
                className={`px-4 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                  filterFeatured === f
                    ? 'bg-slate-900 text-white shadow'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f === 'featured' ? (
                  <span className="flex items-center gap-1">
                    <Home className="w-3 h-3" /> Homepage Featured
                  </span>
                ) : (
                  'All Testimonials'
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Quote className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">No testimonials found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-8 font-medium">
                Showing {filtered.length} testimonial{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col relative group"
                  >
                    {testimonial.isFeatured && (
                      <div className="absolute -top-2.5 left-6 bg-amber-400 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wide border border-amber-300">
                        <Home className="w-2.5 h-2.5" /> Featured
                      </div>
                    )}

                    <Quote className="w-8 h-8 text-green-500/20 mb-4 group-hover:text-green-500/40 transition-colors" />

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-200 fill-gray-200'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-700 italic leading-relaxed flex-1">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>

                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                      {testimonial.image ? (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-green-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{testimonial.name}</h4>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {testimonial.position}
                          {testimonial.company && (
                            <span className="text-green-600 font-medium"> · {testimonial.company}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
