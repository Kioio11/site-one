import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import HomePage from "@/pages/home-page";
import NavHeader from "./components/nav-header";
import ConfiguratorPage from "@/pages/configurator";
import AdminLayout from "@/components/admin-layout";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminServices from "@/pages/admin/services";
import AdminOrders from "@/pages/admin/orders";
import AdminSettings from "@/pages/admin/settings";
import AdminLogin from "@/pages/admin/login";
import AuthPage from "@/pages/auth-page";
import { ProtectedAdminRoute } from "@/lib/protected-admin-route";
import PricingPage from "@/pages/pricing";
import CheckoutPage from "@/pages/checkout";
import DashboardPage from "@/pages/dashboard";
import RequirementsPage from "@/pages/requirements-page";
import NotFound from "@/pages/not-found";

function PublicRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavHeader />
      {children}
    </>
  );
}

function Router() {
  return (
    <CartProvider>
      <Switch>
        {/* Public Routes */}
        <Route path="/">
          {() => (
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          )}
        </Route>

        <Route path="/auth">
          {() => <AuthPage />}
        </Route>

        <Route path="/configurator">
          {() => (
            <PublicRoute>
              <ConfiguratorPage />
            </PublicRoute>
          )}
        </Route>

        <Route path="/pricing">
          {() => (
            <PublicRoute>
              <PricingPage />
            </PublicRoute>
          )}
        </Route>

        <Route path="/checkout">
          {() => (
            <PublicRoute>
              <CheckoutPage />
            </PublicRoute>
          )}
        </Route>

        <Route path="/dashboard">
          {() => (
            <PublicRoute>
              <DashboardPage />
            </PublicRoute>
          )}
        </Route>

        <Route path="/requirements/:orderId">
          {(params) => (
            <PublicRoute>
              <RequirementsPage orderId={params.orderId} />
            </PublicRoute>
          )}
        </Route>

        {/* Admin Login - Public Route */}
        <Route path="/admin/login">
          {() => <AdminLogin />}
        </Route>

        {/* Admin Routes - All admin routes under a single protected route */}
        <Route path="/admin">
          {() => (
            <ProtectedAdminRoute
              path="/admin"
              component={() => (
                <AdminLayout>
                  <Switch>
                    {/* Admin Dashboard */}
                    <Route path="/admin" exact>
                      {() => <AdminDashboard />}
                    </Route>

                    {/* Admin Users */}
                    <Route path="/admin/users">
                      {() => <AdminUsers />}
                    </Route>

                    {/* Admin Services */}
                    <Route path="/admin/services">
                      {() => <AdminServices />}
                    </Route>

                    {/* Admin Orders */}
                    <Route path="/admin/orders">
                      {() => <AdminOrders />}
                    </Route>

                    {/* Admin Settings */}
                    <Route path="/admin/settings">
                      {() => <AdminSettings />}
                    </Route>
                  </Switch>
                </AdminLayout>
              )}
            />
          )}
        </Route>

        {/* 404 Route */}
        <Route>
          {() => (
            <PublicRoute>
              <NotFound />
            </PublicRoute>
          )}
        </Route>
      </Switch>
    </CartProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;