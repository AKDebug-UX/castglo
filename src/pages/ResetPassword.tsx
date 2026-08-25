import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { resetPasswordSchema, ResetPasswordFormValues } from "@/lib/validations";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      navigate("/forgot-password");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await resetPassword({ 
        token, 
        newPassword: data.password, 
        confirmPassword: data.confirmPassword 
      });

      if (error) {
        toast.error(error);
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (error: any) {
      console.error("ResetPassword error:", error);
      toast.error(error?.response?.data?.message || error?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">New Password</label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password (min. 8 chars, letter & number)"
                  disabled={isLoading}
                  className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  disabled={isLoading}
                  className={`pr-10 ${errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-medium text-destructive mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
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