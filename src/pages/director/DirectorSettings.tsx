import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, Upload, KeyRound, Eye } from "lucide-react";
import { profileAPI, userAPI, authAPI, subscriptionAPI } from "@/lib/api";
import { toast } from "sonner";
import { getAvatarUrl, getInitials } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UnifiedCastingDirectorProfileForm } from "@/components/profile/UnifiedCastingDirectorProfileForm";
import { UNIFIED_CASTING_DIRECTOR_FIELD_IDS } from "@/lib/unifiedCastingDirectorProfile/fieldSpec";
import { validateUnifiedCastingDirectorProfile } from "@/lib/unifiedCastingDirectorProfile/validation";

export default function DirectorSettings() {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [pendingProfilePhoto, setPendingProfilePhoto] = useState<{ file: File; preview: string } | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

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
      const [authRes, profileRes, subRes] = await Promise.all([
        authAPI.getMe().catch(() => ({ data: { success: false } })),
        profileAPI.getMe().catch(() => ({ data: { success: false } })),
        subscriptionAPI.getStatus().catch(() => ({ data: { success: false } })),
      ]);

      let combinedData: any = {};
      if (authRes.data?.success) combinedData = { ...combinedData, ...authRes.data.data };
      if (profileRes.data?.success) combinedData = { ...combinedData, ...profileRes.data.data };

      const unified = combinedData.unifiedCastingDirectorProfile || {};
      if (!unified.full_name && combinedData.fullName) unified.full_name = combinedData.fullName;
      if (!unified.display_name && combinedData.displayName) unified.display_name = combinedData.displayName;
      if (!unified.company_name && combinedData.company_name) unified.company_name = combinedData.company_name;
      if (!unified.professional_title && combinedData.professional_title) unified.professional_title = combinedData.professional_title;
      if (!unified.email && combinedData.email) unified.email = combinedData.email;
      if (!unified.short_bio && combinedData.bio) unified.short_bio = combinedData.bio;
      if (!unified.city && combinedData.city) unified.city = combinedData.city;
      if (!unified.country && combinedData.country) unified.country = combinedData.country;

      combinedData.unifiedCastingDirectorProfile = unified;
      setProfileData(combinedData);

      if (subRes.data?.success) setSubscriptionInfo(subRes.data.data);
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const unifiedPayload = {
        ...(profileData?.unifiedCastingDirectorProfile || {}),
        ...Object.fromEntries(Object.entries(profileData || {}).filter(([key]) => UNIFIED_CASTING_DIRECTOR_FIELD_IDS.has(key))),
      };

      if (Object.keys(unifiedPayload).length > 0) {
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
        
        // Use userAPI to update the main profile picture for the header/avatar
        const profileFormData = new FormData();
        profileFormData.append("profilePicture", pendingProfilePhoto.file);
        
        await Promise.all([
          profileAPI.addHeadshot(formData),
          userAPI.updateProfilePicture(profileFormData)
        ]);
        setPendingProfilePhoto(null);
      }

      const userUpdate = userAPI.updateProfile({
        fullName: unifiedPayload.full_name || profileData?.fullName,
        phoneNumber: unifiedPayload.phone_number || profileData?.phoneNumber,
        bio: unifiedPayload.short_bio || profileData?.bio,
        location: [unifiedPayload.city, unifiedPayload.country].filter(Boolean).join(", "),
        companyName: unifiedPayload.company_name || profileData?.companyName,
        unifiedCastingDirectorProfile: unifiedPayload,
      });

      const profileUpdate = profileAPI.updateMe({
        bio: unifiedPayload.full_about || unifiedPayload.short_bio,
        location: [unifiedPayload.city, unifiedPayload.country].filter(Boolean).join(", "),
        website: unifiedPayload.website,
        professionalCategory: unifiedPayload.primary_account_type,
        professionalRoles: [unifiedPayload.primary_account_type, ...(unifiedPayload.additional_account_types || [])].filter(Boolean),
        unifiedCastingDirectorProfile: unifiedPayload,
      });

      await Promise.all([userUpdate, profileUpdate]);
      await refreshUser();
      await fetchProfileData();
      toast.success("Casting profile updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success("Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update password");
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
            <TabsTrigger value="subscription" className="py-2 px-4">Subscription</TabsTrigger>
            <TabsTrigger value="security" className="py-2 px-4">Security</TabsTrigger>
          </TabsList>
        </div>

        {(["overview", "hiring", "projects", "roles", "audition", "commercial", "navigation"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            <UnifiedCastingDirectorProfileForm rootData={profileData} onChange={setProfileData} onSave={handleSave} isSaving={isSaving} activeTab={tab} />
          </TabsContent>
        ))}

        <TabsContent value="subscription" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">Plan: <strong>{subscriptionInfo?.plan?.name || "Free"}</strong></p>
              <p className="text-sm">Status: <strong>{subscriptionInfo?.status || "inactive"}</strong></p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" /> Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <Input type="password" placeholder="Current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />
              <Input type="password" placeholder="New password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />
              <Input type="password" placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} />
              <Button onClick={handleChangePassword} disabled={isSaving}>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
