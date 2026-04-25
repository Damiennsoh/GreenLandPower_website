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
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  onTeamMembersChange,
  uploadImage,
} from '@/lib/firebaseService';
import { uploadPortfolioImageToBlob } from '@/lib/blobService';
import { TeamMember } from '@/lib/types';
import { toast } from 'sonner';
import { Trash2, Plus, Globe, Pencil, User, Mail, Cloud, Camera, X, CheckCircle, Link as LinkIcon } from 'lucide-react';

const teamSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  position: z.string().min(3, 'Position is required'),
  bio: z.string().min(10, 'Bio is required'),
  email: z.string().email('Valid email is required'),
});

type TeamFormData = z.infer<typeof teamSchema>;

export default function AdminTeamEditor() {
  const [team, setTeam] = useState<TeamMember[]>([]);
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
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
  });

  useEffect(() => {
    const unsubscribe = onTeamMembersChange((updatedTeam) => {
      setTeam(updatedTeam);
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
        url = await uploadImage(file, `team/${Date.now()}`);
      }
      setSelectedImage(url);
      setManualUrl(url);
      toast.success('Profile picture attached!');
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

  const onSubmit = async (data: TeamFormData) => {
    if (!selectedImage && !editingId) {
      toast.error('Please attach a profile picture before saving');
      return;
    }

    setIsSaving(true);
    try {
      const existingImage = editingId ? team.find((t) => t.id === editingId)?.image : '';
      const memberData = {
        ...data,
        image: selectedImage || existingImage || '',
      };

      if (editingId) {
        await updateTeamMember(editingId, memberData);
        toast.success('Team member updated live!');
      } else {
        await addTeamMember(memberData);
        toast.success('New team member published live!');
      }

      setIsModalOpen(false);
      reset();
      setSelectedImage(null);
      setManualUrl('');
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to save team member');
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
      bio: '',
      email: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingId(member.id!);
    setSelectedImage(member.image || null);
    setManualUrl(member.image || '');
    reset({
      name: member.name,
      position: member.position,
      bio: member.bio,
      email: member.email,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this team member?')) {
      try {
        await deleteTeamMember(id);
        toast.success('Team member removed from directory');
      } catch (error) {
        toast.error('Failed to delete team member');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500">Loading team directory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage the profiles of your staff members.</p>
        </div>
        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Team Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => (
          <div key={member.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="relative h-40 bg-gradient-to-br from-green-500 to-green-700 p-6 flex justify-center">
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(member)} className="p-1.5 bg-white shadow-sm rounded text-gray-600 hover:text-green-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(member.id!)} className="p-1.5 bg-red-600 text-white shadow-sm rounded hover:bg-red-700"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100 mt-8 shadow-lg">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="p-6 pt-12 text-center">
              <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
              <p className="text-green-600 text-xs font-bold uppercase tracking-wider mb-3">{member.position}</p>
              <Button variant="ghost" size="sm" onClick={() => handleEdit(member)} className="w-full mt-4 text-green-600 font-bold border border-green-50">Edit Profile</Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{editingId ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
            <DialogDescription>Profile picture and professional details.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 px-6 py-4 space-y-6 overflow-y-auto">
            {/* Image Source Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Profile Photo</label>
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
                <button type="button" onClick={() => setUploadMethod('blob')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${uploadMethod === 'blob' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Blob</button>
                <button type="button" onClick={() => setUploadMethod('firebase')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${uploadMethod === 'firebase' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>Firebase</button>
                <button type="button" onClick={() => setUploadMethod('manual')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${uploadMethod === 'manual' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}>Manual</button>
              </div>

              {uploadMethod !== 'manual' ? (
                <div className="relative w-32 h-32 mx-auto rounded-full border-2 border-dashed border-gray-200 overflow-hidden flex flex-col items-center justify-center bg-gray-50 hover:border-green-400 transition-colors">
                  {selectedImage ? (
                    <>
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center">
                        <label className="cursor-pointer bg-white p-2 rounded-full"><Camera className="w-5 h-5"/><input type="file" onChange={handleImageUpload} className="hidden" /></label>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center w-full"><User className="w-8 h-8 text-gray-300"/><input type="file" onChange={handleImageUpload} className="hidden" /></label>
                  )}
                  {isUploadingImage && <div className="absolute inset-0 bg-white/90 flex items-center justify-center"><div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} placeholder="/images/team/member.jpg" />
                    <Button type="button" onClick={handleManualUrlSubmit} className="bg-emerald-600">Attach</Button>
                  </div>
                  {selectedImage && uploadMethod === 'manual' && <img src={selectedImage} className="mx-auto w-24 h-24 rounded-full object-cover border" />}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Full Name</label><Input {...register('name')} /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Position</label><Input {...register('position')} /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Email</label><Input {...register('email')} /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold uppercase text-gray-400">Bio</label><Textarea {...register('bio')} rows={3} /></div>
              <div className="flex gap-2 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={isSaving} className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-black">{isSaving ? 'Saving...' : 'Publish Live'}</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
