import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProfile } from '@/contexts/ProfileContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Save, User, MapPin, Globe, Shield, Loader2, Settings, Briefcase, Camera } from 'lucide-react';
import './ProfileEditDashboard.css';

const profileSchema = z.object({
  // Base Profile (User/Profile)
  fullName: z.string().min(2, 'Name is too short'),
  bio: z.string().max(1000, 'Bio is too long').optional().or(z.literal('')),
  city: z.string().optional(),
  country: z.string().optional(),

  // Talent Fields
  rightToWork: z.boolean().default(false),
  validPassport: z.boolean().default(false),
  willingToTravel: z.boolean().default(false),
  internationalAvailability: z.boolean().default(false),
  openToAppearanceChanges: z.boolean().default(false),
  visibleTattoosPiercings: z.enum(['yes', 'no', 'sometimes']).default('no'),

  // Professional Fields
  displayName: z.string().optional(),
  businessName: z.string().optional(),
  yearsOfExperience: z.number().min(0, 'Years of experience cannot be negative').default(0),
  studioAccess: z.boolean().default(false),
  insuranceAvailable: z.boolean().default(false),
  dbsChecked: z.boolean().default(false),
  ndaFriendly: z.boolean().default(false),
  depositRequired: z.boolean().default(false),
  depositPercentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100').default(0),

  // Casting Fields
  companyName: z.string().optional(),
  professionalTitle: z.string().optional(),
  shortBio: z.string().optional(),
  fullAbout: z.string().optional(),

  // Guardian Consent
  guardianConsent: z.object({
    guardianName: z.string().optional(),
    relationship: z.string().optional(),
    guardianContact: z.string().optional(),
    consentGiven: z.boolean().default(false),
  }).optional(),
  emergencyContact: z.object({
    fullName: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileEditDashboard: React.FC = () => {
  const { profile, updateProfile, isSaving } = useProfile();
  const [activeTab, setActiveTab] = useState('basic');

  const { register, handleSubmit, formState: { errors, isDirty }, watch, setValue } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.fullName || '',
      bio: profile?.bio || profile?.shortBio || '',
      city: profile?.location?.city || profile?.city || '',
      country: profile?.location?.country || profile?.country || '',

      // Talent
      rightToWork: !!profile?.talentProfile?.rightToWork,
      validPassport: !!profile?.talentProfile?.validPassport,
      willingToTravel: !!profile?.talentProfile?.willingToTravel,
      internationalAvailability: !!profile?.talentProfile?.internationalAvailability,
      openToAppearanceChanges: !!profile?.talentProfile?.appearance?.openToAppearanceChanges,
      visibleTattoosPiercings: profile?.talentProfile?.appearance?.visibleTattoosPiercings || 'no',

      // Professional
      displayName: profile?.professionalProfile?.displayName || profile?.fullName || '',
      businessName: profile?.professionalProfile?.businessName || '',
      yearsOfExperience: Number(profile?.professionalProfile?.yearsOfExperience) || 0,
      studioAccess: !!profile?.professionalProfile?.studioAccess,
      insuranceAvailable: !!profile?.professionalProfile?.insuranceAvailable,
      dbsChecked: !!profile?.professionalProfile?.dbsChecked,
      ndaFriendly: !!profile?.professionalProfile?.ndaFriendly,
      depositRequired: !!profile?.professionalProfile?.depositRequired,
      depositPercentage: profile?.professionalProfile?.depositPercentage || 0,

      // Casting
      companyName: profile?.castingProfile?.companyName || '',
      professionalTitle: profile?.castingProfile?.professionalTitle || '',
      shortBio: profile?.castingProfile?.shortBio || profile?.bio || '',
      fullAbout: profile?.castingProfile?.fullAbout || profile?.bio || '',

      // Guardian
      guardianConsent: {
        fullName: profile?.talentProfile?.guardianConsent?.fullName || '',
        relationship: profile?.talentProfile?.guardianConsent?.relationship || '',
        email: profile?.talentProfile?.guardianConsent?.email || '',
        phone: profile?.talentProfile?.guardianConsent?.phone || '',
        consentGiven: !!profile?.talentProfile?.guardianConsent?.consentGiven,
      },
      emergencyContact: {
        fullName: profile?.talentProfile?.emergencyContact?.fullName || '',
        relationship: profile?.talentProfile?.emergencyContact?.relationship || '',
        phone: profile?.talentProfile?.emergencyContact?.phone || '',
      }
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    const role = profile?.userRole || 'talent';
    let payload: any = {};

    if (role === 'talent') {
      payload = {
        rightToWork: values.rightToWork,
        validPassport: values.validPassport,
        willingToTravel: values.willingToTravel,
        internationalAvailability: values.internationalAvailability,
        appearance: {
          visibleTattoosPiercings: values.visibleTattoosPiercings,
          openToAppearanceChanges: values.openToAppearanceChanges,
        },
        guardianConsent: values.guardianConsent,
        emergencyContact: values.emergencyContact,
        remoteWorkOpen: values.remoteWorkOpen
      };
    } else if (role === 'industry_professional') {
      payload = {
        displayName: values.displayName || values.fullName,
        businessName: values.businessName,
        yearsOfExperience: values.yearsOfExperience,
        studioAccess: values.studioAccess,
        insuranceAvailable: values.insuranceAvailable,
        dbsChecked: values.dbsChecked,
        ndaFriendly: values.ndaFriendly,
        depositRequired: values.depositRequired,
        depositPercentage: values.depositPercentage
      };
    } else if (role === 'casting_director') {
      payload = {
        fullName: values.fullName,
        companyName: values.companyName,
        professionalTitle: values.professionalTitle,
        shortBio: values.shortBio || values.bio,
        fullAbout: values.fullAbout || values.bio,
        city: values.city,
        country: values.country,
      };
    }

    await updateProfile(payload);
  };

  return (
    <div className="edit-dashboard glass-card">
      <div className="edit-sidebar">
        <button
          type="button"
          className={`edit-tab-link ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          <User size={18} /> Basic Info
        </button>
        <button
          type="button"
          className={`edit-tab-link ${activeTab === 'professional' ? 'active' : ''}`}
          onClick={() => setActiveTab('professional')}
        >
          <Briefcase size={18} /> Role Details
        </button>
        <button
          type="button"
          className={`edit-tab-link ${activeTab === 'guardian' ? 'active' : ''}`}
          onClick={() => setActiveTab('guardian')}
        >
          <Shield size={18} /> Guardian
        </button>
        <button
          type="button"
          className={`edit-tab-link ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} /> Settings
        </button>
      </div>

      <form className="edit-form-content" onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {activeTab === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="form-section"
            >
              <h3 className="form-section-title">Core Identity</h3>
              <div className="input-group">
                <label>Full Name</label>
                <input {...register('fullName')} className={errors.fullName ? 'error' : ''} />
              </div>
              <div className="input-group">
                <label>Professional Bio</label>
                <textarea {...register('bio')} rows={4} placeholder="Tell the world about your expertise..." />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>City</label>
                  <input {...register('city')} />
                </div>
                <div className="input-group">
                  <label>Country</label>
                  <input {...register('country')} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'professional' && (
            <motion.div
              key="professional"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="form-section"
            >
              <h3 className="form-section-title">Role-Specific Details</h3>

              <div className="toggle-grid">
                {profile?.userRole === 'talent' && (
                  <>
                    <div className="toggle-item">
                      <div className="toggle-label">
                        <span>Right to Work</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" {...register('rightToWork')} />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-label">
                        <span>International Availability</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" {...register('internationalAvailability')} />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <div className="input-group mt-4">
                      <label>Visible Tattoos / Piercings</label>
                      <select {...register('visibleTattoosPiercings')}>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                        <option value="sometimes">Sometimes</option>
                      </select>
                    </div>
                  </>
                )}

                {profile?.userRole === 'industry_professional' && (
                  <>
                    <div className="input-group">
                      <label>Business / Agency Name</label>
                      <input {...register('businessName')} />
                    </div>
                    <div className="input-group">
                      <label>Years of Experience</label>
                      <input type="number" {...register('yearsOfExperience', { valueAsNumber: true })} />
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-label">
                        <span>Studio Access</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" {...register('studioAccess')} />
                        <span className="slider round"></span>
                      </label>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-label">
                        <span>DBS Checked</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" {...register('dbsChecked')} />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </>
                )}

                {profile?.userRole === 'casting_director' && (
                  <>
                    <div className="input-group">
                      <label>Company Name</label>
                      <input {...register('companyName')} />
                    </div>
                    <div className="input-group">
                      <label>Professional Title</label>
                      <input {...register('professionalTitle')} />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'guardian' && (
            <motion.div
              key="guardian"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="form-section"
            >
              <h3 className="form-section-title">Guardian & Consent</h3>
              <p className="section-note">Ensuring safety and legal compliance for younger talent.</p>

              <div className="input-group">
                <label>Guardian Full Name</label>
                <input {...register('guardianConsent.guardianName')} />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Relationship</label>
                  <input {...register('guardianConsent.relationship')} />
                </div>
                <div className="input-group">
                  <label>Guardian Contact Info</label>
                  <input {...register('guardianConsent.guardianContact')} placeholder="Email or Phone" />
                </div>
              </div>

              <div className="toggle-item mt-6">
                <div className="toggle-label">
                  <span>Consent Granted</span>
                  <p className="toggle-desc">I confirm legal guardianship</p>
                </div>
                <label className="switch">
                  <input type="checkbox" {...register('guardianConsent.consentGiven')} />
                  <span className="slider round"></span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="form-footer">
          <button
            type="submit"
            className="btn-premium btn-gold"
            disabled={!isDirty || isSaving}
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
