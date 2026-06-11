import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

const verifyTwoFactorSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

type VerifyTwoFactorValues = z.infer<typeof verifyTwoFactorSchema>;

export default function VerifyTwoFactor() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyTwoFactor, resendTwoFactorCode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const tempToken = location.state?.tempToken;
  const email = location.state?.email;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerifyTwoFactorValues>({
    resolver: zodResolver(verifyTwoFactorSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: VerifyTwoFactorValues) => {
    setIsLoading(true);
    try {
      const result = await verifyTwoFactor(data.code, tempToken);
      if (result.error) {
        toast.error(result.error);
        setValue("code", "");
        setIsLoading(false);
        return;
      }
      toast.success("Verification successful!");
      const roleRoutes: Record<string, string> = {
        talent: "/talent",
        casting_director: "/director",
        industry_professional: "/professional",
        admin: "/admin",
      };
      navigate(roleRoutes[result.role || ""] || "/");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
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
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="flex flex-col items-center text-center">
          <Logo className="mb-4" />
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Two-factor authentication</h1>
          <p className="text-muted-foreground mt-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <div className="bg-card rounded-2xl border shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Verification code
              </label>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
              {errors.code && (
                <p className="text-xs font-medium text-destructive">{errors.code.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResend}
                disabled={isResending || isLoading}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend code"
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <Link to="/sign-in" className="text-sm font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
