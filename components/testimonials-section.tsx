'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { onTestimonialsChange } from '@/lib/firebaseService';
import { Testimonial } from '@/lib/types';
import { Star, Quote, ArrowRight } from 'lucide-react';

export default function TestimonialsSection() {
  const [featured, setFeatured] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onTestimonialsChange((all) => {
      const featuredOnes = all.filter((t) => t.isFeatured).slice(0, 3);
      setFeatured(featuredOnes);
      setIsLoading(false);
    });
    return () => unsubscribe?.();
  }, []);

  if (isLoading) {
    return (
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featured.length === 0) return null;

  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <Quote className="w-3 h-3" />
            Client Testimonials
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            What Our Clients Say
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Trusted by homeowners, businesses, and institutions across Liberia
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {featured.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-8 flex flex-col hover:border-green-500/40 hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Large quote mark */}
              <Quote className="w-10 h-10 text-green-500/20 mb-4 group-hover:text-green-500/40 transition-colors" />

              {/* Star rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-slate-300 leading-relaxed flex-1 italic text-base">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-700/50">
                {testimonial.image ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-500/30"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-white font-bold text-sm">{testimonial.name}</h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {testimonial.position}
                    {testimonial.company && (
                      <span className="text-green-400"> · {testimonial.company}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-bold transition-colors group"
          >
            View All Testimonials
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
