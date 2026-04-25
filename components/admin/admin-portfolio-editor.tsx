'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getPortfolio,
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
  onPortfolioChange,
  uploadImage,
  updatePortfolioOrder,
} from '@/lib/firebaseService';
import { uploadPortfolioImageToBlob } from '@/lib/blobService';
import { Portfolio } from '@/lib/types';
import { toast } from 'sonner';
import { Trash2, Globe, Eye, Cloud, Plus, Pencil, X, ArrowUp, ArrowDown, Image as ImageIcon, Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react';

const portfolioSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  category: z.string().min(2, 'Category is required'),
  client: z.string().optional(),
  completionDate: z.string().optional(),
  result: z.string().optional(),
});

type PortfolioFormData = z.infer<typeof portfolioSchema>;

export default function AdminPortfolioEditor() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
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
    formState: { errors },
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
  });

  useEffect(() => {
    const unsubscribe = onPortfolioChange((updatedPortfolios) => {
      setPortfolios(updatedPortfolios);
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
        url = await uploadImage(file, `portfolio/${Date.now()}`);
      }
      setSelectedImage(url);
      setManualUrl(url);
      toast.success('Image successfully uploaded and attached!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
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

  const onSubmit = async (data: PortfolioFormData) => {
    if (!selectedImage && !editingId) {
      toast.error('Please attach a project image before saving');
      return;
    }

    setIsSaving(true);
    try {
      const existingImage = editingId ? portfolios.find((p) => p.id === editingId)?.image : '';
      const portfolioData = {
        ...data,
        image: selectedImage || existingImage || '',
      };

      if (editingId) {
        await updatePortfolio(editingId, portfolioData);
        toast.success('Project updated live!');
      } else {
        await addPortfolio(portfolioData);
        toast.success('New project published live!');
      }

      setIsModalOpen(false);
      reset();
      setSelectedImage(null);
      setManualUrl('');
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to save portfolio item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setSelectedImage(null);
    setManualUrl('');
    reset({
      title: '',
      description: '',
      category: '',
      client: '',
      completionDate: '',
      result: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (portfolio: Portfolio) => {
    setEditingId(portfolio.id!);
    setSelectedImage(portfolio.image || null);
    setManualUrl(portfolio.image || '');
    reset({
      title: portfolio.title,
      description: portfolio.description,
      category: portfolio.category,
      client: portfolio.client || '',
      completionDate: portfolio.completionDate || '',
      result: portfolio.result || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this portfolio item?')) {
      try {
        await deletePortfolio(id);
        toast.success('Project removed from portfolio');
      } catch (error) {
        toast.error('Failed to delete portfolio item');
      }
    }
  };

  const movePortfolio = async (index: number, direction: 'up' | 'down') => {
    const newPortfolios = [...portfolios];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < portfolios.length) {
      [newPortfolios[index], newPortfolios[targetIndex]] = [newPortfolios[targetIndex], newPortfolios[index]];
      setPortfolios(newPortfolios);
      
      try {
        await updatePortfolioOrder(newPortfolios);
        toast.success('Order updated live');
      } catch (error) {
        toast.error('Failed to update order');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500">Loading portfolio data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Reorder projects to feature the top 3 on your homepage.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleAdd}
            className="bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Project
          </Button>
          <Button
            variant="outline"
            asChild
            className="border-gray-200"
          >
            <a href="/portfolio" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              View Live Site
            </a>
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="text-gray-500 mt-1 mb-6">Your portfolio is currently empty.</p>
            <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">Add First Project</Button>
          </div>
        ) : (
          portfolios.map((portfolio, index) => (
            <div
              key={portfolio.id}
              className={`bg-white rounded-xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col ${
                index < 3 ? 'border-green-100 ring-4 ring-green-50' : 'border-gray-200'
              }`}
            >
              <div className="relative h-48 overflow-hidden">
                {portfolio.image ? (
                  <img src={portfolio.image} alt={portfolio.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                
                <div className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md z-10 ${
                  index < 3 ? 'bg-green-600 text-white' : 'bg-white text-gray-500'
                }`}>
                  {index + 1}
                </div>

                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => movePortfolio(index, 'up')} disabled={index === 0} className="p-1.5 bg-white shadow-sm rounded text-gray-600 hover:text-green-600 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => movePortfolio(index, 'down')} disabled={index === portfolios.length - 1} className="p-1.5 bg-white shadow-sm rounded text-gray-600 hover:text-green-600 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(portfolio.id!)} className="p-1.5 bg-red-600 text-white shadow-sm rounded hover:bg-red-700"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 line-clamp-1">{portfolio.title}</h3>
                <p className="text-gray-500 text-xs mt-2 line-clamp-2">{portfolio.description}</p>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold uppercase tracking-wider">{portfolio.category}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(portfolio)} className="text-green-600 hover:bg-green-50 h-8 font-bold">Edit</Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{editingId ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            <DialogDescription>Fill in the project details and attach an image.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 px-6 py-4 space-y-6 overflow-y-auto">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Project Image</label>
                {selectedImage ? (
                  <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase bg-green-50 px-2 py-0.5 rounded">
                    <CheckCircle className="w-3 h-3" /> Attached
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold uppercase bg-red-50 px-2 py-0.5 rounded">
                    <X className="w-3 h-3" /> Required
                  </div>
                )}
              </div>

              <div className="flex gap-2 p-1 bg-gray-50 rounded-xl w-fit border">
                <button type="button" onClick={() => setUploadMethod('blob')} className={`px-4 py-2 text-xs font-bold rounded-lg ${uploadMethod === 'blob' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Cloud className="w-3.5 h-3.5 inline mr-2"/>Blob</button>
                <button type="button" onClick={() => setUploadMethod('firebase')} className={`px-4 py-2 text-xs font-bold rounded-lg ${uploadMethod === 'firebase' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}><Globe className="w-3.5 h-3.5 inline mr-2"/>Firebase</button>
                <button type="button" onClick={() => setUploadMethod('manual')} className={`px-4 py-2 text-xs font-bold rounded-lg ${uploadMethod === 'manual' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}><LinkIcon className="w-3.5 h-3.5 inline mr-2"/>Manual</button>
              </div>

              {uploadMethod !== 'manual' ? (
                <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex flex-col items-center justify-center bg-gray-50 hover:border-green-400 transition-colors">
                  {selectedImage ? (
                    <>
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center gap-2">
                        <label className="cursor-pointer bg-white px-4 py-2 rounded-lg font-bold text-sm">Change<input type="file" onChange={handleImageUpload} className="hidden" /></label>
                        <button onClick={() => setSelectedImage(null)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Remove</button>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center p-6 w-full">
                      <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
                      <span className="text-sm font-bold">Select Project Image</span>
                      <input type="file" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                  {isUploadingImage && <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-2" />Uploading...</div>}
                </div>
              ) : (
                <div className="space-y-2 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
                  <div className="flex gap-2">
                    <Input value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} placeholder="e.g. /images/portfolio/project.jpg" />
                    <Button type="button" onClick={handleManualUrlSubmit} className="bg-emerald-600 hover:bg-emerald-700">Attach</Button>
                  </div>
                  {selectedImage && uploadMethod === 'manual' && <img src={selectedImage} className="mt-2 rounded-lg aspect-video object-cover border" />}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Project Title</label><Input {...register('title')} /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Category</label><Input {...register('category')} /></div>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Description</label><Textarea {...register('description')} rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Client</label><Input {...register('client')} /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Completion</label><Input {...register('completionDate')} /></div>
              </div>
              <div className="flex gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 font-bold">Cancel</Button>
                <Button type="submit" disabled={isSaving} className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-black">{isSaving ? 'Saving...' : 'Save & Publish Live'}</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
