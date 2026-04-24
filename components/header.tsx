'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/useAuth';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout, mounted, isAdmin } = useAuth();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'About', href: '/about' },
    { label: 'Team', href: '/team' },
    { label: 'Contact', href: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <nav className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GLP</span>
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">
              Green Land Power
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {mounted && isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                >
                  <Link href="/profile">My Profile</Link>
                </Button>
                {isAdmin && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                  >
                    <Link href="/admin/dashboard">Admin Dashboard</Link>
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : mounted ? (
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Link href="/auth">Sign In</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Link href="/auth">Sign In</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-50 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {mounted && isAuthenticated ? (
                <>
                  <div className="px-3 py-2">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full mb-2"
                    >
                      <Link href="/profile">My Profile</Link>
                    </Button>
                    {isAdmin && (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full mb-2 bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                      >
                        <Link href="/admin/dashboard">Admin Dashboard</Link>
                      </Button>
                    )}
                    <Button
                      onClick={handleLogout}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-600"
                      variant="outline"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : mounted ? (
                <div className="px-3 py-2 space-y-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <Link href="/auth">Sign In</Link>
                  </Button>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <Link href="/auth">Sign In</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
