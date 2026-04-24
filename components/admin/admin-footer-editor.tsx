'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getAdminSettings, updateFooterContent } from '@/lib/firebaseService';
import { toast } from 'sonner';

const footerSchema = z.object({
  companyName: z.string().min(3, 'Company name is required'),
  description: z.string().min(10, 'Description is required'),
  address: z.string().min(10, 'Address is required'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email('Valid email required'),
  copyrightText: z.string().min(10, 'Copyright text is required'),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
});

type FooterFormData = z.infer<typeof footerSchema>;

export default function AdminFooterEditor() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FooterFormData>({
    resolver: zodResolver(footerSchema),
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getAdminSettings();
        if (settings?.footerContent) {
          const { footerContent } = settings;
          reset({
            companyName: footerContent.companyName,
            description: footerContent.description,
            address: footerContent.address,
            phone: footerContent.phone,
            email: footerContent.email,
            copyrightText: footerContent.copyrightText,
            facebookUrl: footerContent.socialLinks?.facebook || '',
            twitterUrl: footerContent.socialLinks?.twitter || '',
            linkedinUrl: footerContent.socialLinks?.linkedin || '',
            instagramUrl: footerContent.socialLinks?.instagram || '',
          });
        }
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to load settings');
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: FooterFormData) => {
    setIsSaving(true);
    try {
      await updateFooterContent({
        companyName: data.companyName,
        description: data.description,
        address: data.address,
        phone: data.phone,
        email: data.email,
        copyrightText: data.copyrightText,
        socialLinks: {
          facebook: data.facebookUrl || undefined,
          twitter: data.twitterUrl || undefined,
          linkedin: data.linkedinUrl || undefined,
          instagram: data.instagramUrl || undefined,
        },
      });
      toast.success('Footer content updated successfully!');
    } catch (error) {
      toast.error('Failed to update footer content');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Footer Content</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-900 mb-1">
            Company Name
          </label>
          <Input
            id="companyName"
            type="text"
            {...register('companyName')}
            className="w-full"
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
            Description
          </label>
          <Textarea
            id="description"
            {...register('description')}
            className="w-full"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-1">
            Address
          </label>
          <Textarea
            id="address"
            {...register('address')}
            className="w-full"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-1">
              Phone
            </label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              className="w-full"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="w-full"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-4">
            Social Media Links
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="facebookUrl" className="block text-xs font-medium text-gray-700 mb-1">
                Facebook
              </label>
              <Input
                id="facebookUrl"
                type="url"
                placeholder="https://facebook.com/..."
                {...register('facebookUrl')}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="twitterUrl" className="block text-xs font-medium text-gray-700 mb-1">
                Twitter
              </label>
              <Input
                id="twitterUrl"
                type="url"
                placeholder="https://twitter.com/..."
                {...register('twitterUrl')}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="linkedinUrl" className="block text-xs font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <Input
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/..."
                {...register('linkedinUrl')}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="instagramUrl" className="block text-xs font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <Input
                id="instagramUrl"
                type="url"
                placeholder="https://instagram.com/..."
                {...register('instagramUrl')}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="copyrightText" className="block text-sm font-medium text-gray-900 mb-1">
            Copyright Text
          </label>
          <Input
            id="copyrightText"
            type="text"
            {...register('copyrightText')}
            className="w-full"
          />
          {errors.copyrightText && (
            <p className="text-red-500 text-sm mt-1">{errors.copyrightText.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
