 import { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Mail, ArrowLeft, ArrowRight, Loader2, Info, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SocialLogin } from "@/components/auth/SocialLogin";
import { signUpSchema, SignUpFormValues } from "@/lib/validations";

const typeLabels: Record<string, { title: string; description: string; role: UserRole }> = {
  talent: {
    title: "Join as Talent",
    description: "Showcase your skills and connect with casting directors",
    role: "talent"
  },
  casting_director: {
    title: "Join as Casting Director",
    description: "Discover exceptional talent for your productions",
    role: "casting_director"
  },
  industry_professional: {
    title: "Join as Industry Professional",
    description: "Showcase your craft and get hired for your next production",
    role: "industry_professional"
  },
  admin: {
    title: "Join as Admin",
    description: "Manage and moderate the platform",
    role: "admin"
  },
};

export default function SignUp() {
  const { type = "talent" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const selectedPlan = searchParams.get("plan");
  const selectedCycle = searchParams.get("cycle");
  const collaboratorToken = searchParams.get("collaboratorToken");
  const inviteEmail = searchParams.get("email");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const config = typeLabels[type] || typeLabels.talent;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: inviteEmail || "",
      password: "",
      confirmPassword: "",
      agreed: false,
    },
  });

  const submittedEmail = watch("email");

  useEffect(() => {
    if (collaboratorToken) {
      sessionStorage.setItem("collaboratorToken", collaboratorToken);
    }
    if (inviteEmail) {
      setValue("email", inviteEmail);
    }
  }, [collaboratorToken, inviteEmail, setValue]);

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);

    try {
      const { error } = await signUp({ 
        email: data.email, 
        password: data.password, 
        role: config.role, 
        fullName: data.fullName,
        collaboratorToken: collaboratorToken || undefined,
      });

      if (error) {
        toast.error(error);
        return;
      }

      if (selectedPlan) {
        sessionStorage.setItem('pendingPlan', JSON.stringify({ plan: selectedPlan, cycle: selectedCycle }));
      }

      setIsSuccess(true);
      toast.success("Account created successfully!");
    } catch (error: any) {
      console.error("SignUp error:", error);
      toast.error(error?.response?.data?.message || error?.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
            <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a verification link to <strong>{submittedEmail}</strong>. 
              Please verify your account to start exploring.
              {collaboratorToken && (
                <span className="block mt-2 font-medium text-primary">
                  Once verified, your invitation will be automatically accepted.
                </span>
              )}
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/sign-in">
                  Go to Sign In
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mx-auto text-center mb-4">
          <Logo className="justify-center" />
        </div>

        <div className="bg-card rounded-2xl shadow-card p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">{config.title}</h1>
            <p className="text-muted-foreground mt-1">{config.description}</p>
          </div>

          {selectedPlan && (
            <div className="mb-6 p-4 rounded-xl bg-[#DEFCFE]/50 border border-[#009698]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <Badge variant="outline" className="text-[#009698] border-[#009698]/20 bg-[#009698]/5">
                    {selectedPlan.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Selected Plan</p>
                  <p className="text-sm font-medium text-slate-900 capitalize">{selectedCycle} Billing</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs text-[#009698] hover:text-[#009698] hover:bg-[#009698]/5">
                <Link to="/pricing">Change</Link>
              </Button>
            </div>
          )}

          <SocialLogin mode="signup" disabled={isLoading} />

          {inviteEmail && (
            <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2.5 text-xs text-primary font-medium">
              <Info className="w-4 h-4 shrink-0" />
              <span>Registering with invited email: <strong>{inviteEmail}</strong></span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <Input 
                {...register("fullName")}
                type="text" 
                placeholder="Enter your full name"
                disabled={isLoading}
                className={errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.fullName && (
                <p className="text-xs font-medium text-destructive mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input 
                {...register("email")}
                type="email" 
                placeholder="Enter your email"
                readOnly={!!inviteEmail}
                disabled={isLoading}
                className={`${inviteEmail ? "bg-muted/50 cursor-not-allowed text-muted-foreground " : ""}${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.email && (
                <p className="text-xs font-medium text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Input 
                  {...register("password")}
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create a password (min. 8 chars, letter & number)"
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
                  placeholder="Confirm your password"
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

            <div className="space-y-1">
              <div className="flex items-start gap-2">
                <Controller
                  name="agreed"
                  control={control}
                  render={({ field }) => (
                    <Checkbox 
                      id="terms" 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                      className="mt-0.5"
                    />
                  )}
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms" className="text-foreground underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-foreground underline">Privacy Policy</Link>
                </label>
              </div>
              {errors.agreed && (
                <p className="text-xs font-medium text-destructive">{errors.agreed.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            This site is protected by reCAPTCHA and the Google{" "}
            <Link to="/privacy" className="underline">Privacy Policy</Link> and{" "}
            <Link to="/terms" className="underline">Terms of Service</Link> apply.
          </p>

          <p className="text-center text-sm mt-6">
            Already have an account?{" "}
            <Link to="/sign-in" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

