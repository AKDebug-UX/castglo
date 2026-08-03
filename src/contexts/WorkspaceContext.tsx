import { createContext, useContext, ReactNode } from "react";

export interface WorkspacePermissions {
  viewApplicants?: boolean;
  moveApplicants?: boolean;
  addNotes?: boolean;
  sendMessages?: boolean;
  editProject?: boolean;
  editRoles?: boolean;
  manageCollaborators?: boolean;
}

export type ActiveWorkspace = "Personal";

interface WorkspaceContextType {
  activeWorkspace: ActiveWorkspace;
  collaborations: any[];
  isLoading: boolean;
  switchWorkspace: (workspaceId: string | "Personal") => void;
  refreshCollaborations: () => Promise<void>;
  getPermissionsForProject: (projectId?: string) => WorkspacePermissions;
  getGrantedProjectIds: () => string[];
}

const defaultWorkspaceContext: WorkspaceContextType = {
  activeWorkspace: "Personal",
  collaborations: [],
  isLoading: false,
  switchWorkspace: () => {},
  refreshCollaborations: async () => {},
  getPermissionsForProject: () => ({
    viewApplicants: true,
    moveApplicants: true,
    addNotes: true,
    sendMessages: true,
    editProject: true,
    editRoles: true,
    manageCollaborators: true,
  }),
  getGrantedProjectIds: () => [],
};

const WorkspaceContext = createContext<WorkspaceContextType>(defaultWorkspaceContext);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WorkspaceContext.Provider value={defaultWorkspaceContext}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  return context || defaultWorkspaceContext;
};

