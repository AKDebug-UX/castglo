import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ArrowLeft, AlertCircle } from "lucide-react";
import { twoFactorCodeSchema } from "@/lib/validations";

export default function VerifyTwoFactor() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyTwoFactor, resendTwoFactorCode, setPendingTwoFactor } = useAuth();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const state = location.state as { tempToken?: string; email?: string; returnTo?: string } | null;
  const tempToken = state?.tempToken;
  const email = state?.email;
  const returnTo = state?.returnTo;

  const normalizedCode = code.trim().toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validationResult = twoFactorCodeSchema.safeParse({ code: normalizedCode });
    if (!validationResult.success) {
      setErrorMsg(validationResult.error.errors[0]?.message || "Invalid verification code.");
      return;
    }

    if (!tempToken) {
      toast.error("Session expired. Please sign in again.");
      navigate("/sign-in", { replace: true });
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyTwoFactor(normalizedCode, tempToken);
      if (result.error === "__EXPIRED__") {
        toast.error("Your login session expired. Please sign in again.");
        setPendingTwoFactor(null);
        navigate("/sign-in", { replace: true });
        return;
      }
      if (result.error) {
        setErrorMsg(result.error);
        setCode("");
        return;
      }
      toast.success("Verification successful!");
      const roleRoutes: Record<string, string> = {
        talent: "/talent",
        casting_director: "/director",
        industry_professional: "/professional",
        admin: "/admin",
      };
      navigate(returnTo || roleRoutes[result.role || ""] || "/", { replace: true });
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const result = await resendTwoFactorCode(email);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Verification code resent!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[420px] space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <Logo className="mb-6" />
          <div className="w-16 h-16 rounded-2xl bg-[#009698]/10 flex items-center justify-center mb-4 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-[#009698]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Two-factor authentication</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Enter your 6-digit authenticator code or a backup code to continue.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Authenticator code or backup code
              </label>
              <Input
                id="2fa-code-input"
                type="text"
                inputMode="text"
                autoComplete="one-time-code"
                autoFocus
                placeholder="000000 or AB12CD34EF"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setErrorMsg(null);
                }}
                disabled={isLoading}
                className="text-center text-lg tracking-widest font-mono rounded-xl h-12"
              />
              {errorMsg && (
                <div className="flex items-center gap-2 text-destructive text-xs font-medium mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              id="2fa-verify-btn"
              className="w-full bg-[#009698] hover:bg-[#009698]/90 font-bold rounded-xl h-11 shadow-md shadow-[#009698]/10 text-white"
              disabled={isLoading || !normalizedCode}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : "Verify & Continue"}
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-3">
            <p className="text-xs text-muted-foreground">Didn't get a code?</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResend}
              disabled={isResending || isLoading}
              className="text-[#009698] hover:text-[#009698] hover:bg-[#009698]/5 text-xs font-semibold"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Resending...
                </>
              ) : "Resend code"}
            </Button>
          </div>
        </div>

        {/* Back to sign in */}
        <div className="text-center">
          <Link
            to="/sign-in"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
