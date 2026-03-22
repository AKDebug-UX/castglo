import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Upload, Camera, Plus, Loader2, X } from "lucide-react";
import { profileAPI, authAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";
import { getAvatarUrl, getInitials } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const workingDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
      };

      const userPayload = {
        fullName: profileData?.fullName,
        location: profileData?.location,
        bio: profileData?.bio,
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
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
          <p className="text-muted-foreground">Update your professional profile and showcase your services</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Profile
        </Button>
      </div>

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={pendingProfilePhoto?.preview || profileData?.profilePicture || getAvatarUrl(profileData?.fullName)} />
                <AvatarFallback>{getInitials(profileData?.fullName)}</AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-secondary flex items-center justify-center cursor-pointer shadow-sm hover:bg-secondary/80">
                <Camera className="h-3.5 w-3.5" />
                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleProfilePhotoSelect} disabled={isSaving} />
              </label>
            </div>
            <div>
              <Button variant="outline" size="sm" asChild disabled={isSaving}>
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Select New Photo
                </label>
              </Button>
              {pendingProfilePhoto && (
                <p className="text-xs text-[#009698] font-bold mt-1">Preview mode - Save profile to upload</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max size 5MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <p className="text-sm text-muted-foreground">Your professional details and contact information</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Full Name</label>
            <Input 
              name="fullName"
              value={profileData?.fullName || profileData?.stageName || ""} 
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Profession (e.g., Photographer, Stylist)</label>
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
            <label className="text-sm font-medium mb-1.5 block">About Me</label>
            <Textarea 
              name="bio"
              rows={3}
              value={profileData?.bio || ""}
              onChange={handleInputChange}
              placeholder="Tell clients about your experience and expertise..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Location</label>
            <Input 
              name="location"
              value={profileData?.location || ""}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Samples */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Samples</CardTitle>
          <p className="text-sm text-muted-foreground">Showcase your best work to attract clients</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {profileData?.headshots?.map((shot) => (
              <div key={shot._id} className="relative aspect-square rounded-lg overflow-hidden border group">
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

            <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="w-6 h-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground text-center px-2">Add Samples (Preview)</span>
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
            <p className="text-xs text-[#009698] font-bold mt-4">
              {pendingPortfolioPhotos.length} new samples ready to upload. Save profile to apply changes.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Services & Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Details</CardTitle>
          <p className="text-sm text-muted-foreground">Manage your expertise and availability</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Skills & Expertise (comma separated)</label>
            <Textarea 
              name="skills"
              rows={2}
              value={profileData?.skills?.join(", ") || ""}
              onChange={(e) => {
                const skills = e.target.value.split(",").map(s => s.trim());
                setProfileData((prev) => ({ ...prev, skills }));
              }}
              placeholder="List your skills..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
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
