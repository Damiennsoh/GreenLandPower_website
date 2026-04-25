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
import { Trash2, Globe, Eye, Cloud, Plus, Pencil, X, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-react';

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
  const [uploadMethod, setUploadMethod] = useState<'firebase' | 'blob'>('blob');

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
      toast.success(`Image uploaded successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (data: PortfolioFormData) => {
    if (!selectedImage && !editingId) {
      toast.error('Please upload an image');
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
        toast.success('Portfolio item updated successfully!');
      } else {
        await addPortfolio(portfolioData);
        toast.success('Portfolio item added successfully!');
      }

      setIsModalOpen(false);
      reset();
      setSelectedImage(null);
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
    setSelectedImage(portfolio.image);
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
        toast.success('Portfolio item deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete portfolio item');
      }
    }
  };

  const movePortfolio = async (index: number, direction: 'up' | 'down') => {
    const newPortfolios = [...portfolios];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < portfolios.length) {
      // Swap items locally first for immediate feedback
      [newPortfolios[index], newPortfolios[targetIndex]] = [newPortfolios[targetIndex], newPortfolios[index]];
      setPortfolios(newPortfolios);
      
      try {
        await updatePortfolioOrder(newPortfolios);
        toast.success('Order updated');
      } catch (error) {
        toast.error('Failed to update order');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading portfolios...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Reorder projects to choose which top 3 appear on the homepage
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
          <a
            href="/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Live
          </a>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="text-gray-500 mt-1 mb-6">Start by adding your first portfolio item</p>
            <Button onClick={handleAdd} variant="outline" className="border-green-600 text-green-600">
              Add First Project
            </Button>
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
                  <img
                    src={portfolio.image}
                    alt={portfolio.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                
                {/* Ranking Badge */}
                <div className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md z-10 ${
                  index < 3 ? 'bg-green-600 text-white' : 'bg-white text-gray-500'
                }`}>
                  {index + 1}
                </div>

                {/* Homepage indicator */}
                {index < 3 && (
                  <div className="absolute top-3 right-12 bg-green-600 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-tight shadow-md">
                    Featured on Home
                  </div>
                )}

                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => movePortfolio(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 bg-white/90 backdrop-blur shadow-sm rounded text-gray-600 hover:text-green-600 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => movePortfolio(index, 'down')}
                    disabled={index === portfolios.length - 1}
                    className="p-1.5 bg-white/90 backdrop-blur shadow-sm rounded text-gray-600 hover:text-green-600 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(portfolio.id!)}
                    className="p-1.5 bg-red-600 text-white shadow-sm rounded hover:bg-red-700"
                    title="Delete Permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="absolute bottom-2 left-2">
                  <span className="bg-green-600/90 backdrop-blur text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">
                    {portfolio.category}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 line-clamp-1">{portfolio.title}</h3>
                <p className="text-gray-500 text-sm mt-2 line-clamp-2 min-h-[2.5rem]">
                  {portfolio.description}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="text-[11px] text-gray-400">
                    {portfolio.completionDate || 'Recent Project'}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(portfolio)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 px-2"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    Edit Details
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit/Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingId ? 'Edit Project Details' : 'Add New Portfolio Project'}
            </DialogTitle>
            <DialogDescription>
              {editingId 
                ? 'Update the project information, images, and results.' 
                : 'Enter the details for your new portfolio project to be displayed on the website.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* Image Upload Section */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900">Project Showcase Image</label>
              
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() => setUploadMethod('blob')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    uploadMethod === 'blob' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                  }`}
                >
                  Vercel Blob
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('firebase')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    uploadMethod === 'firebase' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'
                  }`}
                >
                  Firebase
                </button>
              </div>

              <div className="relative group aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden flex flex-col items-center justify-center transition-colors hover:border-green-300">
                {selectedImage ? (
                  <>
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow-xl">
                        Change Image
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-6">
                    <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      {uploadMethod === 'blob' ? <Cloud className="text-blue-500" /> : <Globe className="text-orange-500" />}
                    </div>
                    <span className="text-sm font-bold text-gray-900">Click to upload image</span>
                    <span className="text-xs text-gray-500 mt-1">Recommended: 1200 x 800px</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
                
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-sm font-bold text-green-700">Uploading to {uploadMethod}...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-bold text-gray-900">Project Title</label>
                <Input
                  id="title"
                  placeholder="e.g., Monrovia Mall Electrical"
                  {...register('title')}
                  className="bg-gray-50 focus:bg-white"
                />
                {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-bold text-gray-900">Project Category</label>
                <Input
                  id="category"
                  placeholder="e.g., Commercial, Solar, Industrial"
                  {...register('category')}
                  className="bg-gray-50 focus:bg-white"
                />
                {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-bold text-gray-900">Detailed Description</label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe the scope of work, challenges faced, and how Green Land Power solved them..."
                {...register('description')}
                className="bg-gray-50 focus:bg-white resize-none"
              />
              {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="client" className="text-sm font-bold text-gray-900">Client Name</label>
                <Input id="client" {...register('client')} className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <label htmlFor="completionDate" className="text-sm font-bold text-gray-900">Completion Date</label>
                <Input id="completionDate" placeholder="e.g., August 2024" {...register('completionDate')} className="bg-gray-50" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="result" className="text-sm font-bold text-gray-900">Project Results & Outcomes</label>
              <Input
                id="result"
                placeholder="e.g., 25% energy savings, Zero safety incidents"
                {...register('result')}
                className="bg-gray-50 focus:bg-white"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-200"
              >
                {isSaving ? 'Saving Project...' : editingId ? 'Update Project' : 'Publish Project'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
