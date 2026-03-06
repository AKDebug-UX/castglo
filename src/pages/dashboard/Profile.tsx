import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X, Upload, Loader2 } from "lucide-react";
import { profileAPI } from "@/lib/api";
import { toast } from "sonner";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileAPI.getMe();
        if (response.data.success) {
          setProfileData(response.data.data);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await profileAPI.updateMe(profileData);
      if (response.data.success) {
        toast.success("Profile updated successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfileData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const formData = new FormData();
    formData.append("headshot", e.target.files[0]);
    
    setIsSaving(true);
    try {
      const response = await profileAPI.addHeadshot(formData);
      if (response.data.success) {
        toast.success("Profile picture updated");
        setProfileData((prev: any) => ({ 
          ...prev, 
          profilePicture: response.data.data.url // Adjust based on actual API response
        }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload photo");
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
          <h1 className="text-2xl font-bold">Profile Setting</h1>
          <p className="text-muted-foreground">Manage your professional profile and portfolio</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          {["Basic", "Physical", "Skills", "Education", "Equipment", "Portfolio"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab.toLowerCase().replace(" ", "-")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-3"
            >
              {tab} {tab === "Basic" ? "Info" : ""}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <p className="text-sm text-muted-foreground">Update your personal and contact information</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileData?.profilePicture} />
                    <AvatarFallback>{profileData?.fullName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-secondary flex items-center justify-center cursor-pointer shadow-sm hover:bg-secondary/80">
                    <Camera className="h-3.5 w-3.5" />
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isSaving}
                    />
                  </label>
                </div>
                <Button variant="outline" size="sm" asChild disabled={isSaving}>
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </label>
                </Button>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                  <Input 
                    name="fullName"
                    value={profileData?.fullName || ""} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Professional Roles (comma separated)</label>
                <Input 
                  name="professionalRoles"
                  value={profileData?.professionalRoles?.join(", ") || ""} 
                  onChange={(e) => {
                    const roles = e.target.value.split(",").map(r => r.trim());
                    setProfileData((prev: any) => ({ ...prev, professionalRoles: roles }));
                  }}
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
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Career Highlights <span className="text-muted-foreground font-normal">({profileData?.highlights?.length || 0}/1500)</span>
                </label>
                <Textarea
                  name="highlights"
                  rows={3}
                  value={profileData?.highlights || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Gender</label>
                  <Select 
                    value={profileData?.gender || ""} 
                    onValueChange={(v) => handleSelectChange("gender", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="non-binary">Non-binary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Age Range</label>
                  <Select 
                    value={profileData?.ageRange || ""} 
                    onValueChange={(v) => handleSelectChange("ageRange", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-25">18-25</SelectItem>
                      <SelectItem value="25-35">25-35</SelectItem>
                      <SelectItem value="35-45">35-45</SelectItem>
                      <SelectItem value="45+">45+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input 
                    name="email"
                    type="email" 
                    value={profileData?.email || ""} 
                    disabled // Email usually managed via Auth
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone</label>
                  <Input 
                    name="phone"
                    type="tel" 
                    value={profileData?.phone || ""} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Location</label>
                  <Input 
                    name="location"
                    value={profileData?.location || ""} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="physical" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Physical Attributes</CardTitle>
              <p className="text-sm text-muted-foreground">Provide physical details for casting considerations</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Height (cm)</label>
                  <Input 
                    name="height"
                    type="number"
                    value={profileData?.physicalAttributes?.height || ""} 
                    onChange={(e) => setProfileData((prev: any) => ({
                      ...prev,
                      physicalAttributes: { ...prev.physicalAttributes, height: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Weight (kg)</label>
                  <Input 
                    name="weight"
                    type="number"
                    value={profileData?.physicalAttributes?.weight || ""} 
                    onChange={(e) => setProfileData((prev: any) => ({
                      ...prev,
                      physicalAttributes: { ...prev.physicalAttributes, weight: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Eye Color</label>
                  <Input 
                    name="eyeColor"
                    value={profileData?.physicalAttributes?.eyeColor || ""} 
                    onChange={(e) => setProfileData((prev: any) => ({
                      ...prev,
                      physicalAttributes: { ...prev.physicalAttributes, eyeColor: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profileData?.skills?.map((skill: string, i: number) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {skill}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => {
                      const newSkills = profileData.skills.filter((_: any, idx: number) => idx !== i);
                      setProfileData((prev: any) => ({ ...prev, skills: newSkills }));
                    }} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input id="new-skill" placeholder="Add a skill" onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value;
                    if (val && !profileData.skills.includes(val)) {
                      setProfileData((prev: any) => ({ ...prev, skills: [...prev.skills, val] }));
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }} />
                <Button variant="outline" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio & Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {profileData?.headshots?.map((shot: any, i: number) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={shot.url} className="w-full h-full object-cover" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={async () => {
                        try {
                          await profileAPI.deleteHeadshot(shot._id);
                          setProfileData((prev: any) => ({
                            ...prev,
                            headshots: prev.headshots.filter((s: any) => s._id !== shot._id)
                          }));
                        } catch (e) { toast.error("Failed to delete headshot"); }
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Add Photo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
