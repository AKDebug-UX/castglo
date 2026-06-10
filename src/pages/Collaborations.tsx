import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Mail, Shield, RefreshCw, 
  FolderOpen, CheckCircle2, XCircle
} from "lucide-react";
import { collaboratorAPI } from "@/lib/api";
import { toast } from "sonner";

interface Collaboration {
  id: string;
  projectName?: string;
  role: string;
  status: "pending" | "active" | "revoked";
  inviterName?: string;
  inviterEmail?: string;
  createdAt?: string;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

const getRoleIcon = (role: string) => {
  if (role === "admin") return <Shield className="w-4 h-4 text-blue-600" />;
  if (role === "editor") return <Shield className="w-4 h-4 text-amber-600" />;
  return <Shield className="w-4 h-4 text-slate-500" />;
};

export default function CollaborationsPage() {
  const [invitations, setInvitations] = useState<Collaboration[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const invitationsRes = await collaboratorAPI.getMyInvitations();
      const collaborationsRes = await collaboratorAPI.getMyCollaborations();
      
      const getArrayData = (res: any) => {
        if (Array.isArray(res.data)) return res.data;
        if (res.data?.success && Array.isArray(res.data.data)) return res.data.data;
        return [];
      };
      
      const mappedInvitations: Collaboration[] = getArrayData(invitationsRes).map((invite: any) => ({
        id: invite._id || invite.id || "",
        projectName: invite.project?.title || invite.projectName || invite.castingCall?.title || "Unknown Project",
        role: invite.role || invite.permission || invite.roleName || "viewer",
        status: "pending",
        inviterName: invite.inviter?.fullName || invite.inviterName || invite.owner?.fullName || "Unknown",
        inviterEmail: invite.inviter?.email || invite.inviterEmail || invite.owner?.email,
        createdAt: invite.createdAt,
      }));
      
      const mappedCollaborations: Collaboration[] = getArrayData(collaborationsRes).map((collab: any) => ({
        id: collab._id || collab.id || "",
        projectName: collab.project?.title || collab.projectName || collab.castingCall?.title || "Unknown Project",
        role: collab.role || collab.permission || collab.roleName || "viewer",
        status: "active",
        inviterName: collab.owner?.fullName || collab.inviter?.fullName || collab.inviterName || "Unknown",
        inviterEmail: collab.owner?.email || collab.inviter?.email || collab.inviterEmail,
        createdAt: collab.createdAt,
      }));

      setInvitations(mappedInvitations);
      setCollaborations(mappedCollaborations);
    } catch (err) {
      console.error("Failed to load data:", err);
      toast.error("Failed to load collaborations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await collaboratorAPI.acceptInvitation(id);
      toast.success("Invitation accepted successfully!");
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to accept invitation");
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await collaboratorAPI.declineInvitation(id);
      toast.success("Invitation declined");
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to decline invitation");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in p-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Users className="w-6 h-6 text-[#009698]" /> Collaborations
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your team invitations and active collaborations
          </p>
        </div>
        <Button variant="ghost" onClick={fetchData} className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>

      {/* Pending Invitations Section */}
      {invitations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Pending Invitations
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {invitations.map((invite) => (
              <Card key={invite.id} className="overflow-hidden shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage />
                      <AvatarFallback className="bg-blue-50 text-blue-600">
                        {getInitials(invite.inviterName || "UN")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-bold truncate">
                        Invitation from {invite.inviterName}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground truncate">
                        {invite.inviterEmail}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FolderOpen className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 truncate">{invite.projectName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(invite.role)}
                    <Badge variant="outline" className="capitalize text-xs">
                      {invite.role} Role
                    </Badge>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAccept(invite.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDecline(invite.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active Collaborations Section */}
      {collaborations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#009698]" />
            Active Collaborations
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {collaborations.map((collab) => (
              <Card key={collab.id} className="overflow-hidden shadow-sm border-slate-100">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage />
                      <AvatarFallback className="bg-[#DEFCFE] text-[#009698]">
                        {getInitials(collab.inviterName || "UN")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-bold truncate">
                        Collaborating with {collab.inviterName}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground truncate">
                        {collab.inviterEmail}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <FolderOpen className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 truncate">{collab.projectName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(collab.role)}
                    <Badge variant="outline" className="capitalize text-xs">
                      {collab.role} Role
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && invitations.length === 0 && collaborations.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Collaborations Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            You don't have any pending invitations or active collaborations. When someone invites you to collaborate, you'll see it here.
          </p>
        </div>
      )}
    </div>
  );
}
