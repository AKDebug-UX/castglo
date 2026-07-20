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
  const { user: authUser, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [pendingProfilePhoto, setPendingProfilePhoto] = useState<{ file: File; preview: string } | null>(null);

  const snakeToCamel = (str: string) => str.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''));
  const camelToSnake = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

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
      const [profileRes] = await Promise.all([
        profileAPI.getMe().catch(() => ({ data: { success: false } })),
      ]);

      let combinedData: any = {};
      if (authUser) {
        combinedData = { ...combinedData, ...authUser };
        // Store the User ID separately so it's not overwritten by the profile _id
        combinedData.userId = authUser.id;
      }
      if (profileRes.data?.success) combinedData = { ...combinedData, ...profileRes.data.data };

      const cp = combinedData.castingDirectorProfile || combinedData.castingProfile || {};
      const unified = combinedData.unifiedCastingDirectorProfile || {};

      // 1. Map root and nested API properties back to unified field IDs
      // Create a flat map of all keys in the response to catch nested data
      const flatData: Record<string, any> = {};
      const flatten = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        Object.entries(obj).forEach(([key, value]) => {
          if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            flatten(value);
          } else {
            flatData[key] = value;
          }
        });
      };

      // Flatten root data and the specialized profile object
      flatten(combinedData);

      // Auto-map everything found in flatData to the unified state
      Object.entries(flatData).forEach(([key, value]) => {
        const snakeKey = camelToSnake(key);
        if (UNIFIED_CASTING_DIRECTOR_FIELD_IDS.has(snakeKey)) {
          if (typeof value === "boolean") {
            unified[snakeKey] = value ? "Yes" : "No";
          } else {
            unified[snakeKey] = value;
          }
        }
        // Also check if the key itself is already snake_case and in the spec
        if (UNIFIED_CASTING_DIRECTOR_FIELD_IDS.has(key)) {
          if (typeof value === "boolean") {
            unified[key] = value ? "Yes" : "No";
          } else {
            unified[key] = value;
          }
        }
      });

      // 2. Explicit mappings for root and special fields (ensures priority for core identity)
      if (combinedData.fullName) unified.full_name = combinedData.fullName;
      if (combinedData.displayName || cp.displayName) unified.display_name = combinedData.displayName || cp.displayName;
      if (combinedData.company_name || cp.companyName) unified.company_name = combinedData.company_name || cp.companyName;
      if (combinedData.professional_title || cp.professionalTitle || combinedData.jobTitle) unified.professional_title = combinedData.professional_title || cp.professionalTitle || combinedData.jobTitle;
      if (combinedData.email) unified.email = combinedData.email;
      if (combinedData.phone || combinedData.phoneNumber) unified.phone_number = combinedData.phone || combinedData.phoneNumber;

      const addr = combinedData.address || cp.location || {};
      if (addr.city || combinedData.city) unified.city = addr.city || combinedData.city;
      if (addr.state) unified.state = addr.state;
      if (addr.country || combinedData.country) unified.country = addr.country || combinedData.country;

      if (cp.accountType || combinedData.primaryAccountType) unified.primary_account_type = cp.accountType || combinedData.primaryAccountType;
      if (cp.additionalAccountTypes || combinedData.additionalAccountTypes) unified.additional_account_types = cp.additionalAccountTypes || combinedData.additionalAccountTypes;
      if (cp.industryAreas || combinedData.industryAreas) unified.industry_areas = cp.industryAreas || combinedData.industryAreas;
      if (cp.applicantStatuses || combinedData.applicantStatuses) unified.applicant_statuses = cp.applicantStatuses || combinedData.applicantStatuses;
      if (cp.socialLinks || combinedData.socialLinks) unified.social_links = cp.socialLinks || combinedData.socialLinks;
      if (cp.website || combinedData.website) unified.website = cp.website || combinedData.website;

      // Ensure booleans are correctly represented as "Yes"/"No" for the UI selects
      const booleanFields = [
        'match_engine_enabled', 'enable_manage_applicants', 'enable_switch_between_roles',
        'enable_filter_applicants', 'enable_matched_applicants', 'enable_bulk_actions',
        'enable_folders', 'enable_audition_requests', 'enable_private_notes',
        'enable_messaging', 'enable_collaborators', 'enable_role_management',
        'verified_badge', 'nudity_required', 'preaudition_request_custom_video',
        'preaudition_request_custom_audio', 'preaudition_request_additional_media',
        'preaudition_send_message', 'preaudition_questions_enabled', 'preaudition_question_required',
        'remote_option_available', 'audition_required', 'interview_required',
        'instant_posting', 'featured_posting', 'urgent_hiring_badge',
        'priority_matched_applicants', 'extended_visibility', 'featured_role_highlight',
        'social_promotion_boost', 'premium_analytics'
      ];

      booleanFields.forEach(field => {
        const camel = snakeToCamel(field);
        // Search in flatData first, then fallback to current unified value
        const val = flatData[camel] !== undefined ? flatData[camel] : (flatData[field] !== undefined ? flatData[field] : unified[field]);

        if (val === true || val === "Yes") unified[field] = "Yes";
        else if (val === false || val === "No") unified[field] = "No";
      });

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

      // 1. Update Specialized Casting Profile Information
      // Robustly map all unified fields to camelCase for backend compatibility

      const payload: any = {};

      // Auto-map ONLY fields that belong to the Casting Director specification
      // This prevents sending invalid data like empty socialLinks from other profile contexts
      Object.entries(unifiedPayload).forEach(([key, value]) => {
        if (UNIFIED_CASTING_DIRECTOR_FIELD_IDS.has(key)) {
          const camelKey = snakeToCamel(key);
          payload[camelKey] = value;
        }
      });

      // Explicitly ensure core fields are mapped to root expected names if different
      payload.fullName = unifiedPayload.full_name || profileData?.fullName || authUser?.fullName || "";
      payload.email = unifiedPayload.email || profileData?.email || authUser?.email || "";
      payload.phoneNumber = unifiedPayload.phone_number || profileData?.phoneNumber || (authUser as any)?.phone || "";
      payload.professionalTitle = unifiedPayload.professional_title || profileData?.professional_title || "";
      payload.displayName = unifiedPayload.display_name || (authUser as any)?.stageName || "";
      payload.companyName = unifiedPayload.company_name || profileData?.companyName || "";
      payload.city = unifiedPayload.city || profileData?.city || "";
      payload.country = unifiedPayload.country || profileData?.country || "";

      // Handle boolean conversions and sanitize social links
      Object.keys(payload).forEach(key => {
        if (payload[key] === "Yes") payload[key] = true;
        if (payload[key] === "No") payload[key] = false;

        // Ensure socialLinks only contains valid URIs (strings starting with http/https)
        if (key === "socialLinks" && Array.isArray(payload[key])) {
          payload[key] = payload[key].filter((link: any) =>
            typeof link === "string" && link.trim() !== "" && (link.startsWith("http://") || link.startsWith("https://"))
          );
          // If the array is empty after filtering, we might want to remove it entirely or send empty array
          if (payload[key].length === 0) delete payload[key];
        }
      });

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
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{profileData?.fullName || "Director Profile"}</h1>
              {profileData?.isVerified && (
                <Badge className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-md px-3 py-1">
                  Verified Director
                </Badge>
              )}
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur-md">
                {profileData?.unifiedCastingDirectorProfile?.experience_level || profileData?.experienceLevel || "Professional"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-[#e0f1f1] text-lg opacity-90">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">{profileData?.unifiedCastingDirectorProfile?.professional_title || profileData?.professionalTitle || "Casting Director"}</span>
               
              </div>
              {(profileData?.unifiedCastingDirectorProfile?.city || profileData?.unifiedCastingDirectorProfile?.country) && (
                <div className="flex items-center gap-1.5 text-sm opacity-80">
                  <span className="opacity-50">|</span>
                  <span>{[profileData?.unifiedCastingDirectorProfile?.city, profileData?.unifiedCastingDirectorProfile?.country].filter(Boolean).join(", ")}</span>
                </div>
              )}
            </div>

            {(profileData?.unifiedCastingDirectorProfile?.industry_areas?.length > 0) && (
              <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                {profileData.unifiedCastingDirectorProfile.industry_areas.slice(0, 3).map((area: string) => (
                  <span key={area} className="text-xs bg-black/20 px-2 py-0.5 rounded-full border border-white/10">
                    {area}
                  </span>
                ))}
                {profileData.unifiedCastingDirectorProfile.industry_areas.length > 3 && (
                  <span className="text-xs opacity-60">+{profileData.unifiedCastingDirectorProfile.industry_areas.length - 3} more</span>
                )}
              </div>
            )}

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
              onClick={() => handleSave()}
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
              <Link to={`/director/${profileData?.userId || profileData?._id || profileData?.id}`}>
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
            <TabsTrigger value="commercial" className="py-2 px-4">Commercial</TabsTrigger>
            <TabsTrigger value="summary" className="py-2 px-4">Summary</TabsTrigger>
          </TabsList>
        </div>

        {(["overview", "hiring", "commercial"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6 space-y-6">
            <UnifiedCastingDirectorProfileForm rootData={profileData} onChange={setProfileData} onSave={handleSave} isSaving={isSaving} activeTab={tab} />
          </TabsContent>
        ))}

        <TabsContent value="summary" className="mt-6 space-y-6">
          <ProfileSummaryView
            fields={UNIFIED_CASTING_DIRECTOR_PROFILE_FIELD_SPEC}
            values={{ ...profileData, ...(profileData?.unifiedCastingDirectorProfile || {}) }}
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
