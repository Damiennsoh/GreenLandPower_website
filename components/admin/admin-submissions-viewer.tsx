'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getContactSubmissions,
  getQuoteRequests,
  markContactAsRead,
  markQuoteAsRead,
  onContactSubmissionsChange,
  onQuoteRequestsChange,
} from '@/lib/firebaseService';
import { ContactSubmission, QuoteRequest } from '@/lib/types';
import { Mail, MessageSquare } from 'lucide-react';

export default function AdminSubmissionsViewer() {
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeContact = onContactSubmissionsChange((data) => {
      setContactSubmissions(data);
    });

    const unsubscribeQuote = onQuoteRequestsChange((data) => {
      setQuoteRequests(data);
      setIsLoading(false);
    });

    return () => {
      unsubscribeContact?.();
      unsubscribeQuote?.();
    };
  }, []);

  const handleMarkContactRead = async (id: string) => {
    try {
      await markContactAsRead(id);
    } catch (error) {
      console.error('Error marking contact as read:', error);
    }
  };

  const handleMarkQuoteRead = async (id: string) => {
    try {
      await markQuoteAsRead(id);
    } catch (error) {
      console.error('Error marking quote as read:', error);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="w-full border-b rounded-none">
          <TabsTrigger value="contact" className="flex-1">
            <Mail className="w-4 h-4 mr-2" />
            Contact Messages ({contactSubmissions.filter((c) => !c.read).length})
          </TabsTrigger>
          <TabsTrigger value="quotes" className="flex-1">
            <MessageSquare className="w-4 h-4 mr-2" />
            Quote Requests ({quoteRequests.filter((q) => !q.read).length})
          </TabsTrigger>
        </TabsList>

        {/* Contact Submissions Tab */}
        <TabsContent value="contact" className="p-8">
          {contactSubmissions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No contact submissions yet</p>
          ) : (
            <div className="space-y-4">
              {contactSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className={`p-4 border rounded-lg ${
                    submission.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{submission.name}</h3>
                      <p className="text-sm text-gray-600">{submission.email}</p>
                      <p className="text-sm text-gray-600">{submission.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{formatDate(submission.createdAt)}</p>
                      <button
                        onClick={() => handleMarkContactRead(submission.id!)}
                        className={`text-xs mt-2 px-2 py-1 rounded ${
                          submission.read
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-green-200 text-green-700 hover:bg-green-300'
                        }`}
                      >
                        {submission.read ? 'Read' : 'Mark as Read'}
                      </button>
                    </div>
                  </div>

                  {submission.serviceType && (
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Service:</strong> {submission.serviceType}
                    </p>
                  )}

                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {submission.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Quote Requests Tab */}
        <TabsContent value="quotes" className="p-8">
          {quoteRequests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No quote requests yet</p>
          ) : (
            <div className="space-y-4">
              {quoteRequests.map((request) => (
                <div
                  key={request.id}
                  className={`p-4 border rounded-lg ${
                    request.read ? 'bg-gray-50 border-gray-200' : 'bg-purple-50 border-purple-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{request.name}</h3>
                      <p className="text-sm text-gray-600">{request.email}</p>
                      <p className="text-sm text-gray-600">{request.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                      <button
                        onClick={() => handleMarkQuoteRead(request.id!)}
                        className={`text-xs mt-2 px-2 py-1 rounded ${
                          request.read
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-green-200 text-green-700 hover:bg-green-300'
                        }`}
                      >
                        {request.read ? 'Read' : 'Mark as Read'}
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-3 text-sm">
                    {request.projectScope && (
                      <p>
                        <strong>Scope:</strong> {request.projectScope}
                      </p>
                    )}
                    {request.budget && (
                      <p>
                        <strong>Budget:</strong> {request.budget}
                      </p>
                    )}
                    {request.timeline && (
                      <p>
                        <strong>Timeline:</strong> {request.timeline}
                      </p>
                    )}
                  </div>

                  <div className="bg-white p-3 rounded border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Project Description:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {request.projectDescription}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
