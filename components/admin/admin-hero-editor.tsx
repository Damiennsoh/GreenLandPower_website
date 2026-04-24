'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getAdminSettings, updateHeroSection, uploadImage } from '@/lib/firebaseService';
import { HeroSection } from '@/lib/types';
import { toast } from 'sonner';
import { Globe, Eye, CheckCircle } from 'lucide-react';

const heroSchema = z.object({
  title: z.string().min(5, 'Title is required'),
  subtitle: z.string().min(5, 'Subtitle is required'),
  ctaText: z.string().min(3, 'CTA text is required'),
  ctaLink: z.string().url('Valid URL required'),
});

type HeroFormData = z.infer<typeof heroSchema>;

export default function AdminHeroEditor() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HeroFormData>({
    resolver: zodResolver(heroSchema),
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getAdminSettings();
        if (settings?.heroSection) {
          reset(settings.heroSection);
          setBackgroundImage(settings.heroSection.backgroundImage || null);
        }
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to load settings');
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImage(file, `hero/${Date.now()}`);
      setBackgroundImage(url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const onSubmit = async (data: HeroFormData) => {
    setIsSaving(true);
    try {
      await updateHeroSection({
        ...data,
        backgroundImage: backgroundImage || undefined,
      });
      toast.success('Hero section published successfully! Changes are now live on the homepage.');
      setIsPublished(true);
      // Reset published status after 3 seconds
      setTimeout(() => setIsPublished(false), 3000);
    } catch (error) {
      toast.error('Failed to publish hero section');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Hero Section</h2>
          <p className="text-sm text-gray-500 mt-1">
            Changes will be published immediately to the homepage
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Eye className="w-4 h-4" />
          <span>Live on site</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Background Image
          </label>
          {backgroundImage && (
            <div className="mb-4">
              <img
                src={backgroundImage}
                alt="Hero background"
                className="max-w-xs h-40 object-cover rounded-lg"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-1">
            Main Title
          </label>
          <Input
            id="title"
            type="text"
            placeholder="Enter hero title"
            {...register('title')}
            className="w-full"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="subtitle" className="block text-sm font-medium text-gray-900 mb-1">
            Subtitle
          </label>
          <Textarea
            id="subtitle"
            placeholder="Enter hero subtitle"
            {...register('subtitle')}
            className="w-full"
          />
          {errors.subtitle && (
            <p className="text-red-500 text-sm mt-1">{errors.subtitle.message}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ctaText" className="block text-sm font-medium text-gray-900 mb-1">
              CTA Button Text
            </label>
            <Input
              id="ctaText"
              type="text"
              placeholder="Get Started"
              {...register('ctaText')}
              className="w-full"
            />
            {errors.ctaText && (
              <p className="text-red-500 text-sm mt-1">{errors.ctaText.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="ctaLink" className="block text-sm font-medium text-gray-900 mb-1">
              CTA Button Link
            </label>
            <Input
              id="ctaLink"
              type="url"
              placeholder="https://example.com"
              {...register('ctaLink')}
              className="w-full"
            />
            {errors.ctaLink && (
              <p className="text-red-500 text-sm mt-1">{errors.ctaLink.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4" />
            {isSaving ? 'Publishing...' : isPublished ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Published!
              </>
            ) : (
              'Publish to Homepage'
            )}
          </Button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Live
          </a>
        </div>
      </form>
    </div>
  );
}
