import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export default function ShoppingCartComponent() {
  const { state: { items }, removeItem } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const total = items.reduce((sum, item) => sum + item.basePrice, 0);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some services to your cart before checking out",
        variant: "destructive",
      });
      return;
    }
    setIsOpen(false); // Close the sheet
    setLocation("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] font-bold flex items-center justify-center bg-primary text-primary-foreground rounded-full">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Your cart is empty</p>
            <p className="text-sm text-center max-w-[250px] mb-6">
              Add some services to start building your project
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsOpen(false);
                setLocation("/configurator");
              }}
            >
              Browse Services
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-10rem)]">
            <ScrollArea className="flex-1 -mx-6 px-6">
              <AnimatePresence initial={false}>
                <div className="space-y-4 mt-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="group relative flex items-center gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="h-16 w-16 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        {item.type === "blockchain" && "🔗"}
                        {item.type === "ai" && "🤖"}
                        {item.type === "autonomous" && "⚙️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base truncate pr-8">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="font-semibold">
                          ${(item.basePrice / 100).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </ScrollArea>

            <div className="pt-4">
              <Separator className="mb-4" />
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-lg">${(total / 100).toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full font-medium h-12" 
                  onClick={handleCheckout}
                  type="button"
                >
                  Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}