'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { getPortfolio } from '@/lib/firebaseService';
import { Portfolio } from '@/lib/types';

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const fetchedPortfolios = await getPortfolio();
        setPortfolios(fetchedPortfolios);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const categories = Array.from(new Set(portfolios.map((p) => p.category)));
  const filteredPortfolios = selectedCategory
    ? portfolios.filter((p) => p.category === selectedCategory)
    : portfolios;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12 sm:py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-balance">Our Portfolio</h1>
          <p className="text-green-100 text-base sm:text-lg">
            Showcase of completed projects and successful installations
          </p>
        </div>
      </section>

      {/* Filter and Portfolio Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          {!loading && categories.length > 0 && (
            <div className="mb-8 sm:mb-12">
              <h3 className="text-lg font-bold text-gray-900 mb-3 sm:mb-4">Filter by Category</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200 hover:border-green-600'
                  }`}
                >
                  All Projects
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200 hover:border-green-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading portfolio...</p>
            </div>
          ) : filteredPortfolios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPortfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group h-full flex flex-col"
                >
                  {portfolio.image && (
                    <div className="h-40 sm:h-48 overflow-hidden">
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

                    {portfolio.completionDate && (
                      <p className="text-gray-600 text-sm mb-2">
                        <strong>Completed:</strong> {portfolio.completionDate}
                      </p>
                    )}

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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 text-balance">
            Ready for Your Next Project?
          </h2>
          <p className="text-green-100 text-base sm:text-lg mb-6 sm:mb-8">
            Let&apos;s discuss how we can help bring your electrical vision to life.
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-green-600 font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            Start Your Project
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
