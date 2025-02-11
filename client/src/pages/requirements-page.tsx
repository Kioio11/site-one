import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderRequirementsSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type RequirementsFormData = z.infer<typeof orderRequirementsSchema>;

interface Props {
  orderId: string;
}

export default function RequirementsPage({ orderId }: Props) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Updated error handling in useQuery
  const { data: order, isLoading, error } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
    retry: false,
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        const error = await res.json();
        console.error('Error fetching order:', error);
        throw new Error(error.message || "Order not found or payment not completed");
      }
      return res.json();
    },
  });

  const form = useForm<RequirementsFormData>({
    resolver: zodResolver(orderRequirementsSchema),
    defaultValues: {
      projectName: "",
      brandColors: "",
      logoRequirements: "",
      targetAudience: "",
      additionalNotes: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      companyName: "",
      hostingPreference: "",
      domainName: "",
      technicalRequirements: "",
      projectTimeline: "",
      securityRequirements: "",
      integrationRequirements: "",
      performanceRequirements: "",
      maintenanceRequirements: "",
      scalabilityRequirements: "",
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (data: RequirementsFormData) => {
      const res = await apiRequest(
        "PATCH",
        `/api/orders/${orderId}`,
        { requirements: data }
      );
      if (!res.ok) {
        throw new Error("Failed to update order requirements");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}`] });
      toast({
        description: "Requirements submitted successfully!",
        duration: 3000,
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        description: error.message || "Failed to submit requirements",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const onSubmit = (data: RequirementsFormData) => {
    updateOrderMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "This order does not exist or payment has not been completed."}
          </p>
          <Button onClick={() => setLocation("/")}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Project Requirements</h1>
          <p className="text-muted-foreground mt-2">
            Please provide detailed information about your project to help us deliver the best results
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>Basic information about your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Awesome Project" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name you want to use for your project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Company" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your business or organization name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="projectTimeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Timeline</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 3 months, Start by Q2 2024" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your preferred timeline for project completion
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Technical Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
                <CardDescription>Technical details and requirements for your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="technicalRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technical Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your technical requirements, frameworks, or specific technologies needed"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="integrationRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Integration Requirements</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List any third-party services or APIs to integrate"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="securityRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Security Requirements</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Specify any security requirements or compliance needs"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="performanceRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Performance Requirements</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe performance expectations and scalability needs"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maintenanceRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maintenance Requirements</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Specify maintenance and support expectations"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Brand & Design */}
            <Card>
              <CardHeader>
                <CardTitle>Brand & Design</CardTitle>
                <CardDescription>Visual and branding requirements for your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="brandColors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Colors</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Primary: #FF0000, Secondary: #00FF00" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your brand's color palette (hex codes preferred)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logoRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your logo requirements or upload guidelines"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your target audience and their preferences"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Hosting & Domain */}
            <Card>
              <CardHeader>
                <CardTitle>Hosting & Domain</CardTitle>
                <CardDescription>Hosting and domain preferences for your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="hostingPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hosting Preference</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., AWS, GCP, Azure" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your preferred hosting provider
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="domainName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domain Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your preferred domain name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How we can reach you regarding the project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Any other details you'd like to share</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any other requirements or special instructions"
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t z-10">
              <Button
                type="submit"
                className="w-full max-w-md mx-auto block"
                disabled={updateOrderMutation.isPending}
              >
                {updateOrderMutation.isPending ? "Submitting..." : "Submit Requirements"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}