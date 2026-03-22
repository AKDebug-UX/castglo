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
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
              <p className="text-sm text-muted-foreground">Update your personal and contact information</p>
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
                  <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                  <Input 
                    name="fullName"
                    value={profileData?.fullName || ""} 
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Job Title</label>
                  <Input 
                    name="jobTitle"
                    value={profileData?.jobTitle || ""} 
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Casting Director"
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

              <div>
                <label className="text-sm font-medium mb-1.5 block">Location</label>
                <Input 
                  name="location"
                  value={profileData?.location || ""} 
                  onChange={handleInputChange}
                  placeholder="City, Country"
                />
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
                      <SelectItem value="casting">Casting Company</SelectItem>
                      <SelectItem value="production">Production Company</SelectItem>
                      <SelectItem value="theatre">Theatre</SelectItem>
                      <SelectItem value="brand">Brand / Company</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
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
                        setProfileData((prev: any) => ({ ...prev, professionalLinks: newLinks }));
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
                        placeholder="Add link (LinkedIn, Website, etc.)"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = (e.target as HTMLInputElement).value;
                            if (val) {
                              setProfileData((prev: any) => ({
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
                        setProfileData((prev: any) => ({
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
                <label className="text-sm font-medium mb-1.5 block">
                  About Me / Company <span className="text-muted-foreground font-normal">({profileData?.bio?.length || 0}/500)</span>
                </label>
                <Textarea
                  name="bio"
                  rows={4}
                  value={profileData?.bio || ""}
                  onChange={handleInputChange}
                  placeholder="Describe your professional background and the types of projects you work on..."
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
