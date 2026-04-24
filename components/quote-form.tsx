'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { addQuoteRequest } from '@/lib/firebaseService';
import { toast } from 'sonner';

const quoteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  projectDescription: z.string().min(20, 'Please provide more details'),
  projectScope: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

export default function QuoteForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
  });

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    try {
      await addQuoteRequest({
        name: data.name,
        email: data.email,
        phone: data.phone,
        projectDescription: data.projectDescription,
        projectScope: data.projectScope,
        budget: data.budget,
        timeline: data.timeline,
        read: false,
      });
      toast.success('Quote request submitted! We will contact you shortly.');
      reset();
    } catch (error) {
      toast.error('Failed to submit quote request. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="quote-name" className="block text-sm font-medium text-gray-900 mb-1">
          Full Name
        </label>
        <Input
          id="quote-name"
          type="text"
          placeholder="John Doe"
          {...register('name')}
          className="w-full"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="quote-email" className="block text-sm font-medium text-gray-900 mb-1">
          Email Address
        </label>
        <Input
          id="quote-email"
          type="email"
          placeholder="john@example.com"
          {...register('email')}
          className="w-full"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="quote-phone" className="block text-sm font-medium text-gray-900 mb-1">
          Phone Number
        </label>
        <Input
          id="quote-phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          {...register('phone')}
          className="w-full"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="scope" className="block text-sm font-medium text-gray-900 mb-1">
          Project Scope
        </label>
        <select
          id="scope"
          {...register('projectScope')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Select scope...</option>
          <option value="small">Small Project</option>
          <option value="medium">Medium Project</option>
          <option value="large">Large Project</option>
          <option value="unsure">Not Sure</option>
        </select>
      </div>

      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-900 mb-1">
          Budget Range (Optional)
        </label>
        <select
          id="budget"
          {...register('budget')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Select range...</option>
          <option value="under-5k">Under $5,000</option>
          <option value="5k-10k">$5,000 - $10,000</option>
          <option value="10k-25k">$10,000 - $25,000</option>
          <option value="25k-50k">$25,000 - $50,000</option>
          <option value="above-50k">Above $50,000</option>
        </select>
      </div>

      <div>
        <label htmlFor="timeline" className="block text-sm font-medium text-gray-900 mb-1">
          Timeline (Optional)
        </label>
        <select
          id="timeline"
          {...register('timeline')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Select timeline...</option>
          <option value="immediate">Immediate</option>
          <option value="1-month">Within 1 Month</option>
          <option value="3-months">Within 3 Months</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>

      <div>
        <label htmlFor="project-description" className="block text-sm font-medium text-gray-900 mb-1">
          Project Description
        </label>
        <Textarea
          id="project-description"
          placeholder="Describe your project, requirements, and any specific concerns..."
          {...register('projectDescription')}
          className="w-full min-h-32"
        />
        {errors.projectDescription && (
          <p className="text-red-500 text-sm mt-1">{errors.projectDescription.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
      >
        {isSubmitting ? 'Submitting...' : 'Get Quote'}
      </Button>
    </form>
  );
}
