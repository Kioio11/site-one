import { useQuery } from "@tanstack/react-query";
import { Service } from "@shared/schema";
import PricingCalculator from "@/components/pricing-calculator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import OrderRequirementsForm from "@/components/order-requirements-form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Steps } from "@/components/ui/steps";

export type ConfiguratorOption = Service & {
  icon: React.ElementType;
};

const defaultServices: Service[] = [
  {
    id: 1,
    name: "AI Service",
    description: "Advanced AI solutions for your business",
    basePrice: 299900,
    type: "ai",
    features: null,
  }
];

export default function PricingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [additionalServices, setAdditionalServices] = useState<Service[]>([]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { addItem, clearCart } = useCart();

  const { data: services = defaultServices } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const handleServiceSelect = (mainService: Service, additionalServices: Service[]) => {
    setSelectedService(mainService);
    setAdditionalServices(additionalServices);
    setCurrentStep(2);
  };

  const handleRequirementsSubmit = (formData: any) => {
    if (!selectedService) return;

    clearCart();
    addItem(selectedService);
    additionalServices.forEach(service => addItem(service));

    sessionStorage.setItem('projectRequirements', JSON.stringify(formData));
    setLocation("/checkout");
  };

  const steps = [
    { title: "Select Services", description: "Choose your primary and additional services" },
    { title: "Project Requirements", description: "Provide project details and requirements" },
    { title: "Review & Checkout", description: "Review your selections and complete order" }
  ];

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Configure Your Project</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Complete the following steps to configure your project.
          </p>

          <Steps 
            steps={steps} 
            currentStep={currentStep} 
            className="mb-8"
          />
        </div>

        {currentStep === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>Select Your Services</CardTitle>
              <CardDescription>
                Choose your primary service and any complementary services you need
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PricingCalculator 
                services={services} 
                onServiceSelect={handleServiceSelect}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Project Requirements</CardTitle>
              <CardDescription>
                Provide details about your project requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedService && (
                <OrderRequirementsForm
                  mainService={selectedService}
                  addons={additionalServices}
                  onSubmit={handleRequirementsSubmit}
                  onBack={() => setCurrentStep(1)}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}