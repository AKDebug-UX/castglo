import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Upload, Camera, Plus, Loader2, X } from "lucide-react";
import { profileAPI } from "@/lib/api";
import { toast } from "sonner";

const workingDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProfessionalProfile() {
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
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev: any) => ({ ...prev, [name]: value }));
  };

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append("headshot", e.target.files[0]);
    
    setIsSaving(true);
    try {
      const response = await profileAPI.addHeadshot(formData);
      if (response.data.success) {
        toast.success("Photo uploaded");
        // Refresh profile to show new photo
        const updated = await profileAPI.getMe();
        setProfileData(updated.data.data);
      }
    } catch (error: any) {
      toast.error("Failed to upload photo");
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
                <AvatarImage src={profileData?.profilePicture} />
                <AvatarFallback>{profileData?.fullName?.[0]}</AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-secondary flex items-center justify-center cursor-pointer shadow-sm hover:bg-secondary/80">
                <Camera className="h-3.5 w-3.5" />
                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isSaving} />
              </label>
            </div>
            <div>
              <Button variant="outline" size="sm" asChild disabled={isSaving}>
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </label>
              </Button>
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
              value={profileData?.fullName || ""} 
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
                setProfileData((prev: any) => ({ ...prev, professionalRoles: roles }));
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
            {profileData?.headshots?.map((shot: any) => (
              <div key={shot._id} className="relative aspect-square rounded-lg overflow-hidden border group">
                <img src={shot.url} className="w-full h-full object-cover" />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={async () => {
                    try {
                      await profileAPI.deleteHeadshot(shot._id);
                      setProfileData((prev: any) => ({
                        ...prev,
                        headshots: prev.headshots.filter((s: any) => s._id !== shot._id)
                      }));
                    } catch (e) { toast.error("Delete failed"); }
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="w-6 h-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Add Image</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </label>
          </div>
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
                setProfileData((prev: any) => ({ ...prev, skills }));
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
