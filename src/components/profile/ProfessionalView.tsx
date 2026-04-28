import React from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { Briefcase, Tool, Award, Heart, ShieldCheck, Mail } from 'lucide-react';
import './ProfessionalView.css';

export const ProfessionalView: React.FC = () => {
  const { profile } = useProfile();
  const professional = profile?.professionalProfile;

  return (
    <div className="professional-view-grid">
      <div className="professional-main-col">
        <section className="professional-section glass-card">
          <h3 className="section-title"><Briefcase size={20} /> Professional Services</h3>
          <p className="bio-text">
            {profile?.bio || "Expert industry services specializing in talent management and production support."}
          </p>
          <div className="services-tags">
            {professional?.servesClientTypes?.map((type: string) => (
              <span key={type} className="service-tag">{type.replace('_', ' ')}</span>
            )) || <span className="service-tag">Production Support</span>}
          </div>
        </section>

        <section className="professional-section glass-card">
          <h3 className="section-title"><Tool size={20} /> Skills & Expertise</h3>
          <div className="skills-grid">
            {professional?.coreSkills?.map((skill: string) => (
              <div key={skill} className="skill-item">
                <ShieldCheck size={16} color="var(--accent-blue)" />
                <span>{skill}</span>
              </div>
            )) || ['Photography', 'Lighting Design', 'Digital Retouching'].map(s => (
              <div key={s} className="skill-item">
                <ShieldCheck size={16} color="var(--accent-blue)" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="professional-side-col">
        <section className="professional-section glass-card trust-section">
          <h3 className="section-title"><Award size={20} /> Trust & Safety</h3>
          <div className="trust-badges">
            <div className="trust-badge">
              <ShieldCheck size={20} />
              <span>DBS Checked</span>
            </div>
            <div className="trust-badge">
              <Heart size={20} />
              <span>NDA Friendly</span>
            </div>
          </div>
        </section>

        <section className="professional-section glass-card contact-section">
          <h3 className="section-title"><Mail size={20} /> Booking</h3>
          <p className="contact-note">Preferred Method: {professional?.preferredContactMethod || 'Email'}</p>
          <button className="btn-premium w-full">Request Quote</button>
        </section>
      </div>
    </div>
  );
};
