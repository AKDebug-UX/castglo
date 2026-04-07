import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, Upload, KeyRound } from "lucide-react";
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

  useEffect(() => {
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

    fetchProfileData();
  }, []);

  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setPendingProfilePhoto({ file, preview: URL.createObjectURL(file) });
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
        await profileAPI.addHeadshot(formData);
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Casting Director / Agency Profile</h1>
          <p className="text-muted-foreground">Manage identity, hiring tools, casting workflow, and commercial settings.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={pendingProfilePhoto?.preview || profileData?.profilePicture || getAvatarUrl(profileData?.fullName)} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">{getInitials(profileData?.fullName)}</AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-secondary flex items-center justify-center cursor-pointer shadow-sm hover:bg-secondary/80">
                <Camera className="h-3.5 w-3.5" />
                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleProfilePhotoSelect} disabled={isSaving} />
              </label>
            </div>
            <div className="space-y-1">
              <Button variant="outline" size="sm" asChild disabled={isSaving}>
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Select New Logo
                </label>
              </Button>
              <p className="text-[10px] text-muted-foreground">JPG/PNG/WEBP.</p>
              {profileData?.isVerified && <Badge className="bg-green-600">Verified</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

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
