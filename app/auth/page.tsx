'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/useAuth';
import { toast } from 'sonner';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building } from 'lucide-react';

export default function Auth() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
  });

  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!signInData.email || !signInData.password) {
        toast.error('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      await login(signInData.email, signInData.password);

      toast.success('Logged in successfully!');
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!signUpData.name || !signUpData.email || !signUpData.password) {
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      if (signUpData.password !== signUpData.confirmPassword) {
        toast.error('Passwords do not match');
        setIsLoading(false);
        return;
      }

      if (signUpData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }

      await signup(signUpData.name, signUpData.email, signUpData.password);

      toast.success('Account created successfully!');
      router.push('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!forgotPasswordData.email) {
        toast.error('Please enter your email address');
        setIsLoading(false);
        return;
      }

      // In a real app, you would send a password reset email
      toast.success('Password reset instructions have been sent to your email');
      setShowForgotPassword(false);
      setForgotPasswordData({ email: '' });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <div className="flex-1 flex items-center justify-center py-8 sm:py-16 px-4 relative min-h-[calc(100vh-4rem)]"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(5, 150, 105, 0.85) 0%, rgba(0, 0, 0, 0.75) 100%), url(/images/auth/electrical-engineering-auth.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-green-200/20 p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-lg">
                  <span className="text-white font-bold text-lg">🔑</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
              <p className="text-gray-600 mt-2 text-sm">Enter your email to receive reset instructions</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-900 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotPasswordData.email}
                    onChange={(e) => setForgotPasswordData({ email: e.target.value })}
                    placeholder="john@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-green-600 hover:text-green-700 font-bold"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-1 flex items-center justify-center py-8 sm:py-16 px-4 relative min-h-[calc(100vh-4rem)]"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(5, 150, 105, 0.85) 0%, rgba(0, 0, 0, 0.75) 100%), url(/images/auth/electrical-engineering-auth.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-green-200/20 p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-lg">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isSignIn ? 'Welcome Back' : 'Join Our Team'}
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              {isSignIn 
                ? 'Professional electrical solutions at your fingertips' 
                : 'Become part of Liberia&apos;s leading electrical engineering company'
              }
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex mb-6 gap-2 bg-gray-100/80 rounded-lg p-1">
            <button
              onClick={() => setIsSignIn(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                isSignIn
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 bg-transparent'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignIn(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                !isSignIn
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 bg-transparent'
              }`}
            >
              Sign Up
            </button>
          </div>

          {isSignIn ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                    placeholder="John Doe"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-900 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                    placeholder="+231 (777) 000-0000"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-900 mb-1">
                  Company
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={signUpData.company}
                    onChange={(e) => setSignUpData({ ...signUpData, company: e.target.value })}
                    placeholder="Your company name"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          )}

          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex gap-2 items-start">
              <span className="text-lg mt-0.5">⚡</span>
              <p className="text-sm text-gray-700">
                {isSignIn 
                  ? 'Access your account to submit inquiries and track your electrical projects with us.'
                  : 'Join us to submit project requests and connect with professional electrical engineers.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
