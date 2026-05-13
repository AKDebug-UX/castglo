import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, Mail, Shield, UserPlus, 
  MoreVertical, Trash2, ShieldCheck, 
  ShieldAlert, ShieldEllipsis, X, FolderOpen
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { castingCallAPI } from "@/lib/api";
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

const INITIAL_TEAM: Teammate[] = [
  { id: "1", name: "Sarah Jenkins", email: "sarah.j@production.com", role: "admin", status: "active", lastActive: "2 hours ago", assignedProject: "Project Aurora: Beyond the Horizon" },
  { id: "2", name: "Michael Chen", email: "m.chen@casting.net", role: "editor", status: "active", lastActive: "1 day ago", assignedProject: "The Silent Echo (Short Film)" },
  { id: "3", name: "David Miller", email: "d.miller@freelance.com", role: "viewer", status: "pending", assignedProject: "Project Aurora: Beyond the Horizon" },
];

export default function Collaborators() {
  const [team, setTeam] = useState<Teammate[]>(INITIAL_TEAM);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "editor" | "viewer">("editor");
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [customProjectName, setCustomProjectName] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    const fetchMyProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const response = await castingCallAPI.getMyListings();
        if (response.data.success && response.data.data) {
          const projectData = Array.isArray(response.data.data) 
            ? response.data.data 
            : response.data.data.castingCalls || [];
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
      }
    };
    fetchMyProjects();
  }, []);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error("Please enter an email address.");
      return;
    }

    // Find assigned project name
    let assignedProjName = customProjectName;
    if (selectedProjectId) {
      const selectedProj = projects.find(p => (p._id || p.id) === selectedProjectId);
      if (selectedProj) {
        assignedProjName = selectedProj.projectName || selectedProj.title;
      }
    }

    const newTeammate: Teammate = {
      id: crypto.randomUUID(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: selectedRole,
      status: "pending",
      assignedProject: assignedProjName || "All Projects"
    };

    setTeam([...team, newTeammate]);
    setInviteEmail("");
    toast.success(`Invitation to collaborate on "${assignedProjName || 'All Projects'}" sent to ${inviteEmail}`);
  };

  const removeTeammate = (id: string) => {
    setTeam(team.filter(t => t.id !== id));
    toast.success("Teammate removed.");
  };

  const updateRole = (id: string, newRole: "admin" | "editor" | "viewer") => {
    setTeam(team.map(t => t.id === id ? { ...t, role: newRole } : t));
    toast.success("Role updated.");
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
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Team List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-3xl border-none shadow-xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-bold text-slate-900">Active Collaborators</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {team.length === 0 ? (
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
                            {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
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
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500">Project Access Link</label>
                  {isLoadingProjects ? (
                    <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
                  ) : projects.length > 0 ? (
                    <Select 
                      value={selectedProjectId} 
                      onValueChange={(val) => {
                        setSelectedProjectId(val);
                        const selectedProj = projects.find(p => (p._id || p.id) === val);
                        setCustomProjectName(selectedProj ? (selectedProj.projectName || selectedProj.title) : "");
                      }}
                    >
                      <SelectTrigger className="w-full bg-background border rounded-xl">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-xl">
                        {projects.map(p => (
                          <SelectItem key={p._id || p.id} value={p._id || p.id}>
                            {p.projectName || p.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="relative">
                      <FolderOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="e.g. Project Aurora" 
                        className="pl-10 rounded-xl"
                        value={customProjectName}
                        onChange={e => setCustomProjectName(e.target.value)}
                      />
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">Select the project this collaborator will assist with.</p>
                </div>

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
                        onClick={() => setSelectedRole(r as any)}
                      >
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full bg-[#009698] hover:bg-[#009698]/90 text-white font-bold rounded-xl py-5 shadow-lg shadow-[#009698]/10 transition-transform active:scale-[0.99]">
                  Send Invitation
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
