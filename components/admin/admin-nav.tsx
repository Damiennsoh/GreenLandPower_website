'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Zap,
  FileText,
  Briefcase,
  Images,
  Users,
  Mail,
} from 'lucide-react';

type Tab = 'overview' | 'hero' | 'footer' | 'services' | 'portfolio' | 'team' | 'submissions';

interface AdminNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems = [
  { id: 'overview' as Tab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'hero' as Tab, label: 'Hero Section', icon: Zap },
  { id: 'footer' as Tab, label: 'Footer Content', icon: FileText },
  { id: 'services' as Tab, label: 'Services', icon: Briefcase },
  { id: 'portfolio' as Tab, label: 'Portfolio', icon: Images },
  { id: 'team' as Tab, label: 'Team Members', icon: Users },
  { id: 'submissions' as Tab, label: 'Submissions', icon: Mail },
];

export default function AdminNav({ activeTab, onTabChange }: AdminNavProps) {
  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 flex flex-col">
      {/* Branding */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Admin Console</h2>
            <p className="text-xs text-slate-400">Green Land Power</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-3',
                isActive
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 p-4">
        <div className="bg-slate-700/50 rounded-lg p-3 text-slate-300 text-xs text-center">
          <p className="font-medium">Version 1.0</p>
          <p className="text-slate-400 mt-1">Keep your content fresh</p>
        </div>
      </div>
    </div>
  );
}
