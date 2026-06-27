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
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { refreshCollaborations } = useWorkspace();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "error" | "idle">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmailMismatch, setIsEmailMismatch] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid invitation link. Token is missing.");
      return;
    }

    if (!user) {
      navigate(`/sign-in?redirect=${encodeURIComponent(`/collaborators/accept?token=${token}`)}`);
      return;
    }

    handleAccept(token);
  }, [user, authLoading, token, navigate]);

  const handleAccept = async (invitationToken: string) => {
    setStatus("loading");
    setIsEmailMismatch(false);
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
      
      // If error indicates email mismatch or unauthorized, show specific UI
      if (error?.response?.status === 403) {
        const invitedEmail = error?.response?.data?.email || error?.response?.data?.targetEmail || "another email address";
        setErrorMessage(`This invite was sent to ${invitedEmail}, but you are logged in as ${user?.email}. Please switch accounts.`);
        setIsEmailMismatch(true);
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
              <div className="w-full flex flex-col gap-3 mt-6">
                {isEmailMismatch ? (
                  <Button 
                    className="w-full"
                    onClick={async () => {
                      await signOut();
                      navigate(`/sign-in?redirect=${encodeURIComponent(`/collaborators/accept?token=${token}`)}`);
                    }}
                  >
                    Switch Accounts / Sign In
                  </Button>
                ) : (
                  token && (
                    <Button 
                      className="w-full"
                      onClick={() => handleAccept(token)}
                    >
                      Try Again
                    </Button>
                  )
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  Go to Home
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
