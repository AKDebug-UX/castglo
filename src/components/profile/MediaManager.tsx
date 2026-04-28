import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Camera, Video, Plus, X, Loader2, Lock } from 'lucide-react';
import './MediaManager.css';

export const MediaManager: React.FC = () => {
  const { profile, isSaving } = useProfile();
  const [uploading, setUploading] = useState<string | null>(null);

  const headshots = profile?.media?.additionalPhotos || [];
  const showreel = profile?.media?.showreel;
  const isPremium = profile?.subscriptionStatus === 'active';

  const handleUpload = (type: 'headshot' | 'showreel') => {
    // Simulated upload trigger
    setUploading(type);
    setTimeout(() => setUploading(null), 2000);
  };

  return (
    <div className="media-manager">
      <section className="media-section glass-card">
        <div className="section-header">
          <h3 className="section-title"><Camera size={20} /> Headshots</h3>
          <span className="media-count">{headshots.length} / {isPremium ? 'Unlimited' : '2'}</span>
        </div>
        
        <div className="media-grid">
          {headshots.map((photo: any) => (
            <div key={photo._id} className="media-item">
              <img src={photo.url} alt="Headshot" />
              <button className="delete-media-btn"><X size={14} /></button>
            </div>
          ))}
          
          {(isPremium || headshots.length < 2) ? (
            <button className="upload-placeholder" onClick={() => handleUpload('headshot')}>
              {uploading === 'headshot' ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
              <span>Add Photo</span>
            </button>
          ) : (
            <div className="locked-placeholder">
              <Lock size={24} />
              <span>Upgrade to Pro</span>
            </div>
          )}
        </div>
      </section>

      <section className="media-section glass-card">
        <h3 className="section-title"><Video size={20} /> Showreel</h3>
        {showreel ? (
          <div className="showreel-preview">
            <video src={showreel.url} controls />
            <button className="btn-premium glass-blur mt-4">Replace Showreel</button>
          </div>
        ) : (
          <div className="upload-area" onClick={() => handleUpload('showreel')}>
            {uploading === 'showreel' ? (
              <div className="upload-progress-container">
                <Loader2 className="animate-spin" size={32} />
                <p>Uploading High-Quality Video...</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '45%' }} />
                </div>
              </div>
            ) : (
              <>
                <Video size={48} color="var(--accent-gold)" />
                <p>Drag and drop your showreel (MP4, MOV)</p>
                <button className="btn-premium">Select File</button>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
