import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authAPI, subscriptionAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";
import { KeyRound, Loader2, UserMinus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfessionalSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const subRes = await subscriptionAPI.getStatus().catch(() => ({ data: { success: false } }));
        if (subRes.data?.success) setSubscriptionInfo(subRes.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettingsData();
  }, []);

  const handleChangePassword = async () => {
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

  const deleteAccount = async () => {
    const password = prompt("To confirm deletion, please enter your password:");
    if (password === null) return;
    if (!password) {
      toast.error("Password is required to delete account");
      return;
    }
    if (!confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) return;

    try {
      await userAPI.deleteAccount({ password });
      toast.success("Account deleted successfully");
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete account");
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
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your professional account, subscription, and security.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="h-auto p-1 gap-1 inline-flex">
            <TabsTrigger value="overview" className="py-2 px-4">Overview</TabsTrigger>
            <TabsTrigger value="subscription" className="py-2 px-4">Subscription</TabsTrigger>
            <TabsTrigger value="security" className="py-2 px-4">Security</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 rounded-xl border bg-white">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div className="p-4 rounded-xl border bg-white">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Plan</p>
                <p className="font-medium">{subscriptionInfo?.plan?.name || "Free"}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your current plan</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">Current Plan: <strong>{subscriptionInfo?.plan?.name || "Free"}</strong></p>
              <p className="text-sm">Status: <strong>{subscriptionInfo?.status || "inactive"}</strong></p>
              {subscriptionInfo?.status === "active" && subscriptionInfo?.currentPeriodEnd && (
                <p className="text-sm">Renews on: <strong>{new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString()}</strong></p>
              )}
              <Button variant="outline" asChild className="mt-4">
                <a href="/pricing">Manage Plan</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" /> Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <Input type="password" placeholder="Current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />
              <Input type="password" placeholder="New password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />
              <Input type="password" placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} />
              <Button onClick={handleChangePassword} disabled={isSaving}>Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <UserMinus className="w-5 h-5" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={deleteAccount}>
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
