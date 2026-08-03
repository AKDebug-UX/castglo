import React, { useState, useEffect } from 'react';
import { collaboratorAPI } from '@/lib/api';
import { Collaborator } from '@/types/collaborator';
import { WorkspaceCard } from '@/components/collaborators/invitee/WorkspaceCard';
import { PendingInvitationsBanner } from '@/components/collaborators/invitee/PendingInvitationsBanner';
import { CollaboratorEmptyState } from '@/components/collaborators/shared/CollaboratorEmptyState';
import { Loader2, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';

export default function MyCollaborationsPage() {
  const [collaborations, setCollaborations] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCollaborations = async () => {
      try {
        setIsLoading(true);
        const res = await collaboratorAPI.getMyCollaborations();
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setCollaborations(res.data.data);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load collaborations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollaborations();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Pending Invitations Alert Banner */}
      <PendingInvitationsBanner />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <FolderKanban className="w-6 h-6" />
          </div>
          <span>My Collaborations</span>
        </h1>
        <p className="text-slate-600 text-sm mt-2 max-w-2xl">
          Workspaces and projects shared with you by other Casting Directors and industry teams. Manage team projects and review applicants based on your assigned access.
        </p>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex items-center justify-center p-16 text-slate-500 bg-white/60 rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
          <span className="font-medium text-slate-700">Loading collaborations...</span>
        </div>
      ) : collaborations.length === 0 ? (
        <CollaboratorEmptyState
          showButton={false}
          title="No active collaborations"
          description="When casting directors or team owners invite you to collaborate on their projects, your shared workspaces will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborations.map((collab) => (
            <WorkspaceCard key={collab.id} collaboration={collab} />
          ))}
        </div>
      )}
    </div>
  );
}
