import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, Mail, Shield, UserPlus, 
  MoreVertical, Trash2, ShieldCheck, 
  ShieldAlert, ShieldEllipsis, X
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Teammate {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  avatar?: string;
  status: "active" | "pending";
  lastActive?: string;
}

const INITIAL_TEAM: Teammate[] = [
  { id: "1", name: "Sarah Jenkins", email: "sarah.j@production.com", role: "admin", status: "active", lastActive: "2 hours ago" },
  { id: "2", name: "Michael Chen", email: "m.chen@casting.net", role: "editor", status: "active", lastActive: "1 day ago" },
  { id: "3", name: "David Miller", email: "d.miller@freelance.com", role: "viewer", status: "pending" },
];

export default function Collaborators() {
  const [team, setTeam] = useState<Teammate[]>(INITIAL_TEAM);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newTeammate: Teammate = {
      id: crypto.randomUUID(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: "viewer",
      status: "pending"
    };
    setTeam([...team, newTeammate]);
    setInviteEmail("");
    toast.success("Invitation sent to " + inviteEmail);
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Team Collaborators
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your hiring team and their permissions for projects.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Team List */}
        <div className="lg:col-span-2 space-y-4">
          {team.map((member) => (
            <Card key={member.id} className="group hover:shadow-md transition-all shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                       <p className="font-bold text-sm">{member.name}</p>
                       <Badge variant={member.status === "active" ? "secondary" : "outline"} className="text-[10px] h-4 py-0">
                         {member.status}
                       </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-xs font-semibold capitalize bg-muted px-2 py-1 rounded-md">
                      {getRoleIcon(member.role)} {member.role}
                    </div>
                    {member.lastActive && (
                      <p className="text-[10px] text-muted-foreground mt-1">Active {member.lastActive}</p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => updateRole(member.id, "admin")}>Set as Admin</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateRole(member.id, "editor")}>Set as Editor</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateRole(member.id, "viewer")}>Set as Viewer</DropdownMenuItem>
                      <div className="h-px bg-muted my-1" />
                      <DropdownMenuItem className="text-destructive" onClick={() => removeTeammate(member.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Invite Sidebar */}
        <div className="space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" /> Invite Teammate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="email" 
                      placeholder="teammate@company.com" 
                      className="pl-9" 
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Default Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Editor", "Viewer"].map(r => (
                      <Badge key={r} variant="outline" className="justify-center cursor-pointer hover:bg-background">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full bg-[#009698] hover:bg-[#009698]/90">
                  Send Invitation
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-none border-dashed border-2 bg-transparent">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">Role Permissions</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                    <strong>Admin</strong>: Full access to all projects & billing.<br />
                    <strong>Editor</strong>: Can edit projects & manage applicants.<br />
                    <strong>Viewer</strong>: Read-only access to applicant notes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
