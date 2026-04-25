'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmSeedOverwriteDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmSeedOverwriteDialog({
  isOpen,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmSeedOverwriteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Fixed Header */}
        <AlertDialogHeader className="p-6 pb-2 shrink-0">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl font-bold text-red-600">
                CRITICAL WARNING: Overwrite All Custom Data?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm mt-1 font-medium text-gray-500">
                This action is destructive and irreversible.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-900">
              This action will PERMANENTLY REPLACE your customized website content with default sample data. This includes:
            </p>

            <div className="bg-red-50 border-2 border-red-100 rounded-xl p-4">
              <ul className="text-xs text-gray-800 space-y-3 font-bold">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0" />
                  <span>ALL SERVICES: Custom descriptions and features will be DELETED.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0" />
                  <span>ALL PORTFOLIO ITEMS: Project history and images will be DELETED.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0" />
                  <span>HERO SECTION: Headlines and call-to-action links will be OVERWRITTEN.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0" />
                  <span>FOOTER CONTENT: Contact info and address will be OVERWRITTEN.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0" />
                  <span>TEAM PROFILES: Member list will be REPLACED with mock profiles.</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-900 font-bold leading-relaxed">
                STOP AND READ: This will destroy all customized data you have saved. Only proceed if you want to reset the website to its original demo state.
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <AlertDialogFooter className="p-6 pt-4 border-t border-gray-100 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <AlertDialogCancel disabled={isLoading} className="sm:flex-1">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              disabled={isLoading}
              className="sm:flex-[2] bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              {isLoading ? 'Seeding Data...' : 'Yes, Overwrite Everything'}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
