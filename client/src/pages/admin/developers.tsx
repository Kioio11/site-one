import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Code2, GitBranch, Timer, Briefcase, Mail, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin-layout";
import { sendEmail } from "@/utils/email";

// Mock data - Replace with actual API integration
const mockDevelopers = [
  {
    id: 1,
    name: "John Doe",
    role: "Blockchain Developer",
    skills: ["Solidity", "Web3.js", "React"],
    activeProjects: [
      { id: 1, name: "DeFi Platform", deadline: "2025-03-01" },
      { id: 2, name: "NFT Marketplace", deadline: "2025-04-15" }
    ],
    completedProjects: 15,
    avatar: "",
    email: "john.doe@example.com"
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "AI Engineer",
    skills: ["Python", "TensorFlow", "PyTorch"],
    activeProjects: [
      { id: 3, name: "ML Pipeline", deadline: "2025-03-20" }
    ],
    completedProjects: 8,
    avatar: "",
    email: "jane.smith@example.com"
  },
];

interface AssignProjectDialogProps {
  developer: typeof mockDevelopers[0];
  onAssign: (devId: number, projectDetails: any) => void;
}

function AssignProjectDialog({ developer, onAssign }: AssignProjectDialogProps) {
  const [projectName, setProjectName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [requirements, setRequirements] = useState("");

  const handleSubmit = () => {
    onAssign(developer.id, {
      name: projectName,
      deadline,
      requirements
    });
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Assign Project to {developer.name}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Project Name</label>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Deadline</label>
          <Input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Requirements</label>
          <Input
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Project requirements and notes"
          />
        </div>
        <Button onClick={handleSubmit} className="w-full">
          Assign Project
        </Button>
      </div>
    </DialogContent>
  );
}

export default function AdminDevelopers() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAssignProject = async (devId: number, projectDetails: any) => {
    try {
      // TODO: Replace with actual API call
      console.log("Assigning project:", { devId, projectDetails });

      const developer = mockDevelopers.find(dev => dev.id === devId);
      if (!developer) {
        throw new Error("Developer not found");
      }

      // Send email notification
      const emailSuccess = await sendEmail({
        to: developer.email,
        subject: `New Project Assignment: ${projectDetails.name}`,
        text: `
Hello ${developer.name},

You have been assigned a new project:

Project Name: ${projectDetails.name}
Deadline: ${new Date(projectDetails.deadline).toLocaleDateString()}

Requirements:
${projectDetails.requirements}

Please review the project details and begin work according to the specified timeline.

Best regards,
Admin Team
      `.trim(),
      });

      toast({
        title: emailSuccess ? "Project Assigned" : "Project Assigned (Email Failed)",
        description: emailSuccess 
          ? "Developer has been notified via email."
          : "Project assigned but email notification failed.",
        variant: emailSuccess ? "default" : "destructive",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign project. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Developer Management</h2>
            <p className="text-muted-foreground">
              Manage developers and their project assignments
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Developer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Developer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input placeholder="Enter developer name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Input placeholder="Enter role" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Skills</label>
                  <Input placeholder="Enter skills (comma-separated)" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="developer@example.com" />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setIsCreateDialogOpen(false)}>
                    Add Developer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Code2 className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-primary">Total Developers</h3>
              </div>
              <div className="text-2xl font-bold mt-2">{mockDevelopers.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <GitBranch className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-primary">Active Projects</h3>
              </div>
              <div className="text-2xl font-bold mt-2">
                {mockDevelopers.reduce((sum, dev) => sum + dev.activeProjects.length, 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-primary">Completed Projects</h3>
              </div>
              <div className="text-2xl font-bold mt-2">
                {mockDevelopers.reduce((sum, dev) => sum + dev.completedProjects, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockDevelopers.map((developer) => (
            <Card key={developer.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={developer.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {developer.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{developer.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>{developer.role}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {developer.email}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {developer.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-primary/10 text-primary hover:bg-primary/15"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Active Projects</h4>
                    <ScrollArea className="h-[100px] rounded-md border bg-muted/5 p-2">
                      {developer.activeProjects.map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between py-2 px-2"
                        >
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <span className="font-medium">{project.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(project.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Active: {developer.activeProjects.length}
                    </span>
                    <span className="text-muted-foreground">
                      Completed: {developer.completedProjects}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/5 rounded-b-lg">
                <div className="flex justify-end w-full space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-primary/90 hover:bg-primary">
                        Assign Project
                      </Button>
                    </DialogTrigger>
                    <AssignProjectDialog
                      developer={developer}
                      onAssign={handleAssignProject}
                    />
                  </Dialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}