import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
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
} from "@/lib/unifiedProfessionalProfile/fieldSpec";
import { validateUnifiedProfessionalProfile } from "@/lib/unifiedProfessionalProfile/validation";

export default function ProfessionalProfile() {
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [pendingProfilePhoto, setPendingProfilePhoto] = useState<{ file: File; preview: string } | null>(null);
  const [pendingPortfolioPhotos, setPendingPortfolioPhotos] = useState<{ file: File; preview: string }[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [authRes, profileRes] = await Promise.all([
          authAPI.getMe().catch(() => ({ data: { success: false } })),
          profileAPI.getMe().catch(() => ({ data: { success: false } })),
        ]);

        let combinedData: any = {};
        if (authRes.data?.success) combinedData = { ...combinedData, ...authRes.data.data };
        if (profileRes.data?.success) combinedData = { ...combinedData, ...profileRes.data.data };

        const unified = combinedData.unifiedProfessionalProfile || {};
        if (!unified.full_name && combinedData.fullName) unified.full_name = combinedData.fullName;
        if (!unified.display_name && combinedData.displayName) unified.display_name = combinedData.displayName;
        if (!unified.professional_title && combinedData.professional_title) unified.professional_title = combinedData.professional_title;
        if (!unified.email && combinedData.email) unified.email = combinedData.email;
        if (!unified.phone_number && (combinedData.phoneNumber || combinedData.phone)) unified.phone_number = combinedData.phoneNumber || combinedData.phone;
        if (!unified.short_bio && combinedData.bio) unified.short_bio = combinedData.bio;
        if (!unified.full_bio && combinedData.full_bio) unified.full_bio = combinedData.full_bio;
        if (!unified.city && combinedData.city) unified.city = combinedData.city;
        if (!unified.country && combinedData.country) unified.country = combinedData.country;
        if (!unified.primary_professional_type && combinedData.professionalCategory) unified.primary_professional_type = combinedData.professionalCategory;

        combinedData.unifiedProfessionalProfile = unified;
        setProfileData(combinedData);
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const unifiedPayload = {
        ...(profileData?.unifiedProfessionalProfile || {}),
        ...Object.fromEntries(Object.entries(profileData || {}).filter(([key]) => UNIFIED_PROFESSIONAL_FIELD_IDS.has(key))),
      };

      const shouldValidateUnified = Object.keys(unifiedPayload).length > 0;
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
        await profileAPI.addHeadshot(formData);
        setPendingProfilePhoto(null);
      }

      if (pendingPortfolioPhotos.length > 0) {
        await Promise.all(
          pendingPortfolioPhotos.map((photo) => {
            const formData = new FormData();
            formData.append("headshot", photo.file);
            return profileAPI.addHeadshot(formData);
          })
        );
        setPendingPortfolioPhotos([]);
      }

      const userUpdate = userAPI.updateProfile({
        fullName: unifiedPayload.full_name,
        phoneNumber: unifiedPayload.phone_number,
        bio: unifiedPayload.short_bio,
        location: [unifiedPayload.city, unifiedPayload.country].filter(Boolean).join(", "),
        companyName: unifiedPayload.business_name,
        unifiedProfessionalProfile: unifiedPayload,
      });

      const profileUpdate = profileAPI.updateMe({
        bio: unifiedPayload.full_bio || unifiedPayload.short_bio,
        location: [unifiedPayload.city, unifiedPayload.country].filter(Boolean).join(", "),
        website: unifiedPayload.portfolio_website,
        instagram: unifiedPayload.instagram_url,
        professionalCategory: unifiedPayload.primary_professional_type,
        professionalRoles: [unifiedPayload.primary_professional_type, ...(unifiedPayload.additional_professional_types || [])].filter(Boolean),
        unifiedProfessionalProfile: unifiedPayload,
      });

      await Promise.all([userUpdate, profileUpdate]);
      await refreshUser();
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
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
      <Link to="/professional" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Industry Professional Profile</h1>
          <p className="text-muted-foreground">Complete all profile, service, portfolio, and business fields.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#009698] hover:bg-[#009698]/90">
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Profile
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#009698]/20 to-[#009698]/5 relative">
          {profileData?.cover_image ? (
            <img src={profileData.cover_image} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary/20"><ImageIcon className="w-8 h-8" /></div>
          )}
          <Button variant="secondary" size="sm" className="absolute bottom-3 right-3 h-8 text-xs gap-2">
            <Camera className="w-3.5 h-3.5" /> Edit Banner
          </Button>
        </div>
        <CardContent className="pt-0 relative">
          <div className="flex items-end gap-5 -mt-10 mb-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                <AvatarImage src={pendingProfilePhoto?.preview || profileData?.profilePicture || getAvatarUrl(profileData?.fullName)} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">{getInitials(profileData?.fullName)}</AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-6 w-6" />
                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleProfilePhotoSelect} disabled={isSaving} />
              </label>
            </div>
            <div className="pb-2">
              <h2 className="text-lg font-bold">{profileData?.fullName || "Professional Name"}</h2>
              <p className="text-sm text-muted-foreground">{profileData?.unifiedProfessionalProfile?.professional_title || "Industry Professional"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="h-auto p-1 gap-1 inline-flex">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="specialized">Specialized</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
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

        <TabsContent value="specialized" className="mt-4">
          <UnifiedProfessionalProfileForm rootData={profileData} onChange={setProfileData} onSave={handleSave} isSaving={isSaving} activeTab="specialized" />
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
      </Tabs>
    </div>
  );
}
