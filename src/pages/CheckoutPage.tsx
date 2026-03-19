import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { subscriptionAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('premium'); // Default to premium

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      const response = await subscriptionAPI.createCheckoutSession({ 
        planName: selectedPlan,
        billingCycle: 'monthly' // Or dynamically set this
      });

      if (response.data.success && response.data.data.url) {
        window.location.href = response.data.data.url; // Redirect to Stripe
      } else {
        toast.error('Could not initiate checkout. Please try again.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'An unexpected error occurred.');
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className={`p-4 border rounded-lg text-center cursor-pointer ${selectedPlan === 'freemium' ? 'border-primary bg-primary/10' : ''}`}
                onClick={() => setSelectedPlan('freemium')}
              >
                <h3 className="font-bold">Freemium</h3>
                <p className="text-sm text-muted-foreground">Free</p>
              </div>
              <div 
                className={`p-4 border rounded-lg text-center cursor-pointer ${selectedPlan === 'premium' ? 'border-primary bg-primary/10' : ''}`}
                onClick={() => setSelectedPlan('premium')}
              >
                <h3 className="font-bold">Premium</h3>
                <p className="text-sm text-muted-foreground">$15/mo</p>
              </div>
              <div 
                className={`p-4 border rounded-lg text-center cursor-pointer ${selectedPlan === 'professional' ? 'border-primary bg-primary/10' : ''}`}
                onClick={() => setSelectedPlan('professional')}
              >
                <h3 className="font-bold">Professional</h3>
                <p className="text-sm text-muted-foreground">$30/mo</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Button type="submit" disabled={isProcessing} className="w-full bg-[#009698] hover:bg-[#009698]/90">
                {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isProcessing ? 'Redirecting to checkout...' : `Subscribe to ${selectedPlan}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
