'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  onTestimonialsChange,
  uploadImage,
} from '@/lib/firebaseService';
import { uploadPortfolioImageToBlob } from '@/lib/blobService';
import { Testimonial } from '@/lib/types';
import { toast } from 'sonner';
import { Trash2, Plus, Globe, Pencil, User, Quote, Star, Camera, CheckCircle, X, Link as LinkIcon, Home } from 'lucide-react';

const testimonialSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  position: z.string().min(3, 'Position is required'),
  company: z.string().optional(),
  content: z.string().min(10, 'Testimonial content must be at least 10 characters'),
  rating: z.coerce.number().min(1).max(5),
  isFeatured: z.boolean().default(false),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

export default function AdminTestimonialEditor() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'firebase' | 'blob' | 'manual'>('blob');
  const [manualUrl, setManualUrl] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      isFeatured: false,
      rating: 5,
    },
  });

  const isFeatured = watch('isFeatured');

  useEffect(() => {
    const unsubscribe = onTestimonialsChange((updated) => {
      setTestimonials(updated);
      setIsLoading(false);
    });

    return () => unsubscribe?.();
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
        url = await uploadImage(file, `testimonials/${Date.now()}`);
      }
      setSelectedImage(url);
      setManualUrl(url);
      toast.success('Avatar attached!');
    } catch (error: any) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleManualUrlSubmit = () => {
    if (manualUrl.trim()) {
      setSelectedImage(manualUrl.trim());
      toast.success('Image path attached successfully');
    } else {
      toast.error('Please enter a valid URL or path');
    }
  };

  const onSubmit = async (data: TestimonialFormData) => {
    setIsSaving(true);
    try {
      const testimonialData = {
        ...data,
        image: selectedImage || '',
      };

      if (editingId) {
        await updateTestimonial(editingId, testimonialData);
        toast.success('Testimonial updated!');
      } else {
        await addTestimonial(testimonialData);
        toast.success('Testimonial added!');
      }

      setIsModalOpen(false);
      reset();
      setSelectedImage(null);
      setManualUrl('');
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to save testimonial');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setSelectedImage(null);
    setManualUrl('');
    reset({
      name: '',
      position: '',
      company: '',
      content: '',
      rating: 5,
      isFeatured: false,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id!);
    setSelectedImage(testimonial.image || null);
    setManualUrl(testimonial.image || '');
    reset({
      name: testimonial.name,
      position: testimonial.position,
      company: testimonial.company || '',
      content: testimonial.content,
      rating: testimonial.rating,
      isFeatured: testimonial.isFeatured,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await deleteTestimonial(id);
        toast.success('Testimonial removed');
      } catch (error) {
        toast.error('Failed to delete testimonial');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500">Loading testimonials...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Testimonials</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer feedback and select which ones to feature on the homepage.
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </Button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <Quote className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No testimonials yet</h3>
            <p className="text-gray-500 mt-1 mb-6">Capture what your clients are saying about GLP</p>
            <Button onClick={handleAdd} variant="outline" className="border-green-600 text-green-600">
              Add First Testimonial
            </Button>
          </div>
        ) : (
          testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all group relative"
            >
              {t.isFeatured && (
                <div className="absolute top-4 left-4 bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-tighter border border-amber-200 z-10">
                  <Home className="w-2.5 h-2.5" /> Homepage Featured
                </div>
              )}
              
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(t)}
                  className="p-1.5 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(t.id!)}
                  className="p-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4 mt-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm">
                  {t.image ? (
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{t.name}</h3>
                  <p className="text-gray-500 text-[11px] leading-tight mt-0.5">
                    {t.position} {t.company ? `@ ${t.company}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex gap-0.5 mb-3 text-amber-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>

              <p className="text-gray-600 text-xs italic line-clamp-4 min-h-[4rem]">
                &quot;{t.content}&quot;
              </p>
            </div>
          ))
        )}
      </div>

      {/* Edit/Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingId ? 'Edit Testimonial' : 'Add Testimonial'}
            </DialogTitle>
            <DialogDescription>
              Enter the client details and their feedback.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Avatar Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Client Avatar</label>
                {selectedImage ? (
                  <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase bg-green-50 px-2 py-0.5 rounded">
                    <CheckCircle className="w-3 h-3" /> Attached
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold uppercase bg-gray-50 px-2 py-0.5 rounded">
                    Optional
                  </div>
                )}
              </div>

              <div className="flex gap-2 p-1 bg-gray-50 rounded-xl w-fit border mb-4">
                <button type="button" onClick={() => setUploadMethod('blob')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${uploadMethod === 'blob' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Blob</button>
                <button type="button" onClick={() => setUploadMethod('firebase')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${uploadMethod === 'firebase' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>Firebase</button>
                <button type="button" onClick={() => setUploadMethod('manual')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${uploadMethod === 'manual' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}>Manual</button>
              </div>

              {uploadMethod !== 'manual' ? (
                <div className="relative w-24 h-24 mx-auto rounded-full border-2 border-dashed border-gray-200 overflow-hidden flex flex-col items-center justify-center bg-gray-50 hover:border-green-400 transition-colors">
                  {selectedImage ? (
                    <>
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center">
                        <label className="cursor-pointer bg-white p-2 rounded-full"><Camera className="w-4 h-4"/><input type="file" onChange={handleImageUpload} className="hidden" /></label>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center w-full"><User className="w-6 h-6 text-gray-300"/><input type="file" onChange={handleImageUpload} className="hidden" /></label>
                  )}
                  {isUploadingImage && <div className="absolute inset-0 bg-white/90 flex items-center justify-center"><div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} placeholder="/images/avatars/client.jpg" className="text-xs h-9" />
                    <Button type="button" onClick={handleManualUrlSubmit} size="sm" className="bg-emerald-600">Attach</Button>
                  </div>
                  {selectedImage && uploadMethod === 'manual' && <img src={selectedImage} className="mx-auto w-16 h-16 rounded-full object-cover border" />}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Client Name</label>
                  <Input {...register('name')} placeholder="e.g. Robert Tweh" />
                  {errors.name && <p className="text-red-500 text-[10px]">{errors.name.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Position</label>
                  <Input {...register('position')} placeholder="e.g. Manager" />
                  {errors.position && <p className="text-red-500 text-[10px]">{errors.position.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Company (Optional)</label>
                  <Input {...register('company')} placeholder="e.g. Ocean View" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Rating (1-5)</label>
                  <Input type="number" {...register('rating')} min="1" max="5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-gray-400">Content</label>
                <Textarea {...register('content')} rows={4} placeholder="Write the testimonial here..." />
                {errors.content && <p className="text-red-500 text-[10px]">{errors.content.message}</p>}
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-600 shadow-sm">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">Feature on Homepage</h4>
                    <p className="text-[10px] text-amber-700">Display this in the home testimonial section</p>
                  </div>
                </div>
                <Switch
                  checked={isFeatured}
                  onCheckedChange={(checked) => setValue('isFeatured', checked)}
                />
              </div>

              <div className="flex gap-2 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-black">
                  {isSaving ? 'Saving...' : 'Publish Live'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
