import { useQuery } from "@tanstack/react-query";
import { Order, Service } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function DashboardPage() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [, setLocation] = useLocation();

  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  if (isLoadingOrders) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getServiceName = (serviceId: number) => {
    return services?.find(s => s.id === serviceId)?.name || "Unknown Service";
  };

  const formatDate = (dateString: Date | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const needsRequirements = (order: Order) => {
    return !order.requirements || Object.keys(order.requirements).length === 0;
  };

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Projects</h1>
            <p className="text-lg text-muted-foreground">
              Track and manage your ongoing projects
            </p>
          </div>
          <Button onClick={() => setLocation("/pricing")}>Start New Project</Button>
        </div>

        <div className="grid gap-6">
          {orders?.map((order) => (
            <Card 
              key={order.id} 
              className={`hover:border-primary/50 transition-colors ${needsRequirements(order) ? 'border-yellow-500/50' : ''}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold">
                      {getServiceName(order.serviceId)}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Order #{order.id} • Created on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <div className="flex gap-2">
                      {needsRequirements(order) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                          onClick={() => setLocation(`/requirements/${order.id}`)}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Submit Requirements
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>

                {needsRequirements(order) && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex gap-2 items-center text-yellow-800">
                      <AlertTriangle className="h-5 w-5" />
                      <p className="font-medium">Action Required: Project Requirements Needed</p>
                    </div>
                    <p className="mt-1 text-sm text-yellow-700">
                      Please submit your project requirements so we can begin working on your project.
                      This will help us understand your needs and deliver the best results.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {orders?.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No projects yet</p>
                <Button
                  className="mt-4"
                  onClick={() => setLocation("/pricing")}
                >
                  Start Your First Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Service Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium">{getServiceName(selectedOrder?.serviceId || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">
                    ${((selectedOrder?.totalPrice || 0) / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedOrder?.status || "pending")}>
                    {selectedOrder?.status.charAt(0).toUpperCase() + selectedOrder?.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {formatDate(selectedOrder?.createdAt || null)}
                  </p>
                </div>
              </div>
            </div>

            {selectedOrder?.requirements ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Project Requirements</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Project Name</p>
                      <p className="font-medium">{selectedOrder.requirements.projectName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Technical Requirements</p>
                      <p className="font-medium">{selectedOrder.requirements.technicalRequirements || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Integration Requirements</p>
                      <p className="font-medium">{selectedOrder.requirements.integrationRequirements || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timeline</p>
                      <p className="font-medium">{selectedOrder.requirements.projectTimeline || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Name</p>
                      <p className="font-medium">{selectedOrder.requirements.contactName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{selectedOrder.requirements.companyName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedOrder.requirements.contactEmail || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedOrder.requirements.contactPhone || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex gap-2 items-center text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-medium">Requirements Not Submitted</p>
                </div>
                <p className="mt-1 text-sm text-yellow-700">
                  Project requirements haven't been submitted yet. Please submit your requirements so we can begin working on your project.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSelectedOrder(null);
                    setLocation(`/requirements/${selectedOrder?.id}`);
                  }}
                >
                  Submit Requirements Now
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}