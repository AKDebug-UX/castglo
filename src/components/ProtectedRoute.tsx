import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
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
  if (!user.isVerified && !user.isEmailVerified && user.role !== "admin" && !isVerificationPath) {
    return <Navigate to="/verification-pending" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
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