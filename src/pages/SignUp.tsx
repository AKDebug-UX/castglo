 import { useState, useEffect } from "react";
 import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Mail, CheckCircle, ArrowLeft, ArrowRight, Loader2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const config = typeLabels[type] || typeLabels.talent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!agreed) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);

    const { error } = await signUp({ 
      email, 
      password, 
      role: config.role, 
      fullName 
    });

    if (error) {
      toast.error(error);
      setIsLoading(false);
      return;
    }

    // After successful registration, if they picked a plan, we might want to 
    // redirect them to the checkout page once they've verified their email.
    // For now, we'll store the plan info in session storage or just proceed to success page.
    if (selectedPlan) {
      sessionStorage.setItem('pendingPlan', JSON.stringify({ plan: selectedPlan, cycle: selectedCycle }));
    }

    setIsSuccess(true);
    toast.success("Account created successfully!");
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
              We've sent a verification link to <strong>{email}</strong>. 
              Please verify your account to start exploring.
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

          {/* Social Login */}
          {/* <div className="space-y-3">
            <Button variant="social" className="w-full" type="button">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            <Button variant="social" className="w-full" type="button">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </Button>
          </div> */}

          {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div> */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <Input 
                type="text" 
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <Input 
                type="password" 
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
              <Input 
                type="password" 
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox 
                id="terms" 
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link to="/terms" className="text-foreground underline">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-foreground underline">Privacy Policy</Link>
              </label>
            </div>

             <Button type="submit" className="w-full" size="lg" disabled={!agreed || isLoading}>
               {isLoading ? "Creating account..." : "Create Account"}
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
