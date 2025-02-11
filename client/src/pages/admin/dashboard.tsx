import { useQuery } from "@tanstack/react-query";
import { Order, Service } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Loader2, Brain, Code2, Database, Network, Shield, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: () => fetch("/api/admin/orders").then(res => res.json())
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/admin/services"],
    queryFn: () => fetch("/api/admin/services").then(res => res.json())
  });

  if (isLoadingOrders) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Calculate service demand
  const serviceDemand = services?.map(service => {
    const orderCount = orders?.filter(order => order.serviceId === service.id).length || 0;
    const totalRevenue = orders
      ?.filter(order => order.serviceId === service.id)
      .reduce((sum, order) => sum + order.totalPrice, 0) || 0;

    return {
      name: service.name,
      orders: orderCount,
      revenue: totalRevenue / 100 // Convert cents to dollars
    };
  }) || [];

  // Calculate status distribution
  const statusDistribution = orders?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusDistribution || {}).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count
  }));

  const serviceBanners = [
    {
      title: "AI Development",
      description: "Advanced machine learning solutions powered by cutting-edge algorithms",
      icon: Brain,
      color: "from-blue-500/20 to-purple-500/20 border-blue-500/20",
      highlight: "text-blue-500"
    },
    {
      title: "Blockchain Solutions",
      description: "Secure and scalable distributed ledger technology",
      icon: Database,
      color: "from-emerald-500/20 to-green-500/20 border-emerald-500/20",
      highlight: "text-emerald-500"
    },
    {
      title: "Enterprise Development",
      description: "Full-stack enterprise solutions with modern architecture",
      icon: Code2,
      color: "from-orange-500/20 to-red-500/20 border-orange-500/20",
      highlight: "text-orange-500"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <motion.h1 
        className="text-3xl font-bold mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Admin Dashboard
      </motion.h1>

      {/* Service Banners */}
      <motion.div 
        className="grid md:grid-cols-3 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {serviceBanners.map((banner, index) => {
          const Icon = banner.icon;
          return (
            <motion.div
              key={banner.title}
              className={`relative overflow-hidden rounded-xl border p-6 bg-gradient-to-br ${banner.color}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${banner.highlight} bg-background`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className={`font-semibold ${banner.highlight}`}>{banner.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{banner.description}</p>
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 opacity-10">
                <Icon className="h-32 w-32" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{orders?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              ${(orders?.reduce((sum, order) => sum + order.totalPrice, 0) || 0) / 100}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {orders?.filter(order => order.status === "in-progress").length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Service Demand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceDemand}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="orders" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}