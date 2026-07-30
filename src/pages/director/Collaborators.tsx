import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Users, Mail, UserPlus, 
  MoreVertical, Trash2, FolderOpen,
  RefreshCw, ShieldAlert
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { collaboratorAPI, projectAPI } from "@/lib/api";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface Teammate {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  avatar?: string;
  status: "active" | "pending";
  lastActive?: string;
  assignedProject?: string;
  accessScope?: "all_projects" | "selected_projects";
  projectIds?: string[];
  raw?: any;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

const timeAgo = (dateInput: string | Date | undefined) => {
  if (!dateInput) return undefined;
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const ms = Date.now() - date.getTime();
  if (!Number.isFinite(ms) || ms < 0) return undefined;
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

export default function Collaborators() {
  const { activeWorkspace } = useWorkspace();
  const [team, setTeam] = useState<Teammate[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [customProjectName, setCustomProjectName] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [projectsFetched, setProjectsFetched] = useState(false);
  const [accessScope, setAccessScope] = useState<"all_projects" | "selected_projects">("all_projects");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const [editingCollaborator, setEditingCollaborator] = useState<Teammate | null>(null);
  const [editScope, setEditScope] = useState<"all_projects" | "selected_projects">("all_projects");
  const [editProjectIds, setEditProjectIds] = useState<string[]>([]);
  const [isUpdatingScope, setIsUpdatingScope] = useState(false);

  const fetchCollaborators = async () => {
    setIsLoadingCollaborators(true);
    try {
      const res = await collaboratorAPI.getAll();
      console.log("Collaborators API response:", JSON.stringify(res, null, 2));
      const data = Array.isArray(res.data?.data) ? res.data.data : 
        (Array.isArray(res.data) ? res.data : []);
      
      const mapped = data.map((collab: any) => {
        const email = collab.email || collab.user?.email || collab.invitedUser?.email || collab.inviteEmail || "";
        
        // Extract project grants or project IDs
        const grants = Array.isArray(collab.projectGrants) ? collab.projectGrants : [];
        const projectIds: string[] = grants
          .map((g: any) => (typeof g.projectId === "object" ? g.projectId._id || g.projectId.id : g.projectId))
          .filter(Boolean);
        
        if (collab.project) {
          const singleId = typeof collab.project === "object" ? collab.project._id || collab.project.id : collab.project;
          if (singleId && !projectIds.includes(singleId)) projectIds.push(singleId);
        }

        if (collab.projectId) {
          const singleId = typeof collab.projectId === "object" ? collab.projectId._id || collab.projectId.id : collab.projectId;
          if (singleId && !projectIds.includes(singleId)) projectIds.push(singleId);
        }

        const isSelectedScope = collab.accessScope === "selected_projects" || (collab.accessScope ? collab.accessScope !== "all_projects" : projectIds.length > 0);

        let assignedProject = "All Projects";
        if (isSelectedScope && projectIds.length > 0) {
          if (projectIds.length === 1) {
            const foundProj = projects.find((p: any) => (p._id || p.id) === projectIds[0]);
            assignedProject = foundProj?.projectName || foundProj?.title || collab.project?.title || collab.projectName || "1 Project";
          } else {
            assignedProject = `${projectIds.length} Projects`;
          }
        }

        return {
          id: collab._id || collab.id || collab.userId || "",
          raw: collab,
          name: collab.user?.fullName || collab.name || collab.invitedUser?.fullName || email.split('@')[0] || "Unknown",
          email: email,
          role: (collab.role || collab.permission || collab.roleName || "viewer") as any,
          avatar: collab.user?.profilePicture || collab.invitedUser?.profilePicture,
          status: collab.status === "accepted" ? "active" : (collab.status || "pending"),
          lastActive: timeAgo(collab.updatedAt || collab.lastActiveAt),
          assignedProject: assignedProject,
          accessScope: isSelectedScope ? "selected_projects" : "all_projects",
          projectIds: projectIds
        };
      });
      setTeam(mapped);
    } catch (e) {
      console.error("Failed to load collaborators:", e);
      setTeam([]);
    } finally {
      setIsLoadingCollaborators(false);
    }
  };

  const fetchMyProjects = async () => {
    if (projectsFetched) return;
    setIsLoadingProjects(true);
    try {
      const response = await projectAPI.getMe();
      if (response.data.success && response.data.data) {
        const projectData = Array.isArray(response.data.data) 
          ? response.data.data 
          : response.data.data.projects || response.data.data.castingCalls || [];
        setProjects(projectData);
        if (projectData.length > 0) {
          setSelectedProjectId(projectData[0]._id || projectData[0].id);
          setCustomProjectName(projectData[0].projectName || projectData[0].title);
        }
      }
    } catch (e) {
      console.error("Failed to load projects:", e);
    } finally {
      setIsLoadingProjects(false);
      setProjectsFetched(true);
    }
  };

  useEffect(() => {
    fetchCollaborators();
    fetchMyProjects();
  }, []);

  const assignedProjName = useMemo(() => {
    if (customProjectName) return customProjectName;
    if (selectedProjectId) {
      const selectedProj = projects.find((p) => (p._id || p.id) === selectedProjectId);
      if (selectedProj) return selectedProj.projectName || selectedProj.title;
    }
    return "All Projects";
  }, [customProjectName, projects, selectedProjectId]);

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjectIds(prev => 
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) {
      toast.error("Please enter an email address.");
      return;
    }
    if (accessScope === "selected_projects" && selectedProjectIds.length === 0) {
      toast.error("Please select at least one project.");
      return;
    }
    setInviting(true);
    try {
      const inviteData: any = {
        inviteEmail: email,
        accessScope: accessScope,
        projectGrants: accessScope === "selected_projects" 
          ? selectedProjectIds.map(projectId => ({ projectId }))
          : []
      };
      
      console.log("Sending invite data:", JSON.stringify(inviteData, null, 2));
      await collaboratorAPI.invite(inviteData);

      toast.success(`Invitation sent to ${email}`);
      setInviteEmail("");
      setSelectedProjectIds([]);
      // Refresh collaborators list
      fetchCollaborators();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send invitation.");
    } finally {
      setInviting(false);
    }
  };

  const removeTeammate = async (id: string) => {
    try {
      await collaboratorAPI.revoke(id);
      toast.success("Collaborator removed successfully.");
      fetchCollaborators();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove collaborator.");
    }
  };

  const resendInvitation = async (id: string) => {
    try {
      await collaboratorAPI.resendInvitation(id);
      toast.success("Invitation resent successfully.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resend invitation.");
    }
  };

  const openEditScopeModal = (member: Teammate) => {
    setEditingCollaborator(member);
    setEditScope(member.accessScope || "all_projects");
    setEditProjectIds(member.projectIds || []);
  };

  const handleSaveAccessScope = async () => {
    if (!editingCollaborator) return;
    
    if (editScope === "selected_projects" && editProjectIds.length === 0) {
      toast.error("Please select at least one project.");
      return;
    }

    setIsUpdatingScope(true);
    try {
      const projectGrants = editScope === "selected_projects" 
        ? editProjectIds.map(pId => ({ projectId: pId })) 
        : [];

      const payload: any = {
        accessScope: editScope,
        projectGrants: projectGrants,
      };
      if (editScope === "selected_projects" && editProjectIds[0]) {
        payload.projectId = editProjectIds[0];
      }

      await collaboratorAPI.updatePermissions(editingCollaborator.id, payload);

      toast.success("Access scope updated successfully.");
      setEditingCollaborator(null);
      fetchCollaborators();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update access scope.");
    } finally {
      setIsUpdatingScope(false);
    }
  };

  if (activeWorkspace !== "Personal" && !activeWorkspace.permissions?.manageCollaborators) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <ShieldAlert className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Not Authorized</h2>
        <p className="text-muted-foreground">You do not have permission to manage collaborators for this workspace.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Users className="w-6 h-6 text-[#009698]" /> Team Collaborators
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Invite hiring staff, producers, and casting assistants to collaborate on your projects.
          </p>
        </div>
        <Button variant="ghost" onClick={fetchCollaborators} className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${isLoadingCollaborators ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Team List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-3xl border-none shadow-xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-bold text-slate-900">Active Collaborators</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {isLoadingCollaborators ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading collaborators...
                </div>
              ) : team.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No teammates added yet. Use the sidebar form to invite collaborators.
                </div>
              ) : (
                team.map((member) => (
                  <Card key={member.id} className="group hover:shadow-md transition-all shadow-sm rounded-2xl border-slate-100 overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-[#DEFCFE] text-[#009698] font-bold text-sm">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                     <p className="font-bold text-sm text-slate-900 truncate">{member.name}</p>
                     <Badge variant={member.status === "active" ? "secondary" : "outline"} className="text-[10px] h-4 py-0 rounded-full font-bold">
                       {member.status}
                     </Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{member.email}</p>
                  {member.assignedProject && (
                    <button 
                      type="button"
                      onClick={() => openEditScopeModal(member)}
                      className="text-[11px] text-[#009698] font-bold mt-1 flex items-center gap-1 hover:underline cursor-pointer text-left"
                      title="Click to change access scope"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-[#009698]" />
                      <span className="truncate">{member.assignedProject}</span>
                    </button>
                  )}
                </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {member.lastActive && (
                          <div className="hidden sm:flex flex-col items-end">
                            <p className="text-[10px] text-muted-foreground">Active {member.lastActive}</p>
                          </div>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-900">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-slate-100">
                            <DropdownMenuItem className="font-medium cursor-pointer" onClick={() => openEditScopeModal(member)}>
                              <FolderOpen className="w-4 h-4 mr-2 text-[#009698]" /> Change Access Scope
                            </DropdownMenuItem>
                            {member.status === "pending" && (
                              <DropdownMenuItem className="font-medium cursor-pointer" onClick={() => resendInvitation(member.id)}>Resend Invitation</DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive font-medium cursor-pointer" onClick={() => removeTeammate(member.id)}>
                              <Trash2 className="w-4 h-4 mr-2" /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Invite Sidebar */}
        <div className="space-y-4">
          <Card className="border-[#DEFCFE] bg-[#DEFCFE]/20 rounded-3xl shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#009698]" /> Invite Teammate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="email" 
                      placeholder="teammate@company.com" 
                      className="pl-10 rounded-xl" 
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      disabled={inviting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Access Scope</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Badge 
                      variant={accessScope === "all_projects" ? "default" : "outline"} 
                      className={cn(
                        "justify-center cursor-pointer py-2 rounded-xl transition-all border-slate-200 text-xs font-bold shadow-sm",
                        accessScope === "all_projects" 
                          ? "bg-[#009698] text-white border-transparent hover:bg-[#009698]/90" 
                          : "bg-background text-slate-600 hover:bg-slate-50"
                      )}
                      onClick={() => !inviting && setAccessScope("all_projects")}
                    >
                      All Projects
                    </Badge>
                    <Badge 
                      variant={accessScope === "selected_projects" ? "default" : "outline"} 
                      className={cn(
                        "justify-center cursor-pointer py-2 rounded-xl transition-all border-slate-200 text-xs font-bold shadow-sm",
                        accessScope === "selected_projects" 
                          ? "bg-[#009698] text-white border-transparent hover:bg-[#009698]/90" 
                          : "bg-background text-slate-600 hover:bg-slate-50"
                      )}
                      onClick={() => !inviting && setAccessScope("selected_projects")}
                    >
                      Selected Projects
                    </Badge>
                  </div>
                </div>

                {accessScope === "selected_projects" && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-slate-500">Select Projects</label>
                    {isLoadingProjects ? (
                      <div className="h-20 bg-slate-100 animate-pulse rounded-xl" />
                    ) : projects.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {projects.map(p => {
                          const projectId = p._id || p.id;
                          const isSelected = selectedProjectIds.includes(projectId);
                          return (
                            <div key={projectId} className="flex items-center gap-3 p-3 rounded-xl bg-white border">
                              <Checkbox 
                                id={`project-${projectId}`} 
                                checked={isSelected}
                                onCheckedChange={() => toggleProjectSelection(projectId)}
                                disabled={inviting}
                              />
                              <Label htmlFor={`project-${projectId}`} className="text-sm font-medium text-slate-900 cursor-pointer">
                                {p.projectName || p.title}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">No projects available.</div>
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-[#009698] hover:bg-[#009698]/90 text-white font-bold rounded-xl py-5 shadow-lg shadow-[#009698]/10 transition-transform active:scale-[0.99]"
                  disabled={inviting}
                >
                  {inviting ? "Sending..." : "Send Invitation"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Access Scope Modal */}
      <Dialog open={!!editingCollaborator} onOpenChange={(open) => !open && setEditingCollaborator(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Manage Access Scope</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update project access permissions for <span className="font-semibold text-slate-900">{editingCollaborator?.name}</span> ({editingCollaborator?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500">Access Scope</label>
              <div className="grid grid-cols-2 gap-2">
                <Badge 
                  variant={editScope === "all_projects" ? "default" : "outline"} 
                  className={cn(
                    "justify-center cursor-pointer py-2 rounded-xl transition-all border-slate-200 text-xs font-bold shadow-sm",
                    editScope === "all_projects" 
                      ? "bg-[#009698] text-white border-transparent hover:bg-[#009698]/90" 
                      : "bg-background text-slate-600 hover:bg-slate-50"
                  )}
                  onClick={() => setEditScope("all_projects")}
                >
                  All Projects
                </Badge>
                <Badge 
                  variant={editScope === "selected_projects" ? "default" : "outline"} 
                  className={cn(
                    "justify-center cursor-pointer py-2 rounded-xl transition-all border-slate-200 text-xs font-bold shadow-sm",
                    editScope === "selected_projects" 
                      ? "bg-[#009698] text-white border-transparent hover:bg-[#009698]/90" 
                      : "bg-background text-slate-600 hover:bg-slate-50"
                  )}
                  onClick={() => setEditScope("selected_projects")}
                >
                  Selected Projects
                </Badge>
              </div>
            </div>

            {editScope === "selected_projects" && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500">Select Projects</label>
                {isLoadingProjects ? (
                  <div className="h-20 bg-slate-100 animate-pulse rounded-xl" />
                ) : projects.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {projects.map((p) => {
                      const projectId = p._id || p.id;
                      const isSelected = editProjectIds.includes(projectId);
                      return (
                        <div key={projectId} className="flex items-center gap-3 p-3 rounded-xl bg-white border">
                          <Checkbox 
                            id={`edit-proj-${projectId}`} 
                            checked={isSelected}
                            onCheckedChange={() => {
                              setEditProjectIds(prev => 
                                prev.includes(projectId) 
                                  ? prev.filter(id => id !== projectId) 
                                  : [...prev, projectId]
                              );
                            }}
                            disabled={isUpdatingScope}
                          />
                          <Label htmlFor={`edit-proj-${projectId}`} className="text-sm font-medium text-slate-900 cursor-pointer">
                            {p.projectName || p.title}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No projects available.</div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setEditingCollaborator(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAccessScope}
              disabled={isUpdatingScope}
              className="bg-[#009698] hover:bg-[#009698]/90 text-white font-bold rounded-xl"
            >
              {isUpdatingScope ? "Saving..." : "Save Access Scope"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
