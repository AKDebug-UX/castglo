import { useMemo, useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Loader2, Sparkles, Zap, Shield, Rocket, ChevronDown, ChevronUp } from "lucide-react";
import { subscriptionAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { SUBSCRIPTION_PLANS, ADD_ONS, LAUNCHING_OFFERS } from "@/config/subscriptionPlans";

type BillingCycle = "monthly" | "yearly";
type Plan = {
  planKey: string;
  name: string;
  category: string;
  description?: string;
  pricing: Record<BillingCycle, number>;
  features?: Record<string, any>;
};

export default function Pricing() {
  const { user, formatPrice } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get("category");
  
  const [plans, setPlans] = useState<Plan[]>(SUBSCRIPTION_PLANS as Plan[]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [activeTab, setActiveTab] = useState(categoryParam || user?.role || "talent");

  useEffect(() => {
    if (user?.role && !categoryParam) {
      setActiveTab(user.role);
    }
  }, [user, categoryParam]);

  const localPlanKeys = useMemo(() => new Set((SUBSCRIPTION_PLANS as Plan[]).map((p) => p.planKey)), []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await subscriptionAPI.getPlans();
        const apiPlans = response.data?.data?.data?.plans;
        if (!response.data?.data?.success || !Array.isArray(apiPlans) || apiPlans.length === 0) {
          return;
        }

        const toNumber = (value: unknown) => {
          if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
          if (typeof value === "string") {
            const cleaned = value.replace(/[^0-9.-]/g, "");
            const parsed = parseFloat(cleaned);
            return Number.isFinite(parsed) ? parsed : NaN;
          }
          return NaN;
        };

        const normalizedExtras: Plan[] = apiPlans
          .map((p: any) => {
            const planKey = typeof p?.planKey === "string" ? p.planKey : typeof p?.key === "string" ? p.key : "";
            const name = typeof p?.name === "string" ? p.name : "";
            const category = typeof p?.category === "string" ? p.category : "";

            const monthlyRaw = p?.pricing?.monthly ?? p?.monthlyPrice ?? p?.priceMonthly ?? p?.monthly;
            const yearlyRaw = p?.pricing?.yearly ?? p?.yearlyPrice ?? p?.priceYearly ?? p?.yearly;

            const monthly = toNumber(monthlyRaw);
            const yearly = toNumber(yearlyRaw);

            if (!planKey || !name || !category) return null;
            if (!Number.isFinite(monthly) || !Number.isFinite(yearly)) return null;

            const features =
              p?.features && typeof p.features === "object" && !Array.isArray(p.features) ? p.features : {};

            return {
              planKey,
              name,
              category,
              description: typeof p?.description === "string" ? p.description : undefined,
              pricing: { monthly, yearly },
              features,
            } satisfies Plan;
          })
          .filter(Boolean)
          .filter((p: Plan) => !localPlanKeys.has(p.planKey));

        if (normalizedExtras.length > 0) {
          setPlans([...(SUBSCRIPTION_PLANS as Plan[]), ...normalizedExtras]);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        // Fallback to local plans if API fails
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (plan) => {
    // If user is already logged in, redirect to Stripe checkout
    if (user) {
      setIsProcessing(plan.planKey);
      try {
        const response = await subscriptionAPI.createCheckoutSession({
          planName: plan.planKey,
          billingCycle: billingCycle
        });

        if (response.data.success && response.data.data.url) {
          window.location.href = response.data.data.url;
        } else {
          toast.error("Could not initiate checkout. Please try again.");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "An unexpected error occurred");
      } finally {
        setIsProcessing(null);
      }
    } else {
      // If not logged in, redirect to register with plan and category info
      navigate(`/join/${activeTab}?plan=${plan.planKey}&cycle=${billingCycle}`);
    }
  };

  const categories = [
    { id: "talent", label: "Talent", icon: Sparkles },
    { id: "casting_director", label: "Casting Director / Agency", icon: Zap },
    { id: "industry_professional", label: "Industry Professional", icon: Shield }
  ];

  const getIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes("free")) return <Zap className="w-5 h-5 text-slate-400" />;
    if (name.includes("basic")) return <Sparkles className="w-5 h-5 text-blue-500" />;
    if (name.includes("pro")) return <Rocket className="w-5 h-5 text-orange-500" />;
    return <Zap className="w-5 h-5 text-primary" />;
  };

  const activeTabDetails = categories.find(c => c.id === activeTab);

  const FeatureList = ({ features }: { features: Record<string, any> }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const featureEntries = Object.entries(features);
    const hasMore = featureEntries.length > 10;
    const displayedFeatures = isExpanded ? featureEntries : featureEntries.slice(0, 10);

    return (
      <div className="space-y-2">
        {displayedFeatures.map(([key, value], idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-sm">
            <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="leading-snug">
              <span className="font-medium text-slate-900">{key}</span>
              <span className="text-slate-600">{" — "}{String(value)}</span>
            </div>
          </div>
        ))}
        
        {hasMore && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-[#00857f] transition-colors mt-3"
          >
            {isExpanded ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>See All Features <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-[#DEFCFE] via-white to-white py-14 lg:py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-10">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Pricing that scales with you
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-[720px] mx-auto">
              Choose the plan that matches your role. Upgrade or downgrade anytime.
            </p>
            
            <div className="inline-flex items-center justify-center gap-3 pt-3">
              <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-12 h-6 rounded-full bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#009698]/30"
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : ''}`} />
              </button>
              <span className={`text-sm font-semibold ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-500'}`}>
                Yearly{" "}
                <Badge variant="secondary" className="ml-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                  Save 20%
                </Badge>
              </span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-7xl mx-auto">
            {!user && (
              <TabsList className="grid grid-cols-2 md:grid-cols-3 h-auto p-1 bg-white border border-slate-200 shadow-sm rounded-xl mb-10">
                {categories.map((cat) => (
                  <TabsTrigger 
                    key={cat.id} 
                    value={cat.id}
                    className="py-3 rounded-lg data-[state=active]:bg-slate-50 data-[state=active]:shadow-none"
                  >
                    <cat.icon className="w-4 h-4 mr-2 hidden sm:inline-block" />
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            )}

            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="animate-in fade-in-50 duration-500">
                <div className="grid gap-6 md:grid-cols-3">
                  {plans
                    .filter((p) => p.category === cat.id)
                    .map((plan) => (
                      <Card
                        key={plan.planKey}
                        className={`relative flex flex-col rounded-2xl border bg-white shadow-sm ${
                          plan.name === "Pro" ? "border-[#009698]/30 ring-1 ring-[#009698]/20" : "border-slate-200"
                        }`}
                      >
                        {plan.name === 'Pro' && (
                          <div className="absolute top-0 right-0">
                            <Badge className="rounded-none rounded-bl-xl bg-[#009698] text-white px-4 py-1">Most Popular</Badge>
                          </div>
                        )}
                        <CardHeader className="pb-5 pt-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                              {getIcon(plan.name)}
                            </div>
                            <div className="space-y-0.5">
                              <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                              {plan.description && <p className="text-xs text-slate-500">{plan.description}</p>}
                            </div>
                          </div>
                          <div className="flex items-end gap-2 mt-5">
                            <span className="text-4xl font-semibold tracking-tight">
                              {plan.pricing[billingCycle] === -1
                                ? "Custom"
                                : plan.pricing[billingCycle] === 0
                                  ? formatPrice(0)
                                  : formatPrice(plan.pricing[billingCycle])}
                            </span>
                            {plan.pricing[billingCycle] > 0 && (
                              <span className="text-slate-500 text-sm font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 pt-0">
                          <FeatureList features={plan.features || {}} />
                        </CardContent>
                        <CardFooter className="pt-6 pb-6">
                          <Button 
                            className={`w-full h-11 rounded-xl font-semibold transition-colors ${
                              plan.pricing[billingCycle] === 0
                                ? "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
                                : plan.pricing[billingCycle] === -1
                                  ? "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
                                  : "bg-[#009698] hover:bg-[#00857f] text-white"
                            }`}
                            onClick={() => {
                              if (plan.pricing[billingCycle] === -1) {
                                window.location.href = "mailto:sales@castglo.com";
                              } else {
                                handleSubscribe(plan);
                              }
                            }}
                            disabled={isProcessing === plan.planKey}
                          >
                            {isProcessing === plan.planKey ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : plan.pricing[billingCycle] === -1 ? (
                              "Contact Sales"
                            ) : plan.pricing[billingCycle] === 0 ? (
                              "Join for Free"
                            ) : (
                              "Get Started"
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Launching Offers Section */}
          <div className="mt-20 max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                Limited Time
              </Badge>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">Launching Offers</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Early access offers for the first months. Limited availability.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {LAUNCHING_OFFERS.map((offer, idx) => (
                <Card key={idx} className="border border-slate-200 shadow-sm rounded-2xl p-6 text-center bg-white">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{offer.role}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{offer.offer}</h3>
                </Card>
              ))}
            </div>
          </div>

          {/* Add-ons Section */}
          <div className="mt-20 max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">Add-ons</h2>
              <p className="text-slate-600">Optional upgrades you can buy anytime.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                {ADD_ONS.filter(addon => addon.roles.includes(activeTab)).map((addon, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-[#009698]/10 flex items-center justify-center text-[#009698]">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{addon.name}</h4>
                        <p className="text-xs text-slate-500">Optional upgrade</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-[#009698]">{addon.price}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center mt-6 text-sm text-slate-500">
                * All add-ons can be purchased from your profile dashboard after joining.
              </p>
            </div>
          </div>

          <div className="mt-20 max-w-4xl mx-auto text-center space-y-8 bg-white rounded-2xl p-8 md:p-10 border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Frequently Asked Questions</h2>
            <div className="grid gap-8 md:grid-cols-2 text-left">
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">Can I change plans anytime?</h4>
                <p className="text-sm text-slate-600">Yes, you can upgrade or downgrade your plan at any time from your account settings.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">Is there a free trial?</h4>
                <p className="text-sm text-slate-600">We offer a Free plan for Talents to get started. Paid plans offer more applications and premium visibility.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">How do I cancel my subscription?</h4>
                <p className="text-sm text-slate-600">You can cancel your subscription anytime from the billing section of your dashboard.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">Are there any hidden fees?</h4>
                <p className="text-sm text-slate-600">No, the price you see is what you pay. Custom enterprise plans may have separate agreements.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
