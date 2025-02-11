import { motion } from "framer-motion";
import { SiEthereum, SiOpenai, SiBinance, SiSolana, SiPolygon } from "react-icons/si";
import { BrainCircuit } from "lucide-react";

const partnerLogos = [
  { Icon: SiEthereum, alt: "Ethereum", color: "#627EEA" },
  { Icon: SiBinance, alt: "Binance", color: "#F3BA2F" },
  { Icon: SiOpenai, alt: "OpenAI", color: "#000000" },
  { Icon: SiSolana, alt: "Solana", color: "#14F195" },
  { Icon: SiPolygon, alt: "Polygon", color: "#8247E5" },
  { Icon: BrainCircuit, alt: "Deepseek", color: "#0066FF" }
];

export default function PartnerLogos() {
  return (
    <div className="relative py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-8 items-center justify-items-center">
          {partnerLogos.map((logo, index) => (
            <motion.div
              key={logo.alt}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.5
              }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-border/50 p-3 md:p-4">
                <div className="h-8 md:h-10 w-full flex items-center justify-center">
                  <logo.Icon 
                    className="h-5 w-5 md:h-6 md:w-6 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 ease-out"
                    title={logo.alt}
                    style={{ color: logo.color }}
                  />
                  <span className="sr-only">{logo.alt}</span>
                </div>
                <motion.div 
                  className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-xl"
                  initial={false}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}