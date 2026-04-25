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
import { Trash2, Plus, Globe, Pencil, User, Mail, Cloud, Camera } from 'lucide-react';

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
  const [uploadMethod, setUploadMethod] = useState<'firebase' | 'blob'>('blob');

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
      toast.success('Profile picture uploaded!');
    } catch (error: any) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (data: TeamFormData) => {
    if (!selectedImage && !editingId) {
      toast.error('Please upload a profile picture');
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
        toast.success('Team member updated!');
      } else {
        await addTeamMember(memberData);
        toast.success('Team member added!');
      }

      setIsModalOpen(false);
      reset();
      setSelectedImage(null);
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
    setSelectedImage(member.image);
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
        toast.success('Team member removed');
      } catch (error) {
        toast.error('Failed to delete team member');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading team...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Introduce the professionals behind Green Land Power
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-green-600 hover:bg-green-700 text-white font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Team Member
        </Button>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">No team members yet</h3>
            <p className="text-gray-500 mt-1 mb-6">Start building your company profile</p>
            <Button onClick={handleAdd} variant="outline" className="border-green-600 text-green-600">
              Add First Member
            </Button>
          </div>
        ) : (
          team.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group"
            >
              <div className="relative h-40 bg-gradient-to-br from-green-500 to-green-700 p-6 flex justify-center">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur rounded-md text-white transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id!)}
                    className="p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur rounded-md text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100 mt-8 shadow-lg">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 pt-12 text-center">
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-green-600 text-xs font-bold uppercase tracking-wider mb-3">
                  {member.position}
                </p>
                <div className="flex items-center justify-center gap-2 text-gray-400 text-xs mb-4">
                  <Mail className="w-3 h-3" />
                  {member.email}
                </div>
                <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
                  {member.bio}
                </p>
                <Button
                  onClick={() => handleEdit(member)}
                  variant="ghost"
                  className="w-full mt-4 text-green-600 hover:text-green-700 hover:bg-green-50 font-bold"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit/Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingId ? 'Edit Team Member' : 'Add Team Member'}
            </DialogTitle>
            <DialogDescription>
              Enter the professional details and upload a profile picture.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                {selectedImage ? (
                  <>
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Camera className="w-6 h-6 text-white" />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                    <User className="w-8 h-8 text-gray-300 mb-1" />
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 p-1 bg-gray-100 rounded-md">
                <button
                  type="button"
                  onClick={() => setUploadMethod('blob')}
                  className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                    uploadMethod === 'blob' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  BLOB
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('firebase')}
                  className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${
                    uploadMethod === 'firebase' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  FIREBASE
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label>
                <Input {...register('name')} placeholder="e.g., James Wilson" className="bg-gray-50" />
                {errors.name && <p className="text-red-500 text-[10px]">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Position</label>
                <Input {...register('position')} placeholder="e.g., Chief Engineer" className="bg-gray-50" />
                {errors.position && <p className="text-red-500 text-[10px]">{errors.position.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Email Address</label>
                <Input {...register('email')} placeholder="email@greenlandpower.com" className="bg-gray-50" />
                {errors.email && <p className="text-red-500 text-[10px]">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Professional Bio</label>
                <Textarea {...register('bio')} rows={3} placeholder="Write a short professional summary..." className="bg-gray-50 resize-none" />
                {errors.bio && <p className="text-red-500 text-[10px]">{errors.bio.message}</p>}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-bold">
                {isSaving ? 'Saving...' : editingId ? 'Update Member' : 'Add Member'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
