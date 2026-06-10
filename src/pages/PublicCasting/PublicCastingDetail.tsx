import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SharedCastingDetail from "@/components/casting/SharedCastingDetail";
import { useProjectWithRoles } from "@/hooks/useProjectWithRoles";
import { useAuth } from "@/contexts/AuthContext";
import { applicationAPI } from "@/lib/api";

export default function PublicCastingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { project, isLoading, error } = useProjectWithRoles(id);
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [hasApplied, setHasApplied] = useState(false);
  const [isCheckingApplication, setIsCheckingApplication] = useState(false);

  useEffect(() => {
    if (user?.role === 'talent' && id) {
      setIsCheckingApplication(true);
      applicationAPI.getMe()
        .then(response => {
           let appsData = null;
           if (response.data.success) {
             if (Array.isArray(response.data.data)) {
               appsData = response.data.data;
             } else if (response.data.data && Array.isArray(response.data.data.applications)) {
               appsData = response.data.data.applications;
             }
           }
           if (appsData && Array.isArray(appsData)) {
             const applied = appsData.some((app: any) => {
               const pId = app.project?._id || app.project?.id || app.project || app.projectId;
               const cId = app.castingCall?._id || app.castingCall?.id || app.castingCall || app.castingCallId;
               return pId === id || cId === id;
             });
             setHasApplied(applied);
           }
        })
        .finally(() => {
          setIsCheckingApplication(false);
        });
    }
  }, [user, id]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.info("Please sign up or log in to view project details.");
      navigate("/join");
    }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    if (error && user) toast.error(error);
  }, [error, user]);

  if (isLoading || isAuthLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F5FBFC]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Casting call not found.</p>
        <Button variant="link" asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  const backLink = (
    <Link
      onClick={(e) => { e.preventDefault(); navigate(-1); }}
      to="#"
      className="inline-flex items-center gap-2 text-sm text-[#009698] hover:text-[#007A7C] transition-colors mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Castings
    </Link>
  );

  const sidebarActions = (
    <Card className="rounded-2xl border-none shadow-lg overflow-hidden bg-white mt-6">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-bold text-slate-900">Ready to Apply?</CardTitle>
        <p className="text-sm text-slate-500 font-medium">
          {!user 
            ? "Create an account to submit your application" 
            : user.role === "talent" 
              ? "Submit your application for this casting call" 
              : "Only talent profiles can apply to casting calls"}
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        {!user ? (
          <Button
            className="w-full h-14 rounded-2xl font-bold text-lg bg-[#009698] hover:bg-[#007A7C] transition-all shadow-lg shadow-[#009698]/20"
            size="lg"
            asChild
          >
            <Link to="/join">Sign Up to Apply</Link>
          </Button>
        ) : user.role === "talent" ? (
          <Button
            className={`w-full h-14 rounded-2xl font-bold text-lg transition-all ${
              hasApplied 
                ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                : "bg-[#009698] hover:bg-[#007A7C] text-white shadow-lg shadow-[#009698]/20"
            }`}
            size="lg"
            asChild={!hasApplied && !isCheckingApplication}
            disabled={hasApplied || isCheckingApplication}
          >
            {isCheckingApplication ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : hasApplied ? (
              <span>Already Applied</span>
            ) : (
              <Link to={`/talent/browse-cast/${id}/submit`}>Apply Now</Link>
            )}
          </Button>
        ) : (
          <Button
            className="w-full h-14 rounded-2xl font-bold text-lg bg-slate-300 text-slate-500 cursor-not-allowed"
            size="lg"
            disabled
          >
            Apply
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-[#F5FBFC] min-h-screen">
      <Header />
      <main className="py-10">
        <SharedCastingDetail
          casting={project}
          backLink={backLink}
          sidebarActions={sidebarActions}
          isInternal={false}
        />
      </main>
      <Footer />
    </div>
  );
}
