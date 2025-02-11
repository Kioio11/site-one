import { useCart } from "@/hooks/use-cart";
import PaymentForm from "@/components/payment-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function CheckoutPage() {
  const { calculateTotal, items, removeItem } = useCart();
  const [, setLocation] = useLocation();

  console.log('Checkout Page - Cart Items:', items);

  // If cart is empty or items is undefined, show empty state and redirect option
  if (!items || items.length === 0) {
    console.log('Checkout Page - Cart is empty');
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="flex justify-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground">Add some services to get started with your project.</p>
          </div>
          <Button onClick={() => setLocation("/configurator")} size="lg" className="px-8">
            Browse Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 max-w-4xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation("/pricing")}
            className="hover:bg-background/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground mt-1">Review your order and complete payment</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card rounded-lg shadow-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Details
                </h2>
                <span className="text-sm text-muted-foreground">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <ScrollArea className="h-[400px] pr-4 -mr-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative bg-background rounded-lg p-4 transition-colors border shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <h3 className="font-medium leading-none">{item.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold whitespace-nowrap">
                            ${(item.basePrice / 100).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Payment Section */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* Order Summary */}
              <div className="bg-card rounded-lg shadow-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <Separator className="mb-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${(calculateTotal() / 100).toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-xl">
                      ${(calculateTotal() / 100).toFixed(2)} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="bg-card rounded-lg shadow-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <Separator className="mb-4" />
                <PaymentForm amount={calculateTotal()} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}