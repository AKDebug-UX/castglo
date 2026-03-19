import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Loader2, Sparkles, Zap, Shield, Rocket } from "lucide-react";
import { subscriptionAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Pricing() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await subscriptionAPI.getPlans();
        if (response.data.success) {
          setPlans(response.data.data.plans || []);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Failed to load subscription plans");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (planKey: string) => {
    if (!user) {
      toast.error("Please sign in to subscribe to a plan");
      window.location.href = "/sign-in";
      return;
    }

    setIsProcessing(planKey);
    try {
      const response = await subscriptionAPI.createCheckoutSession({
        planName: planKey,
        billingCycle: billingCycle
      });

      if (response.data.success && response.data.data.url) {
        window.location.href = response.data.data.url;
      } else {
        toast.error("Could not initiate checkout. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An unexpected error occurred");
    } finally {
      setIsProcessing(null);
    }
  };

  const categories = [
    { id: "talent", label: "For Talent", icon: Sparkles },
    { id: "casting_director", label: "For Casting Directors", icon: Zap },
    { id: "agency", label: "For Agencies", icon: Shield },
    { id: "enterprise", label: "Enterprise", icon: Rocket }
  ];

  const getIcon = (planName: string) => {
    if (planName.toLowerCase().includes("basic")) return <Zap className="w-5 h-5 text-blue-500" />;
    if (planName.toLowerCase().includes("standard")) return <Sparkles className="w-5 h-5 text-purple-500" />;
    if (planName.toLowerCase().includes("professional")) return <Rocket className="w-5 h-5 text-orange-500" />;
    return <Zap className="w-5 h-5 text-slate-500" />;
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

          <Tabs defaultValue="talent" className="max-w-6xl mx-auto">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto p-1 bg-white/50 backdrop-blur shadow-sm rounded-xl mb-12">
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
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-center">
                  {plans
                    .filter((p) => p.category === cat.id)
                    .map((plan) => (
                      <Card key={plan.planKey} className={`relative flex flex-col border-none shadow-xl rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${plan.name === 'Standard' ? 'ring-2 ring-primary ring-offset-4 ring-offset-[#DEFCFE]' : ''}`}>
                        {plan.name === 'Standard' && (
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
                              {plan.pricing[billingCycle] === 0 ? "Free" : `£${plan.pricing[billingCycle]}`}
                            </span>
                            {plan.pricing[billingCycle] !== 0 && (
                              <span className="text-muted-foreground font-medium">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6">
                          <div className="space-y-3">
                            {Object.entries(plan.features || {}).map(([key, value]: [string, any], idx) => (
                              <div key={idx} className="flex items-start gap-3 text-sm">
                                <div className="mt-1 bg-green-100 rounded-full p-0.5">
                                  <Check className="w-3 h-3 text-green-600" />
                                </div>
                                <span className="text-slate-600 leading-tight">
                                  {typeof value === 'boolean' ? key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) : `${value} ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-8">
                          <Button 
                            className={`w-full h-12 rounded-2xl font-bold text-lg transition-all ${plan.name === 'Standard' ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20' : 'bg-slate-900 hover:bg-slate-800'}`}
                            onClick={() => handleSubscribe(plan.planKey)}
                            disabled={isProcessing === plan.planKey}
                          >
                            {isProcessing === plan.planKey ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : plan.pricing[billingCycle] === 0 ? (
                              "Get Started"
                            ) : (
                              "Subscribe Now"
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

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
