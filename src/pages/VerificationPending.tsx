import { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function VerificationPending() {
  const { user, resendVerification, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    if (!user?.email) return;
    setIsLoading(true);
    const { error } = await resendVerification(user.email);
    setIsLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Verification email resent successfully!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mx-auto text-center mb-8">
          <Logo className="justify-center" />
        </div>

        <div className="bg-card rounded-2xl shadow-card p-8 text-center border">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
          <p className="text-muted-foreground mb-6">
            Your account is almost ready! We've sent a verification link to <strong>{user?.email}</strong>. 
            Please check your inbox and verify your email to access all features.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleResend} 
              className="w-full" 
              size="lg" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Resend Verification Email
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => signOut()}
            >
              Sign Out
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-8">
            Can't find the email? Check your spam folder or try resending the link.
          </p>
        </div>
      </div>
    </div>
  );
}
