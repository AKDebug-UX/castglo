import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { MyCollaboration, Permissions } from "@/types/collaborator";
import { collaboratorAPI } from "@/lib/api";
import { useAuth } from "./AuthContext";

export interface WorkspacePermissions {
  viewApplicants?: boolean;
  moveApplicants?: boolean;
  addNotes?: boolean;
  sendMessages?: boolean;
  editProject?: boolean;
  editRoles?: boolean;
  manageCollaborators?: boolean;
}

export type ActiveWorkspace = "Personal" | MyCollaboration;

interface WorkspaceContextType {
  activeWorkspace: ActiveWorkspace;
  collaborations: MyCollaboration[];
  isLoading: boolean;
  switchWorkspace: (workspaceId: string | "Personal") => void;
  refreshCollaborations: () => Promise<void>;
  getPermissionsForProject: (projectId?: string) => WorkspacePermissions;
  getGrantedProjectIds: () => string[];
}

const FULL_PERMISSIONS: WorkspacePermissions = {
  viewApplicants: true,
  moveApplicants: true,
  addNotes: true,
  sendMessages: true,
  editProject: true,
  editRoles: true,
  manageCollaborators: true,
};

const defaultWorkspaceContext: WorkspaceContextType = {
  activeWorkspace: "Personal",
  collaborations: [],
  isLoading: false,
  switchWorkspace: () => {},
  refreshCollaborations: async () => {},
  getPermissionsForProject: () => FULL_PERMISSIONS,
  getGrantedProjectIds: () => ["*"],
};

const WorkspaceContext = createContext<WorkspaceContextType>(defaultWorkspaceContext);

const ACTIVE_WORKSPACE_KEY = "active_workspace_id";

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [collaborations, setCollaborations] = useState<MyCollaboration[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<ActiveWorkspace>("Personal");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCollaborations = useCallback(async () => {
    if (!user) {
      setCollaborations([]);
      setActiveWorkspace("Personal");
      return;
    }

    try {
      setIsLoading(true);
      const res = await collaboratorAPI.getMyCollaborations();
      const list: MyCollaboration[] = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      const activeList = list.filter((item) => item.status === "accepted");
      setCollaborations(activeList);

      // Restore active workspace from localStorage if saved
      const savedWorkspaceId = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
      if (savedWorkspaceId && savedWorkspaceId !== "Personal") {
        const found = activeList.find(
          (c) => c.id === savedWorkspaceId || c.ownerId === savedWorkspaceId
        );
        if (found) {
          setActiveWorkspace(found);
        } else {
          setActiveWorkspace("Personal");
          localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user collaborations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCollaborations();
  }, [fetchCollaborations]);

  const switchWorkspace = (workspaceId: string | "Personal") => {
    if (workspaceId === "Personal") {
      setActiveWorkspace("Personal");
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, "Personal");
      return;
    }

    const found = collaborations.find(
      (c) => c.id === workspaceId || c.ownerId === workspaceId
    );
    if (found) {
      setActiveWorkspace(found);
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, found.id);
    }
  };

  const getPermissionsForProject = (projectId?: string): WorkspacePermissions => {
    if (activeWorkspace === "Personal" || !activeWorkspace) {
      return FULL_PERMISSIONS;
    }

    // Operating as delegated collaborator
    const collab = activeWorkspace;

    if (collab.accessScope === "all_projects") {
      return collab.globalPermissions || FULL_PERMISSIONS;
    }

    if (collab.accessScope === "selected_projects" && collab.projectGrants) {
      if (projectId) {
        const grant = collab.projectGrants.find(
          (g) => g.projectId === projectId || (g.project && g.project.id === projectId)
        );
        return grant?.permissions || {};
      }
      // If no specific projectId provided, return union of permissions across all granted projects
      const combined: WorkspacePermissions = {};
      collab.projectGrants.forEach((g) => {
        if (g.permissions) {
          (Object.keys(g.permissions) as (keyof Permissions)[]).forEach((key) => {
            if (g.permissions[key]) combined[key] = true;
          });
        }
      });
      return combined;
    }

    return {};
  };

  const getGrantedProjectIds = (): string[] => {
    if (activeWorkspace === "Personal" || !activeWorkspace) {
      return ["*"];
    }

    const collab = activeWorkspace;
    if (collab.accessScope === "all_projects") {
      return ["*"];
    }

    return collab.projectGrants?.map((g) => g.projectId || g.project?.id || "").filter(Boolean) || [];
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspace,
        collaborations,
        isLoading,
        switchWorkspace,
        refreshCollaborations: fetchCollaborations,
        getPermissionsForProject,
        getGrantedProjectIds,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  return context || defaultWorkspaceContext;
};


