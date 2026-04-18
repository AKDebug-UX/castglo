import * as React from "react";
import { useEffect, useMemo, useState } from "react";
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
  const [pendingIntroVideo, setPendingIntroVideo] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [authRes, profileRes] = await Promise.all([
          authAPI.getMe().catch(() => ({ data: { success: false } })),
          profileAPI.getMe().catch(() => ({ data: { success: false } })),
        ]);

        let combinedData: any = {};
        if (authRes.data?.success) combinedData = { ...combinedData, ...authRes.data.data };
        if (profileRes.data?.success) combinedData = { ...combinedData, ...profileRes.data.data };

        const unified = combinedData.unifiedTalentProfile || {};
        if (!unified.full_name && combinedData.fullName) unified.full_name = combinedData.fullName;
        if (!unified.display_name && combinedData.stageName) unified.display_name = combinedData.stageName;
        if (!unified.email && combinedData.email) unified.email = combinedData.email;
        if (!unified.phone_number && (combinedData.phone || combinedData.phoneNumber)) unified.phone_number = combinedData.phone || combinedData.phoneNumber;
        if (!unified.address && combinedData.address) unified.address = combinedData.address;
        if (!unified.nationality && combinedData.nationality) unified.nationality = combinedData.nationality;
        if (!unified.gender && combinedData.gender) unified.gender = combinedData.gender;

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

  const handleSave = async (skipValidation: boolean = false) => {
    if (!profileData) return;
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
        await profileAPI.addHeadshot(formData);
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

      await Promise.all([
        userAPI.updateProfile({
          fullName: unifiedPayload.full_name || profileData.fullName,
          stageName: unifiedPayload.display_name || profileData.stageName,
          bio: unifiedPayload.short_bio || profileData.bio,
          location: unifiedPayload.current_city
            ? `${unifiedPayload.current_city}${unifiedPayload.current_country ? ", " + unifiedPayload.current_country : ""}`
            : profileData.location,
          phoneNumber: unifiedPayload.phone_number || profileData.phone,
          address: unifiedPayload.address || profileData.address,
          unifiedTalentProfile: unifiedPayload,
        }),
        profileAPI.updateMe({
          bio: unifiedPayload.short_bio || profileData.bio,
          unifiedTalentProfile: unifiedPayload,
        }),
      ]);

      await refreshUser();
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
      'full_name', 'email', 'phone_number', 'date_of_birth', 'age_group',
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

          <div className="flex flex-col gap-3 min-w-[160px]">
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
        pendingIntroVideo={pendingIntroVideo}
        setPendingIntroVideo={setPendingIntroVideo}
        handleIntroVideoSelect={handleIntroVideoSelect}
      />

    </div>
  );
}
