import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldCheck, Upload, CreditCard, Bell, KeyRound, UserMinus, History } from "lucide-react";
import { authAPI, blockchainAPI, profileAPI, subscriptionAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";

type SettingsTab =
  | "overview"
  | "security"
  | "subscriptions"
  | "payments"
  | "payment-history"
  | "plans"
  | "notifications"
  | "verification";

export default function AccountSettings() {
  const location = useLocation();
  const tabFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("tab") || "overview") as SettingsTab;
  }, [location.search]);

  const [activeTab, setActiveTab] = useState<SettingsTab>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [subscriptionQuota, setSubscriptionQuota] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState<any>({
    jobSearchEmail: false,
    jobRecFrequency: "none",
    jobPostingAlerts: false,
    applicationAlerts: false,
    savedJobsRoundup: false,
  });

  useEffect(() => {
    setActiveTab(tabFromQuery);
  }, [tabFromQuery]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [authRes, profileRes, historyRes, subRes, quotaRes, pmRes] = await Promise.all([
          authAPI.getMe().catch(() => ({ data: { success: false } })),
          profileAPI.getMe().catch(() => ({ data: { success: false } })),
          blockchainAPI.getHistory({ limit: 5 }).catch(() => ({ data: { success: false } })),
          subscriptionAPI.getStatus().catch(() => ({ data: { success: false } })),
          subscriptionAPI.getQuota().catch(() => ({ data: { success: false } })),
          subscriptionAPI.getPaymentMethods().catch(() => ({ data: { success: false } })),
        ]);

        if (authRes.data?.success) {
          setUser(authRes.data.data);
          setNotificationSettings(authRes.data.data.notificationSettings || notificationSettings);
        }

        if (profileRes.data?.success) {
          setProfile(profileRes.data.data);
        }

        if (historyRes.data?.success) {
          setVerificationHistory(historyRes.data.data.records || []);
        }

        if (subRes.data?.success) {
          setSubscriptionInfo(subRes.data.data);
        }

        if (quotaRes.data?.success) {
          setSubscriptionQuota(quotaRes.data.data);
        }

        if (pmRes.data?.success) {
          setPaymentMethods(pmRes.data.data.paymentMethods || []);
        }
      } catch (e) {
        toast.error("Failed to load account settings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const saveNotifications = async () => {
    setIsSaving(true);
    try {
      await userAPI.updateProfile({ notificationSettings });
      toast.success("Notification settings updated");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update notification settings");
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setIsSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update password");
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

  const handleBlockchainVerify = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append("document", e.target.files[0]);
    formData.append("documentType", "identity");

    setIsVerifying(true);
    try {
      const response = await blockchainAPI.verify(formData);
      if (response.data.success) {
        toast.success("Document anchored to blockchain successfully!");
        const historyRes = await blockchainAPI.getHistory({ limit: 5 });
        setVerificationHistory(historyRes.data.data.records || []);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Blockchain anchoring failed");
    } finally {
      setIsVerifying(false);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Account Settings
            {user?.isVerified && (
              <Badge className="bg-success text-success-foreground">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Verified
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Security, subscriptions, payments, notifications, and verification</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="h-auto p-1 gap-1 inline-flex">
            <TabsTrigger value="overview" className="py-2 px-4">Overview</TabsTrigger>
            <TabsTrigger value="security" className="py-2 px-4">Security</TabsTrigger>
            <TabsTrigger value="subscriptions" className="py-2 px-4">Subscriptions</TabsTrigger>
            <TabsTrigger value="payments" className="py-2 px-4">Payment Settings</TabsTrigger>
            <TabsTrigger value="payment-history" className="py-2 px-4">Payment History</TabsTrigger>
            <TabsTrigger value="plans" className="py-2 px-4">Plans</TabsTrigger>
            <TabsTrigger value="notifications" className="py-2 px-4">Notifications</TabsTrigger>
            <TabsTrigger value="verification" className="py-2 px-4">Verification</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
              <p className="text-sm text-muted-foreground">Quick snapshot of your account health</p>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-xl border bg-white">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Verification</p>
                <p className="font-medium">{user?.isVerified ? "Verified" : "Not Verified"}</p>
              </div>
              <div className="p-4 rounded-xl border bg-white">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Plan</p>
                <p className="font-medium">{subscriptionInfo?.plan?.name || "Free"}</p>
              </div>
              <div className="p-4 rounded-xl border bg-white">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Applications Left</p>
                <p className="font-medium">
                  {subscriptionQuota?.applicationsLeft !== null && subscriptionQuota?.applicationsLeft !== undefined
                    ? subscriptionQuota.applicationsLeft
                    : "Unlimited"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Change Password
              </CardTitle>
              <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Current Password</label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                />
              </div>
              <Button className="w-full" onClick={changePassword} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <UserMinus className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <p className="text-sm text-muted-foreground">Permanent actions for your account</p>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full" onClick={deleteAccount}>
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your subscription and quota</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary">{subscriptionInfo?.plan?.name || "Free Plan"}</Badge>
                    {subscriptionInfo?.status === "active" && (
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionInfo?.status === "active"
                      ? `Renews on ${new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString()}`
                      : "Upgrade to unlock premium features"}
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <a href="/pricing">Manage Plans</a>
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg border bg-white">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Status</p>
                  <p className="font-medium capitalize">{subscriptionInfo?.status || "inactive"}</p>
                </div>
                <div className="p-4 rounded-lg border bg-white">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Quota</p>
                  <p className="font-medium">
                    {subscriptionQuota?.applicationsLeft !== null && subscriptionQuota?.applicationsLeft !== undefined
                      ? `${subscriptionQuota.applicationsLeft} Apps Left`
                      : "Unlimited"}
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-white">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Price</p>
                  <p className="font-medium">{subscriptionInfo?.plan?.price ? `£${subscriptionInfo.plan.price}/mo` : "£0"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">Manage saved cards and billing</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.length > 0 ? (
                <div className="grid gap-3">
                  {paymentMethods.map((card, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-6 bg-slate-200 rounded flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">•••• •••• •••• {card.last4}</p>
                          <p className="text-xs text-muted-foreground">Expires {card.expMonth}/{card.expYear}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="/pricing">Update</a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed rounded-xl text-center">
                  <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground mb-4">No payment cards added yet</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/pricing">Add Card</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-history" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Payment History
              </CardTitle>
              <p className="text-sm text-muted-foreground">Receipts and invoice history</p>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground text-center py-8">
              Payment history will appear here once Stripe invoices are enabled.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plans</CardTitle>
              <p className="text-sm text-muted-foreground">Compare plans and upgrade</p>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Current Plan</p>
                <p className="text-sm text-muted-foreground">{subscriptionInfo?.plan?.name || "Free Plan"}</p>
              </div>
              <Button asChild>
                <a href="/pricing">View Plans</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notification Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">Manage how you receive updates and alerts</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Job Alerts & Recommendations</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Job Search Notifications</p>
                      <p className="text-xs text-muted-foreground">Get casting notices that are most relevant to you</p>
                    </div>
                    <Switch
                      checked={!!notificationSettings.jobSearchEmail}
                      onCheckedChange={(v) => setNotificationSettings((s: any) => ({ ...s, jobSearchEmail: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Job Recommendations</p>
                      <p className="text-xs text-muted-foreground">Get relevant jobs based on your profile</p>
                    </div>
                    <Select
                      value={notificationSettings.jobRecFrequency || "none"}
                      onValueChange={(v) => setNotificationSettings((s: any) => ({ ...s, jobRecFrequency: v }))}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="none">Opt Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Your Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Job Postings</p>
                      <p className="text-xs text-muted-foreground">Alerts about new activity related to your roles</p>
                    </div>
                    <Switch
                      checked={!!notificationSettings.jobPostingAlerts}
                      onCheckedChange={(v) => setNotificationSettings((s: any) => ({ ...s, jobPostingAlerts: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Your Applications</p>
                      <p className="text-xs text-muted-foreground">Updates about your submissions</p>
                    </div>
                    <Switch
                      checked={!!notificationSettings.applicationAlerts}
                      onCheckedChange={(v) => setNotificationSettings((s: any) => ({ ...s, applicationAlerts: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Saved Jobs Roundup</p>
                      <p className="text-xs text-muted-foreground">Summary of bookmarked jobs</p>
                    </div>
                    <Switch
                      checked={!!notificationSettings.savedJobsRoundup}
                      onCheckedChange={(v) => setNotificationSettings((s: any) => ({ ...s, savedJobsRoundup: v }))}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={saveNotifications} disabled={isSaving} className="w-full">
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Verification
              </CardTitle>
              <p className="text-sm text-muted-foreground">Verified profiles get more trust and higher booking chances</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {!user?.isVerified && (
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800">Your profile is not verified</p>
                    <p className="text-xs text-yellow-700">Verified talent builds trust with casting directors and the wider community.</p>
                    <Button variant="link" className="p-0 h-auto text-yellow-800 font-bold" asChild>
                      <a href="/talent/verification-process">Start Verification</a>
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Blockchain Document Anchoring</h3>
                <div className="p-6 border-2 border-dashed rounded-xl text-center space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Anchor New Document</p>
                    <p className="text-sm text-muted-foreground">Upload certificates or identity documents</p>
                  </div>
                  <div className="relative inline-block">
                    <input type="file" id="blockchain-upload" className="hidden" onChange={handleBlockchainVerify} disabled={isVerifying} />
                    <Button asChild disabled={isVerifying}>
                      <label htmlFor="blockchain-upload" className="cursor-pointer flex items-center gap-2">
                        {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        Select & Anchor Document
                      </label>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Verification History
                  </h4>
                  {verificationHistory.length > 0 ? (
                    verificationHistory.map((record) => (
                      <div key={record._id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500/10 rounded flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{record.documentName || "Verification Document"}</p>
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
