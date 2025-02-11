import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfiguratorOption } from "@/types/configurator";

// Dynamic schema generation based on required fields
const generateRequirementsSchema = (mainService: ConfiguratorOption, addons: ConfiguratorOption[]) => {
  const allRequiredFields = new Set([
    ...(mainService.requiredFields || []),
    ...addons.flatMap(addon => addon.requiredFields || [])
  ]);

  const schemaFields: Record<string, z.ZodType<any>> = {
    // Base fields that are always required
    projectName: z.string().min(1, "Project name is required"),
    contactName: z.string().min(1, "Contact name is required"),
    contactEmail: z.string().email("Invalid email format"),
    contactPhone: z.string().min(1, "Contact phone is required"),
    companyName: z.string().min(1, "Company name is required"),
  };

  // Add conditional fields based on service requirements
  if (allRequiredFields.has('brandColors')) {
    schemaFields.brandColors = z.string().optional();
  }
  if (allRequiredFields.has('targetAudience')) {
    schemaFields.targetAudience = z.string().optional();
  }
  if (allRequiredFields.has('contractName')) {
    schemaFields.contractName = z.string().min(1, "Contract name is required");
  }
  if (allRequiredFields.has('tokenomics')) {
    schemaFields.tokenomics = z.string().min(1, "Tokenomics details are required");
  }
  if (allRequiredFields.has('network')) {
    schemaFields.network = z.string().min(1, "Network selection is required");
  }
  if (allRequiredFields.has('deploymentEnvironment')) {
    schemaFields.deploymentEnvironment = z.string().min(1, "Deployment environment is required");
  }
  if (allRequiredFields.has('modelType')) {
    schemaFields.modelType = z.string().min(1, "Model type is required");
  }
  if (allRequiredFields.has('dataDescription')) {
    schemaFields.dataDescription = z.string().min(1, "Data description is required");
  }
  if (allRequiredFields.has('agentPurpose')) {
    schemaFields.agentPurpose = z.string().min(1, "Agent purpose is required");
  }
  if (allRequiredFields.has('integrations')) {
    schemaFields.integrations = z.string().min(1, "Integration details are required");
  }
  // New AI fields
  if (allRequiredFields.has('modelPreferences')) {
    schemaFields.modelPreferences = z.string().min(1, "Model preferences are required");
  }
  if (allRequiredFields.has('styleOptions')) {
    schemaFields.styleOptions = z.string().min(1, "Style options are required");
  }
  if (allRequiredFields.has('computeRequirements')) {
    schemaFields.computeRequirements = z.string().min(1, "Compute requirements are required");
  }
  if (allRequiredFields.has('legalDomains')) {
    schemaFields.legalDomains = z.string().min(1, "Legal domains are required");
  }
  if (allRequiredFields.has('jurisdictions')) {
    schemaFields.jurisdictions = z.string().min(1, "Jurisdictions are required");
  }
  if (allRequiredFields.has('documentTypes')) {
    schemaFields.documentTypes = z.string().min(1, "Document types are required");
  }
  if (allRequiredFields.has('contentTypes')) {
    schemaFields.contentTypes = z.string().min(1, "Content types are required");
  }
  if (allRequiredFields.has('tonePreferences')) {
    schemaFields.tonePreferences = z.string().min(1, "Tone preferences are required");
  }
  if (allRequiredFields.has('industryFocus')) {
    schemaFields.industryFocus = z.string().min(1, "Industry focus is required");
  }
  if (allRequiredFields.has('programmingLanguages')) {
    schemaFields.programmingLanguages = z.string().min(1, "Programming languages are required");
  }
  if (allRequiredFields.has('frameworkSupport')) {
    schemaFields.frameworkSupport = z.string().min(1, "Framework support is required");
  }
  if (allRequiredFields.has('codeStylePreferences')) {
    schemaFields.codeStylePreferences = z.string().min(1, "Code style preferences are required");
  }
  if (allRequiredFields.has('voiceCharacteristics')) {
    schemaFields.voiceCharacteristics = z.string().min(1, "Voice characteristics are required");
  }
  if (allRequiredFields.has('languageSupport')) {
    schemaFields.languageSupport = z.string().min(1, "Language support is required");
  }
  if (allRequiredFields.has('useCase')) {
    schemaFields.useCase = z.string().min(1, "Use case is required");
  }
  if (allRequiredFields.has('callScenarios')) {
    schemaFields.callScenarios = z.string().min(1, "Call scenarios are required");
  }
  if (allRequiredFields.has('voicePreferences')) {
    schemaFields.voicePreferences = z.string().min(1, "Voice preferences are required");
  }
  if (allRequiredFields.has('integrationRequirements')) {
    schemaFields.integrationRequirements = z.string().min(1, "Integration requirements are required");
  }
  // New Autonomous Agent fields
  if (allRequiredFields.has('taskTypes')) {
    schemaFields.taskTypes = z.string().min(1, "Task types are required");
  }
  if (allRequiredFields.has('automationScope')) {
    schemaFields.automationScope = z.string().min(1, "Automation scope is required");
  }
  if (allRequiredFields.has('systemRequirements')) {
    schemaFields.systemRequirements = z.string().min(1, "System requirements are required");
  }
  if (allRequiredFields.has('personalityTraits')) {
    schemaFields.personalityTraits = z.string().min(1, "Personality traits are required");
  }
  if (allRequiredFields.has('contentStyle')) {
    schemaFields.contentStyle = z.string().min(1, "Content style is required");
  }
  if (allRequiredFields.has('platformPreferences')) {
    schemaFields.platformPreferences = z.string().min(1, "Platform preferences are required");
  }

  return z.object(schemaFields);
};

