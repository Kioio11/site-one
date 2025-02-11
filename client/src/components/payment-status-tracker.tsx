import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Clock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface PaymentStatusTrackerProps {
  orderId: string;
  onPaymentComplete?: () => void;
}

const statusConfig = {
  pending: {
    color: "bg-yellow-500",
    icon: Clock,
    progress: 33,
    message: "Waiting for cryptocurrency payment...",
  },
  processing: {
    color: "bg-blue-500",
    icon: ArrowRight,
    progress: 66,
    message: "Payment detected! Waiting for blockchain confirmation...",
  },
  completed: {
    color: "bg-green-500",
    icon: CheckCircle2,
    progress: 100,
    message: "Payment confirmed successfully!",
  },
  failed: {
    color: "bg-red-500",
    icon: AlertCircle,
    progress: 100,
    message: "Payment failed or was cancelled. Please try again.",
  },
} as const;

type PaymentStatus = keyof typeof statusConfig;

export default function PaymentStatusTracker({ orderId, onPaymentComplete }: PaymentStatusTrackerProps) {
  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const config = statusConfig[status];

  useEffect(() => {
    if (!orderId) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payments/${orderId}/status`);
        if (!res.ok) {
          throw new Error("Failed to fetch payment status");
        }
        const data = await res.json();
        setStatus(data.status as PaymentStatus);

        if (data.status === "completed") {
          onPaymentComplete?.();
          toast({
            description: "Payment completed successfully! Please fill out your project requirements.",
            duration: 5000,
          });
          // Redirect to requirements page after successful payment
          setLocation(`/requirements/${orderId}`);
        } else if (data.status === "failed") {
          setError("Payment failed or was cancelled. Please try again.");
          toast({
            description: "Payment failed. Please try again.",
            variant: "destructive",
            duration: 5000,
          });
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
        setError(err instanceof Error ? err.message : "Failed to check payment status");
      }
    };

    // Check immediately and then every 5 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, [orderId, onPaymentComplete, toast, setLocation]);

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Payment Status</h3>
        <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-4"
          >
            <div className={cn("p-2 rounded-full", config.color)}>
              <config.icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{config.message}</p>
              {status === "processing" && (
                <p className="text-sm text-muted-foreground mt-1">
                  This may take up to 2 hours depending on the blockchain network.
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <Progress value={config.progress} className="h-2" />

        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </div>
    </Card>
  );
}