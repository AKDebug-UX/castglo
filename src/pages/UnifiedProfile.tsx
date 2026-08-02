import React from 'react';
import { useParams } from 'react-router-dom';
import { ProfileProvider, useProfile } from '@/contexts/ProfileContext';
import { ProfileLayout } from '@/components/profile/ProfileLayout';
import { TalentView } from '@/components/profile/TalentView';
import { ProfessionalView } from '@/components/profile/ProfessionalView';
import { CastingView } from '@/components/profile/CastingView';
import { MediaManager } from '@/components/profile/MediaManager';
import { ProfileEditDashboard } from '@/components/profile/ProfileEditDashboard';
import { DeliverableHistoryTab } from '@/components/deliverable-history/DeliverableHistoryTab';

const UnifiedProfileContent: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { profile, isEditMode } = useProfile();
  
  if (isEditMode) {
    return <ProfileEditDashboard />;
  }

  if (activeTab === 'media') {
    return <MediaManager />;
  }

  if (activeTab === 'deliverables') {
    return <DeliverableHistoryTab userId={profile?.userId || ''} userName={profile?.fullName} />;
  }

  const role = profile?.userRole || 'talent';

  switch (role) {
    case 'talent':
      return <TalentView />;
    case 'industry_professional':
      return <ProfessionalView />;
    case 'casting_director':
      return <CastingView />;
    default:
      return <TalentView />;
  }
};

const UnifiedProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <ProfileProvider userId={id}>
      <ProfileLayout>
        {(activeTab) => <UnifiedProfileContent activeTab={activeTab} />}
      </ProfileLayout>
    </ProfileProvider>
  );
};

export default UnifiedProfile;
