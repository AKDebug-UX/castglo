import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Handshake, CheckCircle, XCircle, ArrowRight, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { collaboratorAPI } from "@/lib/api";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";

export function PendingInvitationsBanner() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { refreshCollaborations } = useWorkspace();

  const fetchInvitations = async () => {
    try {
      const res = await collaboratorAPI.getMyInvitations();
      if (res.data?.success) {
        const list = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data?.invitations || [];
        setInvitations(list);
      }
    } catch (err) {
      console.error("Failed to load pending invitations banner:", err);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  if (invitations.length === 0) return null;

  const firstInvite = invitations[0];
  const inviteId = firstInvite._id || firstInvite.id;
  const ownerName = firstInvite.owner?.fullName || firstInvite.inviter?.fullName || firstInvite.inviterName || "A Casting Director";

  const handleAccept = async () => {
    if (!inviteId) return;
    setActionLoading(inviteId);
    try {
      await collaboratorAPI.acceptInvitation(inviteId);
      toast.success("Workspace invitation accepted!");
      await refreshCollaborations();
      fetchInvitations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to accept invitation.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    if (!inviteId) return;
    setActionLoading(inviteId);
    try {
      await collaboratorAPI.declineInvitation(inviteId);
      toast.success("Invitation declined.");
      fetchInvitations();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to decline invitation.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-[#009698]/10 to-teal-500/10 border border-[#009698]/20 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 animate-fade-in my-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-[#009698] text-white flex items-center justify-center shrink-0 shadow-sm">
          <Handshake className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-900 truncate">
              Workspace Invitation
            </span>
            {invitations.length > 1 && (
              <span className="bg-[#009698] text-white text-[10px] font-extrabold px-2 py-0.2 rounded-full">
                +{invitations.length - 1} more
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 truncate mt-0.5">
            <strong>{ownerName}</strong> invited you to collaborate on their workspace projects.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <Button
          size="sm"
          variant="outline"
          onClick={handleDecline}
          disabled={!!actionLoading}
          className="text-xs rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          Decline
        </Button>
        <Button
          size="sm"
          onClick={handleAccept}
          disabled={!!actionLoading}
          className="text-xs rounded-xl bg-[#009698] hover:bg-[#009698]/90 text-white font-bold px-4"
        >
          {actionLoading === inviteId ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
          )}
          Accept Workspace
        </Button>
      </div>
    </div>
  );
}
