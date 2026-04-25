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
import { Globe, Eye, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, CheckCircle, Pencil, Cloud, Link as LinkIcon, X, Save, AlertCircle } from 'lucide-react';
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
  ctaLink: z.string().min(1, 'Link is required'),
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
  const [uploadMethod, setUploadMethod] = useState<'blob' | 'firebase' | 'manual'>('blob');
  const [manualUrl, setManualUrl] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
      toast.success('Image successfully uploaded and attached!');
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
      toast.success('Local/External image attached successfully');
    } else {
      toast.error('Please enter a valid URL or path');
    }
  };

  const onSlideSubmit = (data: SlideFormData) => {
    if (!selectedImage && editingIndex === null) {
      toast.error('Please attach a background image before adding the slide');
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
    setHasUnsavedChanges(true);
    setIsModalOpen(false);
    reset();
    setSelectedImage(null);
    setManualUrl('');
    setEditingIndex(null);
    toast.success('Slide added to list. Remember to click "Publish Carousel" to save changes live.');
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
      setHasUnsavedChanges(true);
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
      setHasUnsavedChanges(true);
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
      setHasUnsavedChanges(false);
      toast.success('Hero carousel published successfully! Changes are now live.');
    } catch (error) {
      toast.error('Failed to publish hero section');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading hero settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
        {hasUnsavedChanges && (
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-400 animate-pulse" />
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hero Carousel Editor</h2>
          <p className="text-sm text-gray-500 mt-1">
            Build a stunning, multi-slide introduction for your visitors
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleAddSlide}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Slide
          </Button>
          <Button
            onClick={publishHero}
            disabled={isSaving}
            className={`${
              hasUnsavedChanges 
                ? 'bg-blue-600 hover:bg-blue-700 animate-shimmer ring-2 ring-blue-100' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95`}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Publish Live Changes'}
          </Button>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3 text-amber-800 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          You have unsaved changes. Click "Publish Live Changes" to update the website.
        </div>
      )}

      {/* Slides List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {slides.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No slides created</h3>
            <p className="text-gray-500 mb-6 max-w-xs mx-auto">Create your first hero slide to start building your homepage carousel.</p>
            <Button onClick={handleAddSlide} className="bg-blue-600 hover:bg-blue-700 font-bold">
              Create First Slide
            </Button>
          </div>
        ) : (
          slides.map((slide, index) => (
            <div
              key={slide.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row group"
            >
              <div className="w-full sm:w-40 h-32 sm:h-auto bg-gray-100 relative shrink-0">
                {slide.backgroundImage ? (
                  <img src={slide.backgroundImage} alt={slide.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Slide {index + 1}
                </div>
              </div>
              
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{slide.title}</h3>
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={index === 0}
                        onClick={() => moveSlide(index, 'up')}
                        className="h-7 w-7 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={index === slides.length - 1}
                        onClick={() => moveSlide(index, 'down')}
                        className="h-7 w-7 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-2">{slide.subtitle}</p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-50">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSlide(index)}
                      className="h-8 text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2"
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSlide(index)}
                      className="h-8 text-[11px] font-bold text-red-600 hover:bg-red-50 px-2"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                  <div className="bg-green-50 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-green-100 uppercase">
                    {slide.ctaText}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle className="text-2xl font-bold">
              {editingIndex !== null ? 'Modify Slide Content' : 'Add New Carousel Slide'}
            </DialogTitle>
            <DialogDescription>
              Select an image source and fill in the headline details.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Image Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-400 uppercase tracking-[2px]">
                  Background Image Source
                </label>
                {selectedImage ? (
                  <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    <CheckCircle className="w-3 h-3" />
                    Image Attached
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold uppercase bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    <X className="w-3 h-3" />
                    No Image Selected
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 p-1 bg-gray-50 rounded-xl w-fit border border-gray-100">
                <button
                  type="button"
                  onClick={() => setUploadMethod('blob')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    uploadMethod === 'blob' ? 'bg-white shadow-sm text-blue-600 border border-gray-200' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  Vercel Blob
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('firebase')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    uploadMethod === 'firebase' ? 'bg-white shadow-sm text-orange-600 border border-gray-200' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Firebase
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('manual')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    uploadMethod === 'manual' ? 'bg-white shadow-sm text-emerald-600 border border-gray-200' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  Public/URL
                </button>
              </div>

              {uploadMethod !== 'manual' ? (
                <div className={`relative aspect-[21/9] rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center ${
                  selectedImage ? 'border-green-400 bg-green-50/20' : 'border-gray-200 bg-gray-50 hover:border-blue-300'
                }`}>
                  {selectedImage ? (
                    <>
                      <img src={selectedImage} alt="Slide Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-transform">
                          Change File
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        <button 
                          onClick={() => setSelectedImage(null)}
                          className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-transform"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-6">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">Select Image to Upload</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Method: {uploadMethod}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <span className="text-sm font-bold text-blue-700 animate-pulse">Uploading to {uploadMethod}...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100">
                  <div className="flex gap-2">
                    <Input 
                      value={manualUrl} 
                      onChange={(e) => setManualUrl(e.target.value)}
                      placeholder="e.g., /images/hero/sample.jpg"
                      className="bg-white border-emerald-100 h-11"
                    />
                    <Button 
                      type="button" 
                      onClick={handleManualUrlSubmit} 
                      className="bg-emerald-600 hover:bg-emerald-700 font-bold h-11 px-6 shadow-md shadow-emerald-100"
                    >
                      Attach
                    </Button>
                  </div>
                  <div className="flex items-start gap-2 px-1">
                    <AlertCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                    <p className="text-[10px] text-emerald-800 font-medium leading-relaxed">
                      Reference files in your <code className="bg-emerald-100/50 px-1 rounded">public</code> folder using paths starting with <code className="bg-emerald-100/50 px-1 rounded">/</code>
                    </p>
                  </div>
                  {selectedImage && uploadMethod === 'manual' && (
                    <div className="relative aspect-[21/9] rounded-xl overflow-hidden border-2 border-emerald-200 mt-2 shadow-sm">
                      <img src={selectedImage} alt="Manual preview" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                        Current View
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSlideSubmit)} className="space-y-5">
              <div className="grid gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-[2px]">Main Headline</label>
                  <Input {...register('title')} placeholder="Enter a powerful headline..." className="bg-gray-50 border-gray-100 h-11 focus:bg-white" />
                  {errors.title && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.title.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-[2px]">Description Text</label>
                  <Textarea {...register('subtitle')} rows={3} placeholder="Tell your visitors what you offer..." className="bg-gray-50 border-gray-100 focus:bg-white resize-none" />
                  {errors.subtitle && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.subtitle.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-[2px]">Button Text</label>
                    <Input {...register('ctaText')} placeholder="e.g., Get Started" className="bg-gray-50 border-gray-100 h-11" />
                    {errors.ctaText && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.ctaText.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-[2px]">Button Link</label>
                    <Input {...register('ctaLink')} placeholder="e.g., /contact or tel:+1234567" className="bg-gray-50 border-gray-100 h-11" />
                    <p className="text-[9px] text-gray-400 mt-1">
                      Use <code className="bg-gray-100 px-1 rounded">/contact</code> for pages, 
                      <code className="bg-gray-100 px-1 rounded">tel:+123</code> for phones, or 
                      <code className="bg-gray-100 px-1 rounded">mailto:a@b.com</code> for email.
                    </p>
                    {errors.ctaLink && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.ctaLink.message}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100 mt-4 shrink-0">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 font-bold">
                  Cancel
                </Button>
                <Button type="submit" className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black h-12 shadow-lg shadow-blue-100">
                  {editingIndex !== null ? 'Save Changes' : 'Add to Carousel'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
