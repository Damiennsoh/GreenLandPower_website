'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getAdminSettings, updateContactInfo } from '@/lib/firebaseService';
import { ContactInfo } from '@/lib/types';
import { toast } from 'sonner';
import { Phone, Mail, MapPin, Clock, MessageSquare, Save, Globe, CheckCircle, AlertCircle } from 'lucide-react';

const contactSchema = z.object({
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(5, 'Phone number is required'),
  whatsapp: z.string().min(5, 'WhatsApp number is required'),
  email: z.string().email('Valid email is required'),
  workingHours: z.string().min(5, 'Working hours are required'),
  mapEmbedUrl: z.string().url('Valid Google Maps Embed URL required').optional().or(z.literal('')),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function AdminContactEditor() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  // Watch for changes to track unsaved status
  const formValues = watch();
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getAdminSettings();
        if (settings?.contactInfo) {
          const info = settings.contactInfo;
          setValue('address', info.address);
          setValue('phone', info.phone);
          setValue('whatsapp', info.whatsapp);
          setValue('email', info.email);
          setValue('workingHours', info.workingHours);
          setValue('mapEmbedUrl', info.mapEmbedUrl || '');
        }
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to load contact settings');
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [setValue]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSaving(true);
    try {
      await updateContactInfo(data);
      setHasUnsavedChanges(false);
      toast.success('Contact information updated live!');
    } catch (error) {
      toast.error('Failed to update contact info');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading contact data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact & Location Editor</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage how clients reach you and what they see on the contact page.
          </p>
        </div>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Saving...' : 'Save & Publish Live'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Core Contact Info */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">General Contact</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Office Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
                <Input {...register('address')} className="pl-10 bg-gray-50 focus:bg-white h-12" placeholder="e.g. Broad Street, Monrovia" />
              </div>
              {errors.address && <p className="text-red-500 text-[10px] font-bold">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
                  <Input {...register('phone')} className="pl-10 bg-gray-50 focus:bg-white h-12" placeholder="+231 77..." />
                </div>
                {errors.phone && <p className="text-red-500 text-[10px] font-bold">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> WhatsApp
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-emerald-300" />
                  <Input {...register('whatsapp')} className="pl-10 bg-emerald-50/30 border-emerald-100 focus:bg-white h-12" placeholder="+231 77..." />
                </div>
                {errors.whatsapp && <p className="text-red-500 text-[10px] font-bold">{errors.whatsapp.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
                <Input {...register('email')} className="pl-10 bg-gray-50 focus:bg-white h-12" placeholder="info@company.com" />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] font-bold">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Working Hours</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
                <Input {...register('workingHours')} className="pl-10 bg-gray-50 focus:bg-white h-12" placeholder="Mon-Fri: 8AM-5PM" />
              </div>
              {errors.workingHours && <p className="text-red-500 text-[10px] font-bold">{errors.workingHours.message}</p>}
            </div>
          </div>
        </div>

        {/* Map & Preview */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Google Maps Integration</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Google Maps Embed URL</label>
              <Textarea 
                {...register('mapEmbedUrl')} 
                rows={4} 
                className="bg-gray-50 focus:bg-white resize-none text-xs font-mono" 
                placeholder="Paste the <iframe src='...'> URL here"
              />
              <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <p className="text-[10px] text-blue-800 leading-relaxed">
                  Go to Google Maps {"->"} Share {"->"} Embed a map. Copy ONLY the URL inside the <code className="font-bold text-blue-900">src="..."</code> attribute.
                </p>
              </div>
              {errors.mapEmbedUrl && <p className="text-red-500 text-[10px] font-bold">{errors.mapEmbedUrl.message}</p>}
            </div>

            {formValues.mapEmbedUrl && (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                <iframe
                  src={formValues.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm">
                  Live Preview
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
