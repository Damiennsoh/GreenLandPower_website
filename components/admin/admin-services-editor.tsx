'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  getServices,
  addService,
  updateService,
  deleteService,
  onServicesChange,
} from '@/lib/firebaseService';
import { Service } from '@/lib/types';
import { toast } from 'sonner';
import { Trash2, Plus, Globe, Eye, CheckCircle } from 'lucide-react';

const serviceSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  features: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function AdminServicesEditor() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastPublished, setLastPublished] = useState<Date | null>(null);
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
        toast.success('Service updated and published! Changes are live on the services page.');
      } else {
        await addService(serviceData);
        toast.success('Service added and published! Visible on the services page.');
      }

      setLastPublished(new Date());
      reset();
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to publish service');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id!);
    reset({
      title: service.title,
      description: service.description,
      features: service.features?.join('\n') || '',
    });
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

  const handleCancel = () => {
    reset();
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
          {editingId ? 'Edit Service' : 'Add New Service'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-1">
              Service Title
            </label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Residential Electrical"
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
              placeholder="Describe the service..."
              {...register('description')}
              className="w-full"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="features" className="block text-sm font-medium text-gray-900 mb-1">
              Features (one per line)
            </label>
            <Textarea
              id="features"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              {...register('features')}
              className="w-full"
            />
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

      {/* Services List */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Services</h2>
            <p className="text-sm text-gray-500 mt-1">
              {services.length} service{services.length !== 1 ? 's' : ''} live on the website
            </p>
          </div>
          <a
            href="/services"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Services Page
          </a>
        </div>

        {services.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No services yet</p>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{service.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                    {service.features && service.features.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {service.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleEdit(service)}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(service.id!)}
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
