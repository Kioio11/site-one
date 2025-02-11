import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Service } from "@shared/schema";
import { 
  SiSolidity, 
  SiOpenai, 
  SiPython, 
  SiFigma, 
  SiGoogleanalytics,
  SiBlockchaindotcom,
  SiRobotframework,
  SiGithubactions
} from "react-icons/si";
import { 
  Shield, 
  Zap, 
  Megaphone,
  Brain,
  Cpu,
  Bot,
  Code2,
  BarChart3,
  Wallet,
  CircuitBoard
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

interface ServiceCardProps {
  service: Service;
  showAddToCart?: boolean;
}

const iconMap = {
  // Blockchain Services
  "smart-contract": SiSolidity,
  "token": Wallet,
  "dex": BarChart3,
  blockchain: SiBlockchaindotcom,

  // AI Services
  "ai-model": Brain,
  "ai-integration": CircuitBoard,
  "nlp": SiPython,
  ai: SiOpenai,

  // Development Services
  development: Code2,
  "web3": Cpu,

  // Autonomous Services
  "trading-bot": Bot,
  "automation": SiGithubactions,
  "data-collection": SiGoogleanalytics,
  autonomous: SiRobotframework,

  // Other Services
  design: SiFigma,
  documentation: Shield,
  marketing: Megaphone,
  security: Shield,
};

const iconColors = {
  // Blockchain
  "smart-contract": "text-yellow-500",
  "token": "text-green-500",
  "dex": "text-blue-500",
  blockchain: "text-blue-500",

  // AI
  "ai-model": "text-purple-500",
  "ai-integration": "text-indigo-500",
  "nlp": "text-pink-500",
  ai: "text-violet-500",

  // Development
  development: "text-cyan-500",
  "web3": "text-teal-500",

  // Autonomous
  "trading-bot": "text-orange-500",
  "automation": "text-red-500",
  "data-collection": "text-emerald-500",
  autonomous: "text-amber-500",

  // Other
  design: "text-pink-500",
  documentation: "text-slate-500",
  marketing: "text-green-500",
  security: "text-red-500",
};

const typeColors = {
  blockchain: {
    bg: "bg-blue-500/10",
    text: "text-blue-700",
    border: "border-blue-500/20",
  },
  ai: {
    bg: "bg-purple-500/10",
    text: "text-purple-700",
    border: "border-purple-500/20",
  },
  autonomous: {
    bg: "bg-green-500/10",
    text: "text-green-700",
    border: "border-green-500/20",
  },
  development: {
    bg: "bg-orange-500/10",
    text: "text-orange-700",
    border: "border-orange-500/20",
  }
};

const getIconKey = (service: Service) => {
  const name = service.name.toLowerCase();
  if (name.includes('smart contract')) return 'smart-contract';
  if (name.includes('token')) return 'token';
  if (name.includes('dex')) return 'dex';
  if (name.includes('ai model')) return 'ai-model';
  if (name.includes('ai integration')) return 'ai-integration';
  if (name.includes('nlp')) return 'nlp';
  if (name.includes('trading bot')) return 'trading-bot';
  if (name.includes('automation')) return 'automation';
  if (name.includes('data collection')) return 'data-collection';
  if (name.includes('web3')) return 'web3';
  return service.type;
};

export default function ServiceCard({ service, showAddToCart }: ServiceCardProps) {
  const iconKey = getIconKey(service);
  const Icon = iconMap[iconKey as keyof typeof iconMap] || Code2;
  const iconColor = iconColors[iconKey as keyof typeof iconColors] || "text-primary";

  const { addItem, state: { items } } = useCart();
  const { toast } = useToast();

  const isInCart = items.some(item => item.id === service.id);

  const typeStyle = typeColors[service.type as keyof typeof typeColors] || {
    bg: "bg-gray-500/10",
    text: "text-gray-700",
    border: "border-gray-500/20",
  };

  const handleAddToCart = () => {
    addItem(service);
    toast({
      title: "Added to cart",
      description: `${service.name} has been added to your cart.`,
      duration: 3000, // Auto-dismiss after 3 seconds
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col relative overflow-hidden backdrop-blur-sm bg-card/95 border-muted/20 shadow-xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

        <CardHeader className="relative">
          <div className="mb-4 md:mb-6 flex items-center justify-between">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Icon className={`w-8 h-8 md:w-10 md:h-10 ${iconColor}`} />
            </motion.div>
            <div className="h-8 w-px bg-border/50" />
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`px-3 py-1.5 rounded-full border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border} text-sm font-medium shadow-sm`}
            >
              {service.type.charAt(0).toUpperCase() + service.type.slice(1)}
            </motion.div>
          </div>
          <CardTitle className="text-lg md:text-xl font-bold tracking-tight">{service.name}</CardTitle>
          <CardDescription className="mt-2 text-sm md:text-base text-muted-foreground/90">
            {service.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow relative">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <p className="text-2xl md:text-3xl font-bold text-primary">
              ${(service.basePrice / 100).toLocaleString()}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Starting price</p>
          </motion.div>
        </CardContent>

        {showAddToCart && (
          <CardFooter className="relative">
            <Button 
              variant={isInCart ? "secondary" : "default"} 
              className={`w-full text-sm md:text-base py-2 md:py-3 ${!isInCart ? 'bg-primary/90 hover:bg-primary' : ''} transition-all duration-300`}
              onClick={handleAddToCart}
              disabled={isInCart}
            >
              {isInCart ? "In Cart" : "Add to Cart"}
            </Button>
          </CardFooter>
        )}

        {/* Tech pattern overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-10" />
      </Card>
    </motion.div>
  );
}