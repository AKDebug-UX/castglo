import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, MapPin, Briefcase, Camera, MoreHorizontal } from 'lucide-react';
import './UnifiedProfileHeader.css';

interface ProfileHeaderProps {
  user: {
    fullName: string;
    role: string;
    profilePicture?: string;
    coverImage?: string;
    isVerified?: boolean;
    location?: {
      city: string;
      country: string;
    };
    headline?: string;
    completionPercentage?: number;
  };
  isOwnProfile?: boolean;
}

export const UnifiedProfileHeader: React.FC<ProfileHeaderProps> = ({ user, isOwnProfile }) => {
  return (
    <motion.header 
      className="profile-header glass-card"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="cover-container">
        <img 
          src={user.coverImage || 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=2070'} 
          alt="Cover" 
          className="cover-image"
        />
        {isOwnProfile && (
          <button className="edit-cover-btn btn-premium glass-blur">
            <Camera size={18} />
            <span>Update Cover</span>
          </button>
        )}
      </div>

      <div className="header-content">
        <div className="avatar-section">
          <div className="avatar-wrapper">
            <img 
              src={user.profilePicture || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=1000'} 
              alt={user.fullName} 
              className="profile-avatar"
            />
            {user.isVerified && (
              <div className="verified-badge-floating">
                <CheckCircle size={20} fill="var(--accent-blue)" color="white" />
              </div>
            )}
          </div>
          
          <div className="user-info">
            <div className="name-row">
              <h1 className="user-name premium-gradient-text">{user.fullName}</h1>
              <span className={`role-badge ${user.role}`}>
                {user.role.replace('_', ' ')}
              </span>
            </div>
            
            <p className="user-headline">{user.headline || 'Professional Actor & Voice Talent'}</p>
            
            <div className="meta-info">
              <span className="meta-item">
                <MapPin size={16} />
                {user.location?.city}, {user.location?.country}
              </span>
              <span className="meta-item">
                <Briefcase size={16} />
                Member since 2024
              </span>
            </div>
          </div>
        </div>

        <div className="action-section">
          {isOwnProfile ? (
            <div className="stats-group glass-card">
              <div className="stat-item">
                <span className="stat-value">{user.completionPercentage || 0}%</span>
                <span className="stat-label">Completion</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-value">24</span>
                <span className="stat-label">Applications</span>
              </div>
            </div>
          ) : (
            <div className="visitor-actions">
              <button className="btn-premium">Connect</button>
              <button className="btn-premium glass-blur">Message</button>
              <button className="icon-btn-glass"><MoreHorizontal size={20} /></button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};
