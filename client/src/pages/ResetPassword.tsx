import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      navigate("/forgot-password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const { error } = await resetPassword(password, token);

    if (error) {
      toast.error(error);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsSuccess(true);
    toast.success("Password reset successfully!");
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mx-auto text-center mb-4">
            <Logo className="justify-center" />
          </div>

          <div className="bg-card rounded-2xl shadow-card p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Password Reset!</h1>
            <p className="text-muted-foreground mb-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Button asChild className="w-full" size="lg">
              <Link to="/sign-in">Continue to Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="justify-center" />
        </div>

        <div className="bg-card rounded-2xl shadow-card p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Set New Password</h1>
            <p className="text-muted-foreground mt-1">
              Your new password must be different from previous passwords
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 6 characters
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <p className="text-center text-sm mt-6">
            Remember your password?{" "}
            <Link to="/sign-in" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}