import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Grid3X3, 
  List, 
  Plus,
  Users,
  Clock,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  Copy,
  MoreVertical,
  Rocket,
  Zap
} from "lucide-react";
import { castingCallAPI, subscriptionAPI, projectAPI } from "@/lib/api";
import { toast } from "sonner";
import { formatLocation } from "@/lib/utils";
import { getStripe } from "@/lib/stripe";
import { getStatusLabel, getStatusClass, isOpenStatus, isDraftStatus, getProjectDeadline } from "@/lib/project.utils";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function DirectorProjects() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);
  const { activeWorkspace, getPermissionsForProject } = useWorkspace();
  const globalPermissions = getPermissionsForProject(); // To check editProject for "New Casting Call"

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const isPersonal = activeWorkspace === "Personal";
      let projectData: any[] = [];
      
      const getLocalProjects = async () => {
        let extractedProjects: any[] = [];
        if (activeWorkspace !== "Personal") {
          if (activeWorkspace.projectGrants && activeWorkspace.projectGrants.length > 0) {
            const promises = activeWorkspace.projectGrants.map(async (grant: any) => {
              const p = grant.projectId;
              if (p && typeof p === 'object' && (p._id || p.id)) {
                return p.castingCall || p.project || p;
              }
              if (typeof p === 'string') {
                const res = await projectAPI.getOne(p).catch(() => null);
                const data = res?.data?.data;
                return data?.castingCall || data?.project || data;
              }
              return null;
            });
            const results = await Promise.all(promises);
            extractedProjects = results.filter(Boolean);
          }
          
          if (extractedProjects.length === 0) {
            let singleProject = activeWorkspace.project || activeWorkspace.castingCall;
            if (singleProject && typeof singleProject === 'string') {
              const res = await projectAPI.getOne(singleProject).catch(() => null);
              const data = res?.data?.data;
              singleProject = data?.castingCall || data?.project || data;
            }
            if (singleProject && typeof singleProject === 'object' && (singleProject._id || singleProject.id)) {
              const unwrapped = singleProject.castingCall || singleProject.project || singleProject;
              extractedProjects = [unwrapped];
            }
          }
        }
        return extractedProjects;
      };

      try {
        const ownerId = !isPersonal ? (
          activeWorkspace.owner?._id || 
          activeWorkspace.owner || 
          activeWorkspace.inviter?._id || 
          activeWorkspace.inviter
        ) : null;

        if (!isPersonal && !ownerId) {
          throw new Error("Owner ID is undefined");
        }

        const response = isPersonal 
          ? await projectAPI.getMe() 
          : await projectAPI.getWorkspaceProjects(ownerId as string);
          
        if (response.data.success && response.data.data) {
          // Handle both direct array and nested structure
          projectData = Array.isArray(response.data.data) 
            ? response.data.data 
            : response.data.data.projects || response.data.data.castingCalls || [];
        }

        if (!isPersonal && projectData.length === 0) {
          projectData = await getLocalProjects();
        }

        if (!isPersonal && activeWorkspace.projectGrants && activeWorkspace.projectGrants.length > 0) {
          const grantedIds = activeWorkspace.projectGrants.map((g: any) => 
            typeof g.projectId === "object" ? g.projectId._id || g.projectId.id : g.projectId
          );
          projectData = projectData.filter((p: any) => grantedIds.includes(p._id || p.id));
        }
      } catch (apiError) {
        if (!isPersonal) {
          console.warn("Failed to fetch workspace projects from API, falling back to local data:", apiError);
          projectData = await getLocalProjects();
        } else {
          throw apiError;
        }
      }
      
      setProjects(projectData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load projects");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeWorkspace]);

  const handleDelete = async (id: string) => {
    if (!await confirm("Are you sure you want to delete this casting call?")) return;
    try {
      const response = await projectAPI.delete(id);
      if (response.data.success) {
        toast.success("Project deleted successfully");
        setProjects(prev => prev.filter(p => (p._id || p.id) !== id));
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to delete project";
      toast.error(message);
    }
  };

  const handleCloseProject = async (id: string) => {
    if (!await confirm("Are you sure you want to close this casting call? No new deliverables will be accepted.")) return;
    try {
      const response = await castingCallAPI.close(id);
      if (response.data.success) {
        toast.success("Project closed successfully");
        fetchProjects(); // Refresh to get the updated status
      } else {
        toast.error(response.data.message || "Failed to close project");
      }
    } catch (error) {
      toast.error("An error occurred while closing the project");
      console.error(error);
    }
  };

  const handleDuplicate = async (project: any) => {
    setIsDuplicating(project.id || project._id);
    try {
      const payload = {
        projectName: `${project.projectName} (Copy)`,
        projectType: project.projectType,
        title: project.title,
        description: project.description,
        requirements: project.requirements,
        category: project.category,
        location: project.location,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 30 days from now
        status: "draft",
        image: project.image,
      };

      const response = await projectAPI.create(payload);
      if (response.data.success) {
        const projectId = response.data.data?.id || response.data.data?._id || response.data.data;
        const rolesToDuplicate = project.roles || [{
          roleName: project.title,
          description: project.description,
          requirements: project.requirements
        }];
        if (rolesToDuplicate.length > 0) {
           await Promise.all(rolesToDuplicate.map((r: any) => projectAPI.createRole(projectId, r)));
        }
        toast.success("Project duplicated as draft");
        fetchProjects();
      }
    } catch (error) {
      toast.error("Failed to duplicate project");
    } finally {
      setIsDuplicating(null);
    }
  };

  const handlePayAndPublish = async (project: any) => {
    setIsProcessingPayment(project.id || project._id);
    try {
      let response;
      
      // We determine which endpoint to call based on the flags
      if (project.featuredPosting) {
        response = await castingCallAPI.boost(project.id || project._id);
      } else if (project.urgentHiringBadge || project.instantPosting) {
        response = await castingCallAPI.instantPost(project.id || project._id);
      } else {
        toast.error("No valid boost selected.");
        setIsProcessingPayment(null);
        return;
      }

      if (response.data.success) {
        const { url } = response.data.data;
        if (url) {
          window.location.href = url;
        } else {
          toast.error("Invalid response from server.");
        }
      } else {
        toast.error("Could not initiate payment. Please try again.");
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error("Failed to initiate payment");
    } finally {
      setIsProcessingPayment(null);
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (activeTab === "all") return true;
    if (activeTab === "open") return isOpenStatus(project.status);
    if (activeTab === "closed") return ["closed", "cancelled", "filled"].includes((project.status || "").toLowerCase());
    if (activeTab === "drafts") return isDraftStatus(project.status);
    if (activeTab === "pending") {
      const s = (project.status || "").toLowerCase();
      return s === "pending" || s === "pending_review" || s === "pending_approval";
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">Manage all your casting calls and projects</p>
        </div>
        {globalPermissions.editProject && (
          <Button asChild>
            <Link to="/director/create">
              <Plus className="w-4 h-4 mr-2" />
              New Casting Call
            </Link>
          </Button>
        )}
      </div>

      {/* Tabs and View Toggle */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === "grid" ? "secondary" : "ghost"} 
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === "list" ? "secondary" : "ghost"} 
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.length > 0 ? filteredProjects.map((project: any) => {
            const projectPermissions = getPermissionsForProject(project.id || project._id);
            return (
            <Card key={project.id || project._id} className="card-elevated">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold truncate max-w-[150px]">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.category}</p>
                  </div>
                  <Badge className={getStatusClass(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>

                <div className="space-y-2 text-xs text-muted-foreground mb-4">
                  {/* <div className="flex justify-between">
                    <span>Deliverables:</span>
                    <span className="font-medium text-foreground">{project.applicationCount || 0}</span>
                  </div> */}
                  <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span className="font-medium text-foreground">{getProjectDeadline(project)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium text-foreground">{formatLocation(project.location)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDraftStatus(project.status) ? (
                    (project.featuredPosting || project.urgentHiringBadge || project.instantPosting) ? (
                      projectPermissions.editProject && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white border-none shadow-sm"
                          onClick={() => handlePayAndPublish(project)}
                          disabled={isProcessingPayment === (project.id || project._id)}
                        >
                          {isProcessingPayment === (project.id || project._id) ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Zap className="w-3 h-3 mr-1 fill-white" />
                          )}
                          Pay & Publish
                        </Button>
                      )
                    ) : (
                      projectPermissions.editProject && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1 bg-[#009698] hover:bg-[#009698]/90 text-white border-none shadow-sm"
                          asChild
                        >
                          <Link to={`/director/projects/${project.id || project._id}/edit`}>
                            <Rocket className="w-3 h-3 mr-1" />
                            Publish Project
                          </Link>
                        </Button>
                      )
                    )
                  ) : (
                    <div className="flex gap-2 flex-1">
                      {projectPermissions.viewApplicants && (
                        <Button variant="outline" size="sm" className="flex-1 px-1 text-[10px]" asChild>
                          <Link to={`/director/submissions/${project.id || project._id}`}>
                            <Users className="w-3 h-3 mr-1" />
                            Deliverables
                          </Link>
                        </Button>
                      )}
                      {projectPermissions.viewApplicants && (
                        <Button variant="outline" size="sm" className="flex-1 px-1 text-[10px]" asChild>
                          <Link to={`/director/applicants?project=${project.id || project._id}`}>
                            <Users className="w-3 h-3 mr-1" />
                            Applicants
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="px-2">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/director/projects/${project.id || project._id}`}>
                          <Eye className="w-4 h-4 mr-2" /> Preview
                        </Link>
                      </DropdownMenuItem>
                      {projectPermissions.editProject && (
                        <>
                          <DropdownMenuItem onClick={() => navigate(`/director/projects/${project.id || project._id}/edit`)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive" 
                            onClick={() => handleDelete(project.id || project._id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Project
                          </DropdownMenuItem>
                          {isOpenStatus(project.status) && (
                            <DropdownMenuItem 
                              onClick={() => handleCloseProject(project.id || project._id)}
                            >
                              <MoreVertical className="w-4 h-4 mr-2" /> Close Project
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          )}) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
               No projects found in this category.
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredProjects.length > 0 ? filteredProjects.map((project) => {
            const projectPermissions = getPermissionsForProject(project.id || project._id);
            return (
            <Card key={project.id || project._id} className="card-elevated">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{project.title}</h3>
                      <Badge 
                        className={
                          getStatusClass(project.status)
                        }
                      >
                        {getStatusLabel(project.status)}
                      </Badge>
                      <Badge variant="secondary">{project.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {/* <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.applicationCount || 0} deliverables
                      </span> */}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Deadline: {getProjectDeadline(project)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {isDraftStatus(project.status) ? (
                      (project.featuredPosting || project.urgentHiringBadge || project.instantPosting) ? (
                        projectPermissions.editProject && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-amber-600 hover:bg-amber-700 text-white border-none shadow-sm"
                            onClick={() => handlePayAndPublish(project)}
                            disabled={isProcessingPayment === (project.id || project._id)}
                          >
                            {isProcessingPayment === (project.id || project._id) ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Zap className="w-3 h-3 mr-1 fill-white" />
                            )}
                            Pay & Publish
                          </Button>
                        )
                      ) : (
                        projectPermissions.editProject && (
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-[#009698] hover:bg-[#009698]/90 text-white border-none shadow-sm"
                            asChild
                          >
                            <Link to={`/director/projects/${project.id || project._id}/edit`}>
                              <Rocket className="w-3 h-3 mr-1" />
                              Publish
                            </Link>
                          </Button>
                        )
                      )
                    ) : (
                      <div className="flex gap-2">
                        {projectPermissions.viewApplicants && (
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/director/submissions/${project.id || project._id}`}>
                              <Users className="w-3 h-3 mr-1" />
                              Deliverables
                            </Link>
                          </Button>
                        )}
                        {projectPermissions.viewApplicants && (
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/director/applicants?project=${project.id || project._id}`}>
                              <Users className="w-3 h-3 mr-1" />
                              Applicants
                            </Link>
                          </Button>
                        )}
                      </div>
                    )}
                    {projectPermissions.editProject && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/director/projects/${project.id || project._id}/edit`}>
                          <Pencil className="w-3 h-3 mr-1" />
                          Edit
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/director/projects/${project.id || project._id}`}>
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Link>
                    </Button>
                    {projectPermissions.editProject && isOpenStatus(project.status) && (
                      <Button variant="outline" size="sm" className="text-warning" onClick={() => handleCloseProject(project.id || project._id)}>
                        <MoreVertical className="w-3 h-3 mr-1" />
                        Close
                      </Button>
                    )}
                    {projectPermissions.editProject && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(project.id || project._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}) : (
            <div className="text-center py-12 text-muted-foreground">
               No projects found in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import CollaboratorProjects from "./CollaboratorProjects";

export default function MyProjects() {
  const { activeWorkspace } = useWorkspace();
  
  if (activeWorkspace !== "Personal") {
    return <CollaboratorProjects />;
  }
  return <DirectorProjects />;
}
