import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileContextType {
  profile: any;
  isLoading: boolean;
  isError: boolean;
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;
  updateProfile: (data: any) => Promise<void>;
  isSaving: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode, userId?: string }> = ({ children, userId }) => {
  const { user: authUser } = useAuth();
  const [isEditMode, setEditMode] = useState(false);
  const queryClient = useQueryClient();

  // If no userId is provided, we're viewing/editing our own profile
  const targetId = userId || authUser?.id;
  const isOwnProfile = !userId || userId === authUser?.id;

  const { data: profileResponse, isLoading, isError } = useQuery({
    queryKey: ['profile', targetId],
    queryFn: () => isOwnProfile ? profileAPI.getMe() : profileAPI.getPublic(targetId!),
    enabled: !!targetId,
  });

  const profile = profileResponse?.data?.data;

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      const role = profile?.userRole || authUser?.role;
      if (role === 'talent') return profileAPI.updateTalent(data);
      if (role === 'industry_professional') return profileAPI.updateProfessional(data);
      if (role === 'casting_director') return profileAPI.updateCasting(data);
      return profileAPI.updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', targetId] });
      setEditMode(false);
    },
  });

  const updateProfile = async (data: any) => {
    await updateMutation.mutateAsync(data);
  };

  return (
    <ProfileContext.Provider value={{
      profile,
      isLoading,
      isError,
      isEditMode,
      setEditMode,
      updateProfile,
      isSaving: updateMutation.isPending,
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
