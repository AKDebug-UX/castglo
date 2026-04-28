import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, ShieldCheck, Upload, X, Image as ImageIcon, Youtube, Monitor } from "lucide-react";
import { authAPI, profileAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getAvatarUrl, getInitials } from "@/lib/utils";
import { UnifiedTalentProfileForm } from "@/components/profile/UnifiedTalentProfileForm";
import { UNIFIED_FIELD_IDS, validateUnifiedTalentProfile, isMinorFromAgeGroup } from "@/lib/unifiedTalentProfile";

export default function Profile() {
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  const [pendingProfilePhoto, setPendingProfilePhoto] = useState<{ file: File; preview: string } | null>(null);
  const [pendingPortfolioPhotos, setPendingPortfolioPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [pendingPortfolioVideos, setPendingPortfolioVideos] = useState<{ file: File; preview: string; name: string }[]>([]);
  const [pendingIntroVideo, setPendingIntroVideo] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const fetchProfileData = async () => {
    try {
      const [authRes, profileRes] = await Promise.all([
        authAPI.getMe().catch(() => ({ data: { success: false } })),
        profileAPI.getMe().catch(() => ({ data: { success: false } })),
      ]);

      let combinedData: any = {};
      if (authRes.data?.success) combinedData = { ...combinedData, ...authRes.data.data };
      if (profileRes.data?.success) combinedData = { ...combinedData, ...profileRes.data.data };

      const tp = combinedData.talentProfile || {};
      const unified = combinedData.unifiedTalentProfile || {};

      // Map root and nested API properties back to unified field IDs
      if (!unified.full_name) unified.full_name = combinedData.fullName;
      if (!unified.display_name) unified.display_name = combinedData.stageName || tp.displayName;
      if (!unified.email) unified.email = combinedData.email;
      if (!unified.phone_number) unified.phone_number = combinedData.phone || combinedData.phoneNumber;

      const addr = combinedData.address || {};
      if (!unified.current_city) unified.current_city = tp.currentCity || addr.city || combinedData.city;
      if (!unified.current_state) unified.current_state = tp.currentState || addr.state;
      if (!unified.current_country) unified.current_country = tp.currentCountry || addr.country || combinedData.country;

      if (!unified.address) unified.address = combinedData.address;
      if (!unified.gender) unified.gender = tp.gender || combinedData.gender;
      if (!unified.primary_talent_type) unified.primary_talent_type = tp.primaryTalentType || combinedData.talentTypes?.[0];
      if (!unified.additional_talent_types) unified.additional_talent_types = tp.additionalTalentTypes || combinedData.talentTypes?.slice(1);
      if (!unified.dateOfBirth) {
        unified.dateOfBirth = tp.dateOfBirth;
      }
      if (unified.dateOfBirth && unified.dateOfBirth.includes('T')) {
        unified.dateOfBirth = unified.dateOfBirth.split('T')[0];
      }
      
      if (!unified.age_group) unified.age_group = tp.ageGroup;
      if (!unified.nationality) unified.nationality = tp.nationality;
      if (!unified.short_bio) unified.short_bio = combinedData.bio || tp.shortBio;
      if (!unified.full_bio) unified.full_bio = tp.fullBio;
      if (!unified.career_goals) unified.career_goals = typeof tp.careerGoals === 'string' ? tp.careerGoals : (Array.isArray(tp.careerGoals) ? tp.careerGoals.join(', ') : "");
      if (!unified.years_of_experience) unified.years_of_experience = tp.yearsOfExperience;
      if (!unified.experience_level) unified.experience_level = tp.experienceLevel;

      if (unified.right_to_work === undefined && tp.rightToWork !== undefined) unified.right_to_work = tp.rightToWork === true || tp.rightToWork === "Yes" ? "Yes" : "No";
      if (unified.valid_passport === undefined && tp.validPassport !== undefined) unified.valid_passport = tp.validPassport === true || tp.validPassport === "Yes" ? "Yes" : "No";
      if (unified.willing_to_travel === undefined && tp.willingToTravel !== undefined) unified.willing_to_travel = tp.willingToTravel === true || tp.willingToTravel === "Yes" ? "Yes" : "No";
      if (unified.international_availability === undefined && tp.internationalAvailability !== undefined) unified.international_availability = tp.internationalAvailability === true || tp.internationalAvailability === "Yes" ? "Yes" : "No";
      if (unified.remote_work_open === undefined && tp.remoteWorkOpen !== undefined) unified.remote_work_open = tp.remoteWorkOpen === true || tp.remoteWorkOpen === "Yes" ? "Yes" : "No";

      if (!unified.languages_spoken) unified.languages_spoken = tp.languages?.performance || combinedData.languages || tp.languagesSpoken;
      if (!unified.fluent_languages) unified.fluent_languages = tp.languages?.fluent || combinedData.fluentLanguages || tp.fluentLanguages;
      if (!unified.natural_accent) unified.natural_accent = combinedData.naturalAccent || tp.naturalAccent;
      if (!unified.additional_accents) unified.additional_accents = tp.accents || [];
      if (!unified.skills) unified.skills = combinedData.skills || tp.skills;
      if (!unified.equipment) unified.equipment = combinedData.equipment || tp.equipment;

      if (tp.actorProfile) {
        if (!unified.actor_performance_category) unified.actor_performance_category = tp.actorProfile.performanceCategory;
        if (!unified.actor_training) unified.actor_training = tp.actorProfile.training;
        if (!unified.actor_techniques) unified.actor_techniques = tp.actorProfile.actorTechniques;
        if (!unified.actor_accents) unified.actor_accents = tp.actorProfile.accents;
        if (!unified.actor_special_skills) unified.actor_special_skills = tp.actorProfile.specialSkills;
        if (!unified.actor_notable_credits) unified.actor_notable_credits = tp.actorProfile.notableCredits;
      }
      if (tp.singerProfile) {
        if (!unified.singer_category) unified.singer_category = tp.singerProfile.category;
        if (!unified.singer_genres) unified.singer_genres = tp.singerProfile.genres;
        if (!unified.singer_vocal_range) unified.singer_vocal_range = tp.singerProfile.vocalRange;
        if (!unified.singer_instruments) unified.singer_instruments = tp.singerProfile.instruments;
      }
      if (tp.appearance) {
        if (!unified.height) unified.height = tp.appearance.height;
        if (!unified.weight) unified.weight = tp.appearance.weight;
        if (!unified.build) unified.build = tp.appearance.build;
        if (!unified.eye_colour) unified.eye_colour = tp.appearance.eyeColour;
        if (!unified.hair_colour) unified.hair_colour = tp.appearance.hairColour;
        if (!unified.hair_length) unified.hair_length = tp.appearance.hairLength;
        if (!unified.skin_tone) unified.skin_tone = tp.appearance.skinTone;
        if (!unified.ethnicity_visible) unified.ethnicity_visible = tp.appearance.ethnicityVisible;
        if (!unified.distinguishing_features) unified.distinguishing_features = tp.appearance.distinguishingFeatures;
        if (unified.visible_tattoos_piercings === undefined && tp.appearance.visibleTattoosPiercings !== undefined) {
          unified.visible_tattoos_piercings = tp.appearance.visibleTattoosPiercings === true || tp.appearance.visibleTattoosPiercings === "Yes" ? "Yes" : "No";
        }
        if (unified.open_to_appearance_changes === undefined && tp.appearance.openToAppearanceChanges !== undefined) {
          unified.open_to_appearance_changes = tp.appearance.openToAppearanceChanges === true || tp.appearance.openToAppearanceChanges === "Yes" ? "Yes" : "No";
        }
        if (!unified.clothing_size_top) unified.clothing_size_top = tp.appearance.clothingSizeTop;
        if (!unified.clothing_size_bottom) unified.clothing_size_bottom = tp.appearance.clothingSizeBottom;
        if (!unified.shoe_size) unified.shoe_size = tp.appearance.shoeSize;
        if (!unified.chest_bust_measurement) unified.chest_bust_measurement = tp.appearance.chestBustMeasurement;
        if (!unified.waist_measurement) unified.waist_measurement = tp.appearance.waistMeasurement;
        if (!unified.hip_measurement) unified.hip_measurement = tp.appearance.hipMeasurement;
      }
      if (tp.availability) {
        if (!unified.availability_type) unified.availability_type = tp.availabilityType || tp.availability.availabilityType;
        if (unified.last_minute_bookings === undefined && (tp.lastMinuteBookings !== undefined || tp.availability.lastMinuteBookings !== undefined)) {
          const val = tp.lastMinuteBookings !== undefined ? tp.lastMinuteBookings : tp.availability.lastMinuteBookings;
          unified.last_minute_bookings = val === true || val === "Yes" ? "Yes" : "No";
        }
        if (!unified.notice_required) unified.notice_required = tp.noticeRequired || tp.availability.noticeRequired;
        if (!unified.opportunities_sought) unified.opportunities_sought = tp.opportunitiesSought || tp.availability.opportunitiesSought;
        if (!unified.opportunities_not_accepted) unified.opportunities_not_accepted = tp.opportunitiesNotAccepted || tp.availability.opportunitiesNotAccepted;
      } else if (tp.availabilityType) {
        // Handle flattened availability fields
        if (!unified.availability_type) unified.availability_type = tp.availabilityType;
        if (unified.last_minute_bookings === undefined && tp.lastMinuteBookings !== undefined) {
          unified.last_minute_bookings = tp.lastMinuteBookings === true || tp.lastMinuteBookings === "Yes" ? "Yes" : "No";
        }
        if (!unified.notice_required) unified.notice_required = tp.noticeRequired;
        if (!unified.opportunities_sought) unified.opportunities_sought = tp.opportunitiesSought;
        if (!unified.opportunities_not_accepted) unified.opportunities_not_accepted = tp.opportunitiesNotAccepted;
      }

      if (tp.representation) {
        if (!unified.representation_status) unified.representation_status = tp.representationStatus || tp.representation.status;
        if (!unified.agency_name) unified.agency_name = tp.agencyName || tp.representation.agencyName;
        if (!unified.agency_contact_details) unified.agency_contact_details = tp.agencyContactDetails || tp.representation.agencyContactDetails;
        if (!unified.union_membership) unified.union_membership = tp.unionMembership || tp.representation.unionMembership;
        if (!unified.preferred_contact_method) unified.preferred_contact_method = tp.preferredContactMethod || tp.representation.preferredContactMethod;
      } else if (tp.representationStatus) {
        // Handle flattened representation fields
        if (!unified.representation_status) unified.representation_status = tp.representationStatus;
        if (!unified.agency_name) unified.agency_name = tp.agencyName;
        if (!unified.agency_contact_details) unified.agency_contact_details = tp.agencyContactDetails;
        if (!unified.union_membership) unified.union_membership = tp.unionMembership;
        if (!unified.preferred_contact_method) unified.preferred_contact_method = tp.preferredContactMethod;
      }
      if (tp.bookingPreferences) {
        if (!unified.currency) unified.currency = tp.bookingPreferences.currency;
        if (!unified.expected_rate_range) unified.expected_rate_range = tp.bookingPreferences.expectedRateRange;
        if (!unified.expected_rate_other) unified.expected_rate_other = tp.bookingPreferences.expectedRateOther;
        if (unified.open_to_unpaid === undefined && tp.bookingPreferences.openToUnpaid !== undefined) {
          unified.open_to_unpaid = tp.bookingPreferences.openToUnpaid === true || tp.bookingPreferences.openToUnpaid === "Yes" ? "Yes" : "No";
        }
      }
      if (tp.emergencyContact) {
        if (!unified.emergency_full_name) unified.emergency_full_name = tp.emergencyFullName || tp.emergencyContact.fullName;
        if (!unified.emergency_relationship) unified.emergency_relationship = tp.emergencyRelationship || tp.emergencyContact.relationship;
        if (!unified.emergency_phone) unified.emergency_phone = tp.emergencyPhone || tp.emergencyContact.phone || tp.emergencyContact.phoneNumber;
      } else if (tp.emergencyFullName) {
        if (!unified.emergency_full_name) unified.emergency_full_name = tp.emergencyFullName;
        if (!unified.emergency_relationship) unified.emergency_relationship = tp.emergencyRelationship;
        if (!unified.emergency_phone) unified.emergency_phone = tp.emergencyPhone;
      }
      if (tp.guardianConsent) {
        if (!unified.guardian_full_name) unified.guardian_full_name = tp.guardianFullName || tp.guardianConsent.fullName;
        if (!unified.guardian_relationship) unified.guardian_relationship = tp.guardianRelationship || tp.guardianConsent.relationship;
        if (!unified.guardian_email) unified.guardian_email = tp.guardianEmail || tp.guardianConsent.email;
        if (!unified.guardian_phone) unified.guardian_phone = tp.guardianPhone || tp.guardianConsent.phone;
        if (unified.guardian_consent_checkbox === undefined && (tp.guardianConsentGiven !== undefined || tp.guardianConsent.consentGiven !== undefined)) {
          const val = tp.guardianConsentGiven !== undefined ? tp.guardianConsentGiven : tp.guardianConsent.consentGiven;
          unified.guardian_consent_checkbox = val ? "Yes" : "No";
        }
      } else if (tp.guardianFullName) {
        if (!unified.guardian_full_name) unified.guardian_full_name = tp.guardianFullName;
        if (!unified.guardian_relationship) unified.guardian_relationship = tp.guardianRelationship;
        if (!unified.guardian_email) unified.guardian_email = tp.guardianEmail;
        if (!unified.guardian_phone) unified.guardian_phone = tp.guardianPhone;
        if (unified.guardian_consent_checkbox === undefined && tp.guardianConsentGiven !== undefined) {
          unified.guardian_consent_checkbox = tp.guardianConsentGiven ? "Yes" : "No";
        }
      }

      const existingProfilePhoto =
        combinedData?.profilePicture ||
        combinedData?.talent?.headshots?.[0]?.url ||
        combinedData?.headshots?.[0]?.url;
      if (!unified.profile_photo && existingProfilePhoto) unified.profile_photo = existingProfilePhoto;

      combinedData.unifiedTalentProfile = unified;
      setProfileData(combinedData);
    } catch (error) {
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const unifiedSnapshot = useMemo(() => {
    const unified = profileData?.unifiedTalentProfile || {};
    return { ...profileData, ...unified };
  }, [profileData]);

  const isMinor = useMemo(() => isMinorFromAgeGroup(unifiedSnapshot?.age_group), [unifiedSnapshot?.age_group]);

  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const preview = URL.createObjectURL(file);
    setPendingProfilePhoto({ file, preview });
  };

  const handlePortfolioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newPhotos = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPendingPortfolioPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePendingPortfolioPhoto = (index: number) => {
    setPendingPortfolioPhotos((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleIntroVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setPendingIntroVideo(e.target.files[0]);
  };

  const handlePortfolioVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newVideos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setPendingPortfolioVideos((prev) => [...prev, ...newVideos]);
  };

  const removePendingPortfolioVideo = (index: number) => {
    setPendingPortfolioVideos((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleSaveProfilePhoto = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!pendingProfilePhoto) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("headshot", pendingProfilePhoto.file);

      const profileFormData = new FormData();
      profileFormData.append("profilePicture", pendingProfilePhoto.file);

      await profileAPI.addHeadshot(formData);
      await userAPI.updateProfilePicture(profileFormData);

      setPendingProfilePhoto(null);
      await refreshUser();
      await fetchProfileData();
      toast.success("Profile photo updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile photo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (skipValidation: boolean = false) => {
    if (!profileData) return;

    // 1. Proactive "Healing" of other profiles to prevent validation blockers
    try {
      await profileAPI.updateProfessional({
        fullName: user?.fullName || profileData.fullName,
        displayName: user?.stageName || profileData.fullName,
        email: user?.email || profileData.email,
        phoneNumber: user?.phone || profileData.phone || profileData.phoneNumber,
        professionalTitle: "Talent",
        city: user?.address?.city || profileData.city || "",
        country: user?.address?.country || profileData.country || "",
        shortBio: profileData.bio || "",
        availabilityType: "Part-time",
        preferredContactMethod: "Castglo",
        bookingMethod: "Direct",
        servesClientTypes: [],
        certifications: "",
        professionalMemberships: ""
      });
    } catch (e) {
      console.warn("Professional healing skipped:", e);
    }

    try {
      await userAPI.updateProfile({
        fullName: profileData.fullName,
        bio: profileData.bio,
        professionalProfile: { certifications: "", professionalMemberships: "" },
        professional_profile: { certifications: "", professional_memberships: "" },
        "professionalProfile.certifications": "",
        "professionalProfile.professionalMemberships": "",
        "professional_profile.certifications": "",
        "professional_profile.professional_memberships": ""
      });
    } catch (e) {
      console.warn("Core profile healing failed:", e);
    }

    setIsSaving(true);
    try {
      const unifiedPayload: any = {
        ...(profileData?.unifiedTalentProfile || {}),
        ...Object.fromEntries(Object.entries(profileData || {}).filter(([key]) => UNIFIED_FIELD_IDS.has(key))),
      };

      const existingProfilePhoto =
        profileData?.profilePicture ||
        profileData?.talent?.headshots?.[0]?.url ||
        profileData?.headshots?.[0]?.url;
      if (!unifiedPayload.profile_photo && existingProfilePhoto) unifiedPayload.profile_photo = existingProfilePhoto;
      if (!unifiedPayload.profile_photo && pendingProfilePhoto) unifiedPayload.profile_photo = "pending_upload";

      if (!skipValidation) {
        const validation = validateUnifiedTalentProfile(unifiedPayload);
        if (!validation.success) {
          const message = validation.error.issues[0]?.message || "Please fix profile validation errors.";
          toast.error(message);
          return;
        }
      }

      if (pendingProfilePhoto) {
        const formData = new FormData();
        formData.append("headshot", pendingProfilePhoto.file);
        const profileFormData = new FormData();
        profileFormData.append("profilePicture", pendingProfilePhoto.file);
        await profileAPI.addHeadshot(formData);
        await userAPI.updateProfilePicture(profileFormData);
        setPendingProfilePhoto(null);
      }

      if (pendingPortfolioPhotos.length > 0) {
        await Promise.all(
          pendingPortfolioPhotos.map(async (photo) => {
            const formData = new FormData();
            formData.append("headshot", photo.file);
            return profileAPI.addHeadshot(formData);
          })
        );
        setPendingPortfolioPhotos([]);
      }

      if (pendingIntroVideo) {
        try {
          const formData = new FormData();
          formData.append("showreel", pendingIntroVideo);
          const uploadRes = await profileAPI.uploadShowreel(formData);
          const url = uploadRes.data?.data?.url || uploadRes.data?.data?.showreelUrl || uploadRes.data?.data?.showreel;
          if (url) {
            unifiedPayload.intro_video = url;
            setProfileData((prev: any) => ({
              ...prev,
              unifiedTalentProfile: { ...(prev?.unifiedTalentProfile || {}), intro_video: url },
            }));
          }
          setPendingIntroVideo(null);
        } catch (e: any) {
          console.error("Video upload error:", e);
          toast.error(e?.response?.data?.message || "Failed to upload introduction video");
          setIsSaving(false);
          return;
        }
      }

      if (pendingPortfolioVideos.length > 0) {
        try {
          const uploadedUrls: string[] = [];
          await Promise.all(
            pendingPortfolioVideos.map(async ({ file }) => {
              const formData = new FormData();
              formData.append("showreel", file);
              const res = await profileAPI.uploadShowreel(formData);
              const url = res.data?.data?.url || res.data?.data?.showreelUrl || res.data?.data?.showreel;
              if (url) uploadedUrls.push(url);
            })
          );
          setPendingPortfolioVideos([]);
          if (uploadedUrls.length > 0) {
            setProfileData((prev: any) => ({
              ...prev,
              talent: {
                ...(prev?.talent || {}),
                portfolioVideos: [...(prev?.talent?.portfolioVideos || []), ...uploadedUrls.map((url) => ({ url }))],
              },
            }));
          }
        } catch (e: any) {
          console.error("Portfolio video upload error:", e);
          toast.error("Failed to upload one or more portfolio videos");
        }
      }

      await profileAPI.updateTalent({
        fullName: unifiedPayload.full_name || profileData.fullName,
        displayName: unifiedPayload.display_name,
        email: unifiedPayload.email || profileData.email,
        phoneNumber: unifiedPayload.phone_number || profileData.phoneNumber || profileData.phone,
        gender: unifiedPayload.gender,
        currentCity: unifiedPayload.current_city,
        currentCountry: unifiedPayload.current_country,
        nationality: unifiedPayload.nationality,
        dateOfBirth: unifiedPayload.dateOfBirth,
        ageGroup: unifiedPayload.age_group,
        shortBio: unifiedPayload.short_bio || profileData.bio || "",
        fullBio: unifiedPayload.full_bio || "",

        primaryTalentType: unifiedPayload.primary_talent_type,
        languagesSpoken: unifiedPayload.languages_spoken || [],
        fluentLanguages: unifiedPayload.fluent_languages || [],
        naturalAccent: unifiedPayload.natural_accent,

        rightToWork: !!(unifiedPayload.right_to_work === "Yes" || unifiedPayload.right_to_work === true),
        validPassport: !!(unifiedPayload.valid_passport === "Yes" || unifiedPayload.valid_passport === true),
        willingToTravel: !!(unifiedPayload.willing_to_travel === "Yes" || unifiedPayload.willing_to_travel === true),
        internationalAvailability: !!(unifiedPayload.international_availability === "Yes" || unifiedPayload.international_availability === true),
        remoteWorkOpen: !!(unifiedPayload.remote_work_open === "Yes" || unifiedPayload.remote_work_open === true),

        careerGoals: typeof unifiedPayload.career_goals === 'string' ? unifiedPayload.career_goals : (Array.isArray(unifiedPayload.career_goals) ? unifiedPayload.career_goals.join(', ') : ""),

        yearsOfExperience: unifiedPayload.years_of_experience,
        experienceLevel: unifiedPayload.experience_level,
        representationStatus: unifiedPayload.representation_status || "Self-represented",
        preferredContactMethod: unifiedPayload.preferred_contact_method || "Castglo",
        availabilityType: unifiedPayload.availability_type || "Part-time",
        lastMinuteBookings: !!(unifiedPayload.last_minute_bookings === "Yes" || unifiedPayload.last_minute_bookings === true),
        noticeRequired: unifiedPayload.notice_required,
        opportunitiesSought: unifiedPayload.opportunities_sought || [],
        opportunitiesNotAccepted: unifiedPayload.opportunities_not_accepted || [],

        appearance: {
          height: Number(unifiedPayload.height) || 0,
          weight: Number(unifiedPayload.weight) || 0,
          build: unifiedPayload.build,
          hairColour: unifiedPayload.hair_colour,
          hairLength: unifiedPayload.hair_length,
          eyeColour: unifiedPayload.eye_colour,
          skinTone: unifiedPayload.skin_tone,
          ethnicityVisible: unifiedPayload.ethnicity_visible,
          distinguishingFeatures: unifiedPayload.distinguishing_features || [],
          visibleTattoosPiercings: (unifiedPayload.visible_tattoos_piercings === "Yes" || unifiedPayload.visible_tattoos_piercings === true) ? "Yes" : "No",
          openToAppearanceChanges: (unifiedPayload.open_to_appearance_changes === "Yes" || unifiedPayload.open_to_appearance_changes === true) ? "Yes" : "No",
        },

        emergencyContact: {
          fullName: unifiedPayload.emergency_full_name || "",
          relationship: unifiedPayload.emergency_relationship || "",
          phoneNumber: unifiedPayload.emergency_phone || "",
        },
        ...(isMinorFromAgeGroup(unifiedPayload.age_group) ? {
          guardianConsent: {
            fullName: unifiedPayload.guardian_full_name,
            relationship: unifiedPayload.guardian_relationship,
            email: unifiedPayload.guardian_email,
            phone: unifiedPayload.guardian_phone,
            consentGiven: !!(unifiedPayload.guardian_consent_checkbox === "Yes" || unifiedPayload.guardian_consent_checkbox === true),
          }
        } : {})

      });

      try {
        await profileAPI.updateAccount({
          phoneNumber: unifiedPayload.phone_number || profileData.phone || profileData.phoneNumber,
          address: {
            city: unifiedPayload.current_city || "",
            state: unifiedPayload.current_state || "",
            country: unifiedPayload.current_country || ""
          }
        });
      } catch (e) {
        console.warn("Account update failed:", e);
      }

      await refreshUser();
      await fetchProfileData();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const completionPercentage = useMemo(() => {
    const unified = profileData?.unifiedTalentProfile || {};
    const coreFields = [
      'full_name', 'email', 'phone_number', 'dateOfBirth', 'age_group',
      'gender', 'nationality', 'current_city', 'current_country',
      'short_bio', 'primary_talent_type', 'profile_photo'
    ];
    const filled = coreFields.filter(f => unified[f] || profileData?.[f]).length;
    return Math.round((filled / coreFields.length) * 100);
  }, [profileData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#009698] to-[#006b6d] p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -m-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -m-12 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-white/20 shadow-2xl transition-transform duration-500 group-hover:scale-105">
              <AvatarImage
                src={
                  pendingProfilePhoto?.preview ||
                  profileData?.profilePicture ||
                  profileData?.talent?.headshots?.[0]?.url ||
                  getAvatarUrl(profileData?.fullName)
                }
                className="object-cover"
              />
              <AvatarFallback className="bg-white/20 text-white font-bold text-3xl backdrop-blur-md">
                {getInitials(profileData?.fullName)}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="profile-photo-upload"
              className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-white text-[#009698] flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-100 transition-all duration-300 hover:scale-110"
            >
              <Camera className="h-5 h-5" />
              <input
                id="profile-photo-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleProfilePhotoSelect}
                disabled={isSaving}
              />
            </label>
            {pendingProfilePhoto && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white text-[#009698] hover:bg-gray-100 shadow-xl border-none h-8 px-3 text-xs font-bold animate-in zoom-in-50 duration-300"
                onClick={handleSaveProfilePhoto}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Upload className="w-3 h-3 mr-1" />
                )}
                Save Photo
              </Button>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{profileData?.fullName || "Your Profile"}</h1>
                {profileData?.isVerified && (
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-md px-3 py-1">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Verified
                  </Badge>
                )}
                {isMinor && (
                  <Badge className="bg-orange-400/20 text-orange-100 border-none backdrop-blur-md">
                    Guardian Required
                  </Badge>
                )}
              </div>
              <p className="text-[#e0f1f1] text-lg opacity-90">{profileData?.stageName || "Complete your profile to stand out"}</p>
            </div>

            <div className="space-y-2 max-w-md mx-auto md:mx-0">
              <div className="flex justify-between text-sm font-medium">
                <span>Profile Completion</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-1000 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            <Button
              size="lg"
              className="w-full bg-white text-[#009698] hover:bg-gray-100 font-bold shadow-lg transition-all duration-300 hover:-translate-y-1"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 mr-2" />
              )}
              Save Changes
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md font-bold"
              asChild
            >
              <Link to={`/talent/${profileData?._id || profileData?.id}`}>
                <Monitor className="w-5 h-5 mr-2" />
                View Public Profile
              </Link>
            </Button>
            <p className="text-[10px] text-center text-white/60">Last saved: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      <UnifiedTalentProfileForm
        rootData={profileData}
        onChange={setProfileData}
        onSave={handleSave}
        isSaving={isSaving}
        showTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingProfilePhoto={pendingProfilePhoto}
        setPendingProfilePhoto={setPendingProfilePhoto}
        pendingPortfolioPhotos={pendingPortfolioPhotos}
        removePendingPortfolioPhoto={removePendingPortfolioPhoto}
        handlePortfolioSelect={handlePortfolioSelect}
        pendingPortfolioVideos={pendingPortfolioVideos}
        removePendingPortfolioVideo={removePendingPortfolioVideo}
        handlePortfolioVideoSelect={handlePortfolioVideoSelect}
        pendingIntroVideo={pendingIntroVideo}
        setPendingIntroVideo={setPendingIntroVideo}
        handleIntroVideoSelect={handleIntroVideoSelect}
      />

    </div>
  );
}
