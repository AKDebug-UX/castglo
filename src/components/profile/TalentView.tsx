import React from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Play, User, Ruler, Star, ExternalLink, Calendar } from 'lucide-react';
import './TalentView.css';

export const TalentView: React.FC = () => {
  const { profile } = useProfile();
  const talent = profile?.talentProfile;
  const appearance = talent?.appearance;

  return (
    <div className="talent-view-grid">
      {/* Left Column: Bio & Attributes */}
      <div className="talent-info-col">
        <section className="talent-section glass-card">
          <h3 className="section-title"><User size={20} /> Professional Bio</h3>
          <p className="bio-text">
            {profile?.bio || "Experienced talent ready for new opportunities. Specialized in dramatic performance and voice work."}
          </p>
        </section>

        <section className="talent-section glass-card">
          <h3 className="section-title"><Ruler size={20} /> Physical Attributes</h3>
          <div className="attributes-grid">
            <div className="attr-item">
              <span className="attr-label">Height</span>
              <span className="attr-value">{appearance?.height ? `${appearance.height}cm` : '175cm'}</span>
            </div>
            <div className="attr-item">
              <span className="attr-label">Eye Color</span>
              <span className="attr-value">{appearance?.eyeColour || 'Brown'}</span>
            </div>
            <div className="attr-item">
              <span className="attr-label">Hair Color</span>
              <span className="attr-value">{appearance?.hairColour || 'Dark Brown'}</span>
            </div>
            <div className="attr-item">
              <span className="attr-label">Build</span>
              <span className="attr-value">{appearance?.build || 'Athletic'}</span>
            </div>
          </div>
        </section>

        <section className="talent-section glass-card">
          <h3 className="section-title"><Calendar size={20} /> Availability</h3>
          <div className="availability-tag">
            <div className="status-dot online" />
            <span>Currently Available for {talent?.availability?.availabilityType || 'Short-term Projects'}</span>
          </div>
        </section>
      </div>

      {/* Right Column: Portfolio & Showreel */}
      <div className="talent-media-col">
        <section className="talent-section glass-card showreel-section">
          <h3 className="section-title"><Play size={20} /> Showreel</h3>
          <div className="video-placeholder">
            <Play size={48} className="play-icon" />
            <span className="video-time">02:45</span>
          </div>
        </section>

        <section className="talent-section glass-card portfolio-section">
          <div className="section-header">
            <h3 className="section-title"><Star size={20} /> Portfolio</h3>
            <button className="view-all-link">View All <ExternalLink size={14} /></button>
          </div>
          <div className="portfolio-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="portfolio-thumb">
                <img 
                  src={`https://images.unsplash.com/photo-15${i}39571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300`} 
                  alt="Portfolio" 
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
