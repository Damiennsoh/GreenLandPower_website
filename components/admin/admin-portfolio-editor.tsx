'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  getPortfolio,
  addPortfolio,
  updatePortfolio,
  deletePortfolio,
  onPortfolioChange,
  uploadImage,
} from '@/lib/firebaseService';
import { uploadPortfolioImageToBlob } from '@/lib/blobService';
import { Portfolio } from '@/lib/types';
import { toast } from 'sonner';
import { Trash2, Globe, Eye, Cloud } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lastPublished, setLastPublished] = useState<Date | null>(null);
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
        // Upload to Vercel Blob
        const blobResult = await uploadPortfolioImageToBlob(file);
        url = blobResult.url;
        console.log('[v0] Blob upload successful:', url);
      } else {
        // Upload to Firebase (legacy)
        url = await uploadImage(file, `portfolio/${Date.now()}`);
        console.log('[v0] Firebase upload successful:', url);
      }
      
      setSelectedImage(url);
      toast.success(`Image uploaded to ${uploadMethod === 'blob' ? 'Vercel Blob' : 'Firebase'} successfully`);
    } catch (error: any) {
      console.error('[v0] Image upload error:', error);
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
        toast.success('Portfolio item updated and published! Changes are live on the portfolio page.');
      } else {
        await addPortfolio(portfolioData);
        toast.success('Portfolio item added and published! Visible on the portfolio page.');
      }

      setLastPublished(new Date());
      reset();
      setSelectedImage(null);
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to publish portfolio item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (portfolio: Portfolio) => {
    setEditingId(portfolio.id!);
    setSelectedImage(portfolio.image);
    reset({
      title: portfolio.title,
      description: portfolio.description,
      category: portfolio.category,
      client: portfolio.client,
      completionDate: portfolio.completionDate,
      result: portfolio.result,
    });
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleCancel = () => {
    reset();
    setSelectedImage(null);
    setEditingId(null);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {editingId ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Project Image
            </label>
            
            {/* Upload Method Selector */}
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => setUploadMethod('blob')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploadMethod === 'blob'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Cloud className="w-4 h-4" />
                Vercel Blob
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('firebase')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploadMethod === 'firebase'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Globe className="w-4 h-4" />
                Firebase
              </button>
            </div>

            {selectedImage && (
              <div className="mb-4">
                <img
                  src={selectedImage}
                  alt="Portfolio"
                  className="max-w-xs h-40 object-cover rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {uploadMethod === 'blob' ? 'Stored in Vercel Blob' : 'Stored in Firebase'}
                </p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploadingImage}
              className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {isUploadingImage && (
              <p className="text-xs text-blue-600 mt-2">Uploading image...</p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-1">
              Project Title
            </label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Commercial Building Electrical"
              {...register('title')}
              className="w-full"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe the project..."
              {...register('description')}
              className="w-full"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-1">
                Category
              </label>
              <Input
                id="category"
                type="text"
                placeholder="e.g., Commercial"
                {...register('category')}
                className="w-full"
              />
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-900 mb-1">
                Client (Optional)
              </label>
              <Input
                id="client"
                type="text"
                placeholder="Client name"
                {...register('client')}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="completionDate" className="block text-sm font-medium text-gray-900 mb-1">
                Completion Date (Optional)
              </label>
              <Input
                id="completionDate"
                type="text"
                placeholder="e.g., 2024-01"
                {...register('completionDate')}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="result" className="block text-sm font-medium text-gray-900 mb-1">
                Result/Outcome (Optional)
              </label>
              <Input
                id="result"
                type="text"
                placeholder="e.g., 30% energy savings"
                {...register('result')}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4" />
              {isSaving ? 'Publishing...' : editingId ? 'Update & Publish' : 'Add & Publish'}
            </Button>
            {editingId && (
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Portfolio List */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Portfolio Items</h2>
            <p className="text-sm text-gray-500 mt-1">
              {portfolios.length} project{portfolios.length !== 1 ? 's' : ''} live on the portfolio page
            </p>
          </div>
          <a
            href="/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Portfolio Page
          </a>
        </div>

        {portfolios.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No portfolio items yet</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  editingId === portfolio.id
                    ? 'border-green-500 ring-2 ring-green-200 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                {portfolio.image && (
                  <img
                    src={portfolio.image}
                    alt={portfolio.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900">{portfolio.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{portfolio.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {portfolio.category}
                    </span>
                    {portfolio.client && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {portfolio.client}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleEdit(portfolio)}
                      variant={editingId === portfolio.id ? 'default' : 'outline'}
                      size="sm"
                      className={editingId === portfolio.id ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {editingId === portfolio.id ? 'Editing...' : 'Edit'}
                    </Button>
                    <Button
                      onClick={() => handleDelete(portfolio.id!)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
