import React from 'react';
import { UnifiedProfileHeader } from './UnifiedProfileHeader';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import './ProfileLayout.css';

interface ProfileLayoutProps {
  children: (activeTab: string) => React.ReactNode;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  const { profile, isLoading, isError, isEditMode, setEditMode } = useProfile();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = React.useState('overview');

  const isOwnProfile = profile?.userId === authUser?.id;

  if (isLoading) {
    return (
      <div className="profile-loading">
        <Loader2 className="animate-spin" size={48} color="var(--accent-gold)" />
        <p>Loading Premium Profile...</p>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="profile-error glass-card">
        <AlertCircle size={48} color="var(--destructive)" />
        <h2>Profile Not Found</h2>
        <p>The profile you're looking for might have been moved or deleted.</p>
        <button className="btn-premium" onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="profile-layout-root">
      <div className="profile-container">
        <UnifiedProfileHeader 
          user={{
            fullName: profile.fullName || profile.displayName || "Unknown User",
            role: profile.userRole || "talent",
            profilePicture: profile.profilePicture || profile.avatar,
            coverImage: profile.media?.coverImage?.url,
            isVerified: profile.isVerified,
            location: profile.location,
            headline: profile.headline,
            completionPercentage: profile.profileCompletion
          }} 
          isOwnProfile={isOwnProfile}
        />

        <nav className="profile-nav glass-card glass-blur">
          <div className="nav-links">
            <button 
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`nav-link ${activeTab === 'media' ? 'active' : ''}`}
              onClick={() => setActiveTab('media')}
            >
              Media
            </button>
            <button 
              className={`nav-link ${activeTab === 'deliverables' ? 'active' : ''}`}
              onClick={() => setActiveTab('deliverables')}
            >
              Deliverable History
            </button>
            <button 
              className={`nav-link ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              Portfolio
            </button>
          </div>
          
          {isOwnProfile && (
            <button 
              className={`edit-toggle-btn ${isEditMode ? 'active' : ''}`}
              onClick={() => setEditMode(!isEditMode)}
            >
              {isEditMode ? 'View Public Profile' : 'Edit Profile'}
            </button>
          )}
        </nav>

        <main className="profile-main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={isEditMode ? 'edit' : activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              {isEditMode ? null : children(activeTab)}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
