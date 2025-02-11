import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Service } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import {
  Code2,
  Brain,
  Bot,
  Palette,
  Shield,
  BarChart,
  Rocket,
  Settings,
  Zap,
  PenTool,
  Layout,
  ImageIcon,
  PaintBucket,
  Share2,
  LineChart,
  Target,
  Bell
} from "lucide-react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Steps } from "@/components/ui/steps";

type Category = typeof categories[number];
type ServiceType =
  | "blockchain"
  | "blockchain_addon"
  | "ai"
  | "ai_addon"
  | "design"
  | "design_addon"
  | "autonomous"
  | "autonomous_addon";

const categories = [
  {
    id: 'blockchain' as const,
    name: 'Blockchain Development',
    icon: Code2,
    description: 'Smart contracts, DApps, and blockchain integration services',
    type: 'blockchain' as ServiceType
  },
  {
    id: 'ai' as const,
    name: 'AI Solutions',
    icon: Brain,
    description: 'Custom AI models, machine learning, and intelligent systems',
    type: 'ai' as ServiceType
  },
  {
    id: 'design' as const,
    name: 'Design & Branding',
    icon: Palette,
    description: 'Professional design and branding services',
    type: 'design' as ServiceType
  },
  {
    id: 'autonomous' as const,
    name: 'Autonomous Agents',
    icon: Bot,
    description: 'Self-operating AI agents and automated systems',
    type: 'autonomous' as ServiceType
  }
] as const;

const steps = [
  { title: "Choose Solution Type", description: "Select your primary solution category" },
  { title: "Select Core Service", description: "Choose your main service package" },
  { title: "Add Extensions", description: "Customize with additional features" }
];

export default function ConfiguratorPage() {
  const [currentStep, setCurrentStep] = useState<'solution' | 'core' | 'extensions'>('solution');
  const [selectedCategory, setSelectedCategory] = useState<ServiceType | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedEnhancements, setSelectedEnhancements] = useState<Service[]>([]);
  const { addItem, clearCart } = useCart();
  const [, setLocation] = useLocation();

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const getServiceEnhancements = (mainService: Service) => {
    const baseType = mainService.type.split('_')[0] as ServiceType;
    const addonType = `${baseType}_addon`;

    console.log('Finding enhancements for:', {
      baseType,
      addonType,
      mainService,
      availableServices: services.map(s => ({ id: s.id, name: s.name, type: s.type }))
    });

    const enhancements = services.filter(service =>
      service.type === addonType
    );

    console.log('Available enhancements:', enhancements);
    return enhancements;
  };

  const handleCategorySelect = (categoryId: string) => {
    console.log('Selected solution type:', categoryId);
    setSelectedCategory(categoryId as ServiceType);
    setCurrentStep('core');
    setSelectedService(null);
    setSelectedEnhancements([]);
    clearCart();
  };

  const handleServiceSelect = (service: Service) => {
    console.log('Selected core service:', service);
    setSelectedService(service);
    setCurrentStep('extensions');
    setSelectedEnhancements([]);
    clearCart();
    addItem(service);
  };

  const handleEnhancementToggle = (enhancement: Service) => {
    console.log('Toggling enhancement:', enhancement);
    setSelectedEnhancements(prev => {
      const exists = prev.find(e => e.id === enhancement.id);
      if (exists) {
        const updated = prev.filter(e => e.id !== enhancement.id);
        console.log('Removing enhancement:', enhancement.name);
        return updated;
      }
      console.log('Adding enhancement:', enhancement.name);
      addItem(enhancement);
      return [...prev, enhancement];
    });
  };

  const handleComplete = () => {
    setLocation('/checkout');
  };

  const getCurrentOptions = () => {
    console.log('Getting options for step:', currentStep, {
      selectedCategory,
      selectedService,
      selectedEnhancements
    });

    switch (currentStep) {
      case 'solution':
        return categories;
      case 'core':
        if (!selectedCategory) return [];
        const mainServices = services.filter(service =>
          service.type === selectedCategory && !service.type.includes('_addon')
        );
        console.log('Available core services:', mainServices);
        return mainServices;
      case 'extensions':
        if (!selectedService) return [];
        const extensions = getServiceEnhancements(selectedService);
        console.log('Available extensions:', extensions);
        return extensions;
      default:
        return [];
    }
  };

  const calculateTotal = () => {
    const servicePrice = selectedService?.basePrice || 0;
    const enhancementsPrice = selectedEnhancements.reduce((sum, enhancement) => sum + enhancement.basePrice, 0);
    return servicePrice + enhancementsPrice;
  };

  const options = getCurrentOptions();
  const currentStepIndex = ['solution', 'core', 'extensions'].indexOf(currentStep);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Bundle Your Enterprise Solution</h1>
        <p className="text-lg text-muted-foreground">
          Configure your enterprise technology solution in three simple steps
        </p>
      </div>

      <Steps
        steps={steps}
        currentStep={currentStepIndex + 1}
        className="mb-12"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {options.map((option) => {
          const isSelected =
            (currentStep === 'solution' && selectedCategory === option.id) ||
            (currentStep === 'core' && selectedService?.id === ('id' in option ? option.id : null)) ||
            (currentStep === 'extensions' && selectedEnhancements.some(e => e.id === ('id' in option ? option.id : null)));

          const Icon = 'icon' in option
            ? option.icon
            : Code2;

          return (
            <Card
              key={String('id' in option ? option.id : option.type)}
              className={cn(
                "cursor-pointer transition-all hover:border-primary",
                isSelected ? "border-primary bg-primary/5" : ""
              )}
              onClick={() => {
                if (currentStep === 'solution') {
                  handleCategorySelect(option.id as string);
                } else if (currentStep === 'core' && 'basePrice' in option) {
                  handleServiceSelect(option as Service);
                } else if (currentStep === 'extensions' && 'basePrice' in option) {
                  handleEnhancementToggle(option as Service);
                }
              }}
            >
              <CardHeader>
                <Icon className="h-8 w-8 text-primary mb-4" />
                <CardTitle>{option.name}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
                {'basePrice' in option && (
                  <div className="mt-2 text-right">
                    <span className="text-lg font-bold">
                      ${(option.basePrice / 100).toFixed(2)}
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {'features' in option && option.features && (
                  <div className="text-sm text-muted-foreground">
                    {option.features.split(',').map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{feature.trim()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {currentStep !== 'solution' && (
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            Total: ${(calculateTotal() / 100).toFixed(2)}
          </div>
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep === 'core') {
                  setCurrentStep('solution');
                  setSelectedService(null);
                } else if (currentStep === 'extensions') {
                  setCurrentStep('core');
                  setSelectedEnhancements([]);
                }
              }}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (currentStep === 'extensions' || (currentStep === 'core' && selectedService)) {
                  handleComplete();
                }
              }}
              disabled={!selectedService}
            >
              {currentStep === 'extensions' ? 'Continue to Checkout' : 'Continue'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}