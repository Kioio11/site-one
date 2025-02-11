import { useQuery, useMutation } from "@tanstack/react-query";
import { Service } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Pencil, Blocks, Brain, Bot, Shield, Rocket, LineChart, Palette, Code2, Megaphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin-layout";

// Mock initial services data that includes design services
const defaultServices = [
  {
    id: 1,
    name: "UI Design Service",
    description: "Professional UI/UX design for web and mobile applications",
    basePrice: 599900,
    type: "design",
    features: "Wireframing,Interactive Prototypes,Design System,User Flow Design"
  },
  {
    id: 2,
    name: "Brand Identity Package",
    description: "Complete branding solution including logo, style guide, and brand assets",
    basePrice: 799900,
    type: "design",
    features: "Logo Design,Brand Guidelines,Marketing Materials,Social Media Kit"
  },
  {
    id: 3,
    name: "Web Design Package",
    description: "Custom website design with responsive layouts and modern aesthetics",
    basePrice: 899900,
    type: "design",
    features: "Responsive Design,Custom Components,Animation Design,Design Implementation"
  }
];

const SERVICE_TYPES = [
  { value: "blockchain", label: "Blockchain", icon: Blocks },
  { value: "ai", label: "AI", icon: Brain },
  { value: "design", label: "Design", icon: Palette },
  { value: "autonomous", label: "Autonomous", icon: Bot },
  { value: "addon", label: "Add-on", icon: Plus }
];

function getServiceIcon(type: string) {
  const serviceType = SERVICE_TYPES.find(t => t.value === type);
  const Icon = serviceType?.icon || Code2;
  return <Icon className="h-4 w-4" />;
}

export default function AdminServices() {
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/admin/services"],
    // initialData: defaultServices //Uncomment for testing with mock data.  Comment out for production.
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: Partial<Service>) => {
      const res = await apiRequest("POST", "/api/services", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Service created successfully",
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

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Service> }) => {
      const res = await apiRequest("PATCH", `/api/services/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Service updated successfully",
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const basePrice = parseFloat(formData.get("basePrice") as string);

    if (isNaN(basePrice) || basePrice < 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price greater than or equal to 0",
        variant: "destructive",
      });
      return;
    }

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      basePrice: Math.round(basePrice * 100), // Convert dollars to cents
      features: formData.get("features") as string,
    };

    if (selectedService) {
      updateServiceMutation.mutate({ id: selectedService.id, data });
    } else {
      createServiceMutation.mutate(data);
    }
  };

  const resetForm = () => {
    setSelectedService(null);
    setIsDialogOpen(false);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div>
              <CardTitle className="text-2xl font-bold">Service Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your service offerings and pricing
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedService ? "Edit Service" : "Add New Service"}
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the service details and set the price.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={selectedService?.name}
                      required
                      placeholder="Enter service name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={selectedService?.description}
                      required
                      placeholder="Describe the service"
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      name="type"
                      defaultValue={selectedService?.type || "blockchain"}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map(type => (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                            className="flex items-center gap-2"
                          >
                            <type.icon className="h-4 w-4 text-muted-foreground" />
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">
                      Price (USD)
                      <span className="text-sm text-muted-foreground ml-2">
                        Enter amount in dollars (e.g. 299.99)
                      </span>
                    </Label>
                    <Input
                      id="basePrice"
                      name="basePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={selectedService ? (selectedService.basePrice / 100).toFixed(2) : ""}
                      required
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="features">Features (comma-separated)</Label>
                    <Input
                      id="features"
                      name="features"
                      defaultValue={selectedService?.features || ""}
                      placeholder="Feature 1, Feature 2, Feature 3"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                    >
                      {createServiceMutation.isPending || updateServiceMutation.isPending
                        ? "Saving..."
                        : selectedService ? "Update Service" : "Create Service"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price (USD)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : services?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No services found. Add your first service.
                      </TableCell>
                    </TableRow>
                  ) : (
                    services?.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell className="max-w-md truncate">
                          {service.description}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 w-fit"
                          >
                            {getServiceIcon(service.type)}
                            <span className="capitalize">{service.type}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${(service.basePrice / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedService(service);
                              setIsDialogOpen(true);
                            }}
                            className="gap-2"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}