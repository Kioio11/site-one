import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Service } from "@shared/schema";
import ServiceCard from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coins, Shield, Bot, Brain } from "lucide-react";
import { SiDiscord, SiX, SiTelegram } from "react-icons/si";
import { useState, useEffect, useMemo } from "react";
import PartnerLogos from "@/components/partner-logos";
import { useLocation } from "wouter";

const keywords = [
  "Smart Contract",
  "dApp",
  "Token",
  "AI Model",
  "Trading Bot",
  "Web3 Project"
];

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setLocation] = useLocation();
  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % keywords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      icon: Shield,
      value: "100%",
      label: "Secure Development",
      color: "emerald-500",
      description: "Enterprise-grade security standards",
      gradient: "from-emerald-500/20 via-emerald-500/10 to-emerald-500/5"
    },
    {
      icon: Bot,
      value: "24/7",
      label: "Support & Monitoring",
      color: "blue-500",
      description: "Round-the-clock technical assistance",
      gradient: "from-blue-500/20 via-blue-500/10 to-blue-500/5"
    },
    {
      icon: Brain,
      value: "AI-First",
      label: "Development",
      color: "purple-500",
      description: "Latest AI technologies integration",
      gradient: "from-purple-500/20 via-purple-500/10 to-purple-500/5"
    },
    {
      icon: Coins,
      value: "$10M+",
      label: "TVL Deployed",
      color: "amber-500",
      description: "Total value secured in our solutions",
      gradient: "from-amber-500/20 via-amber-500/10 to-amber-500/5"
    }
  ];

  const serviceSections = [
    {
      title: "Blockchain Development",
      description: "Enterprise-grade blockchain solutions with advanced security features",
      type: "blockchain",
      background: "bg-background",
      gradient: "from-blue-500/20 via-transparent to-purple-500/10"
    },
    {
      title: "AI & Automation",
      description: "Cutting-edge AI solutions powered by latest technologies",
      type: "ai",
      background: "bg-muted/50",
      gradient: "from-purple-500/20 via-transparent to-pink-500/10"
    },
    {
      title: "Trading & DeFi",
      description: "Advanced trading solutions and DeFi protocol development",
      type: "autonomous",
      background: "bg-background",
      gradient: "from-green-500/20 via-transparent to-blue-500/10"
    }
  ];

  const groupedServices = useMemo(() => {
    if (!services) return {};
    return services.reduce((acc: Record<string, Service[]>, service) => {
      if (!acc[service.type]) {
        acc[service.type] = [];
      }
      acc[service.type].push(service);
      return acc;
    }, {});
  }, [services]);

  const getSectionServices = (section: typeof serviceSections[0]) => {
    if (!services) return [];
    return groupedServices[section.type] || [];
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-12 md:py-20 px-4 overflow-hidden spotlight-hover">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />

        <div className="max-w-5xl mx-auto relative">
          <div className="text-center space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold leading-tight tracking-tighter"
            >
              Build Your{" "}
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-primary inline-block"
                >
                  {keywords[currentIndex]}
                </motion.span>
              </AnimatePresence>
              {" "}with Experts
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed"
            >
              Enterprise-grade blockchain and AI solutions built by industry experts.
              From smart contracts to AI models, we deliver secure and scalable solutions.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-4"
            >
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-primary/90 via-primary to-primary/90 text-primary-foreground hover:shadow-lg hover:scale-[1.02] text-lg px-8 py-6 transition-all duration-300"
                onClick={() => setLocation("/configurator")}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/0 via-primary-foreground/5 to-primary-foreground/0 group-hover:translate-x-full transition-transform duration-1000" />
                Start Building
                <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`group relative overflow-hidden bg-gradient-to-br ${stat.gradient} backdrop-blur-sm p-6 rounded-xl border border-${stat.color}/10 text-center hover:border-${stat.color}/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-${stat.color}/10 text-${stat.color} ring-1 ring-${stat.color}/20 group-hover:ring-${stat.color}/40 transition-all duration-300`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className={`text-2xl font-bold mb-1 text-${stat.color}`}>{stat.value}</h3>
                    <p className="text-sm font-medium mb-1">{stat.label}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{stat.description}</p>
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 opacity-[0.03] rotate-12 group-hover:rotate-6 transition-transform duration-700">
                    <Icon />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-12 border-y bg-gradient-to-br from-background via-muted/50 to-background">
        <PartnerLogos />
      </section>

      {serviceSections.map((section, index) => {
        const sectionServices = getSectionServices(section);
        if (sectionServices.length === 0) return null;

        return (
          <section
            key={index}
            className={`py-12 md:py-16 px-4 ${section.background} relative overflow-hidden spotlight-hover`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-20`} />
            <div className="max-w-5xl mx-auto relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8 md:mb-12 space-y-3"
              >
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{section.title}</h2>
                <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                  {section.description}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                {sectionServices.map((service, i) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <ServiceCard
                      service={service}
                      showAddToCart
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <footer className="bg-background border-t">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary"
              >
                <path d="M20 4L34 12V28L20 36L6 28V12L20 4Z" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M16 14C16 14 24 14 24 17C24 20 16 20 16 23C16 26 24 26 24 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="16" cy="14" r="2" fill="currentColor" />
                <circle cx="24" cy="26" r="2" fill="currentColor" />
                <path d="M12 20H28" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
              </svg>
              <span className="font-bold text-2xl tracking-tight">Solvix Labs</span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://twitter.com/solvix"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <SiX className="w-5 h-5" />
              </a>
              <a
                href="https://t.me/solvix"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <SiTelegram className="w-5 h-5" />
              </a>
              <a
                href="https://discord.gg/solvix"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <SiDiscord className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Solvix Labs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}