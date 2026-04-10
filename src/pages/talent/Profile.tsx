import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, ShieldCheck, Upload, X } from "lucide-react";
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
        } catch (e) {
          toast.error("Failed to upload introduction video");
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            Profile Setup
            {profileData?.isVerified && (
              <Badge className="bg-success text-success-foreground">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Verified
              </Badge>
            )}
            {isMinor && (
              <Badge variant="secondary">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Minor / Guardian Required
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Complete your profile to appear in casting searches and get booked faster</p>
        </div>
        <Button onClick={() => handleSave(false)} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Profile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <p className="text-sm text-muted-foreground">Use a clean headshot. This is what casting teams see first.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border">
                <AvatarImage
                  src={
                    pendingProfilePhoto?.preview ||
                    profileData?.profilePicture ||
                    profileData?.talent?.headshots?.[0]?.url ||
                    getAvatarUrl(profileData?.fullName)
                  }
                />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                  {getInitials(profileData?.fullName)}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="profile-photo-upload"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-4 w-4" />
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
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild disabled={isSaving}>
                  <label htmlFor="profile-photo-upload" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Select Photo
                  </label>
                </Button>
                {pendingProfilePhoto && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setPendingProfilePhoto(null)}>
                    Reset
                  </Button>
                )}
              </div>
              {pendingProfilePhoto && <p className="text-xs text-primary font-semibold">Preview mode — Save Profile to upload.</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <UnifiedTalentProfileForm rootData={profileData} onChange={setProfileData} onSave={handleSave} isSaving={isSaving} showTabs />

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Uploads</CardTitle>
          <p className="text-sm text-muted-foreground">Upload additional photos and an introduction video.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Additional Photos</p>
                <p className="text-xs text-muted-foreground">Upload more headshots or portfolio images.</p>
              </div>
              <label className="cursor-pointer">
                <input type="file" multiple accept="image/*" className="hidden" onChange={handlePortfolioSelect} disabled={isSaving} />
                <Button variant="outline" size="sm" asChild disabled={isSaving}>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Add Photos
                  </span>
                </Button>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(profileData?.talent?.headshots || []).map((shot: any) => (
                <div key={shot._id} className="relative aspect-square rounded-lg overflow-hidden border group">
                  <img src={shot.url} className="w-full h-full object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={async () => {
                      try {
                        await profileAPI.deleteHeadshot(shot._id);
                        setProfileData((prev: any) => ({
                          ...prev,
                          talent: { ...(prev?.talent || {}), headshots: (prev?.talent?.headshots || []).filter((s: any) => s._id !== shot._id) },
                        }));
                        toast.success("Image removed");
                      } catch {
                        toast.error("Failed to delete image");
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {pendingPortfolioPhotos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-primary/40">
                  <img src={photo.preview} className="w-full h-full object-cover opacity-80" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-7 w-7"
                    onClick={() => removePendingPortfolioPhoto(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Introduction Video</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input type="file" accept="video/*" onChange={handleIntroVideoSelect} disabled={isSaving} />
              <Button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving || !pendingIntroVideo}
                className="sm:w-48"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Upload Video
              </Button>
            </div>
            {pendingIntroVideo && <p className="text-xs text-primary font-semibold">Selected: {pendingIntroVideo.name}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
