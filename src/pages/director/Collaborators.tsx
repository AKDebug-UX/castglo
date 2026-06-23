import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Users, Mail, Shield, UserPlus, 
  MoreVertical, Trash2, ShieldCheck, 
  ShieldAlert, ShieldEllipsis, X, FolderOpen,
  RefreshCw
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { collaboratorAPI, projectAPI } from "@/lib/api";
import { toast } from "sonner";

interface Teammate {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  avatar?: string;
  status: "active" | "pending";
  lastActive?: string;
  assignedProject?: string;
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

// Try "role" key!
const getPermissionsObject = (role: string) => {
  return { role };
};

export default function Collaborators() {
  const [team, setTeam] = useState<Teammate[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "editor" | "viewer">("editor");
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [customProjectName, setCustomProjectName] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [projectsFetched, setProjectsFetched] = useState(false);
  const [accessScope, setAccessScope] = useState<"all_projects" | "selected_projects">("all_projects");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [globalPermissions, setGlobalPermissions] = useState({
    viewApplicants: true,
    moveApplicants: true,
    addNotes: true,
    sendMessages: true,
    editProject: false,
    editRoles: false,
    manageCollaborators: false,
  });
  const [projectPermissions, setProjectPermissions] = useState<Record<string, {
    viewApplicants: boolean;
    moveApplicants: boolean;
    addNotes: boolean;
    sendMessages: boolean;
    editProject: boolean;
    editRoles: boolean;
    manageCollaborators: boolean;
  }>>({});

  const fetchCollaborators = async () => {
    setIsLoadingCollaborators(true);
    try {
      const res = await collaboratorAPI.getAll();
      console.log("Collaborators API response:", JSON.stringify(res, null, 2));
      const data = Array.isArray(res.data?.data) ? res.data.data : 
        (Array.isArray(res.data) ? res.data : []);
      
      const mapped = data.map((collab: any) => {
        const email = collab.email || collab.user?.email || collab.invitedUser?.email || collab.inviteEmail || "";
        return {
          id: collab._id || collab.id || collab.userId || "",
          name: collab.user?.fullName || collab.name || collab.invitedUser?.fullName || email.split('@')[0] || "Unknown",
          email: email,
          role: (collab.role || collab.permission || collab.roleName || "viewer") as any,
          avatar: collab.user?.profilePicture || collab.invitedUser?.profilePicture,
          status: collab.status === "accepted" ? "active" : (collab.status || "pending"),
          lastActive: timeAgo(collab.updatedAt || collab.lastActiveAt),
          assignedProject: collab.project?.title || collab.projectName || "All Projects"
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
    setSelectedProjectIds(prev => {
      const isSelected = prev.includes(projectId);
      const newSelected = isSelected 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId];
      
      // Initialize permissions for newly selected projects
      setProjectPermissions(prevPerm => {
        const newPerm = { ...prevPerm };
        if (!isSelected) {
          newPerm[projectId] = {
            viewApplicants: true,
            moveApplicants: true,
            addNotes: true,
            sendMessages: true,
            editProject: false,
            editRoles: false,
            manageCollaborators: false,
          };
        } else {
          delete newPerm[projectId];
        }
        return newPerm;
      });
      
      return newSelected;
    });
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
        // permissions: accessScope === "all_projects" ? { role: selectedRole } : undefined,
        projectGrants: accessScope === "selected_projects" 
          ? selectedProjectIds.map(projectId => ({
              projectId,
              permissions: { role: selectedRole }
            }))
          : []
      };
      
      console.log("Sending invite data:", JSON.stringify(inviteData, null, 2));
      await collaboratorAPI.invite(inviteData);

      toast.success(`Invitation sent to ${email}`);
      setInviteEmail("");
      setSelectedProjectIds([]);
      setProjectPermissions({});
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

  const updateRole = async (id: string, newRole: "admin" | "editor" | "viewer") => {
    try {
      await collaboratorAPI.updatePermissions(id, { 
        permissions: { role: newRole } 
      });
      toast.success("Role updated successfully.");
      fetchCollaborators();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update role.");
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

  const getRoleIcon = (role: string) => {
    if (role === "admin") return <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />;
    if (role === "editor") return <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />;
    return <ShieldEllipsis className="w-3.5 h-3.5 text-slate-500" />;
  };

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
                    <div className="text-[11px] text-[#009698] font-bold mt-1 flex items-center gap-1">
                      <FolderOpen className="w-3.5 h-3.5 text-[#009698]" />
                      <span className="truncate">{member.assignedProject}</span>
                    </div>
                  )}
                </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="hidden sm:flex flex-col items-end">
                          <div className="flex items-center gap-1.5 text-xs font-bold capitalize bg-slate-50 border px-2.5 py-1 rounded-full text-slate-700">
                            {getRoleIcon(member.role)} {member.role}
                          </div>
                          {member.lastActive && (
                            <p className="text-[10px] text-muted-foreground mt-1">Active {member.lastActive}</p>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-900">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl border-slate-100">
                            <DropdownMenuItem className="font-medium cursor-pointer" onClick={() => updateRole(member.id, "admin")}>Set as Admin</DropdownMenuItem>
                            <DropdownMenuItem className="font-medium cursor-pointer" onClick={() => updateRole(member.id, "editor")}>Set as Editor</DropdownMenuItem>
                            <DropdownMenuItem className="font-medium cursor-pointer" onClick={() => updateRole(member.id, "viewer")}>Set as Viewer</DropdownMenuItem>
                            {member.status === "pending" && (
                              <DropdownMenuItem className="font-medium cursor-pointer" onClick={() => resendInvitation(member.id)}>Resend Invitation</DropdownMenuItem>
                            )}
                            <div className="h-px bg-muted my-1" />
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

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Role Permissions</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["admin", "editor", "viewer"].map((r) => (
                      <Badge 
                        key={r} 
                        variant={selectedRole === r ? "default" : "outline"} 
                        className={cn(
                          "justify-center cursor-pointer py-1.5 capitalize rounded-xl transition-all border-slate-200 text-xs font-bold shadow-sm",
                          selectedRole === r 
                            ? "bg-[#009698] text-white border-transparent hover:bg-[#009698]/90" 
                            : "bg-background text-slate-600 hover:bg-slate-50"
                        )}
                        onClick={() => !inviting && setSelectedRole(r as any)}
                      >
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>

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

          <Card className="shadow-none border-dashed border-2 border-slate-200 bg-transparent rounded-3xl">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Permission Details</p>
                  <div className="text-[11px] text-slate-500 leading-relaxed mt-1 space-y-1">
                    <p><strong>Admin</strong>: Full access to all projects, editing, and billing.</p>
                    <p><strong>Editor</strong>: Can edit assigned projects and manage incoming applications.</p>
                    <p><strong>Viewer</strong>: View-only access to browse, rate, and leave notes on applicants.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
