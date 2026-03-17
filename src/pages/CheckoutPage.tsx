import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { toast } from 'sonner';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};

export default function CheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('premium'); // Default to premium
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast.error(error.message);
        setIsProcessing(false);
        return;
      }

      // Placeholder for backend API call to create subscription
      console.log('PaymentMethod created:', paymentMethod);
      console.log('Selected plan:', selectedPlan);
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Subscription created successfully!');
      setIsProcessing(false);
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
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
                className={`p-4 border rounded-lg text-center cursor-pointer ${selectedPlan === 'freemium' ? 'border-primary' : ''}`}
                onClick={() => setSelectedPlan('freemium')}
              >
                <h3 className="font-bold">Freemium</h3>
                <p className="text-sm text-muted-foreground">Free</p>
              </div>
              <div 
                className={`p-4 border rounded-lg text-center cursor-pointer ${selectedPlan === 'premium' ? 'border-primary' : ''}`}
                onClick={() => setSelectedPlan('premium')}
              >
                <h3 className="font-bold">Premium</h3>
                <p className="text-sm text-muted-foreground">$15/mo</p>
              </div>
              <div 
                className={`p-4 border rounded-lg text-center cursor-pointer ${selectedPlan === 'professional' ? 'border-primary' : ''}`}
                onClick={() => setSelectedPlan('professional')}
              >
                <h3 className="font-bold">Professional</h3>
                <p className="text-sm text-muted-foreground">$30/mo</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
                <Button type="submit" disabled={!stripe || isProcessing} className="w-full bg-[#009698] hover:bg-[#009698]/90">
                  {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isProcessing ? 'Processing...' : `Subscribe to ${selectedPlan}`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
