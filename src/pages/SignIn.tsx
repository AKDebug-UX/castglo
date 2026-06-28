import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { SocialLogin } from "@/components/auth/SocialLogin";


const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect");

  // Extract token from redirect query parameter if it exists (e.g. /collaborators/accept?token=XYZ)
  const getCollaboratorToken = () => {
    if (!redirect) return null;
    try {
      const url = new URL(redirect, window.location.origin);
      return url.searchParams.get("token");
    } catch {
      const match = redirect.match(/[?&]token=([^&]+)/);
      return match ? match[1] : null;
    }
  };
  const token = getCollaboratorToken();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInValues) => {
    console.log("Submitting Sign In form with data:", data);
    setIsLoading(true);

    try {
      const result = await signIn(data.email, data.password);
      console.log("Sign In result:", result);

      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }



      if (result.requiresTwoFactor && result.tempToken) {
        navigate("/auth/2fa", {
          state: { tempToken: result.tempToken, email: data.email, returnTo: redirect || location.state?.from?.pathname }
        });
        return;
      }

      toast.success("Welcome back!");

      // Route based on redirect or user role returned from API
      if (redirect) {
        navigate(redirect);
      } else if (result.role) {
        const roleRoutes: Record<string, string> = {
          talent: "/talent",
          casting_director: "/director",
          industry_professional: "/professional",
          admin: "/admin",
        };
        navigate(roleRoutes[result.role] || "/");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Sign In catch block error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="flex flex-col items-center text-center">
          <Logo className="mb-4" />
          <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
          <p className="text-muted-foreground mt-2">
            Enter your credentials to access your account
          </p>
        </div>

        <SocialLogin mode="signin" disabled={isLoading} />

        <div className="bg-card rounded-2xl border shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <Input
                {...register("email")}
                type="email"
                placeholder="name@example.com"
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  disabled={isLoading}
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
                <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="rememberMe"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                )}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link 
            to={token ? `/join?collaboratorToken=${token}` : "/join"} 
            className="font-semibold text-primary hover:underline"
          >
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
