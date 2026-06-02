import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { subscriptionAPI } from "@/lib/api";
import { toast } from "sonner";
import { SUBSCRIPTION_PLANS } from "@/config/subscriptionPlans";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, formatPrice } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const checkoutPlans = useMemo(() => {
    const keys = new Set([
      "talent_basic",
      "talent_pro",
      "director_basic",
      "director_pro",
      "professional_basic",
      "professional_pro",
      "director_agency",
      "director_enterprise",
    ]);
    return SUBSCRIPTION_PLANS.filter((p) => keys.has(p.planKey));
  }, []);

  const [selectedPlanKey, setSelectedPlanKey] = useState<string>(checkoutPlans[0]?.planKey || "talent_basic");
  const selectedPlan = useMemo(
    () => checkoutPlans.find((p) => p.planKey === selectedPlanKey),
    [checkoutPlans, selectedPlanKey]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedPlan) {
      toast.error("Please select a plan.");
      return;
    }

    if (selectedPlan.pricing[billingCycle] === -1) {
      window.location.href = "mailto:sales@castglo.com";
      return;
    }

    if (!user) {
      navigate(`/join/${selectedPlan.category}?plan=${selectedPlan.planKey}&cycle=${billingCycle}`);
      return;
    }

    try {
      setIsProcessing(true);
      const response = await subscriptionAPI.createCheckoutSession({
        planName: selectedPlan.planKey,
        billingCycle,
      });

      if (response.data.success && response.data.data.url) {
        window.location.href = response.data.data.url; // Redirect to Stripe
      } else {
        toast.error('Could not initiate checkout. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <p className="text-sm font-semibold">Plan</p>
                <Select value={selectedPlanKey} onValueChange={setSelectedPlanKey}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {checkoutPlans.map((plan) => (
                      <SelectItem key={plan.planKey} value={plan.planKey}>
                        {plan.category.replace("_", " ")} — {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-semibold">Billing Cycle</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={billingCycle === "monthly" ? "default" : "outline"}
                    onClick={() => setBillingCycle("monthly")}
                    className="w-full"
                  >
                    Monthly
                  </Button>
                  <Button
                    type="button"
                    variant={billingCycle === "yearly" ? "default" : "outline"}
                    onClick={() => setBillingCycle("yearly")}
                    className="w-full"
                  >
                    Yearly
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border p-4 bg-white">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-lg font-bold">
                  {!selectedPlan
                    ? "—"
                    : selectedPlan.pricing[billingCycle] === -1
                      ? "Custom"
                      : selectedPlan.pricing[billingCycle] === 0
                        ? "Free"
                        : `${formatPrice(selectedPlan.pricing[billingCycle])}/${billingCycle === "monthly" ? "mo" : "yr"}`}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Button type="submit" disabled={isProcessing} className="w-full bg-[#009698] hover:bg-[#009698]/90">
                {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selectedPlan?.pricing[billingCycle] === -1
                  ? "Contact Sales"
                  : isProcessing
                    ? "Redirecting to checkout..."
                    : user
                      ? "Continue to Checkout"
                      : "Continue to Sign Up"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
