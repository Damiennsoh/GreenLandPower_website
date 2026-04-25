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
  getServices,
  addService,
  updateService,
  deleteService,
  onServicesChange,
} from '@/lib/firebaseService';
import { Service } from '@/lib/types';
import { toast } from 'sonner';
import { Trash2, Plus, Globe, Eye, Pencil, Zap } from 'lucide-react';

const serviceSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  features: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function AdminServicesEditor() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  useEffect(() => {
    const unsubscribe = onServicesChange((updatedServices) => {
      setServices(updatedServices);
      setIsLoading(false);
    });

    return () => unsubscribe?.();
  }, []);

  const onSubmit = async (data: ServiceFormData) => {
    setIsSaving(true);
    try {
      const serviceData = {
        title: data.title,
        description: data.description,
        features: data.features ? data.features.split('\n').filter((f) => f.trim()) : [],
      };

      if (editingId) {
        await updateService(editingId, serviceData);
        toast.success('Service updated successfully!');
      } else {
        await addService(serviceData);
        toast.success('Service added successfully!');
      }

      setIsModalOpen(false);
      reset();
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to save service');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    reset({
      title: '',
      description: '',
      features: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id!);
    reset({
      title: service.title,
      description: service.description,
      features: service.features?.join('\n') || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(id);
        toast.success('Service deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Services Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Define and describe the electrical solutions you offer
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleAdd}
            className="bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Service
          </Button>
          <a
            href="/services"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Live
          </a>
        </div>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 gap-4">
        {services.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">No services listed</h3>
            <p className="text-gray-500 mt-1 mb-6">Create your first service to show on the website</p>
            <Button onClick={handleAdd} variant="outline" className="border-green-600 text-green-600">
              Add First Service
            </Button>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4 max-w-2xl">{service.description}</p>
                {service.features && service.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 text-[11px] px-2.5 py-1 rounded-full font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                <Button
                  onClick={() => handleEdit(service)}
                  variant="outline"
                  className="flex-1 md:flex-none border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Service
                </Button>
                <Button
                  onClick={() => handleDelete(service.id!)}
                  variant="outline"
                  size="icon"
                  className="border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit/Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingId ? 'Edit Service Offering' : 'Add New Service Offering'}
            </DialogTitle>
            <DialogDescription>
              {editingId 
                ? 'Update the details and features of this service.' 
                : 'Define a new electrical solution to display on your services page.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Service Title
              </label>
              <Input
                id="title"
                placeholder="e.g., Residential Electrical Installation"
                {...register('title')}
                className="bg-gray-50 h-12 text-lg focus:bg-white"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Service Description
              </label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Provide a detailed description of what this service involves..."
                {...register('description')}
                className="bg-gray-50 focus:bg-white resize-none"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="features" className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Key Features (one per line)
              </label>
              <Textarea
                id="features"
                rows={4}
                placeholder="New Construction Wiring&#10;Panel Upgrades&#10;Lighting Design"
                {...register('features')}
                className="bg-gray-50 focus:bg-white font-mono text-sm"
              />
              <p className="text-[11px] text-gray-400">These will appear as bullet points on the website.</p>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-[2] h-12 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-100"
              >
                <Globe className="w-4 h-4 mr-2" />
                {isSaving ? 'Publishing...' : editingId ? 'Update & Publish' : 'Add & Publish'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
