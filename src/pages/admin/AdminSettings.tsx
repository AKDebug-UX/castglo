import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { authAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";
import { KeyRound, Loader2, UserMinus, ShieldCheck, Bell, Settings2, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { TwoFactorSettingsPanel } from "@/components/settings/TwoFactorSettingsPanel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function AdminSettings() {
  const { user: currentUser } = useAuth();
  const location = useLocation();
  const confirm = useConfirm();

  const tabFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (!tab || tab === "overview") return "preferences";
    return tab;
  }, [location.search]);

  const [activeTab, setActiveTab] = useState(tabFromQuery);

  useEffect(() => {
    setActiveTab(tabFromQuery);
  }, [tabFromQuery]);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const [notificationSettings, setNotificationSettings] = useState({
    systemAlerts: true,
    userRegistrations: true,
    flaggedContent: true,
    securityAlerts: true,
    marketingUpdates: false,
  });

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success("Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await userAPI.updateProfile({ notificationSettings });
      toast.success("Notification preferences saved successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update notification settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccountClick = () => {
    setDeleteConfirmPassword("");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmPassword) {
      toast.error("Password is required to delete account");
      return;
    }
    if (!await confirm("Are you sure you want to permanently delete your administrator account? This action cannot be undone.")) return;

    setIsSaving(true);
    try {
      await userAPI.deleteAccount({ password: deleteConfirmPassword });
      toast.success("Account deleted successfully");
      setIsDeleteModalOpen(false);
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete account");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Admin Settings
          </h1>
          <p className="text-muted-foreground">Manage your administrator account credentials, security, and alerts.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="h-auto p-1.5 gap-1.5 inline-flex rounded-2xl bg-muted/60 backdrop-blur-md border border-border/50 shadow-xs">
            <TabsTrigger value="preferences" className="py-2.5 px-4 rounded-xl font-semibold text-xs transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
              <Settings2 className="w-4 h-4 mr-1.5" /> Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="py-2.5 px-4 rounded-xl font-semibold text-xs transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
              <ShieldCheck className="w-4 h-4 mr-1.5" /> Security & 2FA
            </TabsTrigger>
            <TabsTrigger value="notifications" className="py-2.5 px-4 rounded-xl font-semibold text-xs transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
              <Bell className="w-4 h-4 mr-1.5" /> Notifications
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-6 space-y-6">
          <Card className="rounded-2xl border border-border/60 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold">Administrator Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-xl border border-border/50 bg-muted/30">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Email</p>
                <p className="font-semibold text-sm text-foreground">{currentUser?.email}</p>
              </div>
              <div className="p-4 rounded-xl border border-border/50 bg-muted/30">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Role</p>
                <p className="font-semibold text-sm text-primary uppercase">Administrator</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="rounded-2xl border border-border/60 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Current Password</label>
                <Input 
                  type="password" 
                  placeholder="Enter current password" 
                  value={passwordForm.currentPassword} 
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} 
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">New Password</label>
                <Input 
                  type="password" 
                  placeholder="Enter new password" 
                  value={passwordForm.newPassword} 
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} 
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
                <Input 
                  type="password" 
                  placeholder="Confirm new password" 
                  value={passwordForm.confirmPassword} 
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} 
                  className="rounded-xl"
                />
              </div>
              <Button onClick={handleChangePassword} disabled={isSaving} className="rounded-xl font-semibold">
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Two Factor Authentication */}
          <TwoFactorSettingsPanel />

          {/* Danger Zone */}
          <Card className="rounded-2xl border border-destructive/30 bg-destructive/5 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
                <UserMinus className="w-5 h-5 text-destructive" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Permanently delete your administrator account and all associated permissions. This action is immediate and cannot be undone.
              </p>
              <Button variant="destructive" onClick={handleDeleteAccountClick} className="rounded-xl font-semibold">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card className="rounded-2xl border border-border/60 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Admin Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">Critical System Alerts</p>
                  <p className="text-xs text-muted-foreground">Receive real-time alerts for server errors or performance issues</p>
                </div>
                <Switch 
                  checked={notificationSettings.systemAlerts} 
                  onCheckedChange={(c) => setNotificationSettings(s => ({ ...s, systemAlerts: c }))} 
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">New User Registrations</p>
                  <p className="text-xs text-muted-foreground">Get notified when new casting directors or talents join</p>
                </div>
                <Switch 
                  checked={notificationSettings.userRegistrations} 
                  onCheckedChange={(c) => setNotificationSettings(s => ({ ...s, userRegistrations: c }))} 
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">Flagged Content Alerts</p>
                  <p className="text-xs text-muted-foreground">Alerts for reported messages, listings, or profiles needing review</p>
                </div>
                <Switch 
                  checked={notificationSettings.flaggedContent} 
                  onCheckedChange={(c) => setNotificationSettings(s => ({ ...s, flaggedContent: c }))} 
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">Security Alerts</p>
                  <p className="text-xs text-muted-foreground">Receive alerts on unusual login attempts or 2FA modifications</p>
                </div>
                <Switch 
                  checked={notificationSettings.securityAlerts} 
                  onCheckedChange={(c) => setNotificationSettings(s => ({ ...s, securityAlerts: c }))} 
                />
              </div>

              <div className="pt-2">
                <Button onClick={handleSaveNotifications} disabled={isSaving} className="rounded-xl font-semibold">
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md shadow-2xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">Confirm Account Deletion</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Please enter your password to confirm that you want to permanently delete your account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              type="password" 
              placeholder="Enter your password" 
              value={deleteConfirmPassword}
              onChange={(e) => setDeleteConfirmPassword(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl h-11 px-5">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isSaving} className="rounded-xl h-11 px-5">
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
