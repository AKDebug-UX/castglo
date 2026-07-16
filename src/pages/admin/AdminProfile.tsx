import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera, Save, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { userAPI } from "@/lib/api";
import { toast } from "sonner";
import { getAvatarUrl, getInitials } from "@/lib/utils";

export default function AdminProfile() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<{ file: File; preview: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setProfilePhoto({ file, preview: URL.createObjectURL(file) });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Upload photo if selected
      if (profilePhoto) {
        const formData = new FormData();
        formData.append("profilePicture", profilePhoto.file);
        await userAPI.updateProfilePicture(formData);
        setProfilePhoto(null);
      }

      // 2. Update profile text details
      await userAPI.updateProfile({ fullName });
      await refreshUser();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Admin Profile</h1>
        <p className="text-muted-foreground">Manage your public information and avatar.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr] items-start">
        {/* Profile Picture Card */}
        <Card className="rounded-3xl border-none shadow-xl overflow-hidden p-6 flex flex-col items-center">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-slate-100 shadow-xl">
              <AvatarImage src={profilePhoto?.preview || user?.profilePicture || getAvatarUrl(user?.fullName)} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {getInitials(user?.fullName || "Admin")}
              </AvatarFallback>
            </Avatar>
            <label htmlFor="admin-photo-upload" className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform">
              <Camera className="h-4.5 w-4.5" />
              <input id="admin-photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoSelect} disabled={isSaving} />
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">Allowed formats: JPG, PNG. Max size: 2MB.</p>
        </Card>

        {/* Profile Details Card */}
        <Card className="rounded-[32px] border-none shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Profile Info</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. John Doe" className="rounded-xl h-11" disabled={isSaving} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email Address (Read-only)</label>
                <Input value={email} disabled className="rounded-xl h-11 bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Role</label>
                <Input value="Administrator" disabled className="rounded-xl h-11 bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed capitalize" />
              </div>
              <Button type="submit" disabled={isSaving} className="bg-[#009698] hover:bg-[#009698]/90 text-white font-bold rounded-xl h-11 px-6 mt-4 shadow-lg shadow-[#009698]/10">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
