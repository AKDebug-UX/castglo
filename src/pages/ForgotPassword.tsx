import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { forgotPasswordSchema, ForgotPasswordFormValues } from "@/lib/validations";

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const emailValue = watch("email");

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);

    try {
      const { error } = await forgotPassword(data.email);

      if (error) {
        toast.error(error);
        return;
      }

      setIsSubmitted(true);
      toast.success("Reset link sent! Check your email.");
    } catch (error: any) {
      console.error("ForgotPassword error:", error);
      toast.error(error?.response?.data?.message || error?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mx-auto text-center mb-4">
            <Logo className="justify-center" />
          </div>

          <div className="bg-card rounded-2xl shadow-card p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to <strong>{emailValue}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-primary hover:underline"
              >
                try another email
              </button>
            </p>

            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-xs text-muted-foreground mb-2">Demo: Click below to reset password</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/reset-password">Open Reset Page</Link>
              </Button>
            </div>

            <Button asChild variant="ghost" className="w-full">
              <Link to="/sign-in">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
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
            <h1 className="text-2xl font-bold">Forgot Password?</h1>
            <p className="text-muted-foreground mt-1">
              No worries, we'll send you reset instructions
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input
                {...register("email")}
                type="email"
                placeholder="Enter your email"
                disabled={isLoading}
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs font-medium text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}