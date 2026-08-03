import React, { useState, useEffect, useCallback } from 'react';
import { Collaborator } from '@/types/collaborator';
import { collaboratorAPI } from '@/lib/api';
import { CollaboratorCard } from '@/components/collaborators/owner/CollaboratorCard';
import { InviteCollaboratorModal } from '@/components/collaborators/owner/InviteCollaboratorModal';
import { EditPermissionsModal } from '@/components/collaborators/owner/EditPermissionsModal';
import { RevokeConfirmDialog } from '@/components/collaborators/owner/RevokeConfirmDialog';
import { CollaboratorEmptyState } from '@/components/collaborators/shared/CollaboratorEmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Search, Loader2, Users, Clock, CheckCircle2, UserX } from 'lucide-react';
import { toast } from 'sonner';

export default function Collaborators() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & action states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [revokingCollaborator, setRevokingCollaborator] = useState<Collaborator | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const fetchCollaborators = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await collaboratorAPI.list();
      if (res.data?.success || Array.isArray(res.data?.data) || Array.isArray(res.data)) {
        const list = res.data?.data || res.data || [];
        setCollaborators(list);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load workspace collaborators');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  const handleResend = async (collab: Collaborator) => {
    try {
      setResendingId(collab.id);
      const res = await collaboratorAPI.resend(collab.id);
      if (res.data?.success || res.status === 200) {
        toast.success(`Invitation resent to ${collab.inviteEmail}`);
        fetchCollaborators();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to resend invitation');
    } finally {
      setResendingId(null);
    }
  };

  // Filtering collaborators by tab and search
  const filteredCollaborators = collaborators.filter((c) => {
    // Tab filter
    if (activeTab === 'active' && c.status !== 'accepted') return false;
    if (activeTab === 'pending' && c.status !== 'pending') return false;
    if (activeTab === 'revoked' && c.status !== 'revoked' && c.status !== 'declined') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const emailMatch = c.inviteEmail.toLowerCase().includes(q);
      const nameMatch = c.collaboratorUser?.fullName?.toLowerCase().includes(q);
      return emailMatch || nameMatch;
    }

    return true;
  });

  const activeCount = collaborators.filter((c) => c.status === 'accepted').length;
  const pendingCount = collaborators.filter((c) => c.status === 'pending').length;
  const revokedCount = collaborators.filter((c) => c.status === 'revoked' || c.status === 'declined').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-primary" />
            <span>Workspace Collaborators</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Invite team members and co-casting directors to help manage projects and applicants.
          </p>
        </div>

        <Button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white font-medium flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Collaborator</span>
        </Button>
      </div>

      {/* Tabs & Search controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-slate-900 border border-slate-800 p-1">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-400 text-xs sm:text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Active</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-semibold text-slate-300">
                {activeCount}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-400 text-xs sm:text-sm flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-semibold text-slate-300">
                {pendingCount}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="revoked"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-400 text-xs sm:text-sm flex items-center gap-2"
            >
              <UserX className="w-4 h-4 text-rose-400" />
              <span>Revoked / Declined</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-semibold text-slate-300">
                {revokedCount}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary data-[state=active]:text-white text-slate-400 text-xs sm:text-sm"
            >
              All ({collaborators.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-900/80 border-slate-800 text-white placeholder:text-slate-500 text-sm"
          />
        </div>
      </div>

      {/* Main List content */}
      {isLoading ? (
        <div className="flex items-center justify-center p-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
          <span>Loading collaborators...</span>
        </div>
      ) : filteredCollaborators.length === 0 ? (
        <CollaboratorEmptyState
          onInviteClick={() => setIsInviteModalOpen(true)}
          title={
            searchQuery
              ? 'No matching collaborators'
              : activeTab === 'active'
              ? 'No active collaborators'
              : activeTab === 'pending'
              ? 'No pending invitations'
              : 'No collaborators found'
          }
          description={
            searchQuery
              ? `No collaborators match "${searchQuery}". Try clearing your search.`
              : 'Invite colleagues to collaborate on your projects and manage auditions together.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCollaborators.map((collaborator) => (
            <CollaboratorCard
              key={collaborator.id}
              collaborator={collaborator}
              onEdit={(c) => setEditingCollaborator(c)}
              onRevoke={(c) => setRevokingCollaborator(c)}
              onResend={handleResend}
              isResending={resendingId === collaborator.id}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <InviteCollaboratorModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchCollaborators}
      />

      <EditPermissionsModal
        collaborator={editingCollaborator}
        isOpen={!!editingCollaborator}
        onClose={() => setEditingCollaborator(null)}
        onSuccess={fetchCollaborators}
      />

      <RevokeConfirmDialog
        collaborator={revokingCollaborator}
        isOpen={!!revokingCollaborator}
        onClose={() => setRevokingCollaborator(null)}
        onSuccess={fetchCollaborators}
      />
    </div>
  );
}
