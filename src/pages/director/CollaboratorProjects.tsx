import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Grid3X3, 
  List, 
  Users, 
  Clock, 
  MessageSquare, 
  Layers,
  Search,
  Calendar,
  Lock,
  Eye,
  Settings,
  Loader2
} from "lucide-react";
import { formatLocation } from "@/lib/utils";
import { getStatusLabel, getStatusClass, getProjectDeadline } from "@/lib/project.utils";
import { useWorkspace, Collaboration } from "@/contexts/WorkspaceContext";
import { collaboratorAPI, projectAPI } from "@/lib/api";
import { toast } from "sonner";


export default function CollaboratorProjects() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const { activeWorkspace, isLoading: contextLoading } = useWorkspace();

  const [isLoading, setIsLoading] = useState(true);

  const isPersonal = activeWorkspace === "Personal";
  const workspaceOwnerName = !isPersonal && typeof activeWorkspace === "object"
    ? activeWorkspace.owner?.fullName
    : "Director";

  useEffect(() => {
    const resolveProjects = async () => {
      if (contextLoading) return;
      if (isPersonal) {
        setProjects([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const grants = (activeWorkspace as any)?.projectGrants || [];
        const promises = grants.map(async (grant: any) => {
          const p = grant.projectId;
          let projectDetails: any = null;
          if (p && typeof p === "object") {
            projectDetails = p;
          } else if (typeof p === "string") {
            try {
              const res = await projectAPI.getOne(p);
              if (res.data?.success) {
                projectDetails = res.data.data?.castingCall || res.data.data?.project || res.data.data;
              }
            } catch (err) {
              console.error("Failed to fetch project details for collaborator:", p, err);
            }
          }
          
          if (projectDetails) {
            return {
              ...projectDetails,
              _id: projectDetails._id || projectDetails.id,
              id: projectDetails._id || projectDetails.id,
              title: projectDetails.title || projectDetails.projectName,
              projectName: projectDetails.projectName || projectDetails.title,
              roles: projectDetails.roles || [],
              permissions: grant.permissions || {}
            };
          }
          return null;
        });
        
        const results = await Promise.all(promises);
        setProjects(results.filter(Boolean));
      } catch (error) {
        console.error("Failed to load collaborator projects:", error);
        toast.error("Failed to load collaborator projects.");
      } finally {
        setIsLoading(false);
      }
    };
    resolveProjects();
  }, [activeWorkspace, contextLoading, isPersonal]);

  // Filter project listings
  const filteredProjects = projects.filter((project: any) => {
    const matchesSearch = (project.projectName || project.title || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const isClosed = project.status === "closed" || project.status === "archived";
    const isDraft = project.status === "draft";
    const isActive = !isClosed && !isDraft;

    if (activeTab === "active") return matchesSearch && isActive;
    if (activeTab === "closed") return matchesSearch && isClosed;
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
              Collaborator Mode
            </span>
            <span className="text-slate-400 text-xs">
              workspace: {workspaceOwnerName}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Shared Projects</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Manage submissions and collaborate on projects assigned to you.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-slate-50 border-slate-200 rounded-xl text-xs focus-visible:ring-1 focus-visible:ring-primary/20"
            />
          </div>
          <div className="bg-slate-100 p-0.5 rounded-xl flex">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="w-9 h-9 rounded-lg"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="w-9 h-9 rounded-lg"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100/80 p-1 rounded-xl mb-4">
          <TabsTrigger value="all" className="rounded-lg text-xs font-semibold px-4 py-1.5">All Projects</TabsTrigger>
          <TabsTrigger value="active" className="rounded-lg text-xs font-semibold px-4 py-1.5">Active</TabsTrigger>
          <TabsTrigger value="closed" className="rounded-lg text-xs font-semibold px-4 py-1.5">Closed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredProjects.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project: any) => {
                  const pId = project._id || project.id;
                  const perms = project.permissions || {};
                  
                  return (
                    <Card key={pId} className="group border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden bg-white">
                      <CardContent className="p-6 space-y-4">
                        {/* Title and Badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h3 className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors leading-tight line-clamp-1">
                              {project.projectName || project.title}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-medium capitalize">
                              {project.category || "General"}
                            </span>
                          </div>
                          <Badge className={getStatusClass(project.status)}>
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                          {project.description || "No project description available."}
                        </p>

                        {/* Permission Badges */}
                        <div className="pt-1.5 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Your Permissions
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {perms.viewApplicants && (
                              <Badge variant="outline" className="text-[9px] bg-sky-50 text-sky-700 border-sky-200">
                                View Applicants
                              </Badge>
                            )}
                            {perms.sendMessages && (
                              <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">
                                Send Messages
                              </Badge>
                            )}
                            {perms.addNotes && (
                              <Badge variant="outline" className="text-[9px] bg-violet-50 text-violet-700 border-violet-200">
                                Add Notes
                              </Badge>
                            )}
                            {perms.editProject && (
                              <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200">
                                Edit Details
                              </Badge>
                            )}
                            {Object.values(perms).every(v => !v) && (
                              <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-400 border-slate-200">
                                Read Only
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Metadata Details */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{getProjectDeadline(project.deadline)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            <span>{(project.roles || []).length} casting roles</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2">
                          {perms.viewApplicants ? (
                            <Button
                              className="flex-1 h-9 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-xs transition-all shadow-md shadow-primary/10"
                              onClick={() => navigate(`/director/applicants?projectId=${pId}`)}
                            >
                              <Users className="w-3.5 h-3.5 mr-1.5" />
                              Applicants
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              className="flex-1 h-9 rounded-xl border-slate-200 text-slate-600 font-semibold text-xs"
                              onClick={() => navigate(`/director/projects/${pId}`)}
                            >
                              <Eye className="w-3.5 h-3.5 mr-1.5" />
                              View Project
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            className="w-9 h-9 rounded-xl p-0 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                            onClick={() => navigate(`/director/messages?projectId=${pId}`)}
                            title="Open group chat"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              // List View
              <div className="border border-slate-100 rounded-2xl bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold">
                        <th className="p-4">Project Details</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">My Permissions</th>
                        <th className="p-4">Deadline</th>
                        <th className="p-4">Roles</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredProjects.map((project: any) => {
                        const pId = project._id || project.id;
                        const perms = project.permissions || {};
                        
                        return (
                          <tr key={pId} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm leading-tight mb-0.5">
                                  {project.projectName || project.title}
                                </h4>
                                <span className="text-[10px] text-slate-400 capitalize">{project.category || "General"}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusClass(project.status)}>
                                {getStatusLabel(project.status)}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {perms.viewApplicants && (
                                  <Badge variant="outline" className="text-[8px] bg-sky-50 text-sky-700 border-sky-100 px-1 py-0">View Applicants</Badge>
                                )}
                                {perms.sendMessages && (
                                  <Badge variant="outline" className="text-[8px] bg-emerald-50 text-emerald-700 border-emerald-100 px-1 py-0">Messages</Badge>
                                )}
                                {perms.editProject && (
                                  <Badge variant="outline" className="text-[8px] bg-amber-50 text-amber-700 border-amber-100 px-1 py-0">Edit Details</Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-slate-500">
                              {getProjectDeadline(project.deadline)}
                            </td>
                            <td className="p-4 font-semibold text-slate-600">
                              {(project.roles || []).length} roles
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {perms.viewApplicants ? (
                                  <Button
                                    size="sm"
                                    className="h-8 rounded-lg bg-primary hover:bg-primary/95 text-white font-semibold text-xs px-3"
                                    onClick={() => navigate(`/director/applicants?projectId=${pId}`)}
                                  >
                                    Applicants
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-lg border-slate-200 text-slate-600 font-semibold text-xs px-3"
                                    onClick={() => navigate(`/director/projects/${pId}`)}
                                  >
                                    View Details
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  className="w-8 h-8 rounded-lg p-0 hover:bg-slate-100 text-slate-500"
                                  onClick={() => navigate(`/director/messages?projectId=${pId}`)}
                                  title="Open group chat"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-3xl py-16 px-4 bg-white text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No shared projects yet</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-sm">
                Projects shared with you by workspace owners will appear here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
