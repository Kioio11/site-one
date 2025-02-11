import { Service } from "@shared/schema";

export interface ConfiguratorOption extends Service {
  icon: React.ElementType;
  category?: 'blockchain' | 'ai' | 'autonomous';
  complementaryServices?: string[];
  requiredFields?: string[];
}

export interface ExtendedService extends Service {
  icon?: React.ElementType;
  category?: 'blockchain' | 'ai' | 'autonomous';
}