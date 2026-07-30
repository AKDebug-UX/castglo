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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, ShieldCheck, Upload, CreditCard, Bell, KeyRound, UserMinus, History, Trash2, Download, Mail } from "lucide-react";
import { authAPI, profileAPI, subscriptionAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { SUBSCRIPTION_PLANS } from "@/config/subscriptionPlans";
import { TwoFactorSettingsPanel } from "@/components/settings/TwoFactorSettingsPanel";
import { useConfirm } from "@/contexts/ConfirmContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { VerifyProfileButton } from "@/components/verification/VerifyProfileButton";

type SettingsTab =
  | "overview"
  | "security"
  | "subscriptions"
  | "payments"
  | "payment-history"
  | "notifications";

export default function AccountSettings() {
  const location = useLocation();
  const confirm = useConfirm();
  const tabFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("tab") || "overview") as SettingsTab;
  }, [location.search]);

  const [activeTab, setActiveTab] = useState<SettingsTab>("overview");
  const { user: currentUser, updatePreferredCurrency, formatPrice, enableTwoFactor, disableTwoFactor } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");

  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [subscriptionQuota, setSubscriptionQuota] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

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

    const name =
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

    const isFree =
      plan?.planKey?.endsWith("_free") ||
      planKey === "talent_free" ||
      name === "Free" ||
      name === "Free Plan" ||
      !subscriptionInfo?.plan;

    return { name, billingCycle, price, isFree };
  }, [subscriptionInfo]);

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
    marketingUpdates: false,
  });

  useEffect(() => {
    setActiveTab(tabFromQuery);
  }, [tabFromQuery]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [authRes, profileRes, subRes, quotaRes, pmRes, invRes] = await Promise.all([
          authAPI.getMe().catch(() => ({ data: { success: false } })),
          profileAPI.getMe().catch(() => ({ data: { success: false } })),
          subscriptionAPI.getStatus().catch(() => ({ data: { success: false } })),
          subscriptionAPI.getQuota().catch(() => ({ data: { success: false } })),
          subscriptionAPI.getPaymentMethods().catch(() => ({ data: { success: false } })),
          subscriptionAPI.getInvoices().catch(() => ({ data: { success: false } })),
        ]);

        if (authRes.data?.success) {
          setUser(authRes.data.data);
          setNotificationSettings((s: any) => ({
            ...s,
            ...(authRes.data.data.notificationSettings || {})
          }));
        }

        if (profileRes.data?.success) {
          setProfile(profileRes.data.data);
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

        if (invRes.data?.success) {
          setInvoices(invRes.data.data.invoices || []);
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

            <TabsTrigger value="payment-history" className="py-2 px-4">Payment History</TabsTrigger>
            <TabsTrigger value="notifications" className="py-2 px-4">Notifications</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
              <p className="text-sm text-muted-foreground">Quick snapshot of your account health</p>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-xl border bg-white flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Identity Verification</p>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{user?.isVerified ? "Verified" : "Not Verified"}</p>
                    {user?.isVerified ? (
                      <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0">Verified</Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 text-[10px] px-1.5 py-0">Unverified</Badge>
                    )}
                  </div>
                </div>
                {!user?.isVerified && (
                  <VerifyProfileButton size="sm" className="mt-2 text-xs w-full bg-[#009698] hover:bg-[#009698]/90 text-white h-8">
                    Verify Identity (Didit)
                  </VerifyProfileButton>
                )}
              </div>
              <div className="p-4 rounded-xl border bg-white flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Plan</p>
                  <p className="font-medium">{subscriptionInfo?.plan?.name || "Free"}</p>
                </div>
                {(!subscriptionInfo?.plan?.name || subscriptionInfo?.plan?.name === "Free Plan" || subscriptionInfo?.plan?.name === "Free") && (
                  <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100 hover:text-pink-700 rounded-lg font-bold" asChild>
                    <a href="/pricing">Upgrade</a>
                  </Button>
                )}
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

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
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
              <Button variant="destructive" className="w-full" onClick={handleDeleteAccountClick}>
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
              {resolvedPlan.isFree ? (
                <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 p-6 md:p-8 text-white shadow-xl">
                  {/* Glowing background circles for visual depth */}
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                  
                  <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-3 max-w-xl">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D98EB3]/20 text-[#D98EB3] border border-[#D98EB3]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D98EB3] animate-pulse" />
                        Castglo Premium
                      </span>
                      <h3 className="text-xl md:text-2xl font-extrabold tracking-tight">Upgrade to Premium & Unlock Unlimited Access</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        Take your career to the next level. Apply to unlimited casting calls, stand out to casting directors with a featured badge, and get instant job alerts tailored to your talent type.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-slate-300 font-medium">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          Unlimited Casting Submissions
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          Featured Talent Profile Badge
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          Priority Listing in Searches
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          Instant Audition Notifications
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 w-full lg:w-auto">
                      <Button asChild size="lg" className="w-full lg:w-auto bg-gradient-to-r from-[#D98EB3] to-[#C97EA3] hover:from-[#C97EA3] hover:to-[#B86D92] text-white font-bold rounded-xl shadow-lg shadow-pink-900/30 border-none px-8 py-6 text-sm hover:scale-[1.02] transition-transform">
                        <a href="/pricing?category=talent">Upgrade to Premium</a>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl border bg-emerald-50/20 border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold px-3 py-1 rounded-full">{resolvedPlan.name || "Premium Plan"}</Badge>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 font-medium px-2 py-0.5 rounded-full">Active Subscriber</Badge>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Thank you for being a premium member! Your subscription is active and will automatically renew on <span className="font-semibold text-slate-800">{new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString()}</span>.
                    </p>
                  </div>
                  <Button variant="outline" asChild className="rounded-xl border-slate-200 hover:bg-slate-50 flex-shrink-0">
                    <a href="/pricing?category=talent">Manage / Change Plan</a>
                  </Button>
                </div>
              )}

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
                  <p className="font-medium">
                    {resolvedPlan.price !== null ? `${formatPrice(resolvedPlan.price)}/${resolvedPlan.billingCycle === "yearly" ? "yr" : "mo"}` : formatPrice(0)}
                  </p>
                </div>
              </div>
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

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Platform & Marketing</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Platform Updates & Offers</p>
                      <p className="text-xs text-muted-foreground">Receive updates on new premium features, tools, and occasional discounts</p>
                    </div>
                    <Switch
                      checked={!!notificationSettings.marketingUpdates}
                      onCheckedChange={(v) => setNotificationSettings((s: any) => ({ ...s, marketingUpdates: v }))}
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
