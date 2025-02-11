import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { NotificationsMenu } from "@/components/notifications";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Settings,
  ShoppingCart,
  Layers,
  Code2,
  Brain,
  Blocks,
  Shield,
  MonitorCheck,
  Cpu
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Services', href: '/admin/services', icon: Layers },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  const serviceHighlights = [
    { 
      title: 'Secure Development',
      icon: Shield,
      description: 'Enterprise-grade security'
    },
    {
      title: 'Support & Monitoring',
      icon: MonitorCheck,
      description: '24/7 system monitoring'
    },
    {
      title: 'Development',
      icon: Cpu,
      description: 'Advanced tech stack'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4"
        >
          <div className="flex h-16 items-center justify-between">
            <Link href="/admin">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 40 40" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary drop-shadow-lg"
                >
                  <motion.path 
                    d="M20 4L34 12V28L20 36L6 28V12L20 4Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.path 
                    d="M16 14C16 14 24 14 24 17C24 20 16 20 16 23C16 26 24 26 24 26" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
                  />
                  <motion.circle cx="16" cy="14" r="2" fill="currentColor" />
                  <motion.circle cx="24" cy="26" r="2" fill="currentColor" />
                  <motion.path d="M12 20H28" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                </svg>
                <div className="flex flex-col">
                  <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    Admin
                  </span>
                  <span className="text-xs text-muted-foreground">Enterprise Panel</span>
                </div>
              </motion.div>
            </Link>

            {/* Service Highlight Boxes */}
            <div className="hidden lg:flex items-center gap-4">
              {serviceHighlights.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 hover:from-primary/30 hover:to-primary/20 transition-all duration-300 shadow-lg border border-primary/10"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-primary">{service.title}</span>
                      <span className="text-xs text-primary/70">{service.description}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              <NotificationsMenu />
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary"
              >
                <span className="text-sm font-medium">{user?.email}</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar Navigation */}
        <motion.aside 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 hidden md:block border-r bg-background/95 shadow-lg"
        >
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-lg" 
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Tech Icons Banner */}
          <div className="p-4 mt-8">
            <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 p-4">
              <div className="flex justify-center space-x-4 mb-3">
                <Brain className="h-6 w-6 text-primary animate-pulse" />
                <Code2 className="h-6 w-6 text-primary animate-pulse delay-100" />
                <Blocks className="h-6 w-6 text-primary animate-pulse delay-200" />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Powered by Advanced AI & Blockchain Technology
              </p>
            </div>
          </div>
        </motion.aside>

        {/* Mobile Navigation */}
        <div className="md:hidden w-full">
          <motion.nav 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-4 p-4 overflow-x-auto border-b bg-background/95"
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[4.5rem]",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-lg" 
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}
          </motion.nav>

          {/* Mobile Service Highlights */}
          <div className="flex overflow-x-auto gap-4 p-4 md:hidden">
            {serviceHighlights.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 shadow-lg border border-primary/10 min-w-max"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-primary whitespace-nowrap">{service.title}</span>
                    <span className="text-xs text-primary/70 whitespace-nowrap">{service.description}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 p-6"
        >
          <div className="container mx-auto">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}