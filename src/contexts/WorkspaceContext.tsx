import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { collaboratorAPI } from "@/lib/api";

export interface WorkspacePermissions {
  viewApplicants?: boolean;
  moveApplicants?: boolean;
  addNotes?: boolean;
  sendMessages?: boolean;
  editProject?: boolean;
  editRoles?: boolean;
  manageCollaborators?: boolean;
}

export interface Collaboration {
  _id: string;
  owner: {
    _id: string;
    fullName: string;
    profilePicture?: string;
  };
  permissions?: WorkspacePermissions;
  projectGrants?: Array<{
    projectId: string | any;
    permissions: WorkspacePermissions;
  }>;
  status: string;
  project?: string | any;
  castingCall?: string | any;
  inviter?: string | any;
}

export type ActiveWorkspace = "Personal" | Collaboration;

interface WorkspaceContextType {
  activeWorkspace: ActiveWorkspace;
  collaborations: Collaboration[];
  isLoading: boolean;
  switchWorkspace: (workspaceId: string | "Personal") => void;
  refreshCollaborations: () => Promise<void>;
  getPermissionsForProject: (projectId?: string) => WorkspacePermissions;
  /** Returns the list of project IDs the collaborator has been granted access to.
   *  Returns an empty array when in Personal workspace (meaning all projects are accessible). */
  getGrantedProjectIds: () => string[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [activeWorkspace, setActiveWorkspace] = useState<ActiveWorkspace>("Personal");
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCollaborations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await collaboratorAPI.getMyCollaborations();
      if (response.data?.success) {
        // Extract array from standard response wrapper
        const data = Array.isArray(response.data.data) 
          ? response.data.data 
          : (response.data.data?.collaborations || []);
          
        // Only keep accepted collaborations
        const activeCollabs = data.filter((c: any) => c.status === "accepted");
        setCollaborations(activeCollabs);
        
        // If current active workspace is no longer valid, fallback to Personal
        if (activeWorkspace !== "Personal") {
          const stillValid = activeCollabs.find((c: Collaboration) => c._id === activeWorkspace._id);
          if (!stillValid) {
            setActiveWorkspace("Personal");
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch collaborations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, activeWorkspace]);

  useEffect(() => {
    if (user) {
      fetchCollaborations();
    } else {
      setCollaborations([]);
      setActiveWorkspace("Personal");
    }
  }, [user]); // Removed fetchCollaborations from dependency array to prevent loops if not memoized correctly, but it's useCallback'd

  const switchWorkspace = (workspaceId: string | "Personal") => {
    if (workspaceId === "Personal") {
      setActiveWorkspace("Personal");
    } else {
      const collab = collaborations.find(c => c._id === workspaceId || c.owner?._id === workspaceId);
      if (collab) {
        setActiveWorkspace(collab);
      } else {
        setActiveWorkspace("Personal");
      }
    }
  };

  const getPermissionsForProject = (projectId?: string): WorkspacePermissions => {
    // If Personal workspace, user has all permissions
    if (activeWorkspace === "Personal") {
      return {
        viewApplicants: true,
        moveApplicants: true,
        addNotes: true,
        sendMessages: true,
        editProject: true,
        editRoles: true,
        manageCollaborators: true,
      };
    }

    // Default to false for everything if in collaborator workspace, then build up based on grants
    const perms: WorkspacePermissions = {
      viewApplicants: false,
      moveApplicants: false,
      addNotes: false,
      sendMessages: false,
      editProject: false,
      editRoles: false,
      manageCollaborators: false,
    };

    // 1. Apply global permissions if they exist
    if (activeWorkspace.permissions) {
      Object.assign(perms, activeWorkspace.permissions);
    }

    // 2. Override with project specific grants if a projectId is provided
    if (projectId && activeWorkspace.projectGrants) {
      const grant = activeWorkspace.projectGrants.find(g => {
        const id = typeof g.projectId === 'string' ? g.projectId : (g.projectId?._id || g.projectId?.id);
        return id === projectId;
      });
      if (grant && grant.permissions) {
        Object.assign(perms, grant.permissions);
      }
    }

    return perms;
  };

  const getGrantedProjectIds = (): string[] => {
    if (activeWorkspace === "Personal") return [];
    if (!activeWorkspace.projectGrants || activeWorkspace.projectGrants.length === 0) return [];
    return activeWorkspace.projectGrants
      .map(g => (typeof g.projectId === "string" ? g.projectId : (g.projectId?._id || g.projectId?.id || "")))
      .filter(Boolean);
  };

  return (
    <WorkspaceContext.Provider value={{
      activeWorkspace,
      collaborations,
      isLoading,
      switchWorkspace,
      refreshCollaborations: fetchCollaborations,
      getPermissionsForProject,
      getGrantedProjectIds,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
