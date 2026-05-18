import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, Check, Zap, Sparkles, 
  History, ArrowRight, Download, 
  LayoutGrid, Rocket, Megaphone,
  AlertCircle, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { subscriptionAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const PLAN_DETAILS: Record<string, { name: string; price: string; cycle: string; features: string[] }> = {
  free: {
    name: "Free Trial",
    price: "£0",
    cycle: "/month",
    features: [
      "1 Active Project",
      "1 Team Member",
      "Standard Talent Search",
      "Email Support"
    ]
  },
  cd_payg: {
    name: "Pay As You Go",
    price: "£9",
    cycle: "/listing",
    features: [
      "Single Project Listing",
      "Standard Talent Search",
      "Basic Applicant Tracking",
      "Email Support"
    ]
  },
  cd_basic: {
    name: "Director Basic",
    price: "£19",
    cycle: "/month",
    features: [
      "3 Active Projects",
      "1 Team Member",
      "Standard Talent Search",
      "Basic Applicant Tracking",
      "Email Support"
    ]
  },
  cd_standard: {
    name: "Director Standard",
    price: "£39",
    cycle: "/month",
    features: [
      "10 Active Projects",
      "3 Team Collaborators",
      "Advanced Match Engine",
      "Virtual Audition Access",
      "Priority Support"
    ]
  },
  cd_professional: {
    name: "Director Professional",
    price: "£69",
    cycle: "/month",
    features: [
      "Unlimited Active Projects",
      "10 Team Collaborators",
      "Custom Applicant Pipelines",
      "Full Video Audition Rooms",
      "24/7 Dedicated Support",
      "CSV Data Exports"
    ]
  }
};

export default function DirectorBilling() {
  const navigate = useNavigate();
  const { formatPrice } = useAuth();
  const [subStatus, setSubStatus] = useState<any>(null);
  const [isLoadingSub, setIsLoadingSub] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const [subRes, invRes] = await Promise.all([
          subscriptionAPI.getStatus().catch(() => ({ data: { success: false } })),
          subscriptionAPI.getInvoices().catch(() => ({ data: { success: false } })),
        ]);

        if (subRes.data?.success && subRes.data?.data) {
          setSubStatus(subRes.data.data);
        }

        if (invRes.data?.success) {
          setInvoices(invRes.data.data.invoices || []);
        }
      } catch (error) {
        console.error("Failed to load billing data:", error);
      } finally {
        setIsLoadingSub(false);
      }
    };
    fetchBillingData();
  }, []);

  const handleManageSubscription = () => {
    navigate("/pricing?category=casting_director");
  };

  const currentPlanKey = subStatus?.plan?.key || "free";
  const planInfo = PLAN_DETAILS[currentPlanKey] || PLAN_DETAILS.free;
  const planName = subStatus?.plan?.name || planInfo.name;
  const planPrice = subStatus?.plan?.price !== undefined ? `£${subStatus.plan.price}` : planInfo.price;
  const planCycle = subStatus?.billingCycle ? `/${subStatus.billingCycle.replace('ly', '')}` : planInfo.cycle;
  const isSubActive = subStatus?.status === "active";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-[#009698]" /> Billing & Marketplace
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your subscription, view receipts, and promote your casting calls.
        </p>
      </header>

      {/* Subscription Plans */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-2 border-[#009698] shadow-lg lg:col-span-1 h-fit bg-white rounded-2xl">
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge className="bg-[#009698] text-white border-none font-semibold px-2.5 py-0.5">
              {isSubActive ? "Active Plan" : "Current Plan"}
            </Badge>
          </div>
          
          {isLoadingSub ? (
            <CardContent className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#009698]" />
              <p className="text-xs text-slate-400">Loading plan info...</p>
            </CardContent>
          ) : (
            <>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-slate-800">{planName}</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  {currentPlanKey === "free" ? "Start listing projects and discovering talent." : "Advanced tools for professional teams."}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-800">{planPrice}</span>
                  <span className="text-slate-400 text-sm font-medium">{planCycle}</span>
                </div>
                
                <ul className="space-y-3 text-sm text-slate-600">
                  {planInfo.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="p-0.5 rounded-full bg-green-50">
                        <Check className="w-3.5 h-3.5 text-green-600 font-bold" />
                      </div>
                      <span className="font-medium text-slate-600">{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={handleManageSubscription} 
                  className="w-full bg-[#009698] hover:bg-[#009698]/90 text-white font-semibold rounded-xl h-11 active:scale-[0.98] transition-all shadow-sm"
                >
                  Upgrade & Manage Subscription
                </Button>
              </CardContent>
            </>
          )}
        </Card>

        {/* Marketplace / Add-ons */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <Sparkles className="w-5 h-5 text-amber-500" /> Marketplace Add-ons
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="group hover:border-[#009698]/40 transition-all cursor-pointer bg-white border-slate-100 rounded-xl shadow-sm" onClick={handleManageSubscription}>
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Megaphone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Featured Project</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Get 5x more applicants by pinning your project to the top of the talent feed.</p>
                  <p className="text-sm font-bold mt-3 text-[#009698]">$29.00 / project</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:border-[#009698]/40 transition-all cursor-pointer bg-white border-slate-100 rounded-xl shadow-sm" onClick={handleManageSubscription}>
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Urgent Hiring</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Add a priority badge and get instant notifications to the most active talent.</p>
                  <p className="text-sm font-bold mt-3 text-[#009698]">$15.00 / project</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:border-[#009698]/40 transition-all cursor-pointer bg-white border-slate-100 rounded-xl shadow-sm" onClick={handleManageSubscription}>
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <LayoutGrid className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Extra Project Slot</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Found a new project? Add a single project slot without upgrading your whole plan.</p>
                  <p className="text-sm font-bold mt-3 text-[#009698]">$10.00 / month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:border-[#009698]/40 transition-all cursor-pointer bg-white border-slate-100 rounded-xl shadow-sm" onClick={handleManageSubscription}>
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Rocket className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Social Media Blast</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">We'll promote your casting call on the Castglo Instagram & TikTok pages.</p>
                  <p className="text-sm font-bold mt-3 text-[#009698]">$45.00 / blast</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <Card className="bg-white border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-50">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
            <History className="w-5 h-5 text-slate-400" /> Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoices.length > 0 ? (
                  invoices.map((tx, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{new Date(tx.date * 1000).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{tx.description || "Subscription"}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={tx.status === "paid" ? "bg-green-50 text-green-700 border-green-200 font-semibold text-xs rounded-full" : "bg-yellow-50 text-yellow-700 border-yellow-200 font-semibold text-xs rounded-full"}>
                           {tx.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatPrice(tx.amount / 100)}</td>
                      <td className="px-6 py-4 text-right">
                        {tx.receiptUrl && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg" asChild>
                            <a href={tx.receiptUrl} target="_blank" rel="noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No transaction history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Safety Info */}
      <div className="p-4 bg-amber-50/60 border border-amber-200/50 rounded-2xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-amber-800">Payment Security</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            All payments are processed securely via Stripe. Castglo does not store your full card details. 
            For enterprise billing or invoicing, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
