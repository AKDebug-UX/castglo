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
  Plane, Monitor, Info, ArrowLeft
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProfessionalSpecializedFields } from "@/components/professional/ProfessionalSpecializedFields";

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

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

      // 3. Split the data into profile and user updates based on the API expectations
      const profilePayload = {
        bio: profileData?.bio,
        skills: profileData?.skills || [],
        professionalRoles: profileData?.professionalRoles || [],
        location: profileData?.location,
        stageName: profileData?.stageName || profileData?.fullName,
        // Added industry professional fields
        // Professional Identity
        display_name: profileData?.display_name || "",
        business_name: profileData?.business_name || "",
        professional_title: profileData?.professional_title || "",
        // Bio Split
        short_bio: profileData?.short_bio || "",
        full_bio: profileData?.full_bio || profileData?.bio || "",
        // Location & Travel
        location: profileData?.location || "",
        city: profileData?.city || "",
        country: profileData?.country || "",
        willing_to_travel: !!profileData?.willing_to_travel,
        remote_services_available: !!profileData?.remote_services_available,
        // Experience
        experience_level: profileData?.experience_level || "beginner",
        experienceYears: profileData?.experienceYears || "",
        professionalCategory: profileData?.professionalCategory || "",
        specialties: profileData?.specialties || [],
        // Existing
        skills: profileData?.skills || [],
        website: profileData?.website || "",
        instagram: profileData?.instagram || "",
        linkedin: profileData?.linkedin || "",
      };

      const userPayload = {
        fullName: profileData?.fullName,
        location: profileData?.location,
        bio: profileData?.bio,
        // Sync these to user if needed
        companyName: profileData?.companyName,
      };

      const [profileResponse, userResponse] = await Promise.all([
        profileAPI.updateMe(profilePayload),
        userAPI.updateProfile(userPayload)
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

      {/* 1. Identity & Visuals */}
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
              <p className="text-sm text-muted-foreground">{profileData?.professional_title || "Freelancer"}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                Brand / Display Name
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger><Info className="w-3 h-3" /></TooltipTrigger>
                    <TooltipContent><p>This is the name people will see publicly (e.g. "Focus Studio")</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input 
                name="display_name"
                value={profileData?.display_name || ""} 
                onChange={handleInputChange}
                placeholder="Business or Stage Name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Professional Title</Label>
              <Input 
                name="professional_title"
                value={profileData?.professional_title || ""} 
                onChange={handleInputChange}
                placeholder="e.g. Senior Fashion Photographer"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Professional Credentials */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-lg">Professional Credentials</CardTitle></CardHeader>
        <CardContent className="space-y-5">
           <div className="grid gap-5 md:grid-cols-2">
             <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Main Category</Label>
               <Select 
                 value={profileData?.professionalCategory || ""} 
                 onValueChange={(v) => setProfileData(p => ({ ...p, professionalCategory: v }))}
               >
                 <SelectTrigger className="h-11">
                   <SelectValue placeholder="Select Category" />
                 </SelectTrigger>
                 <SelectContent>
                   {professionalCategories.map(cat => (
                     <SelectItem key={cat} value={cat.toLowerCase().replace(/\s+/g, '_')}>{cat}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience Level</Label>
               <Select 
                 value={profileData?.experience_level || "beginner"} 
                 onValueChange={(v) => setProfileData(p => ({ ...p, experience_level: v }))}
               >
                 <SelectTrigger className="h-11">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                   <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                   <SelectItem value="advanced">Advanced (5-10 years)</SelectItem>
                   <SelectItem value="expert">Expert (10+ years)</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>

           <div className="grid gap-5 md:grid-cols-2 text-sm">
             <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
               <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Plane className="w-4 h-4" /></div>
                 <div>
                   <p className="font-bold">Willing to Travel</p>
                   <p className="text-[10px] text-muted-foreground">Available for work outside city</p>
                 </div>
               </div>
               <Switch 
                 checked={!!profileData?.willing_to_travel}
                 onCheckedChange={(v) => setProfileData(p => ({ ...p, willing_to_travel: v }))}
               />
             </div>

             <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
               <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><Monitor className="w-4 h-4" /></div>
                 <div>
                   <p className="font-bold">Remote Services</p>
                   <p className="text-[10px] text-muted-foreground">Work remotely via digital tools</p>
                 </div>
               </div>
               <Switch 
                 checked={!!profileData?.remote_services_available}
                 onCheckedChange={(v) => setProfileData(p => ({ ...p, remote_services_available: v }))}
               />
             </div>
           </div>
        </CardContent>
      </Card>

      {/* 3. Bio & Description */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-lg">About & Bio</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
              Short Bio (Elevator Pitch)
              <span className={profileData?.short_bio?.length > 300 ? "text-destructive" : "text-muted-foreground"}>
                {profileData?.short_bio?.length || 0}/300
              </span>
            </Label>
            <Textarea 
              name="short_bio"
              rows={2}
              value={profileData?.short_bio || ""}
              onChange={handleInputChange}
              placeholder="Give a 1-2 sentence overview of your professional brand..."
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
              Detailed Professional Bio
              <span className={profileData?.full_bio?.length > 3000 ? "text-destructive" : "text-muted-foreground"}>
                {profileData?.full_bio?.length || 0}/3000
              </span>
            </Label>
            <Textarea 
              name="full_bio"
              rows={6}
              value={profileData?.full_bio || ""}
              onChange={handleInputChange}
              placeholder="Describe your career, notable projects, philosophy, and expertise in detail..."
            />
          </div>
        </CardContent>
      </Card>

      {/* 3.5 Specialized Industry Fields */}
      <ProfessionalSpecializedFields 
        category={profileData?.professionalCategory || ""}
        data={profileData}
        onChange={(name, value) => setProfileData(p => ({ ...p, [name]: value }))}
      />

      {/* 4. Portfolio Samples & Credits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Portfolio & Credibility</CardTitle>
          <p className="text-xs text-muted-foreground">Showcase your visual work and professional track record</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
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
                        headshots: prev.headshots.filter((s) => s._id !== shot._id)
                      }));
                      toast.success("Image removed");
                    } catch (e) { toast.error("Delete failed"); }
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            
            {/* Pending Portfolio Photos */}
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

          <Separator />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notable Clients</Label>
              <Textarea 
                name="notable_clients"
                rows={2}
                value={profileData?.notable_clients || ""}
                onChange={handleInputChange}
                placeholder="e.g. Vogue, Netflix, Nike..."
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notable Projects</Label>
              <Textarea 
                name="notable_projects"
                rows={2}
                value={profileData?.notable_projects || ""}
                onChange={handleInputChange}
                placeholder="e.g. Summer Campaign 2025, 'The Crown' S5..."
                className="resize-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Awards & Recognition</Label>
            <Input 
              name="awards_recognition"
              value={profileData?.awards_recognition || ""}
              onChange={handleInputChange}
              placeholder="e.g. British Photography Award 2024"
            />
          </div>
        </CardContent>
      </Card>

      {/* 5. Business Operations */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-lg">Business & Facilities</CardTitle></CardHeader>
        <CardContent className="space-y-4">
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
             <div className="flex items-center space-x-3 p-3 rounded-xl border bg-muted/10">
               <Checkbox 
                 id="studio" 
                 checked={!!profileData?.studio_access}
                 onCheckedChange={(v) => setProfileData(p => ({ ...p, studio_access: !!v }))}
               />
               <label htmlFor="studio" className="text-xs font-bold leading-none cursor-pointer">Studio Access</label>
             </div>

             <div className="flex items-center space-x-3 p-3 rounded-xl border bg-muted/10">
               <Checkbox 
                 id="insurance" 
                 checked={!!profileData?.insurance_available}
                 onCheckedChange={(v) => setProfileData(p => ({ ...p, insurance_available: !!v }))}
               />
               <label htmlFor="insurance" className="text-xs font-bold leading-none cursor-pointer">Insured</label>
             </div>

             <div className="flex items-center space-x-3 p-3 rounded-xl border bg-muted/10">
               <Checkbox 
                 id="nda" 
                 checked={!!profileData?.nda_friendly}
                 onCheckedChange={(v) => setProfileData(p => ({ ...p, nda_friendly: !!v }))}
               />
               <label htmlFor="nda" className="text-xs font-bold leading-none cursor-pointer">NDA Friendly</label>
             </div>

             <div className="flex items-center space-x-3 p-3 rounded-xl border bg-muted/10">
               <Checkbox 
                 id="contract" 
                 checked={!!profileData?.contract_required}
                 onCheckedChange={(v) => setProfileData(p => ({ ...p, contract_required: !!v }))}
               />
               <label htmlFor="contract" className="text-xs font-bold leading-none cursor-pointer">Contract Req.</label>
             </div>
           </div>

           {(profileData?.studio_access) && (
             <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
               <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground focus-within:text-primary transition-colors">Studio Details</Label>
               <Input 
                 name="studio_details"
                 value={profileData?.studio_details || ""}
                 onChange={handleInputChange}
                 placeholder="e.g. 500sqft daylight studio in East London"
               />
             </div>
           )}
        </CardContent>
      </Card>

      {/* 5.5 Business Terms & Policies */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-lg">Business Terms & Policies</CardTitle></CardHeader>
        <CardContent className="space-y-6">
           <div className="grid gap-5 md:grid-cols-2">
             <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deposit Required (%)</Label>
               <Input 
                 type="number"
                 name="deposit_percent"
                 value={profileData?.deposit_percent || ""}
                 onChange={handleInputChange}
                 placeholder="e.g. 50"
               />
             </div>
             <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Accepted Payment Methods</Label>
               <Input 
                 name="payment_methods"
                 value={profileData?.payment_methods || ""}
                 onChange={handleInputChange}
                 placeholder="e.g. Bank Transfer, PayPal, Stripe"
               />
             </div>
           </div>

           <div className="grid gap-5 md:grid-cols-2">
             <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cancellation Policy</Label>
               <Textarea 
                 name="cancellation_policy"
                 rows={2}
                 value={profileData?.cancellation_policy || ""}
                 onChange={handleInputChange}
                 placeholder="e.g. 48 hours notice required..."
                 className="resize-none"
               />
             </div>
             <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Refund Policy</Label>
               <Textarea 
                 name="refund_policy"
                 rows={2}
                 value={profileData?.refund_policy || ""}
                 onChange={handleInputChange}
                 placeholder="e.g. Full refund if cancelled 7 days before..."
                 className="resize-none"
               />
             </div>
           </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Online Presence</CardTitle>
          <p className="text-sm text-muted-foreground">Links to your professional website and social profiles</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Globe className="w-3 h-3" /> Website / Portfolio URL
            </Label>
            <Input 
              name="website"
              value={profileData?.website || ""} 
              onChange={handleInputChange}
              placeholder="https://www.yourportfolio.com"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Instagram className="w-3 h-3" /> Instagram
              </Label>
              <Input 
                name="instagram"
                value={profileData?.instagram || ""} 
                onChange={handleInputChange}
                placeholder="@username"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Linkedin className="w-3 h-3" /> LinkedIn
              </Label>
              <Input 
                name="linkedin"
                value={profileData?.linkedin || ""} 
                onChange={handleInputChange}
                placeholder="linkedin.com/in/username"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7. Skills & Expertise */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-lg">Skills & Expertise</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detailed Skills (comma separated)</Label>
            <Textarea 
              name="skills"
              rows={3}
              value={profileData?.skills?.join(", ") || ""}
              onChange={(e) => {
                const skills = e.target.value.split(",").map(s => s.trim());
                setProfileData((prev) => ({ ...prev, skills }));
              }}
              placeholder="e.g. Portraiture, Retouching, Lighting Design, SFX Makeup..."
            />
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-3 justify-end">
        <Button variant="outline" size="lg" asChild>
          <Link to="/professional">Cancel</Link>
        </Button>
        <Button size="lg" onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Profile
        </Button>
      </div>
    </div>
  );
}
