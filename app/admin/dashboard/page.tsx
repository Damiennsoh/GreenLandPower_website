'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AdminNav from '@/components/admin/admin-nav';
import AdminHeroEditor from '@/components/admin/admin-hero-editor';
import AdminFooterEditor from '@/components/admin/admin-footer-editor';
import AdminServicesEditor from '@/components/admin/admin-services-editor';
import AdminPortfolioEditor from '@/components/admin/admin-portfolio-editor';
import AdminTeamEditor from '@/components/admin/admin-team-editor';
import AdminSubmissionsViewer from '@/components/admin/admin-submissions-viewer';
import { ConfirmSeedOverwriteDialog } from '@/components/admin/confirm-seed-overwrite-dialog';
import {
  LogOut,
  MessageSquare,
  Image,
  Users,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { getContactSubmissions, getPortfolios, getTeamMembers, getUsers } from '@/lib/firebaseService';
import { useAuth } from '@/lib/useAuth';
import { seedAllData } from '@/lib/seedData';
import { toast } from 'sonner';
import AdminUsersEditor from '@/components/admin/admin-users-editor';

type Tab = 'overview' | 'hero' | 'footer' | 'services' | 'portfolio' | 'team' | 'users' | 'submissions';

export default function AdminDashboard() {
  const router = useRouter();
  const { user: authUser, loading: authLoading, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mounted, setMounted] = useState(false);
  const [showSeedConfirmation, setShowSeedConfirmation] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [stats, setStats] = useState({
    contactMessages: 0,
    portfolioItems: 0,
    teamMembers: 0,
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!authLoading) {
      if (!authUser || !isAdmin) {
        router.push('/auth');
      }
    }
  }, [authUser, authLoading, isAdmin, router, mounted]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [contacts, portfolios, team, users] = await Promise.all([
          getContactSubmissions(),
          getPortfolios(),
          getTeamMembers(),
          getUsers(false), // Force refresh to get latest user count
        ]);
        console.log('Dashboard stats fetched - Users:', users.length, users);
        setStats({
          contactMessages: contacts.length,
          portfolioItems: portfolios.length,
          teamMembers: team.length,
          totalUsers: users.length,
          activeUsers: users.filter(u => u.isActive).length,
          adminUsers: users.filter(u => u.role === 'admin' || u.role === 'superAdmin').length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (authUser && isAdmin) {
      fetchStats();
    }
  }, [authUser, isAdmin]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

const handleSeedData = () => {
    setShowSeedConfirmation(true);
  };

  const handleConfirmSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedAllData();
      if (result.success) {
        toast.success('Sample data seeded successfully!');
        // Refresh stats
        const [contacts, portfolios, team, users] = await Promise.all([
          getContactSubmissions(),
          getPortfolios(),
          getTeamMembers(),
          getUsers(false), // Force refresh without cache
        ]);
        setStats({
          contactMessages: contacts.length,
          portfolioItems: portfolios.length,
          teamMembers: team.length,
          totalUsers: users.length,
          activeUsers: users.filter(u => u.isActive).length,
          adminUsers: users.filter(u => u.role === 'admin' || u.role === 'superAdmin').length,
        });
      } else {
        toast.error('Failed to seed data: ' + result.error);
      }
    } catch (error: any) {
      toast.error('Error seeding data: ' + error.message);
    } finally {
      setIsSeeding(false);
      setShowSeedConfirmation(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen flex-col lg:flex-row">
        {/* Sidebar */}
        <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <a
                href="/"
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                View Site
              </a>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-16 lg:pt-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Welcome Section */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {authUser?.name || authUser?.email?.split('@')[0]} 👋
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Here&apos;s what&apos;s happening on Green Land Power Inc. today.
                  </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 uppercase">New Messages</span>
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.contactMessages}</p>
                    <button
                      onClick={() => setActiveTab('submissions')}
                      className="mt-3 sm:mt-4 text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                    >
                      View details <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
                    </button>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-10 sm:w-12 h-10 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Image className="w-5 sm:w-6 h-5 sm:h-6 text-yellow-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 uppercase">Portfolio Items</span>
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.portfolioItems}</p>
                    <button
                      onClick={() => setActiveTab('portfolio')}
                      className="mt-3 sm:mt-4 text-xs sm:text-sm text-yellow-600 hover:text-yellow-700 flex items-center gap-1 font-medium"
                    >
                      View details <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
                    </button>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 sm:w-6 h-5 sm:h-6 text-green-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 uppercase">Team Members</span>
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.teamMembers}</p>
                    <button
                      onClick={() => setActiveTab('team')}
                      className="mt-3 sm:mt-4 text-xs sm:text-sm text-green-600 hover:text-green-700 flex items-center gap-1 font-medium"
                    >
                      View details <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
                    </button>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-10 sm:w-12 h-10 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 uppercase">Registered Users</span>
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.totalUsers}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {stats.activeUsers} active • {stats.adminUsers} admins
                    </div>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="mt-2 text-xs sm:text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium"
                    >
                      Manage users <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Quick Links</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
                    Frequently accessed administrative actions.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <button
                      onClick={() => setActiveTab('hero')}
                      className="group p-4 sm:p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left"
                    >
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-green-700 mb-2">
                        Update Hero Section
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 group-hover:text-green-600">
                        Change headlines and main CTA links
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab('portfolio')}
                      className="group p-4 sm:p-6 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors text-left"
                    >
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-yellow-700 mb-2">
                        Add Portfolio Item
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 group-hover:text-yellow-600">
                        Showcase new project screenshots
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab('submissions')}
                      className="group p-4 sm:p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                    >
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-blue-700 mb-2">
                        View Message Requests
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 group-hover:text-blue-600">
                        Follow up on business inquiries
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab('team')}
                      className="group p-4 sm:p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                    >
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-purple-700 mb-2">
                        Manage Team Members
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 group-hover:text-purple-600">
                        Update team profiles and bios
                      </p>
                    </button>

                    <button
                      onClick={handleSeedData}
                      disabled={false}
                      className="group p-4 sm:p-6 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-red-700 mb-2">
                        Seed Sample Data
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 group-hover:text-red-600">
                        Populate site with sample content
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab('services')}
                      className="group p-4 sm:p-6 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-indigo-700 mb-2">
                        Manage Services
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 group-hover:text-indigo-600">
                        Update service offerings
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hero' && <AdminHeroEditor />}
            {activeTab === 'footer' && <AdminFooterEditor />}
            {activeTab === 'services' && <AdminServicesEditor />}
            {activeTab === 'portfolio' && <AdminPortfolioEditor />}
            {activeTab === 'team' && <AdminTeamEditor />}
            {activeTab === 'users' && <AdminUsersEditor />}
            {activeTab === 'submissions' && <AdminSubmissionsViewer />}
          </div>
        </div>
      </div>

      {/* Seed Data Confirmation Dialog */}
      <ConfirmSeedOverwriteDialog
        isOpen={showSeedConfirmation}
        isLoading={isSeeding}
        onConfirm={handleConfirmSeed}
        onCancel={() => setShowSeedConfirmation(false)}
      />
    </div>
  );
}
