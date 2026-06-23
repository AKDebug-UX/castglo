import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { collaboratorAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { user, isLoading: authLoading } = useAuth();
  const { refreshCollaborations } = useWorkspace();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid invitation link. Token is missing.");
      return;
    }

    if (user) {
      handleAccept(token);
    }
  }, [user, authLoading, token]);

  const handleAccept = async (invitationToken: string) => {
    setStatus("loading");
    try {
      const response = await collaboratorAPI.acceptInvitation(invitationToken);
      if (response.data?.success) {
        setStatus("success");
        await refreshCollaborations();
        toast.success("Invitation accepted successfully!");
      } else {
        setStatus("error");
        setErrorMessage(response.data?.message || "Failed to accept invitation.");
      }
    } catch (error: any) {
      setStatus("error");
      const msg = error?.response?.data?.message || "An error occurred while accepting the invitation.";
      setErrorMessage(msg);
      
      // If error indicates email mismatch or unauthorized, maybe we show specific UI
      if (error?.response?.status === 403) {
        setErrorMessage("This invitation was sent to a different email address. Please log in with the correct account.");
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md shadow-xl border-primary/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">You've Been Invited!</CardTitle>
            <CardDescription className="text-base mt-2">
              You have been invited to collaborate on Castglo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <p className="text-center text-muted-foreground text-sm">
              Please log in or create an account to accept this invitation.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="w-full">
                <Link to={`/register?collaboratorToken=${token}`}>
                  Create an Account
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to={`/sign-in?redirect=/collaborators/accept?token=${token}`}>
                  Log In
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">Accepting Invitation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6 pb-8">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-2" />
              <p className="text-muted-foreground">Processing your invitation...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mb-2 animate-in zoom-in" />
              <p className="text-center font-medium">You are now a collaborator!</p>
              <Button 
                className="w-full mt-4" 
                onClick={() => navigate("/director")}
              >
                Go to Dashboard
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-destructive mb-2 animate-in zoom-in" />
              <p className="text-center text-destructive font-medium px-4">
                {errorMessage}
              </p>
              <div className="w-full flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate("/")}
                >
                  Go to Home
                </Button>
                {token && (
                  <Button 
                    className="flex-1"
                    onClick={() => handleAccept(token)}
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
