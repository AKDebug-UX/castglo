import React from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Film, Users, Building, Send, Plus } from 'lucide-react';
import './CastingView.css';

export const CastingView: React.FC = () => {
  const { profile } = useProfile();
  const casting = profile?.castingProfile;

  return (
    <div className="casting-view-grid">
      <div className="casting-main-col">
        <section className="casting-section glass-card">
          <h3 className="section-title"><Building size={20} /> Company Identity</h3>
          <div className="company-details">
            <h4 className="company-name">{casting?.companyName || "Independent Casting Director"}</h4>
            <p className="bio-text">
              {profile?.bio || "Premier casting services for film and television. Specialized in discovering emerging talent."}
            </p>
          </div>
        </section>

        <section className="casting-section glass-card">
          <div className="section-header">
            <h3 className="section-title"><Film size={20} /> Active Projects</h3>
            <button className="btn-premium btn-small"><Plus size={16} /> New Casting</button>
          </div>
          <div className="projects-list">
            {[1, 2].map((i) => (
              <div key={i} className="project-card glass-blur">
                <div className="project-info">
                  <h5>Feature Film: Untitled Drama {i}</h5>
                  <span className="project-meta">Posted 2 days ago • 12 Applications</span>
                </div>
                <button className="icon-btn-glass"><Send size={16} /></button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="casting-side-col">
        <section className="casting-section glass-card">
          <h3 className="section-title"><Users size={20} /> Hiring Preferences</h3>
          <div className="preferences-list">
            <div className="pref-item">
              <span className="pref-label">Experience Level</span>
              <span className="pref-value">{casting?.experienceLevel || 'All Levels'}</span>
            </div>
            <div className="pref-item">
              <span className="pref-label">Response Time</span>
              <span className="pref-value">{casting?.responseTime || 'Within 48 hours'}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
