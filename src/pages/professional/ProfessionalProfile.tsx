import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Briefcase, Building2, Award, Camera, 
  Globe, Instagram, Linkedin, Loader2, 
  MapPin, Plus, Upload, X, Shield, 
  Plane, Monitor, Info, ArrowLeft,
  Image as ImageIcon,
  User,
  ShieldCheck,
  FileCheck,
  History,
  CreditCard,
  Bell,
  KeyRound,
  Smartphone,
  Mail,
  UserMinus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { authAPI, profileAPI, userAPI, blockchainAPI, subscriptionAPI } from "@/lib/api";
import { getAvatarUrl, getInitials } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UnifiedTalentProfileForm } from "@/components/profile/UnifiedTalentProfileForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UNIFIED_FIELD_IDS } from "@/lib/unifiedTalentProfile/fieldSpec";
import { validateUnifiedTalentProfile } from "@/lib/unifiedTalentProfile/validation";

const professionalCategories = [
  "Talent Agent",
  "Talent Manager",
  "Casting Professional",
  "Photographer",
  "Videographer",
  "Stylist",
  "Makeup Artist",
  "Acting Coach",
  "Voice Coach",
  "Producer",
  "Director",
  "Other"
];

export default function ProfessionalProfile() {
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [pendingProfilePhoto, setPendingProfilePhoto] = useState<{ file: File, preview: string } | null>(null);
  const [pendingPortfolioPhotos, setPendingPortfolioPhotos] = useState<{ file: File, preview: string }[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [authRes, profileRes] = await Promise.all([
          authAPI.getMe().catch(() => ({ data: { success: false } })),
          profileAPI.getMe().catch(() => ({ data: { success: false } }))
        ]);

        let combinedData = {};

        if (authRes.data?.success) {
          combinedData = { ...combinedData, ...authRes.data.data };
        }

        if (profileRes.data?.success) {
          combinedData = { ...combinedData, ...profileRes.data.data };
        }

        // Map legacy fields to unified talent profile for pre-filling
        const unified = combinedData.unifiedTalentProfile || {};
        if (!unified.full_name && combinedData.fullName) unified.full_name = combinedData.fullName;
        if (!unified.display_name && combinedData.stageName) unified.display_name = combinedData.stageName;
        if (!unified.phone_number && (combinedData.phone || combinedData.phoneNumber)) unified.phone_number = combinedData.phone || combinedData.phoneNumber;
        if (!unified.address && combinedData.address) unified.address = combinedData.address;
        if (!unified.location && combinedData.location) unified.location = combinedData.location;
        if (!unified.city && combinedData.city) unified.city = combinedData.city;
        if (!unified.country && combinedData.country) unified.country = combinedData.country;
        if (unified.willing_to_travel === undefined && combinedData.willing_to_travel !== undefined) unified.willing_to_travel = combinedData.willing_to_travel;
        if (unified.remote_services_available === undefined && combinedData.remote_services_available !== undefined) unified.remote_services_available = combinedData.remote_services_available;
        
        combinedData.unifiedTalentProfile = unified;

        setProfileData(combinedData);
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const unifiedPayload = {
        ...(profileData?.unifiedTalentProfile || {}),
        ...Object.fromEntries(Object.entries(profileData || {}).filter(([key]) => UNIFIED_FIELD_IDS.has(key))),
      };

      const shouldValidateUnified = Object.keys(unifiedPayload).length > 0;
      if (shouldValidateUnified) {
        const validation = validateUnifiedTalentProfile(unifiedPayload);
        if (!validation.success) {
          const message = validation.error.issues[0]?.message || "Please fix unified profile validation errors.";
          toast.error(message);
          return;
        }
      }

      // 1. Upload new avatar if selected
      if (pendingProfilePhoto) {
        const formData = new FormData();
        formData.append("headshot", pendingProfilePhoto.file);
        await profileAPI.addHeadshot(formData);
        setPendingProfilePhoto(null);
      }

      // 2. Upload pending portfolio photos
      if (pendingPortfolioPhotos.length > 0) {
        await Promise.all(pendingPortfolioPhotos.map(async (photo) => {
          const formData = new FormData();
          formData.append("headshot", photo.file);
          return profileAPI.addHeadshot(formData);
        }));
        setPendingPortfolioPhotos([]);
      }

      // 3. Update data using the same unified approach as Talent Profile
      const profileUpdate = profileAPI.updateMe({
        bio: unifiedPayload.full_bio || profileData?.bio,
        skills: profileData?.skills || [],
        location: unifiedPayload.location || profileData?.location,
        stageName: unifiedPayload.display_name || profileData?.stageName || profileData?.fullName,
        professionalRoles: profileData?.professionalRoles || [],
        // industry professional fields
        display_name: unifiedPayload.display_name,
        business_name: unifiedPayload.business_name,
        professional_title: unifiedPayload.professional_title,
        experience_level: unifiedPayload.experience_level,
        experienceYears: unifiedPayload.experience_years,
        professionalCategory: unifiedPayload.primary_talent_type,
        specialties: profileData?.specialties || [],
        website: unifiedPayload.website || profileData?.website,
        instagram: unifiedPayload.instagram_url || profileData?.instagram,
        linkedin: unifiedPayload.linkedin_url || profileData?.linkedin,
        unifiedTalentProfile: unifiedPayload
      });

      const userUpdate = userAPI.updateProfile({
        fullName: unifiedPayload.full_name || profileData?.fullName,
        location: unifiedPayload.location || profileData?.location,
        bio: unifiedPayload.short_bio || profileData?.bio,
        companyName: unifiedPayload.business_name || profileData?.companyName,
        phoneNumber: unifiedPayload.phone_number || profileData?.phone || profileData?.phoneNumber,
        address: unifiedPayload.address || profileData?.address,
        unifiedTalentProfile: unifiedPayload
      });

      const [profileResponse, userResponse] = await Promise.all([
        profileUpdate,
        userUpdate
      ]);

      if (profileResponse.data.success || userResponse.data.success) {
        toast.success("Profile updated successfully");
        
        // Refresh global user state for header/sidebar
        await refreshUser();

        // Refresh data from server to ensure state is in sync
        const [authRes, profileRes] = await Promise.all([
          authAPI.getMe().catch(() => ({ data: { success: false } })),
          profileAPI.getMe().catch(() => ({ data: { success: false } }))
        ]);

        let combinedData = {};
        if (authRes.data?.success) combinedData = { ...combinedData, ...authRes.data.data };
        if (profileRes.data?.success) combinedData = { ...combinedData, ...profileRes.data.data };
        
        setProfileData(combinedData);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const preview = URL.createObjectURL(file);
    setPendingProfilePhoto({ file, preview });
  };

  const handlePortfolioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPendingPortfolioPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePendingPortfolioPhoto = (index: number) => {
    setPendingPortfolioPhotos(prev => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
      <Link 
        to="/professional"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile Management</h1>
          <p className="text-muted-foreground">Manage your brand identity and professional services</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#009698] hover:bg-[#009698]/90">
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Profile
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#009698]/20 to-[#009698]/5 relative">
          {profileData?.cover_image ? (
            <img src={profileData.cover_image} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary/20">
              <ImageIcon className="w-8 h-8" />
            </div>
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
              <p className="text-sm text-muted-foreground">{profileData?.professional_title || "Industry Professional"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="w-full">
        <div className="sticky top-0 z-20 bg-[#F1FBFB]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F1FBFB]/60 py-4 -mx-1 px-1">
          <div className="overflow-x-auto pb-1 scrollbar-hide">
            <TabsList className="h-auto p-1 gap-1 inline-flex bg-white/50 border shadow-sm rounded-xl">
              <TabsTrigger value="general" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all">General</TabsTrigger>
              <TabsTrigger value="professional" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all">Professional</TabsTrigger>
              <TabsTrigger value="business" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all">Business</TabsTrigger>
              <TabsTrigger value="specialized" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all">Specialisms</TabsTrigger>
              <TabsTrigger value="portfolio" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all">Portfolio</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="general" className="mt-2 space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <UnifiedTalentProfileForm
            rootData={profileData}
            onChange={(nextRootData) => setProfileData(nextRootData)}
            activeTab="general"
            showTabs={false}
          />
        </TabsContent>

        <TabsContent value="professional" className="mt-2 space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <UnifiedTalentProfileForm
            rootData={profileData}
            onChange={(nextRootData) => setProfileData(nextRootData)}
            activeTab="professional"
            showTabs={false}
          />
        </TabsContent>

        <TabsContent value="business" className="mt-2 space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <UnifiedTalentProfileForm
            rootData={profileData}
            onChange={(nextRootData) => setProfileData(nextRootData)}
            activeTab="business"
            showTabs={false}
          />
        </TabsContent>

        <TabsContent value="specialized" className="mt-2 space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <UnifiedTalentProfileForm
            rootData={profileData}
            onChange={(nextRootData) => setProfileData(nextRootData)}
            activeTab="specialized"
            showTabs={false}
          />
        </TabsContent>

        <TabsContent value="portfolio" className="mt-2 space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Portfolio Gallery</CardTitle>
              <p className="text-xs text-muted-foreground">Upload visual samples of your professional work</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profileData?.headshots?.map((shot) => (
                  <div key={shot._id} className="relative aspect-square rounded-xl overflow-hidden border group bg-muted/30">
                    <img src={shot.url} className="w-full h-full object-cover" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={async () => {
                        try {
                          await profileAPI.deleteHeadshot(shot._id);
                          setProfileData((prev) => ({
                            ...prev,
                            headshots: (prev.headshots || []).filter((s) => s._id !== shot._id)
                          }));
                          toast.success("Image removed");
                        } catch (e) { toast.error("Delete failed"); }
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                
                {pendingPortfolioPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-primary/30 group animate-in zoom-in-95 duration-200">
                    <img src={photo.preview} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Badge className="bg-primary hover:bg-primary">Pending</Badge>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => removePendingPortfolioPhoto(index)}
                    >
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
          <UnifiedTalentProfileForm
            rootData={profileData}
            onChange={(nextRootData) => setProfileData(nextRootData)}
            activeTab="media"
            showTabs={false}
          />
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 justify-end pt-6">
        <Button variant="outline" size="lg" asChild>
          <Link to="/professional">Cancel</Link>
        </Button>
        <Button size="lg" onClick={handleSave} disabled={isSaving} className="bg-[#009698] hover:bg-[#009698]/90 min-w-[140px]">
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
