'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getAdminSettings, updateHeroSection, uploadImage } from '@/lib/firebaseService';
import { uploadPortfolioImageToBlob } from '@/lib/blobService';
import { HeroSection, HeroSlide } from '@/lib/types';
import { toast } from 'sonner';
import { Globe, Eye, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, CheckCircle, Pencil, Cloud, Link as LinkIcon, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const slideSchema = z.object({
  title: z.string().min(5, 'Title is required'),
  subtitle: z.string().min(5, 'Subtitle is required'),
  ctaText: z.string().min(3, 'CTA text is required'),
  ctaLink: z.string().url('Valid URL required'),
});

type SlideFormData = z.infer<typeof slideSchema>;

export default function AdminHeroEditor() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'firebase' | 'blob' | 'manual'>('blob');
  const [manualUrl, setManualUrl] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SlideFormData>({
    resolver: zodResolver(slideSchema),
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getAdminSettings();
        if (settings?.heroSection?.slides) {
          setSlides(settings.heroSection.slides);
        } else if (settings?.heroSection) {
          const legacySlide: HeroSlide = {
            id: 'legacy-1',
            title: settings.heroSection.title,
            subtitle: settings.heroSection.subtitle,
            ctaText: settings.heroSection.ctaText,
            ctaLink: settings.heroSection.ctaLink,
            backgroundImage: settings.heroSection.backgroundImage || '',
            order: 0,
          };
          setSlides([legacySlide]);
        }
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to load settings');
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      let url: string;
      if (uploadMethod === 'blob') {
        const blobResult = await uploadPortfolioImageToBlob(file);
        url = blobResult.url;
      } else {
        url = await uploadImage(file, `hero/${Date.now()}`);
      }
      setSelectedImage(url);
      setManualUrl(url);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleManualUrlSubmit = () => {
    if (manualUrl.trim()) {
      setSelectedImage(manualUrl.trim());
      toast.success('Image path updated');
    }
  };

  const onSlideSubmit = (data: SlideFormData) => {
    if (!selectedImage && editingIndex === null) {
      toast.error('Please provide a background image');
      return;
    }

    const newSlide: HeroSlide = {
      id: editingIndex !== null ? slides[editingIndex].id : `slide-${Date.now()}`,
      ...data,
      backgroundImage: selectedImage || (editingIndex !== null ? slides[editingIndex].backgroundImage : ''),
      order: editingIndex !== null ? slides[editingIndex].order : slides.length,
    };

    const updatedSlides = [...slides];
    if (editingIndex !== null) {
      updatedSlides[editingIndex] = newSlide;
    } else {
      updatedSlides.push(newSlide);
    }

    setSlides(updatedSlides);
    setIsModalOpen(false);
    reset();
    setSelectedImage(null);
    setManualUrl('');
    setEditingIndex(null);
  };

  const handleAddSlide = () => {
    setEditingIndex(null);
    setSelectedImage(null);
    setManualUrl('');
    reset({
      title: '',
      subtitle: '',
      ctaText: 'Get a Free Quote',
      ctaLink: '/contact',
    });
    setIsModalOpen(true);
  };

  const handleEditSlide = (index: number) => {
    const slide = slides[index];
    setEditingIndex(index);
    setSelectedImage(slide.backgroundImage);
    setManualUrl(slide.backgroundImage);
    reset({
      title: slide.title,
      subtitle: slide.subtitle,
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink,
    });
    setIsModalOpen(true);
  };

  const handleDeleteSlide = (index: number) => {
    if (confirm('Are you sure you want to delete this slide?')) {
      const updatedSlides = slides.filter((_, i) => i !== index);
      setSlides(updatedSlides);
    }
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < slides.length) {
      [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
      newSlides.forEach((slide, i) => {
        slide.order = i;
      });
      setSlides(newSlides);
    }
  };

  const publishHero = async () => {
    if (slides.length === 0) {
      toast.error('Add at least one slide before publishing');
      return;
    }

    setIsSaving(true);
    try {
      await updateHeroSection({
        title: slides[0].title,
        subtitle: slides[0].subtitle,
        ctaText: slides[0].ctaText,
        ctaLink: slides[0].ctaLink,
        backgroundImage: slides[0].backgroundImage,
        slides: slides,
      });
      toast.success('Hero carousel published successfully!');
    } catch (error) {
      toast.error('Failed to publish hero section');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading hero settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hero Carousel Editor</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage multiple slides for your homepage hero section
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleAddSlide}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Slide
          </Button>
          <Button
            onClick={publishHero}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-green-100"
          >
            <Globe className="w-4 h-4" />
            {isSaving ? 'Publishing...' : 'Publish Carousel'}
          </Button>
        </div>
      </div>

      {/* Slides List */}
      <div className="space-y-4">
        {slides.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500 mb-4">No slides created yet.</p>
            <Button onClick={handleAddSlide} variant="outline" className="border-blue-600 text-blue-600">
              Create First Slide
            </Button>
          </div>
        ) : (
          slides.map((slide, index) => (
            <div
              key={slide.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col md:flex-row"
            >
              <div className="w-full md:w-48 h-32 md:h-auto bg-gray-100 relative">
                {slide.backgroundImage ? (
                  <img src={slide.backgroundImage} alt={slide.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded font-bold">
                  SLIDE {index + 1}
                </div>
              </div>
              
              <div className="flex-1 p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{slide.title}</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => moveSlide(index, 'up')}
                      className="h-8 w-8 text-gray-400 hover:text-blue-600"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === slides.length - 1}
                      onClick={() => moveSlide(index, 'down')}
                      className="h-8 w-8 text-gray-400 hover:text-blue-600"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{slide.subtitle}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex gap-4 text-[11px] font-medium text-gray-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      {slide.ctaText}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSlide(index)}
                      className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSlide(index)}
                      className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit Hero Slide' : 'Add New Hero Slide'}</DialogTitle>
            <DialogDescription>
              Provide an image and content for this slide. You can upload a file or reference an image from the public directory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Image Source Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Background Image Source</label>
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() => setUploadMethod('blob')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    uploadMethod === 'blob' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                  }`}
                >
                  <Cloud className="w-3 h-3" />
                  Vercel Blob
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('firebase')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    uploadMethod === 'firebase' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  Firebase
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('manual')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    uploadMethod === 'manual' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  URL / Public
                </button>
              </div>

              {uploadMethod !== 'manual' ? (
                <div className="relative aspect-[21/9] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden group">
                  {selectedImage ? (
                    <>
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <span className="bg-white px-4 py-2 rounded-lg font-bold text-sm shadow-xl">Change File</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-100 transition-colors">
                      <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
                      <span className="text-sm font-bold text-gray-900">Click to upload via {uploadMethod}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      value={manualUrl} 
                      onChange={(e) => setManualUrl(e.target.value)}
                      placeholder="e.g., /images/hero/sample.jpg or https://..."
                      className="bg-gray-50"
                    />
                    <Button type="button" onClick={handleManualUrlSubmit} className="bg-green-600 hover:bg-green-700">Apply</Button>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Use <code className="bg-gray-100 px-1 rounded">/images/hero/...</code> to reference files in your <code className="bg-gray-100 px-1 rounded">public</code> folder.
                  </p>
                  {selectedImage && (
                    <div className="relative aspect-[21/9] rounded-xl overflow-hidden border border-gray-100 mt-4">
                      <img src={selectedImage} alt="Manual preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSlideSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-900">Main Headline</label>
                  <Input {...register('title')} placeholder="Enter a powerful headline..." className="bg-gray-50" />
                  {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-900">Description Text</label>
                  <Textarea {...register('subtitle')} rows={3} placeholder="Tell your visitors what you offer..." className="bg-gray-50 resize-none" />
                  {errors.subtitle && <p className="text-red-500 text-xs">{errors.subtitle.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-900">Button Text</label>
                    <Input {...register('ctaText')} placeholder="e.g., Get Started" className="bg-gray-50" />
                    {errors.ctaText && <p className="text-red-500 text-xs">{errors.ctaText.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-900">Button Link</label>
                    <Input {...register('ctaLink')} placeholder="e.g., /contact" className="bg-gray-50" />
                    {errors.ctaLink && <p className="text-red-500 text-xs">{errors.ctaLink.message}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  {editingIndex !== null ? 'Update Slide' : 'Add Slide'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
