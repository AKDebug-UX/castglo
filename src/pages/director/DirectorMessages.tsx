import MessageView from "@/components/messaging/MessageView";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";

export default function DirectorMessages() {
  const { user } = useAuth();
  const { activeWorkspace, getGrantedProjectIds } = useWorkspace();

  // Are we acting on behalf of a director's workspace?
  const isCollaboratorMode = activeWorkspace !== "Personal";

  // IDs of projects this collaborator can see (empty = workspace-wide access → show all)
  const grantedProjectIds = isCollaboratorMode ? getGrantedProjectIds() : [];

  // Collaborator's display label shown in attribution banners
  const collaboratorLabel = isCollaboratorMode && user
    ? `${user.fullName} (Collaborator)`
    : undefined;

  // Director name shown in attribution ("on behalf of …")
  const directorName = isCollaboratorMode && activeWorkspace !== "Personal"
    ? (activeWorkspace as any).owner?.fullName
    : undefined;

  return (
    <MessageView
      title="Director Messages"
      subtitle="Communicate with talent regarding their applications"
      isCollaboratorMode={isCollaboratorMode}
      grantedProjectIds={grantedProjectIds}
      collaboratorLabel={collaboratorLabel}
      directorName={directorName}
    />
  );
}
