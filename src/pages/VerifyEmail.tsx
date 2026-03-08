import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage("Invalid verification link. No token found.");
        return;
      }

      const { error } = await verifyEmail(token);
      
      if (error) {
        setStatus('error');
        setErrorMessage(error);
      } else {
        setStatus('success');
      }
    };

    performVerification();
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mx-auto text-center mb-8">
          <Logo className="justify-center" />
        </div>

        <div className="bg-card rounded-2xl shadow-card p-8 text-center border">
          {status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
              <h1 className="text-2xl font-bold">Verifying Email</h1>
              <p className="text-muted-foreground">Please wait while we confirm your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-success">Email Verified!</h1>
                <p className="text-muted-foreground">
                  Your email has been successfully verified. You can now access all features of the platform.
                </p>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link to="/sign-in">
                  Continue to Sign In
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-destructive">Verification Failed</h1>
                <p className="text-muted-foreground">{errorMessage}</p>
              </div>
              <div className="space-y-3">
                <Button asChild className="w-full" variant="outline">
                  <Link to="/sign-in">Back to Sign In</Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  Token expired? Try signing in to resend the verification email.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
