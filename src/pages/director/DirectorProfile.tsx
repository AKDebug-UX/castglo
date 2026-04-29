import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, Upload, Eye, Save } from "lucide-react";
import { profileAPI, userAPI, authAPI } from "@/lib/api";
import { toast } from "sonner";
import { getAvatarUrl, getInitials } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UnifiedCastingDirectorProfileForm } from "@/components/profile/UnifiedCastingDirectorProfileForm";
import { UNIFIED_CASTING_DIRECTOR_FIELD_IDS, UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC } from "@/lib/unifiedCastingDirectorProfile/fieldSpec";
import { validateUnifiedCastingDirectorProfile } from "@/lib/unifiedCastingDirectorProfile/validation";
import { ProfileSummaryView } from "@/components/profile/ProfileSummaryView";

export default function DirectorProfile() {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [pendingProfilePhoto, setPendingProfilePhoto] = useState<{ file: File; preview: string } | null>(null);

  const completionPercentage = useMemo(() => {
    if (!profileData) return 0;
    const unified = profileData.unifiedCastingDirectorProfile || {};
    const coreFields = [
      'full_name', 'email', 'phone_number', 'city', 'country',
      'short_bio', 'primary_account_type'
    ];
    const filled = coreFields.filter(f => unified[f] || profileData[f]).length;
    const hasPhoto = !!(profileData.profilePicture || profileData.headshots?.length);
    return Math.round(((filled + (hasPhoto ? 1 : 0)) / (coreFields.length + 1)) * 100);
  }, [profileData]);

  const fetchProfileData = async () => {
    try {
      const [authRes, profileRes] = await Promise.all([
        authAPI.getMe().catch(() => ({ data: { success: false } })),
        profileAPI.getMe().catch(() => ({ data: { success: false } })),
      ]);

      let combinedData: any = {};
      if (authRes.data?.success) combinedData = { ...combinedData, ...authRes.data.data };
      if (profileRes.data?.success) combinedData = { ...combinedData, ...profileRes.data.data };

      const cp = combinedData.castingDirectorProfile || combinedData.castingProfile || {};
      const unified = combinedData.unifiedCastingDirectorProfile || {};

      // Map root and nested API properties back to unified field IDs
      if (!unified.full_name) unified.full_name = combinedData.fullName;
      if (!unified.display_name) unified.display_name = combinedData.displayName || cp.displayName;
      if (!unified.company_name) unified.company_name = combinedData.company_name || cp.companyName;
      if (!unified.professional_title) unified.professional_title = combinedData.professional_title || cp.professionalTitle || combinedData.jobTitle;
      if (!unified.email) unified.email = combinedData.email;
      if (!unified.phone_number) unified.phone_number = combinedData.phone || combinedData.phoneNumber;
      if (!unified.short_bio) unified.short_bio = combinedData.bio || cp.shortBio;
      if (!unified.full_about) unified.full_about = combinedData.fullAbout || cp.fullAbout;
      
      const addr = combinedData.address || cp.location || {};
      if (!unified.city) unified.city = addr.city || combinedData.city;
      if (!unified.state) unified.state = addr.state;
      if (!unified.country) unified.country = addr.country || combinedData.country;
      
      if (!unified.primary_account_type) unified.primary_account_type = cp.accountType;
      if (!unified.additional_account_types) unified.additional_account_types = cp.additionalAccountTypes;
      if (!unified.industry_areas) unified.industry_areas = cp.industryAreas;
      if (!unified.applicant_statuses) unified.applicant_statuses = cp.applicantStatuses;
      
      if (unified.match_engine_enabled === undefined) {
        unified.match_engine_enabled = cp.matchEngineEnabled ? "Yes" : "No";
      }
      if (unified.enable_manage_applicants === undefined) {
        unified.enable_manage_applicants = cp.enableManageApplicants ? "Yes" : "No";
      }
      if (!unified.notes_policy) unified.notes_policy = cp.notesPolicy;

      combinedData.unifiedCastingDirectorProfile = unified;
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

  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setPendingProfilePhoto({ file, preview: URL.createObjectURL(file) });
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
      await fetchProfileData();
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
        ...(profileData?.unifiedCastingDirectorProfile || {}),
        ...Object.fromEntries(Object.entries(profileData || {}).filter(([key]) => UNIFIED_CASTING_DIRECTOR_FIELD_IDS.has(key))),
      };

      if (!skipValidation && Object.keys(unifiedPayload).length > 0) {
        const validation = validateUnifiedCastingDirectorProfile(unifiedPayload);
        if (!validation.success) {
          const message = validation.error.issues[0]?.message || "Please fix casting profile validation errors.";
          toast.error(message);
          return;
        }
      }

      if (pendingProfilePhoto) {
        const formData = new FormData();
        formData.append("headshot", pendingProfilePhoto.file);
        
        const profileFormData = new FormData();
        profileFormData.append("profilePicture", pendingProfilePhoto.file);
        
        await Promise.all([
          profileAPI.addHeadshot(formData),
          userAPI.updateProfilePicture(profileFormData)
        ]);
        setPendingProfilePhoto(null);
      }

      // 1. Update Specialized Casting Profile Information FIRST
      // Aligning strictly with backend validation requirements
      const payload: any = {
        // ALWAYS include mandatory fields to satisfy backend validation
        fullName: activeTab === "overview" ? (unifiedPayload.full_name || profileData?.fullName || user?.fullName || "") : (profileData?.fullName || user?.fullName || unifiedPayload.full_name || ""),
        email: activeTab === "overview" ? (unifiedPayload.email || profileData?.email || user?.email || "") : (profileData?.email || user?.email || unifiedPayload.email || ""),
        phoneNumber: activeTab === "overview" ? (unifiedPayload.phone_number || profileData?.phoneNumber || user?.phone || "") : (profileData?.phoneNumber || user?.phone || unifiedPayload.phone_number || ""),
        professionalTitle: activeTab === "overview" ? unifiedPayload.professional_title : (profileData?.unifiedCastingDirectorProfile?.professional_title || unifiedPayload.professional_title),
        city: activeTab === "overview" ? (unifiedPayload.city || user?.address?.city || "") : (profileData?.unifiedCastingDirectorProfile?.city || unifiedPayload.city || user?.address?.city || ""),
        country: activeTab === "overview" ? (unifiedPayload.country || user?.address?.country || "") : (profileData?.unifiedCastingDirectorProfile?.country || unifiedPayload.country || user?.address?.country || ""),
        primaryAccountType: activeTab === "overview" ? unifiedPayload.primary_account_type : (profileData?.unifiedCastingDirectorProfile?.primary_account_type || unifiedPayload.primary_account_type),
      };

      if (activeTab === "overview") {
        Object.assign(payload, {
          displayName: unifiedPayload.display_name || user?.stageName || "",
          companyName: unifiedPayload.company_name,
          shortBio: unifiedPayload.short_bio || "",
          fullAbout: unifiedPayload.full_about || "",
          yearsOfExperience: unifiedPayload.years_of_experience,
          experienceLevel: unifiedPayload.experience_level,
          industryAreas: unifiedPayload.industry_areas || [],
          applicantStatuses: unifiedPayload.applicant_statuses || ["Reviewing", "Shortlisted", "Rejected"],
        });
      }

      if (["hiring", "projects", "roles", "audition", "commercial"].includes(activeTab)) {
        Object.assign(payload, {
          matchEngineEnabled: unifiedPayload.match_engine_enabled === "Yes" || unifiedPayload.match_engine_enabled === true,
          enableManageApplicants: unifiedPayload.enable_manage_applicants === "Yes" || unifiedPayload.enable_manage_applicants === true,
          notesPolicy: unifiedPayload.notes_policy
        });
      }

      if (activeTab === "summary") {
        return;
      }

      await profileAPI.updateCasting(payload);

      await refreshUser();
      await fetchProfileData();
      toast.success("Casting profile updated successfully");
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
                <h1 className="text-3xl font-bold tracking-tight">{profileData?.fullName || "Director Profile"}</h1>
                {profileData?.isVerified && (
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-md px-3 py-1">
                    Verified Director
                  </Badge>
                )}
              </div>
              <p className="text-[#e0f1f1] text-lg opacity-90">{profileData?.unifiedCastingDirectorProfile?.professional_title || "Casting Director / Agency"}</p>
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
                <Eye className="w-5 h-5 mr-2" />
                View Public Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="h-auto p-1 gap-1 inline-flex">
            <TabsTrigger value="overview" className="py-2 px-4">Overview</TabsTrigger>
            <TabsTrigger value="hiring" className="py-2 px-4">Hiring Tools</TabsTrigger>
            <TabsTrigger value="projects" className="py-2 px-4">Projects</TabsTrigger>
            <TabsTrigger value="roles" className="py-2 px-4">Roles</TabsTrigger>
            <TabsTrigger value="audition" className="py-2 px-4">Pre-Audition</TabsTrigger>
            <TabsTrigger value="commercial" className="py-2 px-4">Commercial</TabsTrigger>
            <TabsTrigger value="navigation" className="py-2 px-4">Tabs</TabsTrigger>
            <TabsTrigger value="summary" className="py-2 px-4">Summary</TabsTrigger>
          </TabsList>
        </div>

        {(["overview", "hiring", "projects", "roles", "audition", "commercial", "navigation"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6 space-y-6">
            <UnifiedCastingDirectorProfileForm rootData={profileData} onChange={setProfileData} onSave={handleSave} isSaving={isSaving} activeTab={tab} />
          </TabsContent>
        ))}

        <TabsContent value="summary" className="mt-6 space-y-6">
          <ProfileSummaryView 
            fields={UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC} 
            values={{...profileData, ...(profileData?.unifiedCastingDirectorProfile || {})}} 
            title="Casting Director Profile Summary" 
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
