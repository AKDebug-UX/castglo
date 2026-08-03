import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collaboratorAPI } from '@/lib/api';
import { Collaborator, Permissions } from '@/types/collaborator';

export function useCollaboratorPermissions(targetProjectId?: string) {
  const { user } = useAuth();
  const [collaborations, setCollaborations] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollaborations = useCallback(async () => {
    if (!user) {
      setCollaborations([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await collaboratorAPI.getMyCollaborations();
      if (res.data?.success) {
        setCollaborations(res.data.data || []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load collaborations');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCollaborations();
  }, [fetchCollaborations]);

  const getEffectivePermissions = useCallback(
    (projectId?: string): Permissions => {
      const activeProjId = projectId || targetProjectId;
      if (!user || collaborations.length === 0) return {};

      // Find relevant collaboration
      for (const collab of collaborations) {
        if (collab.status !== 'accepted') continue;

        if (collab.accessScope === 'all_projects') {
          return collab.globalPermissions || {};
        }

        if (collab.accessScope === 'selected_projects' && activeProjId && collab.projectGrants) {
          const grant = collab.projectGrants.find((g) => g.projectId === activeProjId);
          if (grant) return grant.permissions || {};
        }
      }

      return {};
    },
    [user, collaborations, targetProjectId]
  );

  const hasPermission = useCallback(
    (key: keyof Permissions, projectId?: string): boolean => {
      // Workspace owners and admins always have full permissions
      if (user?.role === 'admin' || user?.role === 'casting_director' || user?.role === 'industry_professional') {
        // If they are operating as workspace owner, return true
        // But for collaborator checks:
        const perms = getEffectivePermissions(projectId);
        if (Object.keys(perms).length > 0) {
          return !!perms[key];
        }
        // Owner default
        return true;
      }

      const perms = getEffectivePermissions(projectId);
      return !!perms[key];
    },
    [user, getEffectivePermissions]
  );

  return {
    collaborations,
    isLoading,
    error,
    refetch: fetchCollaborations,
    getEffectivePermissions,
    hasPermission,
  };
}
