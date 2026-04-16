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

      <UnifiedTalentProfileForm rootData={profileData} onChange={setProfileData} onSave={handleSave} isSaving={isSaving} showTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "portfolio" && (
        <Card className="rounded-[2rem] border shadow-card overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader className="px-4 md:px-12 pt-4 md:pt-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <ImageIcon className="w-6 h-6 text-[#009698]" />
              Portfolio & Media
            </CardTitle>
            <p className="text-sm text-muted-foreground">High-quality media increases your chances of being shortlisted by 70%.</p>
          </CardHeader>
          <CardContent className="px-4 md:px-12 pt-0 space-y-10">
            {/* Main Profile Photo Section */}
            {(pendingProfilePhoto?.preview || profileData?.profilePicture) && (
              <div className="space-y-4 pb-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-lg">Main Profile Photo</p>
                    <p className="text-xs text-muted-foreground">This is your primary representative image across the platform.</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="text-[#009698] hover:bg-[#009698]/5 font-bold">
                    <label htmlFor="profile-photo-upload" className="cursor-pointer">Change Main Photo</label>
                  </Button>
                </div>

                <div className="relative w-full sm:w-64 aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-xl group">
                  <img
                    src={pendingProfilePhoto?.preview || profileData?.profilePicture}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-[#009698] text-white border-none px-3 py-1 shadow-lg">PRIMARY HEADSHOT</Badge>
                  </div>
                  {pendingProfilePhoto && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#009698]" />
                        <span className="text-sm font-bold text-[#009698]">Uploading...</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label htmlFor="profile-photo-upload" className="h-12 w-12 rounded-full bg-white text-[#009698] flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-bold text-lg">Additional Photos</p>
                  <p className="text-xs text-muted-foreground">Add up to 10 more high-resolution shots.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Additional Photos only */}
                {(profileData?.talent?.headshots || [])
                  .filter(shot => shot.url !== profileData?.profilePicture)
                  .map((shot: any) => (
                    <div key={shot._id} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-gray-100 group transition-all duration-300 hover:border-[#009698]/50 shadow-sm">
                      <img src={shot.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-10 w-10 rounded-full shadow-xl transform scale-0 group-hover:scale-100 transition-transform duration-300"
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
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}

                {pendingPortfolioPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-[#009698]/40 bg-[#009698]/5 animate-pulse">
                    <img src={photo.preview} className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white text-destructive shadow-lg"
                        onClick={() => removePendingPortfolioPhoto(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center">
                      <Badge variant="secondary" className="text-[8px] bg-white/80">PENDING</Badge>
                    </div>
                  </div>
                ))}

                {(profileData?.talent?.headshots || []).length + pendingPortfolioPhotos.length < 10 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors group">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handlePortfolioSelect} disabled={isSaving} />
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#009698]/10 group-hover:text-[#009698] transition-colors">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-[#009698]">Add New</span>
                  </label>
                )}
              </div>
            </div>

            <div className="pt-10 border-t space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-bold text-lg">Introduction Video</p>
                  <p className="text-xs text-muted-foreground">Upload a 30-60s video introducing yourself.</p>
                </div>
                <div className="flex w-full sm:w-auto gap-3">
                  <Input type="file" accept="video/*" className="hidden" id="video-upload" onChange={handleIntroVideoSelect} disabled={isSaving} />
                  <Button variant="outline" asChild className="flex-1 sm:flex-none rounded-xl border-[#009698] text-[#009698] hover:bg-[#009698]/5 font-bold">
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Monitor className="w-4 h-4 mr-2" />
                      Select Video
                    </label>
                  </Button>
                  <Button
                    onClick={() => handleSave(true)}
                    disabled={isSaving || !pendingIntroVideo}
                    className="flex-1 sm:flex-none bg-[#009698] hover:bg-[#009698]/90 font-bold px-6 rounded-xl shadow-lg shadow-[#009698]/20"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Upload Video"
                    )}
                  </Button>
                </div>
              </div>

              {pendingIntroVideo ? (
                <div className="rounded-2xl border-2 border-[#009698]/30 bg-[#009698]/5 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#009698] shadow-sm">
                        <Youtube className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[200px]">{pendingIntroVideo.name}</p>
                        <p className="text-xs text-[#009698] font-medium">Ready for upload • {(pendingIntroVideo.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive rounded-full" onClick={() => setPendingIntroVideo(null)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ) : profileData?.unifiedTalentProfile?.intro_video ? (
                <div className="rounded-2xl overflow-hidden border bg-black shadow-xl group">
                  <video src={profileData.unifiedTalentProfile.intro_video} controls className="w-full aspect-video object-contain" />
                  <div className="bg-white/95 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">Live Portfolio Video</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-primary">Replace</Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center bg-gray-50/50">
                  <Youtube className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-sm font-medium text-muted-foreground">Showcase your personality and communication skills.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">MP4 or MOV formats supported (Max 100MB)</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
