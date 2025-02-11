import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import ShoppingCartComponent from "@/components/shopping-cart";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function NavHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const isAdmin = location.startsWith('/admin');

  // Only show navigation for non-admin pages
  const NavLinks = ({ onClick }: { onClick?: () => void }) => {
    if (isAdmin) return null;

    return (
      <>
        <Link href="/">
          <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={onClick}>
            Home
          </Button>
        </Link>
        <Link href="/configurator">
          <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={onClick}>
            Bundle
          </Button>
        </Link>
        <ShoppingCartComponent />
        {user ? (
          <Link href="/dashboard">
            <Button variant="default">Dashboard</Button>
          </Link>
        ) : (
          <Link href="/auth">
            <Button variant="default" onClick={onClick}>Sign In</Button>
          </Link>
        )}
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href={isAdmin ? '/admin' : '/'}>
            <div className="flex items-center gap-3 cursor-pointer">
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 40 40" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary"
              >
                <path d="M20 4L34 12V28L20 36L6 28V12L20 4Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M16 14C16 14 24 14 24 17C24 20 16 20 16 23C16 26 24 26 24 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="16" cy="14" r="2" fill="currentColor"/>
                <circle cx="24" cy="26" r="2" fill="currentColor"/>
                <path d="M12 20H28" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
              </svg>
              <span className="font-bold text-xl tracking-tight">
                {isAdmin ? 'Admin' : 'Solvix Labs'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation or Admin User Info */}
          {isAdmin ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
            </div>
          ) : (
            <nav className="hidden md:flex items-center gap-6">
              <NavLinks />
            </nav>
          )}

          {/* Mobile Navigation (only for non-admin) */}
          {!isAdmin && (
            <div className="flex items-center gap-4 md:hidden">
              <ShoppingCartComponent />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px]">
                  <div className="flex items-center gap-2 mb-8">
                    <svg 
                      width="28" 
                      height="28" 
                      viewBox="0 0 40 40" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-primary"
                    >
                      <path d="M20 4L34 12V28L20 36L6 28V12L20 4Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <path d="M16 14C16 14 24 14 24 17C24 20 16 20 16 23C16 26 24 26 24 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="16" cy="14" r="2" fill="currentColor"/>
                      <circle cx="24" cy="26" r="2" fill="currentColor"/>
                      <path d="M12 20H28" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
                    </svg>
                    <span className="font-bold text-lg">Solvix Labs</span>
                  </div>
                  <nav className="flex flex-col gap-4">
                    <NavLinks onClick={() => setIsOpen(false)} />
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}