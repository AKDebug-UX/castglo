import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X, Upload, Loader2, ShieldCheck, FileCheck, History, KeyRound, Smartphone, Mail, CreditCard, Bell, UserMinus, Globe, Link2, ExternalLink, BadgeCheck, Ruler, Weight, Eye as EyeIcon, User, VenetianMask, Languages } from "lucide-react";
import { profileAPI, userAPI, blockchainAPI, authAPI, subscriptionAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getAvatarUrl, getInitials } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { UNIFIED_FIELD_IDS, validateUnifiedTalentProfile } from "@/lib/unifiedTalentProfile";
import { UnifiedTalentProfileForm } from "@/components/profile/UnifiedTalentProfileForm";

export default function Profile() {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [pendingProfilePhoto, setPendingProfilePhoto] = useState<{ file: File, preview: string } | null>(null);
  const [pendingPortfolioPhotos, setPendingPortfolioPhotos] = useState<{ file: File, preview: string }[]>([]);
  
  // Blockchain states
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);

  // Security states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Education state
  const [newEdu, setNewEdu] = useState({ institution: "", degree: "", year: "" });
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1950 + 6 }, (_, i) => (currentYear + 5 - i).toString());

  // Subscription states
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [subscriptionQuota, setSubscriptionQuota] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [authRes, profileRes, historyRes, subRes, quotaRes, pmRes] = await Promise.all([
          authAPI.getMe().catch(() => ({ data: { success: false } })),
          profileAPI.getMe().catch(() => ({ data: { success: false } })),
          blockchainAPI.getHistory({ limit: 5 }).catch(() => ({ data: { success: false } })),
          subscriptionAPI.getStatus().catch(() => ({ data: { success: false } })),
          subscriptionAPI.getQuota().catch(() => ({ data: { success: false } })),
          subscriptionAPI.getPaymentMethods().catch(() => ({ data: { success: false } }))
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
        if (!unified.nationality && combinedData.nationality) unified.nationality = combinedData.nationality;
        if (!unified.gender && combinedData.gender) unified.gender = combinedData.gender;
        if (!unified.ethnicity && combinedData.ethnicity) unified.ethnicity = combinedData.ethnicity;
        if (!unified.agency_name && combinedData.agencyName) unified.agency_name = combinedData.agencyName;
        if (!unified.union_status && combinedData.unionStatus) unified.union_status = combinedData.unionStatus;
        if (unified.right_to_work === undefined && combinedData.rightToWork !== undefined) unified.right_to_work = combinedData.rightToWork;
        if (unified.valid_passport === undefined && combinedData.validPassport !== undefined) unified.valid_passport = combinedData.validPassport;
        if (unified.willing_to_travel === undefined && combinedData.willingnessToTravel !== undefined) unified.willing_to_travel = combinedData.willingnessToTravel;
        if (unified.remote_work_open === undefined && combinedData.openToRemote !== undefined) unified.remote_work_open = combinedData.openToRemote;
        
        combinedData.unifiedTalentProfile = unified;

        setProfileData(combinedData);
        
        if (historyRes.data?.success) {
          setVerificationHistory(historyRes.data.data.records || []);
        }

        if (subRes.data?.success) {
          setSubscriptionInfo(subRes.data.data);
        }

        if (quotaRes.data?.success) {
          setSubscriptionQuota(quotaRes.data.data);
        }

        if (pmRes.data?.success) {
          setPaymentMethods(pmRes.data.data.paymentMethods || []);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleSave = async (skipValidation: boolean = false) => {
    setIsSaving(true);
    try {
      const unifiedPayload = {
        ...(profileData?.unifiedTalentProfile || {}),
        ...Object.fromEntries(Object.entries(profileData || {}).filter(([key]) => UNIFIED_FIELD_IDS.has(key))),
      };

      const shouldValidateUnified = Object.keys(unifiedPayload).length > 0 && !skipValidation;
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

      // Update User profile (PATCH /user/profile)
      const userUpdate = userAPI.updateProfile({
        fullName: unifiedPayload.full_name || profileData.fullName,
        bio: profileData.bio,
        location: unifiedPayload.current_city ? `${unifiedPayload.current_city}${unifiedPayload.current_country ? ', ' + unifiedPayload.current_country : ''}` : profileData.location,
        phoneNumber: unifiedPayload.phone_number || profileData.phone,
        address: unifiedPayload.address || profileData.address,
        stageName: unifiedPayload.display_name || profileData.stageName,
        organisationType: profileData.organisationType,
        jobTitle: profileData.jobTitle,
        website: profileData.website,
        professionalLinks: profileData.professionalLinks,
        notificationSettings: profileData.notificationSettings,
        // Sync demographic fields
        gender: unifiedPayload.gender || profileData.gender,
        ethnicity: unifiedPayload.ethnicity || profileData.ethnicity,
        languages: profileData.languages,
        playingAge: profileData.playingAge,
        // New Spec Fields
        nationality: unifiedPayload.nationality || profileData.nationality,
        rightToWork: unifiedPayload.right_to_work !== undefined ? unifiedPayload.right_to_work : profileData.rightToWork,
        validPassport: unifiedPayload.valid_passport !== undefined ? unifiedPayload.valid_passport : profileData.validPassport,
        willingnessToTravel: unifiedPayload.willing_to_travel || profileData.willingnessToTravel,
        openToRemote: unifiedPayload.remote_work_open !== undefined ? unifiedPayload.remote_work_open : profileData.openToRemote,
        instagramUrl: profileData.instagramUrl,
        tiktokUrl: profileData.tiktokUrl,
        youtubeUrl: profileData.youtubeUrl,
        unionStatus: profileData.unionStatus,
        agencyName: profileData.agencyName,
        expectedRate: profileData.expectedRate,
        openToUnpaid: profileData.openToUnpaid,
        careerGoals: profileData.careerGoals,
        specialties: profileData.specialties,
        fluentLanguages: unifiedPayload.fluent_languages || profileData.fluentLanguages,
        performanceLanguages: unifiedPayload.performance_languages || profileData.performanceLanguages,
        languagesForVoiceWork: unifiedPayload.languages_for_voice_work || profileData.languagesForVoiceWork,
        languagesForPresentation: unifiedPayload.languages_for_presentation || profileData.languagesForPresentation,
        unifiedTalentProfile: unifiedPayload
      });

      // Update Talent/Profile data (PATCH /profiles/me)
      const profileUpdate = profileAPI.updateMe({
        bio: profileData.bio,
        skills: profileData?.talent?.skills || profileData?.skills,
        education: profileData?.talent?.education || profileData?.education,
        equipment: profileData?.talent?.equipment || profileData?.equipment,
        physicalAttributes: profileData?.physicalAttributes || profileData?.talent?.physicalAttributes,
        experience: profileData.experience,
        // Demographic fields for talent profile
        gender: unifiedPayload.gender || profileData.gender,
        ethnicity: unifiedPayload.ethnicity || profileData.ethnicity,
        languages: profileData.languages,
        playingAge: profileData.playingAge,
        // Spec Fields
        unionStatus: profileData.unionStatus,
        agencyName: profileData.agencyName,
        specialties: profileData.specialties,
        fluentLanguages: unifiedPayload.fluent_languages || profileData.fluentLanguages,
        performanceLanguages: unifiedPayload.performance_languages || profileData.performanceLanguages,
        languagesForVoiceWork: unifiedPayload.languages_for_voice_work || profileData.languagesForVoiceWork,
        languagesForPresentation: unifiedPayload.languages_for_presentation || profileData.languagesForPresentation,
        unifiedTalentProfile: unifiedPayload
      });

      await Promise.all([userUpdate, profileUpdate]);
      
      // Refresh global user state for header/sidebar
      await refreshUser();
      
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
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
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success("Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const password = prompt("To confirm deletion, please enter your password:");
    if (password === null) return; // User cancelled
    
    if (!password) {
      toast.error("Password is required to delete account");
      return;
    }

    if (confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      try {
        await userAPI.deleteAccount({ password });
        toast.success("Account deleted successfully");
        localStorage.removeItem('token');
        window.location.href = "/";
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete account");
      }
    }
  };

  const handleBlockchainVerify = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const formData = new FormData();
    formData.append("document", e.target.files[0]);
    formData.append("documentType", "identity"); // Default for demo

    setIsVerifying(true);
    try {
      const response = await blockchainAPI.verify(formData);
      if (response.data.success) {
        toast.success("Document anchored to blockchain successfully!");
        // Refresh history
        const historyRes = await blockchainAPI.getHistory({ limit: 5 });
        setVerificationHistory(historyRes.data.data.records || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Blockchain anchoring failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key: string, value: boolean) => {
    setProfileData((prev) => ({
      ...prev,
      notificationSettings: {
        ...(prev.notificationSettings || {}),
        [key]: value
      }
    }));
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Account Settings
            {profileData?.isVerified && <BadgeCheck className="w-6 h-6 text-blue-500" />}
          </h1>
          <p className="text-muted-foreground">Manage your personal information and account preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="relative">
        <div className="sticky top-0 z-20 bg-[#F1FBFB]/95 backdrop-blur supports-[backdrop-filter]:bg-[#F1FBFB]/60 py-4 -mx-1 px-1">
          <div className="overflow-x-auto pb-1 scrollbar-hide">
            <TabsList className="h-auto p-1 gap-1 inline-flex bg-white/50 border shadow-sm rounded-xl">
              <TabsTrigger value="basic" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all duration-200">Basic</TabsTrigger>
              <TabsTrigger value="details" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all duration-200">Professional</TabsTrigger>
              <TabsTrigger value="physical" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all duration-200">Physical</TabsTrigger>
              <TabsTrigger value="specialized" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all duration-200">Specialized</TabsTrigger>
              <TabsTrigger value="skills" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all duration-200">Skills</TabsTrigger>
              <TabsTrigger value="education" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all duration-200">Education</TabsTrigger>
              <TabsTrigger value="equipment" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all duration-200">Equipment</TabsTrigger>
              <TabsTrigger value="portfolio" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all duration-200">Portfolio</TabsTrigger>
              <TabsTrigger value="subscription" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all duration-200">Subscription</TabsTrigger>
              <TabsTrigger value="verification" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all duration-200">Verification</TabsTrigger>
              <TabsTrigger value="payments" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all duration-200">Payments</TabsTrigger>
              <TabsTrigger value="notifications" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all duration-200">Notifications</TabsTrigger>
              <TabsTrigger value="security" className="py-2 px-4 rounded-lg data-[state=active]:bg-[#009698] data-[state=active]:text-white transition-all duration-200">Security</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="basic" className="mt-2 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <p className="text-sm text-muted-foreground">This photo will be visible to casting directors and professionals</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-2 border-primary/20 transition-all duration-300 group-hover:border-primary/50">
                    <AvatarImage src={pendingProfilePhoto?.preview || profileData?.profilePicture || profileData?.talent?.headshots?.[0]?.url || getAvatarUrl(profileData?.fullName)} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                      {getInitials(profileData?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input 
                      id="avatar-upload" 
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
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Change Photo
                      </label>
                    </Button>
                    {pendingProfilePhoto && (
                      <Button variant="ghost" size="sm" onClick={() => setPendingProfilePhoto(null)} className="text-destructive">
                        Reset
                      </Button>
                    )}
                  </div>
                  {pendingProfilePhoto && (
                    <p className="text-xs text-[#009698] font-bold animate-pulse">Preview mode - Save changes to upload</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">JPG, GIF or PNG. Max size of 800K. Recommendation: Square aspect ratio.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <UnifiedTalentProfileForm
            rootData={profileData}
            onChange={(nextRootData) => setProfileData(nextRootData)}
            onSave={handleSave}
            isSaving={isSaving}
            activeTab="general"
            showTabs={false}
          />
        </TabsContent>

        <TabsContent value="details" className="mt-2 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
              <p className="text-sm text-muted-foreground">Update your professional and organizational information</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Organisation Type</label>
                  <Select 
                    value={profileData?.organisationType || ""} 
                    onValueChange={(v) => handleSelectChange("organisationType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="creative-agency">Creative / Marketing Agency</SelectItem>
                      <SelectItem value="casting">Casting</SelectItem>
                      <SelectItem value="production">Production Company</SelectItem>
                      <SelectItem value="theatre">Theatre</SelectItem>
                      <SelectItem value="brand">Brand / Company</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Job Title / Role</label>
                  <Select 
                    value={profileData?.jobTitle || ""} 
                    onValueChange={(v) => handleSelectChange("jobTitle", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actor">Actor</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="producer">Producer</SelectItem>
                      <SelectItem value="casting-director">Casting Director</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="crew">Crew / Technical</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Union Status</label>
                  <Select 
                    value={profileData?.unionStatus || ""} 
                    onValueChange={(v) => handleSelectChange("unionStatus", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Union Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="non-union">Non-Union</SelectItem>
                      <SelectItem value="sag-aftra">SAG-AFTRA</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="other">Other Union</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Representation</label>
                  <Input 
                    name="agencyName"
                    value={profileData?.agencyName || ""} 
                    onChange={handleInputChange}
                    placeholder="Agency Name (or Self-Represented)"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Expected Rate Range</label>
                  <Input 
                    name="expectedRate"
                    value={profileData?.expectedRate || ""} 
                    onChange={handleInputChange}
                    placeholder="e.g., $100 - $500 / day"
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50">
                  <div>
                    <p className="font-semibold text-sm">Open to TFPs / Unpaid</p>
                    <p className="text-xs text-muted-foreground">Open to portfolio or unpaid work?</p>
                  </div>
                  <Switch 
                    checked={profileData?.openToUnpaid || false} 
                    onCheckedChange={(v) => setProfileData(prev => ({...prev, openToUnpaid: v}))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Website (Company or Personal)</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    name="website"
                    className="pl-10"
                    value={profileData?.website || ""} 
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Professional Links</label>
                <div className="space-y-2">
                  {(profileData?.professionalLinks || []).map((link: string, i: number) => (
                    <div key={i} className="flex gap-2">
                      <div className="relative flex-1">
                        <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          value={link} 
                          className="pl-10"
                          readOnly
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => {
                        const newLinks = profileData.professionalLinks.filter((_, idx: number) => idx !== i);
                        setProfileData((prev) => ({ ...prev, professionalLinks: newLinks }));
                      }}>
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="new-link"
                        className="pl-10"
                        placeholder="Add professional link (IMDb, Spotlight, etc.)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = (e.target as HTMLInputElement).value;
                            if (val) {
                              setProfileData((prev) => ({
                                ...prev,
                                professionalLinks: [...(prev.professionalLinks || []), val]
                              }));
                              (e.target as HTMLInputElement).value = "";
                            }
                          }
                        }}
                      />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => {
                      const input = document.getElementById("new-link") as HTMLInputElement;
                      if (input.value) {
                        setProfileData((prev) => ({
                          ...prev,
                          professionalLinks: [...(prev.professionalLinks || []), input.value]
                        }));
                        input.value = "";
                      }
                    }}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Professional Roles (comma separated)</label>
                <Input 
                  name="professionalRoles"
                  value={profileData?.professionalRoles?.join(", ") || ""} 
                  onChange={(e) => {
                    const roles = e.target.value.split(",").map(r => r.trim());
                    setProfileData((prev) => ({ ...prev, professionalRoles: roles }));
                  }}
                  placeholder="e.g. Lead Actor, Voice Artist"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  About Me <span className="text-muted-foreground font-normal">({profileData?.bio?.length || 0}/500)</span>
                </label>
                <Textarea
                  name="bio"
                  rows={4}
                  value={profileData?.bio || ""}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself and your professional background..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Career Goals
                </label>
                <Textarea
                  name="careerGoals"
                  rows={3}
                  value={profileData?.careerGoals || ""}
                  onChange={handleInputChange}
                  placeholder="What are your main goals directly related to your work with Castglo?"
                />
              </div>
              
              <div className="border-t pt-4">
                <label className="text-sm font-bold mb-3 block text-primary">Social Media Presence</label>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">IG</span>
                    <Input name="instagramUrl" placeholder="Instagram URL" value={profileData?.instagramUrl || ""} onChange={handleInputChange} className="pl-8" />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">TT</span>
                    <Input name="tiktokUrl" placeholder="TikTok URL" value={profileData?.tiktokUrl || ""} onChange={handleInputChange} className="pl-8" />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">YT</span>
                    <Input name="youtubeUrl" placeholder="YouTube URL" value={profileData?.youtubeUrl || ""} onChange={handleInputChange} className="pl-8" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <UnifiedTalentProfileForm
            rootData={profileData}
            onChange={(nextRootData) => setProfileData(nextRootData)}
            onSave={handleSave}
            isSaving={isSaving}
            activeTab="professional"
            showTabs={false}
          />
        </TabsContent>

        <TabsContent value="physical" className="mt-2 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Physical Attributes & Demographics</CardTitle>
              <p className="text-sm text-muted-foreground">Provide details for casting considerations and diversity tracking</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-primary" />
                    Height (cm)
                  </label>
                  <Input 
                    name="height"
                    type="number"
                    value={profileData?.physicalAttributes?.height || ""} 
                    onChange={(e) => setProfileData((prev) => ({
                      ...prev,
                      physicalAttributes: { ...(prev?.physicalAttributes || {}), height: e.target.value }
                    }))}
                    placeholder="e.g. 175"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Weight className="w-4 h-4 text-primary" />
                    Weight (kg)
                  </label>
                  <Input 
                    name="weight"
                    type="number"
                    value={profileData?.physicalAttributes?.weight || ""} 
                    onChange={(e) => setProfileData((prev) => ({
                      ...prev,
                      physicalAttributes: { ...(prev?.physicalAttributes || {}), weight: e.target.value }
                    }))}
                    placeholder="e.g. 70"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <EyeIcon className="w-4 h-4 text-primary" />
                    Eye Color
                  </label>
                  <Select 
                    value={profileData?.physicalAttributes?.eyeColor || ""} 
                    onValueChange={(v) => setProfileData((prev) => ({
                      ...prev,
                      physicalAttributes: { ...(prev?.physicalAttributes || {}), eyeColor: v }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Eye Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brown">Brown</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="hazel">Hazel</SelectItem>
                      <SelectItem value="grey">Grey</SelectItem>
                      <SelectItem value="amber">Amber</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    Build / Body Type
                  </label>
                  <Select 
                    value={profileData?.physicalAttributes?.build || ""} 
                    onValueChange={(v) => setProfileData((prev) => ({
                      ...prev,
                      physicalAttributes: { ...(prev?.physicalAttributes || {}), build: v }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Build" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slim">Slim</SelectItem>
                      <SelectItem value="athletic">Athletic</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="muscular">Muscular</SelectItem>
                      <SelectItem value="curvy">Curvy</SelectItem>
                      <SelectItem value="heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    Hair Color
                  </label>
                  <Input 
                    name="hairColor"
                    value={profileData?.physicalAttributes?.hairColor || ""} 
                    onChange={(e) => setProfileData((prev) => ({
                      ...prev,
                      physicalAttributes: { ...(prev?.physicalAttributes || {}), hairColor: e.target.value }
                    }))}
                    placeholder="e.g. Blonde, Brown, Black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    Hair Length
                  </label>
                  <Input 
                    name="hairLength"
                    value={profileData?.physicalAttributes?.hairLength || ""} 
                    onChange={(e) => setProfileData((prev) => ({
                      ...prev,
                      physicalAttributes: { ...(prev?.physicalAttributes || {}), hairLength: e.target.value }
                    }))}
                    placeholder="e.g. Short, Medium, Long, Bald"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    Skin Tone
                  </label>
                  <Input 
                    name="skinTone"
                    value={profileData?.physicalAttributes?.skinTone || ""} 
                    onChange={(e) => setProfileData((prev) => ({
                      ...prev,
                      physicalAttributes: { ...(prev?.physicalAttributes || {}), skinTone: e.target.value }
                    }))}
                    placeholder="e.g. Fair, Medium, Deep"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    Distinguishing Features
                  </label>
                  <Input 
                    name="distinguishingFeatures"
                    value={profileData?.physicalAttributes?.distinguishingFeatures || ""} 
                    onChange={(e) => setProfileData((prev) => ({
                      ...prev,
                      physicalAttributes: { ...(prev?.physicalAttributes || {}), distinguishingFeatures: e.target.value }
                    }))}
                    placeholder="Tattoos, Scars, Piercings (Optional)"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50/50">
                <div>
                  <p className="font-semibold text-sm">Open to Appearance Changes</p>
                  <p className="text-xs text-muted-foreground">Are you open to cutting/dyeing hair for a role?</p>
                </div>
                <Switch 
                  checked={profileData?.physicalAttributes?.openToAppearanceChanges || false} 
                  onCheckedChange={(v) => setProfileData((prev) => ({
                    ...prev,
                    physicalAttributes: { ...(prev?.physicalAttributes || {}), openToAppearanceChanges: v }
                  }))}
                />
              </div>

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Gender Identity
                  </label>
                  <Select 
                    value={profileData?.gender || ""} 
                    onValueChange={(v) => handleSelectChange("gender", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="transgender">Transgender</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <VenetianMask className="w-4 h-4 text-primary" />
                    Ethnicity
                  </label>
                  <Select 
                    value={profileData?.ethnicity || ""} 
                    onValueChange={(v) => handleSelectChange("ethnicity", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Ethnicity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="caucasian">Caucasian / White</SelectItem>
                      <SelectItem value="black">Black / African / Caribbean</SelectItem>
                      <SelectItem value="asian">Asian (East, South, SE)</SelectItem>
                      <SelectItem value="latino">Latino / Hispanic</SelectItem>
                      <SelectItem value="middle-eastern">Middle Eastern</SelectItem>
                      <SelectItem value="mixed">Mixed Ethnicity</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Languages className="w-4 h-4 text-primary" />
                    Languages Spoken
                  </label>
                  <Input 
                    name="languages"
                    value={profileData?.languages?.join(", ") || ""} 
                    onChange={(e) => {
                      const langs = e.target.value.split(",").map(l => l.trim());
                      setProfileData((prev) => ({ ...prev, languages: langs }));
                    }}
                    placeholder="e.g. English, Spanish, French"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Playing Age Range
                  </label>
                  <Input 
                    name="playingAge"
                    placeholder="e.g. 18-25"
                    value={profileData?.playingAge || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <UnifiedTalentProfileForm
            rootData={profileData}
            onChange={(nextRootData) => setProfileData(nextRootData)}
            onSave={handleSave}
            isSaving={isSaving}
            activeTab="attributes"
            showTabs={false}
          />
        </TabsContent>

        <TabsContent value="specialized" className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <UnifiedTalentProfileForm
            rootData={profileData}
            onChange={(nextRootData) => setProfileData(nextRootData)}
            onSave={handleSave}
            isSaving={isSaving}
            activeTab="specialized"
            showTabs={false}
          />
        </TabsContent>

        <TabsContent value="skills" className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(profileData?.talent?.skills || profileData?.skills || []).map((skill: string, i: number) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {skill}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => {
                      const currentSkills = (profileData?.talent?.skills || profileData?.skills || []);
                      const newSkills = currentSkills.filter((_, idx: number) => idx !== i);
                      setProfileData((prev) => ({
                        ...prev,
                        talent: prev.talent ? { ...prev.talent, skills: newSkills } : prev.talent,
                        skills: newSkills 
                      }));
                    }} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input id="new-skill" placeholder="Add a skill" onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value;
                    const currentSkills = (profileData?.talent?.skills || profileData?.skills || []);
                    if (val && !currentSkills.includes(val)) {
                      const newSkills = [...currentSkills, val];
                      setProfileData((prev) => ({
                        ...prev,
                        talent: prev.talent ? { ...prev.talent, skills: newSkills } : prev.talent,
                        skills: newSkills
                      }));
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }} />
                <Button variant="outline" size="icon" onClick={() => {
                  const input = document.getElementById("new-skill") as HTMLInputElement;
                  const val = input.value;
                  const currentSkills = (profileData?.talent?.skills || profileData?.skills || []);
                  if (val && !currentSkills.includes(val)) {
                    const newSkills = [...currentSkills, val];
                    setProfileData((prev) => ({
                      ...prev,
                      talent: prev.talent ? { ...prev.talent, skills: newSkills } : prev.talent,
                      skills: newSkills
                    }));
                    input.value = "";
                  }
                }}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Education & Training</CardTitle>
              <p className="text-sm text-muted-foreground">List your academic qualifications and professional training</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {(profileData?.talent?.education || profileData?.education || []).map((edu, i: number) => (
                  <div key={i} className="flex items-start justify-between p-4 rounded-lg border bg-muted/30">
                    <div className="space-y-1">
                      <p className="font-bold">{edu.degree || edu.qualification}</p>
                      <p className="text-sm text-muted-foreground">{edu.institution || edu.school}</p>
                      <p className="text-xs text-muted-foreground">{edu.year || edu.graduationYear}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => {
                      const currentEdu = (profileData?.talent?.education || profileData?.education || []);
                      const newEdu = currentEdu.filter((_, idx: number) => idx !== i);
                      setProfileData((prev) => ({
                        ...prev,
                        talent: prev.talent ? { ...prev.talent, education: newEdu } : prev.talent,
                        education: newEdu
                      }));
                    }}>
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="grid gap-4 p-4 border rounded-lg bg-slate-50/50">
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Institution</label>
                  <Input 
                    placeholder="e.g. Royal Academy of Dramatic Art" 
                    value={newEdu.institution}
                    onChange={(e) => setNewEdu(prev => ({ ...prev, institution: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Degree / Qualification</label>
                    <Input 
                      placeholder="e.g. BA in Acting" 
                      value={newEdu.degree}
                      onChange={(e) => setNewEdu(prev => ({ ...prev, degree: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Year</label>
                    <Select 
                      value={newEdu.year} 
                      onValueChange={(v) => setNewEdu(prev => ({ ...prev, year: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full mt-2" onClick={() => {
                  if (newEdu.institution && newEdu.degree) {
                    const currentEdu = (profileData?.talent?.education || profileData?.education || []);
                    const newEduList = [...currentEdu, newEdu];
                    
                    setProfileData((prev) => ({
                      ...prev,
                      talent: prev.talent ? { ...prev.talent, education: newEduList } : prev.talent,
                      education: newEduList
                    }));
                    
                    setNewEdu({ institution: "", degree: "", year: "" });
                  } else {
                    toast.error("Please enter both institution and degree");
                  }
                }}>
                  <Plus className="w-4 h-4 mr-2" /> Add Education
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Equipment & Gear</CardTitle>
              <p className="text-sm text-muted-foreground">List the professional equipment you have access to</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {(profileData?.talent?.equipment || profileData?.equipment || []).map((item: string, i: number) => (
                  <Badge key={i} variant="secondary" className="gap-1 py-1.5 px-3">
                    {item}
                    <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => {
                      const currentEq = (profileData?.talent?.equipment || profileData?.equipment || []);
                      const newEq = currentEq.filter((_, idx: number) => idx !== i);
                      setProfileData((prev) => ({
                        ...prev,
                        talent: prev.talent ? { ...prev.talent, equipment: newEq } : prev.talent,
                        equipment: newEq
                      }));
                    }} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input id="new-equipment" placeholder="Add equipment (e.g. 4K Camera, Green Screen)" onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value;
                    const currentEq = (profileData?.talent?.equipment || profileData?.equipment || []);
                    if (val && !currentEq.includes(val)) {
                      const newEq = [...currentEq, val];
                      setProfileData((prev) => ({
                        ...prev,
                        talent: prev.talent ? { ...prev.talent, equipment: newEq } : prev.talent,
                        equipment: newEq
                      }));
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }} />
                <Button variant="outline" size="icon" onClick={() => {
                  const input = document.getElementById("new-equipment") as HTMLInputElement;
                  const val = input.value;
                  const currentEq = (profileData?.talent?.equipment || profileData?.equipment || []);
                  if (val && !currentEq.includes(val)) {
                    const newEq = [...currentEq, val];
                    setProfileData((prev) => ({
                      ...prev,
                      talent: prev.talent ? { ...prev.talent, equipment: newEq } : prev.talent,
                      equipment: newEq
                    }));
                    input.value = "";
                  }
                }}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="mt-2 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio & Media</CardTitle>
              <p className="text-sm text-muted-foreground">Showcase your headshots and professional photos</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {profileData?.talent?.headshots?.map((shot, i: number) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border group">
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
                            talent: {
                              ...prev?.talent,
                              headshots: (prev?.talent?.headshots || []).filter((s) => s._id !== shot._id)
                            }
                          }));
                          toast.success("Image removed");
                        } catch (e) { toast.error("Failed to delete headshot"); }
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {/* Pending Portfolio Photos */}
                {pendingPortfolioPhotos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-[#009698] ring-2 ring-[#009698]/20 group animate-in zoom-in-95 duration-200">
                    <img src={photo.preview} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Badge className="bg-[#009698] hover:bg-[#009698]">Pending</Badge>
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

                <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Add Photo (Preview)</span>
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handlePortfolioSelect} 
                  />
                </label>
              </div>
              {pendingPortfolioPhotos.length > 0 && (
                <p className="text-xs text-[#009698] font-bold">
                  {pendingPortfolioPhotos.length} new photos ready to upload. Save changes to apply.
                </p>
              )}
            </CardContent>
          </Card>
          <UnifiedTalentProfileForm
            rootData={profileData}
            onChange={(nextRootData) => setProfileData(nextRootData)}
            onSave={handleSave}
            isSaving={isSaving}
            activeTab="media"
            showTabs={false}
          />
        </TabsContent>

        <TabsContent value="subscription" className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Information</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your account subscription and billing cycle</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 rounded-xl border bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#009698]">{subscriptionInfo?.plan?.name || "Free Plan"}</Badge>
                    {subscriptionInfo?.status === "active" && (
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionInfo?.status === "active" 
                      ? `Your plan renews on ${new Date(subscriptionInfo?.currentPeriodEnd).toLocaleDateString()}`
                      : "Upgrade to unlock premium features and casting opportunities"}
                  </p>
                </div>
                {!subscriptionInfo || subscriptionInfo.status !== "active" ? (
                  <Button asChild className="bg-[#009698] hover:bg-[#009698]/90">
                    <a href="/pricing">Upgrade Plan</a>
                  </Button>
                ) : (
                  <Button variant="outline">Manage Subscription</Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg border bg-white">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Status</p>
                  <p className="font-medium capitalize">{subscriptionInfo?.status || "Inactive"}</p>
                </div>
                <div className="p-4 rounded-lg border bg-white">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Usage Quota</p>
                  <p className="font-medium">
                    {subscriptionQuota?.applicationsLeft !== null 
                      ? `${subscriptionQuota?.applicationsLeft} Apps Left` 
                      : "Unlimited Applications"}
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-white">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Price</p>
                  <p className="font-medium">{subscriptionInfo?.plan?.price ? `$${subscriptionInfo.plan.price}/mo` : "$0"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Account Verification
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Verify your identity and professional credentials
                  </p>
                </div>
                <Badge variant={profileData?.isVerified ? "default" : "secondary"}>
                  {profileData?.isVerified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!profileData?.isVerified && (
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800">Your account is not verified</p>
                    <p className="text-xs text-yellow-700">Verified accounts get 3x more visibility and trust from casting directors.</p>
                    <Button variant="link" className="p-0 h-auto text-yellow-800 font-bold" asChild>
                      <a href="/verification-process">Start Verification Process</a>
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  Blockchain Document Anchoring
                </h3>
                <p className="text-sm text-muted-foreground">
                  Anchor your professional documents, awards, and identity to the blockchain for immutable verification.
                </p>
                
                <div className="p-6 border-2 border-dashed rounded-xl text-center space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Anchor New Document</p>
                    <p className="text-sm text-muted-foreground">Upload certificates, contracts, or identity documents</p>
                  </div>
                  <div className="relative inline-block">
                    <input
                      type="file"
                      id="blockchain-upload"
                      className="hidden"
                      onChange={handleBlockchainVerify}
                      disabled={isVerifying}
                    />
                    <Button asChild disabled={isVerifying}>
                      <label htmlFor="blockchain-upload" className="cursor-pointer flex items-center gap-2">
                        {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Select & Anchor Document
                      </label>
                    </Button>
                  </div>
                </div>

                {/* History */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Verification History
                  </h4>
                  {verificationHistory.length > 0 ? (
                    verificationHistory.map((record) => (
                      <div key={record._id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500/10 rounded flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{record.documentName || "Identity Verification"}</p>
                            <p className="text-xs text-muted-foreground">Hash: {record.documentHash?.substring(0, 16)}...</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No verification records found.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payments & Billing Address
              </CardTitle>
              <p className="text-sm text-muted-foreground">Manage your payment methods and billing information</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Saved Cards</h3>
                {paymentMethods.length > 0 ? (
                  <div className="grid gap-4">
                    {paymentMethods.map((card, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-6 bg-slate-200 rounded flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-slate-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">•••• •••• •••• {card.last4}</p>
                            <p className="text-xs text-muted-foreground">Expires {card.expMonth}/{card.expYear}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed rounded-xl text-center">
                    <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground mb-4">No payment cards added yet</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/pricing">
                        <Plus className="w-4 h-4 mr-2" /> Add New Card
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Billing Address</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Full Name on Bill</label>
                    <Input placeholder="John Doe" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Country</label>
                      <Input placeholder="United Kingdom" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Postcode / ZIP</label>
                      <Input placeholder="SW1A 1AA" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Street Address</label>
                    <Input placeholder="10 Downing Street" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notification Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">Manage how you receive updates and alerts</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Job Alerts & Recommendations</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Job Search Notifications</p>
                      <p className="text-xs text-muted-foreground">Get casting notices that are most relevant to you</p>
                    </div>
                    <Switch 
                      checked={profileData?.notificationSettings?.jobSearchEmail || false} 
                      onCheckedChange={(v) => handleNotificationToggle("jobSearchEmail", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Job Recommendations</p>
                      <p className="text-xs text-muted-foreground">Get relevant jobs based on your casting roles</p>
                    </div>
                    <Select 
                      value={profileData?.notificationSettings?.jobRecFrequency || "none"}
                      onValueChange={(v) => handleNotificationToggle("jobRecFrequency", v)}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="none">Opt Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Your Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Job Postings</p>
                      <p className="text-xs text-muted-foreground">Get notified when there are new applications for your jobs</p>
                    </div>
                    <Switch 
                      checked={profileData?.notificationSettings?.jobPostingAlerts || false} 
                      onCheckedChange={(v) => handleNotificationToggle("jobPostingAlerts", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Your Applications</p>
                      <p className="text-xs text-muted-foreground">Reminders if you've been invited to apply to a role</p>
                    </div>
                    <Switch 
                      checked={profileData?.notificationSettings?.applicationAlerts || false} 
                      onCheckedChange={(v) => handleNotificationToggle("applicationAlerts", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Saved Jobs Roundup</p>
                      <p className="text-xs text-muted-foreground">Get a summary of the jobs you've bookmarked</p>
                    </div>
                    <Switch 
                      checked={profileData?.notificationSettings?.savedJobsRoundup || false} 
                      onCheckedChange={(v) => handleNotificationToggle("savedJobsRoundup", v)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  Change Password
                </CardTitle>
                <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input 
                    type="password" 
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="••••••••" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">New Password</label>
                  <Input 
                    type="password" 
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="••••••••" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input 
                    type="password" 
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="••••••••" 
                  />
                </div>
                <Button 
                  className="w-full bg-[#009698] hover:bg-[#009698]/90"
                  onClick={handleChangePassword}
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Security Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">Manage your account security and authentication</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Two-Factor Authentication (2FA)</h3>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="font-bold text-sm">Email Authentication</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Receive a verification code via email</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <p className="font-bold text-sm">SMS Authentication</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Receive a code via text message</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        <p className="font-bold text-sm">Google Authenticator</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Use Google Authenticator for secure codes</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50">
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-red-900">Delete Account</p>
                      <p className="text-xs text-red-700">Permanently delete your account and all data</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDeleteAccount}
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-muted-foreground">
                    Deactivate Account Temporarily
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}













