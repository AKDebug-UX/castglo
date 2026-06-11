import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { authAPI, subscriptionAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";
import { KeyRound, Loader2, UserMinus, Bell, CreditCard, History, Download, Trash2, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUBSCRIPTION_PLANS } from "@/config/subscriptionPlans";

export default function ProfessionalSettings() {
  const { user: currentUser, updatePreferredCurrency, formatPrice, enableTwoFactor, disableTwoFactor } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");

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
        const [subRes, pmRes, invRes] = await Promise.all([
          subscriptionAPI.getStatus().catch(() => ({ data: { success: false } })),
          subscriptionAPI.getPaymentMethods().catch(() => ({ data: { success: false } })),
          subscriptionAPI.getInvoices().catch(() => ({ data: { success: false } })),
        ]);

        if (subRes.data?.success) setSubscriptionInfo(subRes.data.data);
        if (pmRes.data?.success) setPaymentMethods(pmRes.data.data.paymentMethods || []);
        if (invRes.data?.success) setInvoices(invRes.data.data.invoices || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettingsData();
  }, []);

  const resolvedPlan = useMemo(() => {
    const rawKeyOrName =
      subscriptionInfo?.plan?.planKey ||
      subscriptionInfo?.plan?.key ||
      subscriptionInfo?.plan?.name ||
      "";

    const aliasMap: Record<string, string> = {
      cd_free: "director_free",
      cd_basic: "director_basic",
      cd_professional: "director_pro",
      cd_pro: "director_pro",
      cd_agency: "director_agency",
      cd_enterprise: "director_enterprise",
      ip_free: "professional_free",
      ip_basic: "professional_basic",
      ip_pro: "professional_pro",
      freemium: "talent_free",
      premium: "talent_pro",
      professional: "professional_pro",
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

  const handleEnable2FA = async () => {
    setIsEnabling2FA(true);
    try {
      const result = await enableTwoFactor();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Two-factor authentication enabled!");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to enable two-factor authentication");
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      toast.error("Password is required to disable two-factor authentication");
      return;
    }
    setIsDisabling2FA(true);
    try {
      const result = await disableTwoFactor(disablePassword);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Two-factor authentication disabled!");
      setDisablePassword("");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to disable two-factor authentication");
    } finally {
      setIsDisabling2FA(false);
    }
  };

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

  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm("Are you sure you want to remove this payment method?")) return;
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
            <TabsTrigger value="notifications" className="flex-1 rounded-xl text-sm font-semibold transition-all">Notifications</TabsTrigger>
            <TabsTrigger value="subscription" className="flex-1 rounded-xl text-sm font-semibold transition-all">Subscription</TabsTrigger>
            <TabsTrigger value="payments" className="flex-1 rounded-xl text-sm font-semibold transition-all">Payments</TabsTrigger>
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
                onClick={() => {
                  toast.success("Notification preferences saved successfully!");
                }}
                className="bg-[#009698] hover:bg-[#009698]/90 font-bold rounded-xl px-6 py-5 text-white shadow-lg shadow-[#009698]/10"
              >
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

        <TabsContent value="payments" className="mt-6">
          <Card className="rounded-[32px] border-none shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Methods
              </CardTitle>
              <p className="text-sm text-muted-foreground">Manage your saved cards and billing information</p>
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
                          <p className="text-sm font-medium">{card.brand ? card.brand.toUpperCase() : "CARD"} •••• {card.last4}</p>
                          <p className="text-xs text-muted-foreground">Expires {card.expMonth}/{card.expYear}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeletePaymentMethod(card.id)} disabled={isSaving}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href="/pricing">Update</a>
                        </Button>
                      </div>
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

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="rounded-[32px] border-none shadow-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Two-factor authentication
              </CardTitle>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-2xl border bg-slate-50/50">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Email verification</p>
                  <p className="text-xs text-muted-foreground">Get a verification code sent to your email</p>
                </div>
                <div className="flex items-center gap-2">
                  {currentUser?.twoFactorEnabled ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isDisabling2FA}>
                          {isDisabling2FA ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Disabling...
                            </>
                          ) : "Disable"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disable two-factor authentication?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the extra layer of security from your account. Are you sure you want to proceed?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Enter your password to confirm</label>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            value={disablePassword}
                            onChange={(e) => setDisablePassword(e.target.value)}
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDisablePassword("")}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDisable2FA}
                            disabled={isDisabling2FA || !disablePassword}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDisabling2FA ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Disabling...
                              </>
                            ) : "Disable 2FA"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleEnable2FA}
                      disabled={isEnabling2FA}
                    >
                      {isEnabling2FA ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enabling...
                        </>
                      ) : "Enable"}
                    </Button>
                  )}
                </div>
              </div>
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
              <Button variant="destructive" onClick={deleteAccount} className="font-bold rounded-xl px-5 py-5 shadow-lg shadow-red-500/10">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
