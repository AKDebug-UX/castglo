import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Loader2, Sparkles, Zap, Shield, Rocket, ChevronDown, ChevronUp } from "lucide-react";
import { subscriptionAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";

import { SUBSCRIPTION_PLANS, ADD_ONS, LAUNCHING_OFFERS } from "@/config/subscriptionPlans";

export default function Pricing() {
  const { user, formatPrice } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get("category");
  
  const [plans, setPlans] = useState(SUBSCRIPTION_PLANS);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [activeTab, setActiveTab] = useState(categoryParam || "talent");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await subscriptionAPI.getPlans();
        if (response.data.success && response.data.data.plans?.length > 0) {
          setPlans(response.data.data.plans);
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
      <div className="space-y-3">
        {displayedFeatures.map(([key, value], idx) => (
          <div key={idx} className="flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="mt-1 bg-green-100 rounded-full p-0.5">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{key}</span>
              <span className="text-slate-900 font-medium leading-tight">{value}</span>
            </div>
          </div>
        ))}
        
        {hasMore && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors mt-4 w-full justify-center py-2 rounded-lg bg-primary/5 border border-primary/10"
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
      <main className="flex-1 bg-[#DEFCFE] py-16 lg:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Simple, <span className="text-gradient">Transparent</span> Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
              Choose the perfect plan to accelerate your career or find the best talent for your production.
            </p>
            
            <div className="flex items-center justify-center gap-4 pt-4">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-12 h-6 rounded-full bg-slate-200 transition-colors focus:outline-none"
              >
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : ''}`} />
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Yearly <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 hover:bg-green-100 border-none">Save 20%</Badge>
              </span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-7xl mx-auto">
            <TabsList className="grid grid-cols-2 md:grid-cols-3 h-auto p-1 bg-white/50 backdrop-blur shadow-sm rounded-xl mb-12">
              {categories.map((cat) => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <cat.icon className="w-4 h-4 mr-2 hidden sm:inline-block" />
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="animate-in fade-in-50 duration-500">
                <div className="grid gap-8 md:grid-cols-3 justify-center">
                  {plans
                    .filter((p) => p.category === cat.id)
                    .map((plan) => (
                      <Card key={plan.planKey} className={`relative flex flex-col border-none shadow-xl rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${plan.name === 'Pro' ? 'ring-2 ring-primary ring-offset-4 ring-offset-[#DEFCFE]' : ''}`}>
                        {plan.name === 'Pro' && (
                          <div className="absolute top-0 right-0">
                            <Badge className="rounded-none rounded-bl-xl bg-primary text-primary-foreground px-4 py-1">Most Popular</Badge>
                          </div>
                        )}
                        <CardHeader className="pb-8">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                              {getIcon(plan.name)}
                            </div>
                            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black">
                              {plan.pricing[billingCycle] === 0 ? "Free" : formatPrice(plan.pricing[billingCycle])}
                            </span>
                            {plan.pricing[billingCycle] !== 0 && (
                              <span className="text-muted-foreground font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6">
                          <FeatureList features={plan.features || {}} />
                        </CardContent>
                        <CardFooter className="pt-8">
                          <Button 
                            className={`w-full h-12 rounded-2xl font-bold text-lg transition-all ${plan.name === 'Pro' ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20' : 'bg-slate-900 hover:bg-slate-800'}`}
                            onClick={() => handleSubscribe(plan)}
                            disabled={isProcessing === plan.planKey}
                          >
                            {isProcessing === plan.planKey ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
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
          <div className="mt-24 max-w-6xl mx-auto space-y-10">
            <div className="text-center space-y-4">
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-4 py-1 text-sm font-bold uppercase tracking-wider">Limited Time Offer</Badge>
              <h2 className="text-3xl md:text-4xl font-black">Launching <span className="text-[#009698]">Offers</span></h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Rapid adoption deals for the first 3 months. Get premium features at a fraction of the cost.</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {LAUNCHING_OFFERS.map((offer, idx) => (
                <Card key={idx} className="bg-white/60 backdrop-blur border-none shadow-lg rounded-[32px] p-6 text-center hover:scale-[1.03] transition-transform duration-300">
                  <p className="text-sm font-bold text-slate-500 uppercase mb-2">{offer.role}</p>
                  <h3 className="text-xl font-black text-slate-900">{offer.offer}</h3>
                </Card>
              ))}
            </div>
          </div>

          {/* Add-ons Section */}
          <div className="mt-24 max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-black">Power Up with <span className="text-[#009698]">Add-ons</span></h2>
              <p className="text-slate-600">Customize your experience with specific upgrades tailored to your needs.</p>
            </div>

            <div className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 md:p-12 border border-white/60 shadow-2xl">
              <div className="grid gap-6 md:grid-cols-2">
                {ADD_ONS.filter(addon => addon.roles.includes(activeTab)).map((addon, idx) => (
                  <div key={idx} className="flex items-center justify-between p-6 bg-white/80 rounded-3xl shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#009698]/10 flex items-center justify-center text-[#009698] group-hover:bg-[#009698] group-hover:text-white transition-colors">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{addon.name}</h4>
                        <p className="text-xs text-slate-500">Boost your presence</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-[#009698]">{addon.price}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-center mt-10 text-sm text-slate-500 font-medium">
                * All add-ons can be purchased from your profile dashboard after joining.
              </p>
            </div>
          </div>

          <div className="mt-24 max-w-4xl mx-auto text-center space-y-8 bg-white/40 backdrop-blur-sm rounded-[40px] p-12 border border-white/50">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <div className="grid gap-8 md:grid-cols-2 text-left">
              <div className="space-y-2">
                <h4 className="font-bold">Can I change plans anytime?</h4>
                <p className="text-sm text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time from your account settings.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold">Is there a free trial?</h4>
                <p className="text-sm text-muted-foreground">We offer a Free plan for Talents to get started. Paid plans offer more applications and premium visibility.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold">How do I cancel my subscription?</h4>
                <p className="text-sm text-muted-foreground">You can cancel your subscription anytime from the billing section of your dashboard.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold">Are there any hidden fees?</h4>
                <p className="text-sm text-muted-foreground">No, the price you see is what you pay. Custom enterprise plans may have separate agreements.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
