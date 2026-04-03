import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Loader2, KeyRound, Mail, CreditCard, Bell, UserMinus, Globe, Link2, ExternalLink, BadgeCheck, X, Plus } from "lucide-react";
import { profileAPI, userAPI, authAPI, subscriptionAPI } from "@/lib/api";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { getAvatarUrl, getInitials } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function DirectorSettings() {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [pendingProfilePhoto, setPendingProfilePhoto] = useState<{ file: File, preview: string } | null>(null);

  // Security states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Subscription states
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [subscriptionQuota, setSubscriptionQuota] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [authRes, profileRes, subRes, quotaRes, pmRes] = await Promise.all([
          authAPI.getMe().catch(() => ({ data: { success: false } })),
          profileAPI.getMe().catch(() => ({ data: { success: false } })),
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

        setProfileData(combinedData);

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

      // Update User profile (PATCH /user/profile)
      const userUpdate = userAPI.updateProfile({
        fullName: profileData.fullName,
        bio: profileData.bio,
        location: profileData.location,
        phoneNumber: profileData.phone,
        address: profileData.address,
        stageName: profileData.stageName,
        organisationType: profileData.organisationType,
        jobTitle: profileData.jobTitle,
        website: profileData.website,
        professionalLinks: profileData.professionalLinks,
        notificationSettings: profileData.notificationSettings
      });

      // Update Talent/Profile data (PATCH /profiles/me)
      const profileUpdate = profileAPI.updateMe({
        bio: profileData.bio,
        experience: profileData.experience,
      });

      await Promise.all([userUpdate, profileUpdate]);
      
      // Refresh global user state for header/sidebar
      await refreshUser();
      
      // Refresh data
      const updatedProfile = await profileAPI.getMe();
      if (updatedProfile.data?.success) {
        setProfileData((prev: any) => ({ ...prev, ...updatedProfile.data.data }));
      }
      
      toast.success("Settings updated successfully");
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

  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const preview = URL.createObjectURL(file);
    setPendingProfilePhoto({ file, preview });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
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
            Settings & Profile
            {profileData?.isVerified && <BadgeCheck className="w-6 h-6 text-blue-500" />}
          </h1>
          <p className="text-muted-foreground">Manage your casting director profile and account preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="h-auto p-1 gap-1 inline-flex">
            <TabsTrigger value="basic" className="py-2 px-4">Basic Info</TabsTrigger>
            <TabsTrigger value="professional" className="py-2 px-4">Professional</TabsTrigger>
            <TabsTrigger value="subscription" className="py-2 px-4">Subscription</TabsTrigger>
            <TabsTrigger value="notifications" className="py-2 px-4">Notifications</TabsTrigger>
            <TabsTrigger value="security" className="py-2 px-4">Security</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="basic" className="mt-6">
          <Card>
            <CardHeader ShadcnTab="basic">
              <CardTitle>Basic Details</CardTitle>
              <p className="text-sm text-muted-foreground">Update your personal and identity information</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={pendingProfilePhoto?.preview || profileData?.profilePicture || getAvatarUrl(profileData?.fullName)} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                      {getInitials(profileData?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-secondary flex items-center justify-center cursor-pointer shadow-sm hover:bg-secondary/80">
                    <Camera className="h-3.5 w-3.5" />
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
                <div className="space-y-1">
                  <Button variant="outline" size="sm" asChild disabled={isSaving}>
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Select New Photo
                    </label>
                  </Button>
                  {pendingProfilePhoto && (
                    <p className="text-xs text-[#009698] font-bold mt-1">Preview mode - Save changes to upload</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
                  <Input 
                    name="fullName"
                    value={profileData?.fullName || ""} 
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Display Name *</label>
                  <Input 
                    name="displayName"
                    value={profileData?.displayName || ""} 
                    onChange={handleInputChange}
                    placeholder="Public display name"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input 
                    name="email"
                    type="email" 
                    value={profileData?.email || ""} 
                    disabled 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
                  <Input 
                    name="phone"
                    type="tel" 
                    value={profileData?.phone || ""} 
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">City *</label>
                  <Input 
                    name="city"
                    value={profileData?.city || ""} 
                    onChange={handleInputChange}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Country *</label>
                  <Select 
                    value={profileData?.country || ""} 
                    onValueChange={(v) => handleSelectChange("country", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
              <p className="text-sm text-muted-foreground">Information about your company and professional background</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium mb-1.5 block">Primary Account Type *</label>
                  <Select 
                    value={profileData?.primary_account_type || profileData?.organisationType || ""} 
                    onValueChange={(v) => handleSelectChange("primary_account_type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casting_director">Casting Director</SelectItem>
                      <SelectItem value="casting_agency">Casting Agency</SelectItem>
                      <SelectItem value="production_company">Production Company</SelectItem>
                      <SelectItem value="talent_agency">Talent Agency</SelectItem>
                      <SelectItem value="independent_hirer">Independent Hirer</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium mb-1.5 block">Additional Roles</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["Casting Director", "Agent", "Producer", "Director", "Manager"].map(type => (
                      <Badge 
                        key={type} 
                        variant={(profileData?.additional_account_types || []).includes(type) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = profileData?.additional_account_types || [];
                          const next = current.includes(type) ? current.filter((t: string) => t !== type) : [...current, type];
                          handleSelectChange("additional_account_types", next);
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium mb-1.5 block">Company / Agency Name</label>
                  <Input 
                    name="company_name"
                    value={profileData?.company_name || ""} 
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium mb-1.5 block">Professional Title *</label>
                  <Input 
                    name="professional_title"
                    value={profileData?.professional_title || profileData?.jobTitle || ""} 
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Casting Director"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium mb-1.5 block">Experience Level *</label>
                  <Select 
                    value={profileData?.experience_level || ""} 
                    onValueChange={(v) => handleSelectChange("experience_level", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid-Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium mb-1.5 block">Years of Experience *</label>
                  <Select 
                    value={profileData?.years_of_experience || ""} 
                    onValueChange={(v) => handleSelectChange("years_of_experience", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium mb-1.5 block">Website</label>
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
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Short Bio (Public Profile) <span className="text-muted-foreground font-normal">({profileData?.bio?.length || 0}/200)</span>
                </label>
                <Textarea
                  name="bio"
                  rows={2}
                  maxLength={200}
                  value={profileData?.bio || ""}
                  onChange={handleInputChange}
                  placeholder="A short punchy bio for your profile card..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Full About Description <span className="text-muted-foreground font-normal">({profileData?.full_bio?.length || 0}/2000)</span>
                </label>
                <Textarea
                  name="full_bio"
                  rows={6}
                  value={profileData?.full_bio || ""}
                  onChange={handleInputChange}
                  placeholder="Detailed professional background, notable projects, and approach to casting..."
                />
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
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
                      : "Upgrade to unlock premium casting tools and increased visibility"}
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
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Job Postings Left</p>
                  <p className="font-medium">
                    {subscriptionQuota?.listingsLeft !== null 
                      ? `${subscriptionQuota?.listingsLeft} Listings` 
                      : "Unlimited"}
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

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <p className="text-sm text-muted-foreground">Choose how you want to be notified about activity</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Application Alerts</label>
                    <p className="text-xs text-muted-foreground">Get notified when someone applies to your casting calls</p>
                  </div>
                  <Switch 
                    checked={profileData?.notificationSettings?.applicationAlerts || false}
                    onCheckedChange={(v) => handleNotificationToggle("applicationAlerts", v)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Message Notifications</label>
                    <p className="text-xs text-muted-foreground">Get notified when you receive a new message</p>
                  </div>
                  <Switch 
                    checked={profileData?.notificationSettings?.messageAlerts || true}
                    onCheckedChange={(v) => handleNotificationToggle("messageAlerts", v)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Platform Updates</label>
                    <p className="text-xs text-muted-foreground">Receive news about new features and improvements</p>
                  </div>
                  <Switch 
                    checked={profileData?.notificationSettings?.platformUpdates || false}
                    onCheckedChange={(v) => handleNotificationToggle("platformUpdates", v)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <p className="text-sm text-muted-foreground">Update your password and secure your account</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input 
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input 
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input 
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
                <Button className="w-fit" onClick={handleChangePassword} disabled={isSaving}>
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
