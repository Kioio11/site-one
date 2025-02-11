import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bitcoin, Wallet, AlertCircle, Shield } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useLocation } from "wouter";
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise, createPaymentIntent } from "@/lib/stripe";
import CryptoPaymentForm from "./crypto-payment-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentFormProps {
  amount: number;
}

function StripePaymentForm({ amount }: { amount: number }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { items, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const stripe = useStripe();
  const elements = useElements();

  const handleTraditionalPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      toast({
        description: "Payment provider not initialized",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (items.length === 0) {
      toast({
        description: "Your cart is empty",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { clientSecret, orderId } = await createPaymentIntent(amount, items);

      if (!clientSecret || !orderId) {
        throw new Error('Failed to create payment intent');
      }

      const cardNumber = elements.getElement(CardNumberElement);
      if (!cardNumber) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumber,
        }
      });

      if (error) {
        throw error;
      }

      if (paymentIntent.status === 'succeeded') {
        clearCart();
        toast({
          title: "Success",
          description: "Payment successful!",
          duration: 3000,
          variant: "default",
        });
        setLocation(`/requirements/${orderId}`);
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Payment failed. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1a1a1a',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#666666',
        },
        iconColor: '#635bff',
        ':-webkit-autofill': {
          color: '#1a1a1a',
        },
      },
      invalid: {
        color: 'var(--destructive)',
        iconColor: 'var(--destructive)',
      },
    },
  };

  const inputClassName = "min-h-[48px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Traditional Payment
          </h3>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground hidden sm:inline">Secured by</span>
            <img src="/stripe.svg" alt="Stripe" className="h-8 dark:invert" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b">
          <div>
            <p className="text-sm text-muted-foreground">Amount to Pay</p>
            <p className="text-2xl font-bold text-foreground">${(amount / 100).toFixed(2)} USD</p>
          </div>
        </div>

        <form onSubmit={handleTraditionalPayment} className="space-y-6">
          <div className="space-y-4">
            <div className="rounded-xl border bg-white/50 backdrop-blur-sm p-4 md:p-6 shadow-sm">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Card Information</label>
                  <div className="space-y-4">
                    <div className="relative">
                      <CardNumberElement
                        options={cardElementStyle}
                        className={inputClassName}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <CardExpiryElement
                          options={cardElementStyle}
                          className={inputClassName}
                        />
                      </div>
                      <div className="relative">
                        <CardCvcElement
                          options={cardElementStyle}
                          className={inputClassName}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Your payment information is encrypted and secure</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isProcessing || !stripe}
              className="w-full h-12 bg-[#635bff] hover:bg-[#635bff]/90 text-white font-medium relative overflow-hidden group transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 group-hover:translate-x-full transition-transform duration-1000" />
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay ${(amount / 100).toFixed(2)}
                  <Shield className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TraditionalPaymentTab({ amount }: { amount: number }) {
  if (!stripePromise) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Traditional payments are currently unavailable. Please use cryptocurrency payment options or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm amount={amount} />
    </Elements>
  );
}

export default function PaymentForm({ amount }: PaymentFormProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="traditional" className="w-full">
        <TabsList className="grid w-full grid-cols-2 p-1">
          <TabsTrigger value="traditional" className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-blue-600/20">
            <Wallet className="h-4 w-4 text-blue-500" />
            <span className="hidden sm:inline">Traditional Payment</span>
            <span className="sm:hidden">Card</span>
          </TabsTrigger>
          <TabsTrigger value="crypto" className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500/20 data-[state=active]:to-yellow-600/20">
            <Bitcoin className="h-4 w-4 text-yellow-500" />
            <span className="hidden sm:inline">Crypto Payment</span>
            <span className="sm:hidden">Crypto</span>
          </TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="traditional">
            <TraditionalPaymentTab amount={amount} />
          </TabsContent>
          <TabsContent value="crypto">
            <CryptoPaymentForm amount={amount} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}