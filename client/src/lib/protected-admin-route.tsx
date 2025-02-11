import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedAdminRouteProps {
  path: string;
  component: () => React.JSX.Element;
}

export function ProtectedAdminRoute({ path, component: Component }: ProtectedAdminRouteProps) {
  const { user, isLoading, isAdmin } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Redirect to admin login if not authenticated or not an admin
  if (!user || !isAdmin) {
    return <Redirect to="/admin/login" />;
  }

  return <Route path={path} component={Component} />;
}