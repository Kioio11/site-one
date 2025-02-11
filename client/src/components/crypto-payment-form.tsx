import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Check, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useLocation } from "wouter";
import {
  SUPPORTED_PAYMENTS,
  type CryptoPaymentMethod,
  generatePaymentLink
} from "@/lib/crypto-payments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Steps } from "@/components/ui/steps";

interface CryptoPaymentFormProps {
  amount: number;
}

export default function CryptoPaymentForm({ amount }: CryptoPaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<CryptoPaymentMethod>(SUPPORTED_PAYMENTS[0]);
  const [transactionHash, setTransactionHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const { clearCart } = useCart();
  const [, setLocation] = useLocation();

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(selectedMethod.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      description: "Wallet address copied to clipboard",
      duration: 2000,
    });
  };

  const steps = [
    {
      title: "Select Cryptocurrency",
      description: "Choose your preferred payment method"
    },
    {
      title: "Send Payment",
      description: "Transfer the exact amount to the provided address"
    },
    {
      title: "Confirm Transaction",
      description: "Submit your transaction hash for verification"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionHash) {
      toast({
        description: "Please enter your transaction hash",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionHash,
          method: selectedMethod.symbol,
          amount: amount / 100, // Convert cents to dollars
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify payment");
      }

      clearCart();
      toast({
        description: "Payment submitted successfully! We'll verify the transaction shortly.",
      });
      setLocation("/requirements");
    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : "Payment verification failed",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Steps steps={steps} currentStep={currentStep} />

      <div className="space-y-6">
        {currentStep === 1 && (
          <div className="grid gap-4">
            {SUPPORTED_PAYMENTS.map((method) => (
              <Card
                key={method.symbol}
                className={`cursor-pointer transition-all hover:border-primary ${
                  selectedMethod.symbol === method.symbol ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => {
                  setSelectedMethod(method);
                  setCurrentStep(2);
                }}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  {/* Assuming method.icon is a valid React component */}
                  {method.icon && <method.icon className="h-8 w-8 text-muted-foreground" />}
                  <div className="flex-1">
                    <CardTitle>{method.name}</CardTitle>
                    <CardDescription>Network: {method.network}</CardDescription>
                  </div>
                  <Badge variant="outline">
                    {method.symbol.toUpperCase()}
                  </Badge>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Send Payment</CardTitle>
              <CardDescription>
                Send exactly ${(amount / 100).toFixed(2)} worth of {selectedMethod.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <h4 className="font-medium mb-2">Wallet Address</h4>
                  <div className="flex gap-2">
                    <Input
                      value={selectedMethod.address}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyAddress}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <QRCodeSVG
                    value={generatePaymentLink(selectedMethod, (amount / 100).toFixed(2))}
                    size={120}
                    className="bg-white p-2 rounded"
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => setCurrentStep(3)}
              >
                I've Sent the Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Transaction</CardTitle>
              <CardDescription>
                Enter the transaction hash from your {selectedMethod.name} wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                    placeholder="Enter your transaction hash"
                    className="font-mono"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || !transactionHash}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying Payment...
                    </>
                  ) : (
                    "Submit Transaction"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {currentStep > 1 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          >
            Back
          </Button>
        )}
      </div>
    </div>
  );
}