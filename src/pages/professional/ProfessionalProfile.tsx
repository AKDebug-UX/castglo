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
import { getAvatarUrl, getInitials } from "@/lib/utils";
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
  const [pendingPortfolioPhotos, setPendingPortfolioPhotos] = useState<{ file: File; preview: string }[]>([]);


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

  const fetchProfile = async () => {
    try {
      const [authRes, profileRes] = await Promise.all([
        authAPI.getMe().catch(() => ({ data: { success: false } })),
        profileAPI.getMe().catch(() => ({ data: { success: false } })),
      ]);

      let combinedData: any = {};
      if (authRes.data?.success) combinedData = { ...combinedData, ...authRes.data.data };
      if (profileRes.data?.success) combinedData = { ...combinedData, ...profileRes.data.data };

      const pp = combinedData.professionalProfile || combinedData.professional || {};
      const unified = combinedData.unifiedProfessionalProfile || {};

      // Map root and nested API properties back to unified field IDs
      if (!unified.full_name) unified.full_name = combinedData.fullName;
      if (!unified.display_name) unified.display_name = combinedData.displayName;
      if (!unified.email) unified.email = combinedData.email;
      if (!unified.phone_number) unified.phone_number = combinedData.phoneNumber || combinedData.phone;
      if (!unified.short_bio) unified.short_bio = combinedData.bio || pp.bio;
      if (!unified.full_bio) unified.full_bio = combinedData.full_bio || pp.fullBio;
      // Map specialized professional information
      const bd = pp.businessDetails || {};
      
      if (!unified.business_name) unified.business_name = pp.businessName;
      if (!unified.professional_title) unified.professional_title = combinedData.professional_title || pp.professionalTitle || combinedData.jobTitle;
      if (!unified.primary_professional_type) unified.primary_professional_type = combinedData.professionalCategory || pp.primaryProfessionalType;
      if (!unified.additional_professional_types) unified.additional_professional_types = pp.additionalTypes;
      if (!unified.years_of_experience) unified.years_of_experience = pp.yearsOfExperience;
      if (!unified.experience_level) unified.experience_level = pp.experienceLevel;
      if (!unified.serves_client_types) unified.serves_client_types = pp.servesClientTypes;
      if (!unified.industry_areas) unified.industry_areas = pp.industryAreas;
      
      if (!unified.software_tools) unified.software_tools = pp.softwareTools;
      if (!unified.equipment_owned) unified.equipment_owned = pp.equipmentOwned;
      
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
      
      // Booking & Terms
      if (!unified.booking_method) unified.booking_method = pp.bookingMethod || bd.bookingMethod;
      if (!unified.preferred_contact_method) unified.preferred_contact_method = pp.preferredContactMethod || bd.preferredContactMethod;
      if (unified.deposit_required === undefined) {
        const val = pp.depositRequired !== undefined ? pp.depositRequired : bd.depositRequired;
        if (val !== undefined) unified.deposit_required = val ? "Yes" : "No";
      }
      if (!unified.deposit_percentage) unified.deposit_percentage = pp.depositPercentage || bd.depositPercentage;
      if (!unified.payment_methods) unified.payment_methods = pp.paymentMethods || bd.paymentMethods;
      if (!unified.services) unified.services = pp.services;

      // Map address fields if they are in the structured address object
      const addr = combinedData.address || {};
      if (!unified.city) unified.city = addr.city || combinedData.city;
      if (!unified.state) unified.state = addr.state;
      if (!unified.country) unified.country = addr.country || combinedData.country;

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
    const next = Array.from(e.target.files).map((file) => ({ file, preview: URL.createObjectURL(file) }));
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
            formData.append("title", "Portfolio Image");
            return profileAPI.addPortfolio(formData);
          })
        );
        setPendingPortfolioPhotos([]);
      }

      // 1. Update Specialized Professional Information FIRST
      // Aligning strictly with backend validation error requirements (FLAT structure)
      await profileAPI.updateProfessional({
        fullName: unifiedPayload.full_name || profileData?.fullName,
        displayName: unifiedPayload.display_name || profileData?.stageName,
        professionalTitle: unifiedPayload.professional_title,
        email: unifiedPayload.email || profileData?.email,
        phoneNumber: unifiedPayload.phone_number || profileData?.phoneNumber || profileData?.phone,
        city: unifiedPayload.city || "",
        country: unifiedPayload.country || "",
        shortBio: unifiedPayload.short_bio || "",
        fullBio: unifiedPayload.full_bio || "",
        
        primaryProfessionalType: unifiedPayload.primary_professional_type,
        yearsOfExperience: unifiedPayload.years_of_experience,
        experienceLevel: unifiedPayload.experience_level,
        
        availabilityType: unifiedPayload.availability_type || "Part-time",
        preferredContactMethod: unifiedPayload.preferred_contact_method || "Castglo",
        bookingMethod: unifiedPayload.booking_method || "Direct",
        servesClientTypes: unifiedPayload.serves_client_types || [],

        // Flattened Business Fields (No longer in businessDetails)
        businessName: unifiedPayload.business_name,
        insuranceAvailable: (unifiedPayload.insurance_available === "Yes" || unifiedPayload.insurance_available === true) ? "Yes" : "No",
        dbsChecked: (unifiedPayload.dbs_checked === "Yes" || unifiedPayload.dbs_checked === true) ? "Yes" : "No",
        certifications: Array.isArray(unifiedPayload.certifications) ? unifiedPayload.certifications.join(', ') : (unifiedPayload.certifications || ""),
        
        studioAccess: (unifiedPayload.studio_access === "Yes" || unifiedPayload.studio_access === true) ? "Yes" : "No",
        studioDetails: unifiedPayload.studio_details || "",
        depositRequired: (unifiedPayload.deposit_required === "Yes" || unifiedPayload.deposit_required === true) ? "Yes" : "No",
        depositPercentage: unifiedPayload.deposit_percentage ? String(unifiedPayload.deposit_percentage) : "0",
        cancellationPolicy: unifiedPayload.cancellation_policy || "",
        refundPolicy: unifiedPayload.refund_policy || "",
        contractRequired: (unifiedPayload.contract_required === "Yes" || unifiedPayload.contract_required === true) ? "Yes" : "No",
        ndaFriendly: (unifiedPayload.nda_friendly === "Yes" || unifiedPayload.nda_friendly === true) ? "Yes" : "No",
        invoicingAvailable: (unifiedPayload.invoicing_available === "Yes" || unifiedPayload.invoicing_available === true) ? "Yes" : "No",
        taxRegistered: (unifiedPayload.tax_registered === "Yes" || unifiedPayload.tax_registered === true) ? "Yes" : "No",
      });

      // 2. Proactive "Healing" of other profiles to prevent cross-model validation blockers
      try {
        await profileAPI.updateTalent({ shortBio: unifiedPayload.short_bio || "", careerGoals: "" });
        // We also "heal" the root professional fields if they are corrupted
        await userAPI.updateProfile({
          professionalProfile: { certifications: "", professionalMemberships: "", awards: "" },
          talentProfile: { careerGoals: "" }
        });
      } catch (e) {
        console.warn("Cross-profile healing skipped:", e);
      }

      // 3. Update Core User & Account Information (isolated to prevent blocking)
      try {
        await userAPI.updateProfile({
          fullName: unifiedPayload.full_name,
          bio: unifiedPayload.short_bio,
          jobTitle: unifiedPayload.professional_title,
          organisationType: unifiedPayload.business_name ? "Business" : "Individual",
        });
      } catch (e) {
        console.warn("Core profile update failed, but professional data saved:", e);
      }

      try {
        await profileAPI.updateAccount({
          phoneNumber: unifiedPayload.phone_number,
          address: {
            city: unifiedPayload.city || "",
            state: unifiedPayload.state || "",
            country: unifiedPayload.country || ""
          }
        });
      } catch (e) {
        console.warn("Account update failed:", e);
      }

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
      toast.error(error?.response?.data?.message || "Failed to update profile");
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
              <Link to={`/professional/${profileData?._id || profileData?.id}`}>
                <EyeIcon className="w-5 h-5 mr-2" />
                View Public Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
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
          <UnifiedProfessionalProfileForm rootData={profileData} onChange={setProfileData} onSave={handleSave} isSaving={isSaving} activeTab="general" />
        </TabsContent>

        <TabsContent value="professional" className="mt-4">
          <UnifiedProfessionalProfileForm rootData={profileData} onChange={setProfileData} onSave={handleSave} isSaving={isSaving} activeTab="professional" />
        </TabsContent>

        <TabsContent value="business" className="mt-4 space-y-6">
          <UnifiedProfessionalProfileForm rootData={profileData} onChange={setProfileData} onSave={handleSave} isSaving={isSaving} activeTab="business" />
        </TabsContent>

        <TabsContent value="media" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Gallery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(profileData?.headshots || []).map((shot: any) => (
                  <div key={shot._id} className="relative aspect-square rounded-xl overflow-hidden border group bg-muted/30">
                    <img src={shot.url} alt="portfolio" className="w-full h-full object-cover" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={async () => {
                        try {
                          await profileAPI.deleteHeadshot(shot._id);
                          setProfileData((prev: any) => ({ ...prev, headshots: (prev.headshots || []).filter((s: any) => s._id !== shot._id) }));
                          toast.success("Image removed");
                        } catch {
                          toast.error("Delete failed");
                        }
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {pendingPortfolioPhotos.map((photo, index) => (
                  <div key={`${photo.file.name}-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-primary/30 group">
                    <img src={photo.preview} alt="pending" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Badge className="bg-primary hover:bg-primary">Pending</Badge>
                    </div>
                    <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removePendingPortfolioPhoto(index)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                <label className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Add Media</span>
                  <input type="file" multiple className="hidden" accept="image/*" onChange={handlePortfolioSelect} />
                </label>
              </div>
            </CardContent>
          </Card>

          <UnifiedProfessionalProfileForm rootData={profileData} onChange={setProfileData} onSave={handleSave} isSaving={isSaving} activeTab="media" />
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
