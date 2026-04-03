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
 
  if (!user.isEmailVerified && user.role !== "admin") {
    return <Navigate to="/verification-pending" replace />;
  }

  // Check if account is verified (for non-admin roles)
  if (!user.isVerified && user.role !== "admin") {
    return <Navigate to="/verification-pending" replace />;
  }
 
   if (allowedRoles && !allowedRoles.includes(user.role)) {
     // Redirect to appropriate dashboard based on role
     const roleRoutes: Record<UserRole, string> = {
       talent: "/dashboard",
       casting_director: "/director",
       industry_professional: "/professional",
       admin: "/admin",
     };
     return <Navigate to={roleRoutes[user.role]} replace />;
   }
 
   return <>{children}</>;
 }