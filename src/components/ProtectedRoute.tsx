import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const { activeWorkspace, collaborations } = useWorkspace();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Define paths that should be accessible even if unverified (to fix verification status)
  const isVerificationPath = 
    location.pathname.includes("verification-process") || 
    location.pathname.includes("profile") ||
    location.pathname.includes("verification-pending");

  // Check if email is verified
  if (!user.isEmailVerified && user.role !== "admin" && !isVerificationPath) {
    return <Navigate to="/verification-pending" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Bypass role restriction for specific collaborator routes if user is acting as a collaborator in a Casting Director workspace
    const savedWorkspaceId = localStorage.getItem("active_workspace_id");
    const isCollaboratorActive = 
      activeWorkspace !== "Personal" || 
      (savedWorkspaceId && savedWorkspaceId !== "Personal") || 
      (collaborations && collaborations.length > 0);

    if (location.pathname.startsWith("/director") && isCollaboratorActive) {
      const path = location.pathname;
      const isOwnerOnlyRoute =
        path === "/director" ||
        path === "/director/" ||
        path.startsWith("/director/billing") ||
        path.startsWith("/director/profile") ||
        (path.startsWith("/director/settings") && !path.startsWith("/director/settings/team"));

      if (isOwnerOnlyRoute) {
        return <Navigate to="/collaborations" replace />;
      }

      return <>{children}</>;
    }

    // Redirect to appropriate dashboard based on role
    const roleRoutes: Record<UserRole, string> = {
      admin: "/admin",
      talent: "/talent",
      casting_director: "/director",
      industry_professional: "/professional"
    };

    return <Navigate to={roleRoutes[user.role]} replace />;
  }

  return <>{children}</>;
}