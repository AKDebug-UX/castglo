import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, KeyRound, Settings2, ShieldCheck, ShieldAlert, CreditCard, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { authAPI, subscriptionAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { SUBSCRIPTION_PLANS } from "@/config/subscriptionPlans";
import { TwoFactorSettingsPanel } from "@/components/settings/TwoFactorSettingsPanel";

export default function DirectorSettings() {
  const { user: currentUser, updatePreferredCurrency, formatPrice } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("preferences");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const { activeWorkspace } = useWorkspace();

  const [notificationSettings, setNotificationSettings] = useState({
    newApplicants: true,
    weeklyDigest: true,
    directMessages: true,
    shortlistUpdates: true,
    marketingUpdates: false,
  });

  const fetchSettingsData = async () => {
    try {
      const [subRes, authRes] = await Promise.all([
        subscriptionAPI.getStatus().catch(() => ({ data: { success: false } })),
        authAPI.getMe().catch(() => ({ data: { success: false } })),
      ]);
      if (subRes.data?.success) setSubscriptionInfo(subRes.data.data);
      if (authRes.data?.success) {
        setNotificationSettings((s: any) => ({
          ...s,
          ...(authRes.data.data.notificationSettings || {})
        }));
      }
    } catch (error) {
      toast.error("Failed to load settings data");
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotifications = async () => {
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

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const resolvedPlan = useMemo(() => {
    const rawKeyOrName =
      subscriptionInfo?.plan?.planKey ||
      subscriptionInfo?.plan?.key ||
      subscriptionInfo?.plan?.name ||
      "";

    const aliasMap: Record<string, string> = {
      director_free: "cd_free",
      director_basic: "cd_basic",
      director_pro: "cd_pro",
      director_agency: "agency",
      director_enterprise: "enterprise",
      professional_free: "ip_free",
      professional_basic: "ip_basic",
      professional_pro: "ip_pro",
      freemium: "talent_free",
      premium: "talent_pro",
      professional: "ip_pro",
    };

    const planKey = aliasMap[rawKeyOrName] || rawKeyOrName;
    const plan = (SUBSCRIPTION_PLANS as any[]).find((p) => p?.planKey === planKey);
    const planName =
      plan?.name ||
      (typeof subscriptionInfo?.plan?.name === "string" && subscriptionInfo.plan.name.trim()
        ? subscriptionInfo.plan.name
        : "Free");
    const category = plan?.category || subscriptionInfo?.plan?.category;

    const titleCase = (s: string) =>
      s
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const friendlyName =
      plan?.name ||
      (typeof subscriptionInfo?.plan?.name === "string" && subscriptionInfo.plan.name.includes("_")
        ? titleCase(subscriptionInfo.plan.name.replace(/^cd_/, "casting_director_").replace(/^ip_/, "industry_professional_"))
        : planName);

    const billingCycle = subscriptionInfo?.billingCycle === "yearly" || subscriptionInfo?.billingCycle === "annual" ? "yearly" : "monthly";
    const price =
      typeof subscriptionInfo?.plan?.price === "number"
        ? subscriptionInfo.plan.price
        : typeof plan?.pricing?.[billingCycle] === "number"
          ? plan.pricing[billingCycle]
          : null;

    return {
      planKey: plan?.planKey || planKey,
      name: friendlyName,
      category,
      billingCycle,
      price,
    };
  }, [subscriptionInfo]);

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

  if (activeWorkspace !== "Personal" && !activeWorkspace.permissions?.manageCollaborators) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <ShieldAlert className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Not Authorized</h2>
        <p className="text-muted-foreground">You do not have permission to manage settings for this workspace.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences, notifications, subscription, and security.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-2xl p-1 bg-slate-100/80 border">
          <TabsTrigger value="preferences" className="flex items-center gap-2 rounded-xl text-sm font-semibold transition-all">
            <Settings2 className="w-4 h-4" /> Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 rounded-xl text-sm font-semibold transition-all">
            <Bell className="w-4 h-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2 rounded-xl text-sm font-semibold transition-all">
            <CreditCard className="w-4 h-4" /> Subscription
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 rounded-xl text-sm font-semibold transition-all">
            <ShieldCheck className="w-4 h-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="mt-6">
          <Card className="rounded-[32px] border-none shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <p className="text-sm text-muted-foreground">Customize your experience across the platform</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-2xl border bg-slate-50/50">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-800">Preferred Currency</p>
                  <p className="text-xs text-muted-foreground">Used for all prices and rates across the app</p>
                </div>
                <Select
                  value={currentUser?.preferredCurrency || "GBP"}
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
                  <SelectTrigger className="w-[140px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="rounded-[32px] border-none shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#009698]" /> Notification Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">Manage how you receive updates and activity alerts on Castglo</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800">Casting & Project Alerts</h3>
                <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-700">New Applicant Alerts</p>
                      <p className="text-xs text-muted-foreground">Get notified immediately when a talent submits to one of your roles</p>
                    </div>
                    <Switch
                      checked={notificationSettings.newApplicants}
                      onCheckedChange={(v) => setNotificationSettings(s => ({ ...s, newApplicants: v }))}
                    />
                  </div>
                  
                  <div className="h-px bg-slate-100 my-2" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-700">Weekly Performance Digest</p>
                      <p className="text-xs text-muted-foreground">Receive a weekly summary report of your active listings and submissions</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyDigest}
                      onCheckedChange={(v) => setNotificationSettings(s => ({ ...s, weeklyDigest: v }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800">Your Activity</h3>
                <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-700">Direct Messages</p>
                      <p className="text-xs text-muted-foreground">Get notified when a talent or collaborator sends you a direct message</p>
                    </div>
                    <Switch
                      checked={notificationSettings.directMessages}
                      onCheckedChange={(v) => setNotificationSettings(s => ({ ...s, directMessages: v }))}
                    />
                  </div>
                  
                  <div className="h-px bg-slate-100 my-2" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-700">Shortlist & Invitation Actions</p>
                      <p className="text-xs text-muted-foreground">Receive updates when talent accepts invitations or schedules audition callbacks</p>
                    </div>
                    <Switch
                      checked={notificationSettings.shortlistUpdates}
                      onCheckedChange={(v) => setNotificationSettings(s => ({ ...s, shortlistUpdates: v }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800">Platform & Marketing</h3>
                <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-700">Platform Updates & Offers</p>
                      <p className="text-xs text-muted-foreground">Receive updates on new premium features, tools, and occasional discounts</p>
                    </div>
                    <Switch
                      checked={notificationSettings.marketingUpdates}
                      onCheckedChange={(v) => setNotificationSettings(s => ({ ...s, marketingUpdates: v }))}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={saveNotifications}
                disabled={isSaving}
                className="bg-[#009698] hover:bg-[#009698]/90 font-bold rounded-xl px-6 py-5"
              >
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <Card className="rounded-[32px] border-none shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your current billing plan and features</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-5 rounded-2xl border bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current Plan</span>
                  <Badge variant="secondary" className="bg-[#009698]/10 text-[#009698] border-[#009698]/20 font-bold rounded-full">
                    {resolvedPlan.name || "Free"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  <span className="text-sm capitalize font-bold text-slate-700">{subscriptionInfo?.status || "inactive"}</span>
                </div>
                {resolvedPlan.price !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Price</span>
                    <span className="text-sm font-bold text-slate-700">
                      {formatPrice(resolvedPlan.price)}/{resolvedPlan.billingCycle === "yearly" ? "yr" : "mo"}
                    </span>
                  </div>
                )}
                {subscriptionInfo?.status === "active" && subscriptionInfo?.currentPeriodEnd && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Renews on</span>
                    <span className="text-sm font-bold text-slate-700">{new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <Button
                className="w-full bg-[#009698] hover:bg-[#009698]/90 text-white font-bold rounded-xl py-5 shadow-lg shadow-[#009698]/10"
                onClick={() => navigate("/pricing?category=casting_director")}
              >
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="rounded-[32px] border-none shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Two-factor authentication
              </CardTitle>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </CardHeader>
            <CardContent>
              <TwoFactorSettingsPanel />
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" /> Change Password</CardTitle>
              <p className="text-sm text-muted-foreground">Ensure your account is using a long, random password to stay secure.</p>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <Input type="password" placeholder="••••••••" className="rounded-xl" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input type="password" placeholder="••••••••" className="rounded-xl" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input type="password" placeholder="••••••••" className="rounded-xl" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} />
              </div>
              <Button onClick={handleChangePassword} disabled={isSaving} className="bg-[#009698] hover:bg-[#009698]/90 font-bold rounded-xl px-5">
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
