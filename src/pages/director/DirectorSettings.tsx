import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, KeyRound, Settings2, ShieldCheck, CreditCard } from "lucide-react";
import { authAPI, subscriptionAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DirectorSettings() {
  const { user, updatePreferredCurrency } = useAuth();
  const [activeTab, setActiveTab] = useState("preferences");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const fetchSettingsData = async () => {
    try {
      const subRes = await subscriptionAPI.getStatus().catch(() => ({ data: { success: false } }));
      if (subRes.data?.success) setSubscriptionInfo(subRes.data.data);
    } catch (error) {
      toast.error("Failed to load settings data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences, subscription and security.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" /> Preferences
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Subscription
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <p className="text-sm text-muted-foreground">Customize your experience across the platform</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Preferred Currency</p>
                  <p className="text-xs text-muted-foreground">Used for all prices and rates across the app</p>
                </div>
                <Select
                  value={user?.preferredCurrency || "GBP"}
                  onValueChange={async (v) => {
                    setIsSaving(true);
                    const res = await updatePreferredCurrency(v);
                    if (res.error) {
                      toast.error(res.error);
                    } else {
                      toast.success("Currency preference updated");
                    }
                    setIsSaving(false);
                  }}
                  disabled={isSaving}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="NGN">NGN (₦)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your current billing plan and features</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl border bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current Plan</span>
                  <Badge variant="secondary" className="bg-[#009698]/10 text-[#009698] border-[#009698]/20">
                    {subscriptionInfo?.plan?.name || "Free"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  <span className="text-sm capitalize">{subscriptionInfo?.status || "inactive"}</span>
                </div>
              </div>
              <Button className="w-full bg-[#009698] hover:bg-[#009698]/90">
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" /> Change Password</CardTitle>
              <p className="text-sm text-muted-foreground">Ensure your account is using a long, random password to stay secure.</p>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <Input type="password" placeholder="••••••••" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input type="password" placeholder="••••••••" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input type="password" placeholder="••••••••" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} />
              </div>
              <Button onClick={handleChangePassword} disabled={isSaving} className="bg-[#009698] hover:bg-[#009698]/90">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
