import { useQuery, useMutation } from "@tanstack/react-query";
import { Order, Service } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  Loader2,
  FileText,
  Clock,
  CheckCircle2,
  PlayCircle,
  Building2,
  Mail,
  Phone,
  Globe,
  Server,
  Users,
  Palette,
  FileDown,
  CalendarDays,
  Code2,
  Database,
  Network,
  Lock,
  Cpu,
  Cloud,
  Boxes,
  Layers,
  Bot,
  Brain,
  Github,
  Link,
  Box,
  Terminal,
  Smartphone,
  Monitor,
  Blocks,
  CircuitBoard,
  AppWindow,
  PauseCircle,
  XCircle
} from "lucide-react";
import FileUpload from "@/components/file-upload";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/admin-layout";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Technology stack mapping using Lucide icons
const techStackIcons: Record<string, React.ElementType> = {
  blockchain: Blocks,
  web3: Link,
  docker: Box,
  kubernetes: Cloud,
  aws: Cloud,
  gcp: Cloud,
  react: Monitor,
  vue: Monitor,
  angular: Monitor,
  python: Terminal,
  nodejs: Terminal,
  rust: Terminal,
  solidity: Code2,
  typescript: Code2,
  postgresql: Database,
  mongodb: Database,
  redis: Database,
  tensorflow: Brain,
  pytorch: Brain,
  mobile: Smartphone,
  desktop: Monitor,
  web: AppWindow,
  microservices: CircuitBoard
};

// Add type definition for order status
type OrderStatus = 'pending' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';

type OrderStatusConfig = {
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  allowedTransitions: OrderStatus[];
};

// Update the orderStatuses object with proper typing
const orderStatuses: Record<OrderStatus, OrderStatusConfig> = {
  pending: {
    label: "Pending",
    description: "Order received, awaiting processing",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    allowedTransitions: ["in-progress", "cancelled"]
  },
  "in-progress": {
    label: "In Progress",
    description: "Order is being processed",
    icon: PlayCircle,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    allowedTransitions: ["completed", "on-hold"]
  },
  completed: {
    label: "Completed",
    description: "Order has been fulfilled",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    allowedTransitions: []
  },
  "on-hold": {
    label: "On Hold",
    description: "Order temporarily paused",
    icon: PauseCircle,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    allowedTransitions: ["in-progress", "cancelled"]
  },
  cancelled: {
    label: "Cancelled",
    description: "Order has been cancelled",
    icon: XCircle,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    allowedTransitions: []
  }
} as const;

// Update utility functions with proper typing
function getStatusColor(status: string): string {
  return orderStatuses[status as OrderStatus]?.color || orderStatuses.pending.color;
}

function getStatusIcon(status: string) {
  const Icon = orderStatuses[status as OrderStatus]?.icon || orderStatuses.pending.icon;
  return <Icon className="h-4 w-4" />;
}

