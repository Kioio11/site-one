import { useState } from "react";
import { Service } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";

interface PricingCalculatorProps {
  services: Service[];
  onServiceSelect?: (service: Service, additionalServices: Service[]) => void;
}

type ServiceType = "blockchain" | "ai" | "design" | "marketing";

const complementaryTypes: Record<ServiceType, ServiceType[]> = {
  blockchain: ["design", "marketing"],
  ai: ["design", "marketing"],
  design: ["marketing"],
  marketing: ["design"]
};

export default function PricingCalculator({ services, onServiceSelect }: PricingCalculatorProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [additionalServices, setAdditionalServices] = useState<Service[]>([]);
  const { addItem, clearCart } = useCart();

  const getComplementaryServices = (mainService: Service) => {
    const relevantTypes = complementaryTypes[mainService.type as ServiceType] || [];
    return services.filter(s => 
      s.id !== mainService.id && 
      relevantTypes.includes(s.type as ServiceType)
    );
  };

  const handleMainServiceSelect = (serviceId: string) => {
    console.log('Selected service ID:', serviceId);
    const service = services.find(s => s.id === parseInt(serviceId));
    if (service) {
      setSelectedService(service);
      setAdditionalServices([]); // Reset additional services when main service changes
      clearCart(); // Clear cart when changing main service
      addItem(service); // Add the main service to cart
      console.log('Added main service to cart:', service);
    }
  };

  const toggleAdditionalService = (service: Service) => {
    setAdditionalServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      }
      addItem(service); // Add to cart when selected
      console.log('Added additional service to cart:', service);
      return [...prev, service];
    });
  };

  const handleSubmit = () => {
    if (!selectedService) {
      toast({
        description: "Please select a primary service",
        variant: "destructive"
      });
      return;
    }

    console.log('Submitting with services:', {
      main: selectedService,
      additional: additionalServices
    });

    if (onServiceSelect) {
      onServiceSelect(selectedService, additionalServices);
    } else {
      setLocation("/checkout");
    }
  };

  const complementaryServices = selectedService 
    ? getComplementaryServices(selectedService)
    : [];

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base">Choose Your Primary Service</Label>
        <RadioGroup
          onValueChange={handleMainServiceSelect}
          className="mt-4 space-y-4"
        >
          {services.map((service) => (
            <div key={service.id} className="flex items-center space-x-2 p-4 rounded-lg border">
              <RadioGroupItem value={service.id.toString()} id={`service-${service.id}`} />
              <div className="flex-grow">
                <Label htmlFor={`service-${service.id}`} className="text-lg font-medium">
                  {service.name}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${(service.basePrice / 100).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Starting price</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      {selectedService && complementaryServices.length > 0 && (
        <>
          <Separator />
          <div>
            <Label className="text-base">Recommended Additional Services</Label>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Enhance your project with these complementary services
            </p>
            <div className="space-y-4">
              {complementaryServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center space-x-2 p-4 rounded-lg border"
                >
                  <Checkbox
                    id={`additional-${service.id}`}
                    checked={additionalServices.some(s => s.id === service.id)}
                    onCheckedChange={() => toggleAdditionalService(service)}
                  />
                  <div className="flex-grow">
                    <Label htmlFor={`additional-${service.id}`} className="text-lg font-medium">
                      {service.name}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${(service.basePrice / 100).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Add-on price</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="pt-4 border-t">
        <Button
          onClick={handleSubmit}
          disabled={!selectedService}
          className="w-full"
        >
          Continue to Requirements
        </Button>
      </div>
    </div>
  );
}