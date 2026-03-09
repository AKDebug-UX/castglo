import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X, Upload, Loader2, ShieldCheck, FileCheck, History } from "lucide-react";
import { profileAPI, userAPI, blockchainAPI, authAPI } from "@/lib/api";
import { toast } from "sonner";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  
  // Blockchain states
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          profileAPI.getMe(),
          blockchainAPI.getHistory({ limit: 5 })
        ]);

        if (profileRes.data.success) {
          setProfileData(profileRes.data.data);
        } else {
          const userRes = await authAPI.getMe();
          if (userRes.data.success) {
            setProfileData(userRes.data.data);
          }
        }
        
        if (historyRes.data.success) {
          setVerificationHistory(historyRes.data.data.records || []);
        }
      } catch (error) {
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
      // Update both User profile and Talent profile
      const userUpdate = userAPI.updateProfile({
        fullName: profileData.fullName,
        bio: profileData.bio,
        location: profileData.location,
        phoneNumber: profileData.phone
      });

      const profileUpdate = profileAPI.updateMe({
        bio: profileData.bio,
        skills: profileData.skills,
        experience: profileData.experience,
        // Add other fields as supported by backend
      });

      await Promise.all([userUpdate, profileUpdate]);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
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

  const handleSelectChange = (name: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [name]: value }));
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
        setProfileData((prev) => ({ 
          ...prev, 
          profilePicture: response.data.data.url // Adjust based on actual API response
        }));
      }
    } catch (error) {
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
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto p-1 gap-1">
          <TabsTrigger value="basic" className="py-2">Basic</TabsTrigger>
          <TabsTrigger value="physical" className="py-2">Physical</TabsTrigger>
          <TabsTrigger value="skills" className="py-2">Skills</TabsTrigger>
          <TabsTrigger value="education" className="py-2">Education</TabsTrigger>
          <TabsTrigger value="equipment" className="py-2">Equipment</TabsTrigger>
          <TabsTrigger value="portfolio" className="py-2">Portfolio</TabsTrigger>
          <TabsTrigger value="verification" className="py-2">Verification</TabsTrigger>
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
                    setProfileData((prev) => ({ ...prev, professionalRoles: roles }));
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
                    onChange={(e) => setProfileData((prev) => ({
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
                    onChange={(e) => setProfileData((prev) => ({
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
                    onChange={(e) => setProfileData((prev) => ({
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
                      const newSkills = profileData.skills.filter((_, idx: number) => idx !== i);
                      setProfileData((prev) => ({ ...prev, skills: newSkills }));
                    }} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input id="new-skill" placeholder="Add a skill" onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.target as HTMLInputElement).value;
                    if (val && !profileData.skills.includes(val)) {
                      setProfileData((prev) => ({ ...prev, skills: [...prev.skills, val] }));
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
                {profileData?.headshots?.map((shot, i: number) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={shot.url} className="w-full h-full object-cover" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={async () => {
                        try {
                          await profileAPI.deleteHeadshot(shot._id);
                          setProfileData((prev) => ({
                            ...prev,
                            headshots: prev.headshots.filter((s) => s._id !== shot._id)
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

        <TabsContent value="verification" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Blockchain Credential Verification
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Anchor your professional documents, awards, and identity to the blockchain for immutable, investor-ready verification.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 border-2 border-dashed rounded-xl text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <FileCheck className="w-6 h-6 text-primary" />
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
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Verification History
                </h3>
                <div className="space-y-2">
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
      </Tabs>
    </div>
  );
}