interface OrderRequirementsFormProps {
  mainService: ConfiguratorOption;
  addons: ConfiguratorOption[];
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

const networks = [
  "Ethereum Mainnet",
  "Binance Smart Chain",
  "Polygon",
  "Arbitrum",
  "Optimism",
  "Custom"
];

const deploymentOptions = [
  "AWS",
  "Google Cloud Platform",
  "Microsoft Azure",
  "Custom Server",
  "To Be Discussed"
];

export default function OrderRequirementsForm({
  mainService,
  addons,
  onSubmit,
  isSubmitting = false,
}: OrderRequirementsFormProps) {
  const requirementsSchema = generateRequirementsSchema(mainService, addons);
  type RequirementsFormData = z.infer<typeof requirementsSchema>;

  const form = useForm<RequirementsFormData>({
    resolver: zodResolver(requirementsSchema),
    defaultValues: {
      projectName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      companyName: "",
    },
  });

  const allRequiredFields = new Set([
    ...(mainService.requiredFields || []),
    ...addons.flatMap(addon => addon.requiredFields || [])
  ]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Project Information */}
        <Card className="p-6 space-y-6">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6 space-y-6">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact name" {...field} />
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
                    <Input type="email" placeholder="Enter contact email" {...field} />
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
                    <Input placeholder="Enter contact phone" {...field} />
                  </FormControl>
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
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Blockchain Specific Fields */}
        {mainService.category === 'blockchain' && (
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Blockchain Requirements</h3>
            <div className="space-y-4">
              {allRequiredFields.has('contractName') && (
                <FormField
                  control={form.control}
                  name="contractName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Smart Contract Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contract name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {allRequiredFields.has('tokenomics') && (
                <FormField
                  control={form.control}
                  name="tokenomics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tokenomics Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your token distribution, supply, and economics"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {allRequiredFields.has('network') && (
                <FormField
                  control={form.control}
                  name="network"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Network</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {networks.map((network) => (
                            <SelectItem key={network} value={network}>
                              {network}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </Card>
        )}

        {/* AI Specific Fields */}
        {mainService.category === 'ai' && (
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">AI Model Requirements</h3>
            <div className="space-y-4">
              {allRequiredFields.has('modelType') && (
                <FormField
                  control={form.control}
                  name="modelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Classification, NLP, Computer Vision" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {allRequiredFields.has('dataDescription') && (
                <FormField
                  control={form.control}
                  name="dataDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your data structure and requirements"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('modelPreferences') && (
                <FormField
                  control={form.control}
                  name="modelPreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Preferences</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your model preferences" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('styleOptions') && (
                <FormField
                  control={form.control}
                  name="styleOptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Style Options</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your style options" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('computeRequirements') && (
                <FormField
                  control={form.control}
                  name="computeRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compute Requirements</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your compute requirements" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('legalDomains') && (
                <FormField
                  control={form.control}
                  name="legalDomains"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Domains</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe legal domains" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('jurisdictions') && (
                <FormField
                  control={form.control}
                  name="jurisdictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jurisdictions</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe jurisdictions" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('documentTypes') && (
                <FormField
                  control={form.control}
                  name="documentTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Types</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe document types" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('contentTypes') && (
                <FormField
                  control={form.control}
                  name="contentTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Types</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe content types" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('tonePreferences') && (
                <FormField
                  control={form.control}
                  name="tonePreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone Preferences</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe tone preferences" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('industryFocus') && (
                <FormField
                  control={form.control}
                  name="industryFocus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry Focus</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe industry focus" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('programmingLanguages') && (
                <FormField
                  control={form.control}
                  name="programmingLanguages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Programming Languages</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe programming languages" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('frameworkSupport') && (
                <FormField
                  control={form.control}
                  name="frameworkSupport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Framework Support</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe framework support" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('codeStylePreferences') && (
                <FormField
                  control={form.control}
                  name="codeStylePreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code Style Preferences</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe code style preferences" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('voiceCharacteristics') && (
                <FormField
                  control={form.control}
                  name="voiceCharacteristics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice Characteristics</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe voice characteristics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('languageSupport') && (
                <FormField
                  control={form.control}
                  name="languageSupport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language Support</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe language support" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('useCase') && (
                <FormField
                  control={form.control}
                  name="useCase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Use Case</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe use case" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('callScenarios') && (
                <FormField
                  control={form.control}
                  name="callScenarios"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call Scenarios</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe call scenarios" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('voicePreferences') && (
                <FormField
                  control={form.control}
                  name="voicePreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice Preferences</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe voice preferences" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('integrationRequirements') && (
                <FormField
                  control={form.control}
                  name="integrationRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Integration Requirements</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe integration requirements" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </Card>
        )}

        {/* Autonomous Agent Fields */}
        {mainService.category === 'autonomous' && (
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Agent Requirements</h3>
            <div className="space-y-4">
              {allRequiredFields.has('agentPurpose') && (
                <FormField
                  control={form.control}
                  name="agentPurpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Purpose</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the main purpose and goals of your autonomous agent"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {allRequiredFields.has('integrations') && (
                <FormField
                  control={form.control}
                  name="integrations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Integrations</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List any systems or APIs that the agent needs to interact with"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('taskTypes') && (
                <FormField
                  control={form.control}
                  name="taskTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Types</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe task types" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('automationScope') && (
                <FormField
                  control={form.control}
                  name="automationScope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Automation Scope</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe automation scope" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('systemRequirements') && (
                <FormField
                  control={form.control}
                  name="systemRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Requirements</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe system requirements" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('personalityTraits') && (
                <FormField
                  control={form.control}
                  name="personalityTraits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personality Traits</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe personality traits" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('contentStyle') && (
                <FormField
                  control={form.control}
                  name="contentStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Style</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe content style" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {allRequiredFields.has('platformPreferences') && (
                <FormField
                  control={form.control}
                  name="platformPreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform Preferences</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe platform preferences" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </Card>
        )}

        {/* Branding Fields */}
        {allRequiredFields.has('brandColors') && (
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Branding Requirements</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="brandColors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Colors</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., #FF0000, #00FF00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {allRequiredFields.has('targetAudience') && (
                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your target audience and market"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </Card>
        )}

        {/* Deployment Fields */}
        {allRequiredFields.has('deploymentEnvironment') && (
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">Deployment Requirements</h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="deploymentEnvironment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deployment Environment</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select deployment environment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {deploymentOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit Requirements"}
        </Button>
      </form>
    </Form>
  );
}