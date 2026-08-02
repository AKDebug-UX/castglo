import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { authAPI, subscriptionAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";
import { KeyRound, Loader2, UserMinus, Bell, CreditCard, History, Download, Trash2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUBSCRIPTION_PLANS } from "@/config/subscriptionPlans";
import { TwoFactorSettingsPanel } from "@/components/settings/TwoFactorSettingsPanel";
import { useConfirm } from "@/contexts/ConfirmContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { VerifyProfileButton } from "@/components/verification/VerifyProfileButton";

export default function ProfessionalSettings() {
  const { user: currentUser, updatePreferredCurrency, formatPrice } = useAuth();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const [notificationSettings, setNotificationSettings] = useState({
    newBookingRequests: true,
    weeklyPerformance: true,
    directMessages: true,
    serviceReviews: true,
    marketingUpdates: false,
  });

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const [subRes, pmRes, invRes, authRes] = await Promise.all([
          subscriptionAPI.getStatus().catch(() => ({ data: { success: false } })),
          subscriptionAPI.getPaymentMethods().catch(() => ({ data: { success: false } })),
          subscriptionAPI.getInvoices().catch(() => ({ data: { success: false } })),
          authAPI.getMe().catch(() => ({ data: { success: false } })),
        ]);

        if (subRes.data?.success) setSubscriptionInfo(subRes.data.data);
        if (pmRes.data?.success) setPaymentMethods(pmRes.data.data.paymentMethods || []);
        if (invRes.data?.success) setInvoices(invRes.data.data.invoices || []);
        if (authRes.data?.success) {
          setNotificationSettings((s: any) => ({
            ...s,
            ...(authRes.data.data.notificationSettings || {})
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettingsData();
  }, []);

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
        : subscriptionInfo?.plan?.name || "Free");

    const billingCycle = subscriptionInfo?.billingCycle === "yearly" || subscriptionInfo?.billingCycle === "annual" ? "yearly" : "monthly";
    const price =
      typeof subscriptionInfo?.plan?.price === "number"
        ? subscriptionInfo.plan.price
        : typeof plan?.pricing?.[billingCycle] === "number"
          ? plan.pricing[billingCycle]
          : null;

    return { name: friendlyName, billingCycle, price };
  }, [subscriptionInfo]);

  const handleChangePassword = async () => {
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

  const handleDeleteAccountClick = () => {
    setDeleteConfirmPassword("");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmPassword) {
      toast.error("Password is required to delete account");
      return;
    }
    if (!await confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) return;

    setIsSaving(true);
    try {
      await userAPI.deleteAccount({ password: deleteConfirmPassword });
      toast.success("Account deleted successfully");
      setIsDeleteModalOpen(false);
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to delete account");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!await confirm("Are you sure you want to remove this payment method?")) return;
    setIsSaving(true);
    try {
      await subscriptionAPI.deletePaymentMethod(id);
      toast.success("Payment method removed");
      setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to remove payment method");
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
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
        <p className="text-muted-foreground">Manage your professional account, notifications, subscription, and security.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="flex w-full min-w-[600px] rounded-2xl p-1 bg-slate-100/80 border">
            <TabsTrigger value="overview" className="flex-1 rounded-xl text-sm font-semibold transition-all">Overview</TabsTrigger>
            <TabsTrigger value="verification" className="flex-1 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 text-emerald-700 bg-emerald-50/50 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <ShieldCheck className="w-4 h-4" /> Verification
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 rounded-xl text-sm font-semibold transition-all">Notifications</TabsTrigger>
            <TabsTrigger value="subscription" className="flex-1 rounded-xl text-sm font-semibold transition-all">Subscription</TabsTrigger>

            <TabsTrigger value="history" className="flex-1 rounded-xl text-sm font-semibold transition-all">History</TabsTrigger>
            <TabsTrigger value="security" className="flex-1 rounded-xl text-sm font-semibold transition-all">Security</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card className="rounded-[32px] border-none shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-xl border bg-slate-50/50">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Email</p>
                <p className="font-medium text-slate-800">{currentUser?.email}</p>
              </div>
              <div className="p-4 rounded-xl border bg-slate-50/50">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Plan</p>
                <p className="font-medium text-slate-800">{subscriptionInfo?.plan?.name || "Free"}</p>
              </div>
            </CardContent>
          </Card>

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
                    <SelectItem value="NGN">NGN (₦)</SelectItem>
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
              <p className="text-sm text-muted-foreground">Manage how you receive updates and client notifications on Castglo</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800">Client Bookings & Requests</h3>
                <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-700">New Booking Requests</p>
                      <p className="text-xs text-muted-foreground">Get notified immediately when a client requests your service or facility</p>
                    </div>
                    <Switch
                      checked={notificationSettings.newBookingRequests}
                      onCheckedChange={(v) => setNotificationSettings(s => ({ ...s, newBookingRequests: v }))}
                    />
                  </div>
                  
                  <div className="h-px bg-slate-100 my-2" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-700">Performance & Search Digest</p>
                      <p className="text-xs text-muted-foreground">Receive weekly analytics on how many clients viewed your services</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyPerformance}
                      onCheckedChange={(v) => setNotificationSettings(s => ({ ...s, weeklyPerformance: v }))}
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
                      <p className="text-xs text-muted-foreground">Get notified when a client or project director sends you a direct message</p>
                    </div>
                    <Switch
                      checked={notificationSettings.directMessages}
                      onCheckedChange={(v) => setNotificationSettings(s => ({ ...s, directMessages: v }))}
                    />
                  </div>
                  
                  <div className="h-px bg-slate-100 my-2" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-700">New Client Reviews</p>
                      <p className="text-xs text-muted-foreground">Receive updates when a client submits feedback or rates your profile</p>
                    </div>
                    <Switch
                      checked={notificationSettings.serviceReviews}
                      onCheckedChange={(v) => setNotificationSettings(s => ({ ...s, serviceReviews: v }))}
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
                      <p className="text-xs text-muted-foreground">Receive updates on new professional features, tools, and advertising discounts</p>
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
                className="bg-[#009698] hover:bg-[#009698]/90 font-bold rounded-xl px-6 py-5 text-white shadow-lg shadow-[#009698]/10"
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
              <p className="text-sm text-muted-foreground">Manage your current professional plan</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-5 rounded-2xl border bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current Plan</span>
                  <strong className="text-sm text-slate-800 bg-[#009698]/10 text-[#009698] px-3 py-1 rounded-full font-bold border border-[#009698]/20">{resolvedPlan.name || "Free"}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  <strong className="text-sm capitalize text-slate-800">{subscriptionInfo?.status || "inactive"}</strong>
                </div>
                {resolvedPlan.price !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Price</span>
                    <strong className="text-sm text-slate-700">{formatPrice(resolvedPlan.price)}/{resolvedPlan.billingCycle === "yearly" ? "yr" : "mo"}</strong>
                  </div>
                )}
                {subscriptionInfo?.status === "active" && subscriptionInfo?.currentPeriodEnd && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Renews on</span>
                    <strong className="text-sm text-slate-700">{new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString()}</strong>
                  </div>
                )}
              </div>
              <Button variant="outline" asChild className="w-full py-5 rounded-xl border-[#009698] text-[#009698] hover:bg-[#009698]/5 font-bold transition-all">
                <a href="/pricing">Manage Subscription</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="history" className="mt-6">
          <Card className="rounded-[32px] border-none shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Payment History
              </CardTitle>
              <p className="text-sm text-muted-foreground">Your past receipts and invoices</p>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Description</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {invoices.map((inv, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3">{new Date(inv.date * 1000).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-medium">{inv.description || "Subscription"}</td>
                          <td className="px-4 py-3">{formatPrice(inv.amount / 100)}</td>
                          <td className="px-4 py-3">
                            <Badge variant={inv.status === "paid" ? "default" : "outline"} className={inv.status === "paid" ? "bg-emerald-500" : ""}>
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {inv.receiptUrl && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={inv.receiptUrl} target="_blank" rel="noreferrer">
                                  <Download className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No payment history found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="mt-6 space-y-6">
          <Card className="rounded-[32px] border-2 border-[#009698]/20 shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl text-white">
                    <ShieldCheck className="w-6 h-6 text-[#009698]" />
                    Identity Verification
                  </CardTitle>
                  <p className="text-sm text-slate-300 mt-1">
                    Instant biometric selfie & government photo ID verification
                  </p>
                </div>
                {currentUser?.isVerified ? (
                  <Badge className="bg-emerald-500 text-white text-xs px-3 py-1 font-semibold self-start sm:self-auto">
                    Account Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-400 border-amber-400/40 bg-amber-500/10 text-xs px-3 py-1 font-semibold self-start sm:self-auto">
                    Unverified Profile
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-xl border bg-slate-50/50 space-y-1">
                  <div className="text-sm font-semibold flex items-center gap-1.5 text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#009698]" /> Biometric Selfie Matching
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Quickly verify your identity using facial recognition via your webcam or camera.
                  </p>
                </div>
                <div className="p-4 rounded-xl border bg-slate-50/50 space-y-1">
                  <div className="text-sm font-semibold flex items-center gap-1.5 text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#009698]" /> Official Photo ID
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Validate your passport, driver's license, or national ID card securely.
                  </p>
                </div>
                <div className="p-4 rounded-xl border bg-slate-50/50 space-y-1">
                  <div className="text-sm font-semibold flex items-center gap-1.5 text-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#009698]" /> Verified Badge
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Earn an official verified badge to build trust with clients and directors.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#009698]/10 via-teal-500/5 to-slate-50 border border-[#009698]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <h3 className="font-bold text-base text-slate-900">
                    {currentUser?.isVerified ? "Identity Verification Completed" : "Start Instant Verification"}
                  </h3>
                  <p className="text-xs text-slate-600 max-w-lg">
                    {currentUser?.isVerified
                      ? "Your identity has been verified. You can re-run verification anytime if your details change."
                      : "Click below to launch the identity verification popup and complete your identity check in under 2 minutes."}
                  </p>
                </div>
                <VerifyProfileButton size="lg" className="bg-[#009698] hover:bg-[#009698]/90 text-white font-semibold px-6 py-3 rounded-xl shadow-md min-w-[220px]">
                  {currentUser?.isVerified ? "Re-verify Identity" : "Verify Identity"}
                </VerifyProfileButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="rounded-[32px] border-none shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#009698]">
                <ShieldCheck className="w-5 h-5" /> Identity Verification
              </CardTitle>
              <p className="text-sm text-muted-foreground">Verify your identity to earn an official verified badge</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-2xl border bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800">Verification Status</p>
                    {currentUser?.isVerified ? (
                      <Badge className="bg-emerald-500 text-white text-xs">Verified</Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-xs">Unverified</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentUser?.isVerified ? "Your identity is verified" : "Your account is currently unverified"}
                  </p>
                </div>
                <VerifyProfileButton size="sm" className="bg-[#009698] hover:bg-[#009698]/90 text-white rounded-xl">
                  {currentUser?.isVerified ? "Re-verify" : "Verify Identity"}
                </VerifyProfileButton>
              </div>
            </CardContent>
          </Card>

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
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Current Password</label>
                <Input type="password" placeholder="••••••••" className="rounded-xl" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">New Password</label>
                <Input type="password" placeholder="••••••••" className="rounded-xl" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input type="password" placeholder="••••••••" className="rounded-xl" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} />
              </div>
              <Button onClick={handleChangePassword} disabled={isSaving} className="bg-[#009698] hover:bg-[#009698]/90 font-bold rounded-xl text-white px-5 py-5 shadow-lg shadow-[#009698]/10 mt-2">
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-xl overflow-hidden border border-red-100">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <UserMinus className="w-5 h-5 text-red-500" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Permanently delete your professional account and all associated data. This action is immediate and cannot be undone.
              </p>
              <Button variant="destructive" onClick={handleDeleteAccountClick} className="font-bold rounded-xl px-5 py-5 shadow-lg shadow-red-500/10">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
