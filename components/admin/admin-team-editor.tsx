'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  onTeamMembersChange,
  uploadImage,
} from '@/lib/firebaseService';
import { TeamMember } from '@/lib/types';
import { toast } from 'sonner';
import { Trash2, Globe, Eye } from 'lucide-react';

const teamSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  position: z.string().min(2, 'Position is required'),
  bio: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

type TeamFormData = z.infer<typeof teamSchema>;

export default function AdminTeamEditor() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lastPublished, setLastPublished] = useState<Date | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
  });

  useEffect(() => {
    const unsubscribe = onTeamMembersChange((updatedMembers) => {
      setMembers(updatedMembers);
      setIsLoading(false);
    });

    return () => unsubscribe?.();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImage(file, `team/${Date.now()}`);
      setSelectedImage(url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const onSubmit = async (data: TeamFormData) => {
    setIsSaving(true);
    try {
      const memberData = {
        ...data,
        image: selectedImage || (editingId ? members.find((m) => m.id === editingId)?.image : undefined),
      };

      if (editingId) {
        await updateTeamMember(editingId, memberData);
        toast.success('Team member updated and published! Changes are live on the team page.');
      } else {
        await addTeamMember(memberData);
        toast.success('Team member added and published! Visible on the team page.');
      }

      setLastPublished(new Date());
      reset();
      setSelectedImage(null);
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to publish team member');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingId(member.id!);
    setSelectedImage(member.image || null);
    reset({
      name: member.name,
      position: member.position,
      bio: member.bio,
      email: member.email,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this team member?')) {
      try {
        await deleteTeamMember(id);
        toast.success('Team member deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete team member');
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
          {editingId ? 'Edit Team Member' : 'Add New Team Member'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Profile Image
            </label>
            {selectedImage && (
              <div className="mb-4">
                <img
                  src={selectedImage}
                  alt="Team member"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              {...register('name')}
              className="w-full"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-900 mb-1">
              Position
            </label>
            <Input
              id="position"
              type="text"
              placeholder="e.g., Senior Electrician"
              {...register('position')}
              className="w-full"
            />
            {errors.position && (
              <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-900 mb-1">
              Bio (Optional)
            </label>
            <Textarea
              id="bio"
              placeholder="Brief bio..."
              {...register('bio')}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
              Email (Optional)
            </label>
            <Input
              id="email"
              type="email"
              placeholder="john@greenlandpower.com"
              {...register('email')}
              className="w-full"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
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

      {/* Team Members List */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
            <p className="text-sm text-gray-500 mt-1">
              {members.length} team member{members.length !== 1 ? 's' : ''} live on the team page
            </p>
          </div>
          <a
            href="/team"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Team Page
          </a>
        </div>

        {members.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No team members yet</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex gap-4">
                  {member.image && (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{member.name}</h3>
                    <p className="text-gray-600 text-sm">{member.position}</p>
                    {member.bio && <p className="text-gray-600 text-xs mt-1">{member.bio}</p>}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="text-green-600 text-xs hover:underline"
                      >
                        {member.email}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleEdit(member)}
                    variant="outline"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(member.id!)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