function TechBadge({ tech, className = "" }: { tech: string; className?: string }) {
  const Icon = techStackIcons[tech.toLowerCase()] || Code2;
  return (
    <Badge variant="outline" className={`flex items-center gap-1.5 ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="capitalize">{tech}</span>
    </Badge>
  );
}

export default function AdminOrders() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const currentStatus = orders?.find(o => o.id === orderId)?.status;
      const allowedTransitions = orderStatuses[currentStatus || "pending"].allowedTransitions;

      if (!allowedTransitions.includes(status)) {
        throw new Error(`Cannot transition from ${currentStatus} to ${status}`);
      }

      const res = await apiRequest("PATCH", `/api/orders/${orderId}`, { status });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update status");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoadingOrders) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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


  const getStatusBadge = (status: string) => {
    const statusConfig = orderStatuses[status as OrderStatus] || orderStatuses.pending;
    const Icon = statusConfig.icon;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge
              className={cn(
                "flex items-center gap-1.5",
                statusConfig.color
              )}
              variant="outline"
            >
              <Icon className="h-4 w-4" />
              <span className="capitalize">{statusConfig.label}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{statusConfig.description}</p>
            {statusConfig.allowedTransitions.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Can transition to: {statusConfig.allowedTransitions.map(s => orderStatuses[s].label).join(", ")}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div>
              <CardTitle className="text-2xl font-bold">Order Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track and manage customer orders
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select
                defaultValue="all"
                onValueChange={(value) => {
                  // Add filter functionality here
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(orderStatuses).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-2">
                <FileDown className="h-4 w-4" />
                Export Orders
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>{getServiceName(order.serviceId)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {order.requirements?.contactName || "N/A"}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {order.requirements?.companyName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          {formatDate(order.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${(order.totalPrice / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={order.status}
                          onValueChange={(value) =>
                            updateStatusMutation.mutate({ orderId: order.id, status: value })
                          }
                          disabled={!orderStatuses[order.status as OrderStatus].allowedTransitions.length}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue>
                              {getStatusBadge(order.status)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {orderStatuses[order.status as OrderStatus].allowedTransitions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {getStatusBadge(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <FileUpload
                          orderId={order.id}
                          onUpload={() => queryClient.invalidateQueries({ queryKey: ["/api/orders"] })}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <FileText className="h-4 w-4" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Order Details #{selectedOrder?.id}</span>
                <Badge className={getStatusColor(selectedOrder?.status || "pending")}>
                  {getStatusIcon(selectedOrder?.status || "pending")}
                  <span className="capitalize ml-1">
                    {selectedOrder?.status || "Pending"}
                  </span>
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-6">
              {/* Service Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>Service Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/10">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Service</p>
                    <p className="text-base font-semibold mt-1">
                      {getServiceName(selectedOrder?.serviceId || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Price</p>
                    <p className="text-base font-semibold mt-1">
                      ${((selectedOrder?.totalPrice || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatDate(selectedOrder?.createdAt || null)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Development Requirements */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  <span>Development Requirements</span>
                </h3>
                <div className="space-y-6">
                  {/* Tech Stack */}
                  <div className="p-4 rounded-lg border bg-muted/10">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Technology Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrder?.requirements?.technologies?.map((tech: string) => (
                        <TechBadge key={tech} tech={tech} />
                      )) || (
                        <p className="text-sm text-muted-foreground">No technologies specified</p>
                      )}
                    </div>
                  </div>

                  {/* Infrastructure */}
                  <div className="p-4 rounded-lg border bg-muted/10">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      Infrastructure Requirements
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Cloud className="h-3.5 w-3.5" />
                          Hosting
                        </p>
                        <p className="mt-1">{selectedOrder?.requirements?.hostingPreference || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Database className="h-3.5 w-3.5" />
                          Database
                        </p>
                        <p className="mt-1">{selectedOrder?.requirements?.databaseType || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Network className="h-3.5 w-3.5" />
                          Scalability
                        </p>
                        <p className="mt-1">{selectedOrder?.requirements?.scalabilityRequirements || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5" />
                          Security Requirements
                        </p>
                        <p className="mt-1">{selectedOrder?.requirements?.securityRequirements || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI/ML Requirements */}
                  {selectedOrder?.requirements?.aiFeatures && (
                    <div className="p-4 rounded-lg border bg-muted/10">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        AI/ML Requirements
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium flex items-center gap-1.5">
                            <Bot className="h-3.5 w-3.5" />
                            AI Features
                          </p>
                          <p className="mt-1">{selectedOrder?.requirements?.aiFeatures}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium flex items-center gap-1.5">
                            <Cpu className="h-3.5 w-3.5" />
                            Model Requirements
                          </p>
                          <p className="mt-1">{selectedOrder?.requirements?.modelRequirements || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Integration Requirements */}
                  <div className="p-4 rounded-lg border bg-muted/10">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Boxes className="h-4 w-4" />
                      Integration Requirements
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Github className="h-3.5 w-3.5" />
                          Version Control
                        </p>
                        <p className="mt-1">{selectedOrder?.requirements?.versionControl || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Box className="h-3.5 w-3.5" />
                          Container Requirements
                        </p>
                        <p className="mt-1">{selectedOrder?.requirements?.containerization || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <span>Project Information</span>
                </h3>
                <div className="space-y-4 p-4 rounded-lg border bg-muted/10">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Project Name</p>
                    <p className="text-base mt-1">{selectedOrder?.requirements?.projectName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Project Timeline</p>
                    <p className="text-base mt-1">{selectedOrder?.requirements?.projectTimeline || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Additional Notes</p>
                    <p className="text-base mt-1 whitespace-pre-wrap">
                      {selectedOrder?.requirements?.additionalNotes || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Customer Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/10">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Contact Name
                    </p>
                    <p className="text-base mt-1">{selectedOrder?.requirements?.contactName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      Company
                    </p>
                    <p className="text-base mt-1">{selectedOrder?.requirements?.companyName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </p>
                    <p className="text-base mt-1">{selectedOrder?.requirements?.contactEmail || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      Phone
                    </p>
                    <p className="text-base mt-1">{selectedOrder?.requirements?.contactPhone || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Attached Files */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Attached Files</span>
                </h3>
                <div className="p-4 rounded-lg border bg-muted/10">
                  <FileUpload
                    orderId={selectedOrder?.id || 0}
                    onUpload={() => queryClient.invalidateQueries({ queryKey: ["/api/orders"] })}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}