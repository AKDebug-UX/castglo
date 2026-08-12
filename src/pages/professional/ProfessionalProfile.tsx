import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Image as ImageIcon, Loader2, Upload, X, Eye as EyeIcon, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI, profileAPI, userAPI } from "@/lib/api";
import { getAvatarUrl, getInitials, getApiErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import { UnifiedProfessionalProfileForm } from "@/components/profile/UnifiedProfessionalProfileForm";
import {
  UNIFIED_PROFESSIONAL_FIELD_IDS,
  UNIFIED_PROFESSIONAL_PROFILE_FIELD_SPEC,
} from "@/lib/unifiedProfessionalProfile/fieldSpec";
import { validateUnifiedProfessionalProfile } from "@/lib/unifiedProfessionalProfile/validation";
import { ProfileSummaryView } from "@/components/profile/ProfileSummaryView";

export default function ProfessionalProfile() {
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [activeSubTab, setActiveSubTab] = useState("general");
  const [profileData, setProfileData] = useState<any>(null);
  const [pendingProfilePhoto, setPendingProfilePhoto] = useState<{ file: File; preview: string } | null>(null);
  const [pendingPortfolioPhotos, setPendingPortfolioPhotos] = useState<{ file: File; preview: string; caption?: string }[]>([]);
  const [pendingPortfolioVideos, setPendingPortfolioVideos] = useState<{ file: File; preview: string; name: string; caption?: string }[]>([]);
  const [pendingIntroVideo, setPendingIntroVideo] = useState<File | null>(null);


  const completionPercentage = useMemo(() => {
    if (!profileData) return 0;
    const unified = profileData.unifiedProfessionalProfile || {};
    const coreFields = [
      'full_name', 'email', 'phone_number', 'city', 'country',
      'short_bio', 'primary_professional_type'
    ];
    const filled = coreFields.filter(f => unified[f] || profileData[f]).length;
    // Add 1 if there's a profile photo
    const hasPhoto = !!(profileData.profilePicture || profileData.headshots?.length);
    return Math.round(((filled + (hasPhoto ? 1 : 0)) / (coreFields.length + 1)) * 100);
  }, [profileData]);

  const profileName = useMemo(() => {
    return profileData?.professionalProfile?.fullName || profileData?.fullName || "Your Profile";
  }, [profileData]);

  const fetchProfile = async () => {
    try {
      const [authRes, profileRes] = await Promise.all([
        authAPI.getMe().catch(() => ({ data: { success: false } })),
        profileAPI.getMe().catch(() => ({ data: { success: false } })),
      ]);

      let combinedData: any = {};
      if (authRes.data?.success) {
        combinedData = { ...combinedData, ...authRes.data.data };
        // Store the User ID separately so it's not overwritten by the profile _id
        combinedData.userId = authRes.data.data._id || authRes.data.data.id;
      }
      if (profileRes.data?.success) combinedData = { ...combinedData, ...profileRes.data.data };

      const pp = combinedData.professionalProfile || combinedData.professional || {};
      const unified = combinedData.unifiedProfessionalProfile || {};

      // Map root and nested API properties back to unified field IDs
      if (!unified.full_name) unified.full_name = pp.fullName || combinedData.fullName;
      if (!unified.display_name) unified.display_name = pp.displayName || combinedData.displayName;
      if (!unified.email) unified.email = pp.email || combinedData.email;
      if (!unified.phone_number) unified.phone_number = pp.phoneNumber || pp.phone || combinedData.phoneNumber || combinedData.phone;
      if (!unified.short_bio) unified.short_bio = pp.shortBio || pp.bio || combinedData.shortBio || combinedData.bio;
      if (!unified.full_bio) unified.full_bio = pp.fullBio || pp.fullAbout || combinedData.fullBio || combinedData.full_bio;
      
      // Map specialized professional information
      const bd = pp.businessDetails || {};
      
      if (!unified.business_name) unified.business_name = pp.businessName || pp.companyName;
      if (!unified.professional_title) unified.professional_title = combinedData.professional_title || pp.professionalTitle || combinedData.jobTitle;
      if (!unified.primary_professional_type) unified.primary_professional_type = combinedData.professionalCategory || pp.primaryProfessionalType;
      if (!unified.additional_professional_types) unified.additional_professional_types = pp.additionalTypes || pp.additionalProfessionalTypes;
      if (!unified.years_of_experience) unified.years_of_experience = pp.yearsOfExperience;
      if (!unified.experience_level) unified.experience_level = pp.experienceLevel;
      if (!unified.serves_client_types) unified.serves_client_types = pp.servesClientTypes;
      if (!unified.industry_areas) unified.industry_areas = pp.industryAreas;
      
      if (!unified.software_tools) unified.software_tools = pp.softwareTools;
      if (!unified.equipment_summary) unified.equipment_summary = pp.equipmentSummary || pp.equipmentOwned;
      if (!unified.equipment_owned) unified.equipment_owned = pp.equipmentOwned || pp.equipmentSummary;
      
      // Trust & Verification (Checking root then businessDetails)
      if (unified.insurance_available === undefined) {
        const val = pp.insuranceAvailable !== undefined ? pp.insuranceAvailable : bd.insuranceAvailable;
        if (val !== undefined) unified.insurance_available = val === true || val === "Yes" ? "Yes" : "No";
      }
      if (unified.dbs_checked === undefined) {
        const val = pp.dbsChecked !== undefined ? pp.dbsChecked : bd.dbsChecked;
        if (val !== undefined) unified.dbs_checked = val === true || val === "Yes" ? "Yes" : "No";
      }
      
      if (!unified.certifications) unified.certifications = typeof pp.certifications === 'string' ? pp.certifications : (typeof bd.certifications === 'string' ? bd.certifications : "");
      if (!unified.awards_recognition) unified.awards_recognition = typeof pp.awards === 'string' ? pp.awards : (typeof bd.awards === 'string' ? bd.awards : "");
      if (!unified.professional_memberships) unified.professional_memberships = typeof pp.professionalMemberships === 'string' ? pp.professionalMemberships : (typeof bd.professionalMemberships === 'string' ? bd.professionalMemberships : "");
      
      if (unified.willing_to_travel === undefined) {
        const val = pp.willingToTravel !== undefined ? pp.willingToTravel : bd.willingToTravel;
        if (val !== undefined) unified.willing_to_travel = val === true || val === "Yes" ? "Yes" : "No";
      }
      if (unified.remote_services_available === undefined) {
        const val = pp.remoteServicesAvailable !== undefined ? pp.remoteServicesAvailable : bd.remoteServicesAvailable;
        if (val !== undefined) unified.remote_services_available = val === true || val === "Yes" ? "Yes" : "No";
      }

      // Booking & Terms
      if (!unified.booking_method) unified.booking_method = pp.bookingMethod || bd.bookingMethod;
      if (!unified.preferred_contact_method) unified.preferred_contact_method = pp.preferredContactMethod || bd.preferredContactMethod;
      if (!unified.availability_type) unified.availability_type = pp.availabilityType || "Part-time";
      
      if (unified.deposit_required === undefined) {
        const val = pp.depositRequired !== undefined ? pp.depositRequired : bd.depositRequired;
        if (val !== undefined) unified.deposit_required = val ? "Yes" : "No";
      }
      if (!unified.deposit_percentage) unified.deposit_percentage = pp.depositPercentage || bd.depositPercentage;
      if (!unified.payment_methods) unified.payment_methods = pp.paymentMethods || bd.paymentMethods;
      if (!unified.services) unified.services = pp.services;

      // New Commercial Fields
      if (unified.studio_access === undefined) {
        const val = pp.studioAccess !== undefined ? pp.studioAccess : bd.studioAccess;
        if (val !== undefined) unified.studio_access = val ? "Yes" : "No";
      }
      if (!unified.studio_details) unified.studio_details = pp.studioDetails || bd.studioDetails;
      if (!unified.cancellation_policy) unified.cancellation_policy = pp.cancellationPolicy || bd.cancellationPolicy;
      if (!unified.refund_policy) unified.refund_policy = pp.refundPolicy || bd.refundPolicy;
      
      if (unified.contract_required === undefined) {
        const val = pp.contractRequired !== undefined ? pp.contractRequired : bd.contractRequired;
        if (val !== undefined) unified.contract_required = val ? "Yes" : "No";
      }
      if (unified.nda_friendly === undefined) {
        const val = pp.ndaFriendly !== undefined ? pp.ndaFriendly : bd.ndaFriendly;
        if (val !== undefined) unified.nda_friendly = val ? "Yes" : "No";
      }
      if (unified.invoicing_available === undefined) {
        const val = pp.invoicingAvailable !== undefined ? pp.invoicingAvailable : bd.invoicingAvailable;
        if (val !== undefined) unified.invoicing_available = val ? "Yes" : "No";
      }
      if (unified.tax_registered === undefined) {
        const val = pp.taxRegistered !== undefined ? pp.taxRegistered : bd.taxRegistered;
        if (val !== undefined) unified.tax_registered = val ? "Yes" : "No";
      }
      
      if (!unified.insurance_details) unified.insurance_details = pp.insuranceDetails || bd.insuranceDetails;
      if (!unified.served_age_ranges) unified.served_age_ranges = pp.servedAgeRanges;
      if (!unified.core_skills) unified.core_skills = pp.coreSkills;
      if (!unified.custom_skills) unified.custom_skills = pp.customSkills;
      if (!unified.portfolio_website) unified.portfolio_website = pp.portfolioWebsite || combinedData.website;
      if (!unified.instagram_url) unified.instagram_url = pp.instagramUrl || combinedData.instagramUrl;
      if (!unified.youtube_url) unified.youtube_url = pp.youtubeUrl || combinedData.youtubeUrl;
      if (!unified.vimeo_url) unified.vimeo_url = pp.vimeoUrl || combinedData.vimeoUrl;
      
      if (unified.testimonials_enabled === undefined && pp.testimonialsEnabled !== undefined) {
        unified.testimonials_enabled = pp.testimonialsEnabled ? "Yes" : "No";
      }
      
      if (!unified.notable_clients) unified.notable_clients = pp.notableClients;
      if (!unified.notable_projects) unified.notable_projects = pp.notableProjects;
      
      if (unified.last_minute_bookings === undefined && pp.lastMinuteBookings !== undefined) {
        unified.last_minute_bookings = pp.lastMinuteBookings ? "Yes" : "No";
      }
      if (!unified.notice_required) unified.notice_required = pp.noticeRequired;
      if (unified.international_availability === undefined && pp.internationalAvailability !== undefined) {
        unified.international_availability = pp.internationalAvailability ? "Yes" : "No";
      }
      if (!unified.working_days) unified.working_days = pp.workingDays;
      if (!unified.working_hours_summary) unified.working_hours_summary = pp.workingHoursSummary;
      if (!unified.booking_lead_time) unified.booking_lead_time = pp.bookingLeadTime;

      // Specialized fields
      if (!unified.photographer_specialisms) unified.photographer_specialisms = pp.photographerSpecialisms;
      if (unified.photographer_studio_access === undefined && pp.photographerStudioAccess !== undefined) {
        unified.photographer_studio_access = pp.photographerStudioAccess ? "Yes" : "No";
      }
      if (unified.photographer_retouching_included === undefined && pp.photographerRetouchingIncluded !== undefined) {
        unified.photographer_retouching_included = pp.photographerRetouchingIncluded ? "Yes" : "No";
      }
      if (!unified.photographer_equipment_summary) unified.photographer_equipment_summary = pp.photographerEquipmentSummary;
      
      if (!unified.mua_specialisms) unified.mua_specialisms = pp.muaSpecialisms;
      if (unified.kit_available === undefined && pp.kitAvailable !== undefined) {
        unified.kit_available = pp.kitAvailable ? "Yes" : "No";
      }
      if (unified.travel_kit_available === undefined && pp.travelKitAvailable !== undefined) {
        unified.travel_kit_available = pp.travelKitAvailable ? "Yes" : "No";
      }
      
      if (!unified.coaching_specialisms) unified.coaching_specialisms = pp.coachingSpecialisms;
      if (!unified.coaching_delivery_modes) unified.coaching_delivery_modes = pp.coachingDeliveryModes;
      if (unified.youth_clients_supported === undefined && pp.youthClientsSupported !== undefined) {
        unified.youth_clients_supported = pp.youthClientsSupported ? "Yes" : "No";
      }
      
      if (!unified.editing_specialisms) unified.editing_specialisms = pp.editingSpecialisms;
      if (!unified.file_transfer_methods) unified.file_transfer_methods = pp.fileTransferMethods;
      if (!unified.revision_workflow) unified.revision_workflow = pp.revisionWorkflow;

      // Map address fields if they are in the structured address object
      const addr = combinedData.address || {};
      if (!unified.city) unified.city = addr.city || combinedData.city || pp.city;
      if (!unified.state) unified.state = addr.state || pp.state;
      if (!unified.country) unified.country = addr.country || combinedData.country || pp.country;

      combinedData.unifiedProfessionalProfile = unified;
      setProfileData(combinedData);
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setPendingProfilePhoto({ file, preview: URL.createObjectURL(file) });
  };

  const handlePortfolioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const next = Array.from(e.target.files).map((file) => ({ file, preview: URL.createObjectURL(file), caption: "" }));
    setPendingPortfolioPhotos((prev) => [...prev, ...next]);
  };

  const removePendingPortfolioPhoto = (index: number) => {
    setPendingPortfolioPhotos((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handlePortfolioVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newVideos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      caption: "",
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

  const handleIntroVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setPendingIntroVideo(e.target.files[0]);
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
      
      await Promise.all([
        profileAPI.addHeadshot(formData),
        userAPI.updateProfilePicture(profileFormData)
      ]);
      
      setPendingProfilePhoto(null);
      await refreshUser();
      await fetchProfile();
      toast.success("Profile photo updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile photo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (skipValidation: boolean = false) => {
    setIsSaving(true);
    try {
      const unifiedPayload = {
        ...(profileData?.unifiedProfessionalProfile || {}),
        ...Object.fromEntries(Object.entries(profileData || {}).filter(([key]) => UNIFIED_PROFESSIONAL_FIELD_IDS.has(key))),
      };

      const shouldValidateUnified = !skipValidation && Object.keys(unifiedPayload).length > 0;
      if (shouldValidateUnified) {
        const validation = validateUnifiedProfessionalProfile(unifiedPayload);
        if (!validation.success) {
          toast.error(validation.error.issues[0]?.message || "Please fix professional profile validation errors.");
          return;
        }
      }

      if (pendingProfilePhoto) {
        const formData = new FormData();
        formData.append("headshot", pendingProfilePhoto.file);
        
        // Use userAPI to update the main profile picture for the header/avatar
        const profileFormData = new FormData();
        profileFormData.append("profilePicture", pendingProfilePhoto.file);
        
        await Promise.all([
          profileAPI.addHeadshot(formData),
          userAPI.updateProfilePicture(profileFormData)
        ]);
        setPendingProfilePhoto(null);
      }

      if (pendingPortfolioPhotos.length > 0) {
        await Promise.all(
          pendingPortfolioPhotos.map((photo) => {
            const formData = new FormData();
            formData.append("portfolio", photo.file);
            formData.append("title", photo.caption || "Portfolio Image");
            return profileAPI.addPortfolio(formData);
          })
        );
        setPendingPortfolioPhotos([]);
        // Re-fetch to get newly added portfolio items
        const updatedProfileRes = await profileAPI.getMe();
        if (updatedProfileRes.data?.success) {
          profileData.professional.portfolioItems = updatedProfileRes.data.data.professionalProfile?.portfolioItems || [];
        }
      }

      if (pendingPortfolioVideos.length > 0) {
        try {
          const uploadedUrls: any[] = [];
          await Promise.all(
            pendingPortfolioVideos.map(async (vid) => {
              const formData = new FormData();
              formData.append("showreel", vid.file);
              const res = await profileAPI.uploadShowreel(formData);
              const url = res.data?.data?.url || res.data?.data?.showreelUrl || res.data?.data?.showreel;
              if (url) uploadedUrls.push({ url, caption: vid.caption || "" });
            })
          );
          setPendingPortfolioVideos([]);
          if (uploadedUrls.length > 0) {
            // Update local state for subsequent payload
            if (!profileData.professional) profileData.professional = {};
            profileData.professional.portfolioVideos = [...(profileData?.professional?.portfolioVideos || []), ...uploadedUrls];
          }
        } catch (e: any) {
          console.error("Portfolio video upload error:", e);
          toast.error("Failed to upload one or more portfolio videos");
        }
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
              unifiedProfessionalProfile: { ...(prev?.unifiedProfessionalProfile || {}), intro_video: url },
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

      // 1. Update Specialized Professional Information FIRST
      // Aligning strictly with backend validation error requirements (FLAT structure)
      const payload: any = {
        fullName: unifiedPayload.full_name || profileData?.fullName,
        displayName: unifiedPayload.display_name || profileData?.stageName,
        professionalTitle: unifiedPayload.professional_title || profileData?.unifiedProfessionalProfile?.professional_title || profileData?.professional_title,
        email: unifiedPayload.email || profileData?.email,
        phoneNumber: unifiedPayload.phone_number || profileData?.phone_number || profileData?.phoneNumber,
        city: unifiedPayload.city || profileData?.city || "",
        country: unifiedPayload.country || profileData?.country || "",
        shortBio: unifiedPayload.short_bio || profileData?.short_bio || "",
        yearsOfExperience: unifiedPayload.years_of_experience || profileData?.years_of_experience,
        experienceLevel: unifiedPayload.experience_level || profileData?.experience_level,
        primaryProfessionalType: unifiedPayload.primary_professional_type || profileData?.primary_professional_type,
        
        // General fields
        businessName: unifiedPayload.business_name || unifiedPayload.businessName || profileData?.unifiedProfessionalProfile?.businessName,
        business_name: unifiedPayload.business_name || unifiedPayload.businessName || profileData?.unifiedProfessionalProfile?.businessName,
        companyName: unifiedPayload.business_name || unifiedPayload.companyName || profileData?.unifiedProfessionalProfile?.companyName,
        fullBio: unifiedPayload.full_bio || unifiedPayload.fullBio || "",
        full_bio: unifiedPayload.full_bio || unifiedPayload.fullBio || "",
        willingToTravel: unifiedPayload.willing_to_travel || "No",
        willing_to_travel: unifiedPayload.willing_to_travel || "No",

        // Professional fields
        additionalProfessionalTypes: unifiedPayload.additional_professional_types || [],
        industryAreas: unifiedPayload.industry_areas || [],
        softwareTools: unifiedPayload.software_tools || [],
        equipmentSummary: (unifiedPayload.equipment_summary || unifiedPayload.equipment_owned) || undefined,
        equipmentOwned: (unifiedPayload.equipment_owned || unifiedPayload.equipment_summary) || undefined,
        certifications: Array.isArray(unifiedPayload.certifications) ? unifiedPayload.certifications.join(', ') : (unifiedPayload.certifications || ""),

        // Commercial fields
        servesClientTypes: unifiedPayload.serves_client_types || profileData?.serves_client_types || [],
        availabilityType: unifiedPayload.availability_type || profileData?.availability_type || "Part-time",
        preferredContactMethod: unifiedPayload.preferred_contact_method || profileData?.preferred_contact_method || "Castglo",
        bookingMethod: unifiedPayload.booking_method || profileData?.booking_method || "Direct",
        remoteServicesAvailable: unifiedPayload.remote_services_available || "No",
        remote_services_available: unifiedPayload.remote_services_available || "No",
        insuranceAvailable: unifiedPayload.insurance_available || "No",
        dbsChecked: unifiedPayload.dbs_checked || "No",
        studioAccess: unifiedPayload.studio_access || "No",
        studioDetails: unifiedPayload.studio_details || "",
        depositRequired: unifiedPayload.deposit_required || "No",
        depositPercentage: Number(unifiedPayload.deposit_percentage) || 0,
        cancellationPolicy: unifiedPayload.cancellation_policy || "",
        refundPolicy: unifiedPayload.refund_policy || "",
        contractRequired: unifiedPayload.contract_required || "No",
        ndaFriendly: unifiedPayload.nda_friendly || "No",
        invoicingAvailable: unifiedPayload.invoicing_available || "No",
        taxRegistered: unifiedPayload.tax_registered || "No",
        
        // Additional missing fields
        insuranceDetails: unifiedPayload.insurance_details || undefined,
        servedAgeRanges: unifiedPayload.served_age_ranges || [],
        coreSkills: unifiedPayload.core_skills || [],
        customSkills: unifiedPayload.custom_skills || undefined,
        portfolioWebsite: unifiedPayload.portfolio_website || undefined,
        instagramUrl: unifiedPayload.instagram_url || undefined,
        youtubeUrl: unifiedPayload.youtube_url || undefined,
        vimeoUrl: unifiedPayload.vimeo_url || undefined,
        testimonialsEnabled: unifiedPayload.testimonials_enabled || "No",
        notableClients: unifiedPayload.notable_clients || undefined,
        notableProjects: unifiedPayload.notable_projects || undefined,
        lastMinuteBookings: unifiedPayload.last_minute_bookings || "No",
        noticeRequired: unifiedPayload.notice_required || undefined,
        internationalAvailability: unifiedPayload.international_availability || "No",
        workingDays: unifiedPayload.working_days || [],
        workingHoursSummary: unifiedPayload.working_hours_summary || undefined,
        bookingLeadTime: unifiedPayload.booking_lead_time || undefined,

        // Specialized fields
        photographerSpecialisms: unifiedPayload.photographer_specialisms || [],
        photographerStudioAccess: unifiedPayload.photographer_studio_access || "No",
        photographerRetouchingIncluded: unifiedPayload.photographer_retouching_included || "No",
        photographerEquipmentSummary: unifiedPayload.photographer_equipment_summary || undefined,
        
        muaSpecialisms: unifiedPayload.mua_specialisms || [],
        kitAvailable: unifiedPayload.kit_available || "No",
        travelKitAvailable: unifiedPayload.travel_kit_available || "No",
        
        coachingSpecialisms: unifiedPayload.coaching_specialisms || [],
        coachingDeliveryModes: unifiedPayload.coaching_delivery_modes || [],
        youthClientsSupported: unifiedPayload.youth_clients_supported || "No",
        
        editingSpecialisms: unifiedPayload.editing_specialisms || [],
        fileTransferMethods: unifiedPayload.file_transfer_methods || [],
        revisionWorkflow: unifiedPayload.revision_workflow || undefined,
      };

      if (activeTab === "summary") {
        return;
      }

      await profileAPI.updateProfessional(payload);

      if (activeTab === "summary") {
        return;
      }

      await profileAPI.updateProfessional(payload);

      await refreshUser();
      await fetchProfile();

      // 3. Optional: Extract service if filled in the form
      if (unifiedPayload.service_title) {
        try {
          const serviceData = new FormData();
          serviceData.append("title", unifiedPayload.service_title);
          serviceData.append("description", unifiedPayload.service_short_description || "Service listing");
          serviceData.append("price", (unifiedPayload.price_amount || 0).toString());
          serviceData.append("duration", "60"); // Default since we use text fields
          
          await serviceAPI.create(serviceData);
        } catch (e) {
          console.error("Failed to create service from unified form:", e);
        }
      }

      await refreshUser();
      await fetchProfile();
      toast.success("Professional profile updated successfully");
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "Failed to update profile"));
    } finally {
      setIsSaving(false);
    }
  };

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
                  getAvatarUrl(profileName)
                }
                className="object-cover"
              />
              <AvatarFallback className="bg-white/20 text-white font-bold text-3xl backdrop-blur-md">
                {getInitials(profileName)}
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
                <h1 className="text-3xl font-bold tracking-tight">{profileName}</h1>
                {profileData?.isVerified && (
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-md px-3 py-1">
                    Verified Professional
                  </Badge>
                )}
              </div>
              <p className="text-[#e0f1f1] text-lg opacity-90">{profileData?.unifiedProfessionalProfile?.professional_title || "Industry Professional"}</p>
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
              onClick={handleSave}
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
              <Link to={`/professional/${profileData?.userId || profileData?._id || profileData?.id}`}>
                <EyeIcon className="w-5 h-5 mr-2" />
                View Public Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="h-auto p-1 gap-1 inline-flex">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="mt-4">
          <UnifiedProfessionalProfileForm 
            rootData={profileData} 
            onChange={setProfileData} 
            onSave={handleSave} 
            isSaving={isSaving} 
            activeTab="general" 
          />
        </TabsContent>

        <TabsContent value="professional" className="mt-4">
          <UnifiedProfessionalProfileForm 
            rootData={profileData} 
            onChange={setProfileData} 
            onSave={handleSave} 
            isSaving={isSaving} 
            activeTab="professional" 
          />
        </TabsContent>

        <TabsContent value="business" className="mt-4 space-y-6">
          <UnifiedProfessionalProfileForm 
            rootData={profileData} 
            onChange={setProfileData} 
            onSave={handleSave} 
            isSaving={isSaving} 
            activeTab="business" 
          />
        </TabsContent>

        <TabsContent value="media" className="mt-4 space-y-6">
          <UnifiedProfessionalProfileForm
            rootData={profileData}
            onChange={setProfileData}
            onSave={handleSave}
            isSaving={isSaving}
            activeTab="media"
            pendingPortfolioPhotos={pendingPortfolioPhotos}
            setPendingPortfolioPhotos={setPendingPortfolioPhotos}
            removePendingPortfolioPhoto={removePendingPortfolioPhoto}
            handlePortfolioSelect={handlePortfolioSelect}
            pendingPortfolioVideos={pendingPortfolioVideos}
            setPendingPortfolioVideos={setPendingPortfolioVideos}
            removePendingPortfolioVideo={removePendingPortfolioVideo}
            handlePortfolioVideoSelect={handlePortfolioVideoSelect}
          />
        </TabsContent>

        <TabsContent value="summary" className="mt-4 space-y-6">
          <ProfileSummaryView 
            fields={UNIFIED_PROFESSIONAL_PROFILE_FIELD_SPEC} 
            values={{...profileData, ...(profileData?.unifiedProfessionalProfile || {})}} 
            title="Professional Profile Summary" 
          />
          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => handleSave(false)} 
              disabled={isSaving}
              className="bg-[#009698] hover:bg-[#009698]/90 text-white font-bold px-8 py-6 rounded-2xl shadow-lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save Entire Profile
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
