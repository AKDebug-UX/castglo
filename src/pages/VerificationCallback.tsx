import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Loader2, 
  RefreshCw,
  User,
  LayoutDashboard
} from "lucide-react";
import { toast } from "sonner";

export default function VerificationCallback() {
  const [searchParams] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [isRefreshing, setIsRefreshing] = useState(true);

  const rawSessionId = searchParams.get("verificationSessionId") || searchParams.get("sessionId") || searchParams.get("session_id") || "";
  const rawStatus = searchParams.get("status") || "Pending";

  const statusNormalized = rawStatus.trim().toLowerCase();

  const isApproved = statusNormalized === "approved" || statusNormalized === "success" || statusNormalized === "completed";
  const isInReview = statusNormalized === "in review" || statusNormalized === "in_review" || statusNormalized === "pending" || statusNormalized === "processing";
  const isFailed = statusNormalized === "rejected" || statusNormalized === "failed" || statusNormalized === "declined";

  useEffect(() => {
    const handleCallback = async () => {
      setIsRefreshing(true);
      try {
        await refreshUser();
      } catch (err) {
        console.error("Failed to refresh user during verification callback:", err);
      } finally {
        setIsRefreshing(false);
      }
    };

    handleCallback();
  }, []);

  const getDashboardRoute = () => {
    if (!user) return "/sign-in";
    switch (user.role) {
      case "casting_director":
        return "/director";
      case "industry_professional":
        return "/professional";
      case "admin":
        return "/admin";
      case "talent":
      default:
        return "/talent";
    }
  };

  const getProfileRoute = () => {
    if (!user) return "/sign-in";
    switch (user.role) {
      case "casting_director":
        return "/director/profile";
      case "industry_professional":
        return "/professional/profile";
      case "talent":
      default:
        return "/talent/profile";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-lg">
        {/* Header Logo */}
        <div className="flex flex-col items-center mx-auto text-center mb-8">
          <Logo className="justify-center" />
        </div>

        {/* Status Card */}
        <div className="bg-card rounded-3xl shadow-xl p-8 border border-border/60 text-center relative overflow-hidden backdrop-blur-sm">
          {/* Subtle Top Accent Glow */}
          <div 
            className={`absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none ${
              isApproved ? "bg-emerald-500" : isFailed ? "bg-destructive" : "bg-amber-500"
            }`}
          />

          {/* Status Icon */}
          <div className="relative mb-6 inline-flex">
            {isApproved ? (
              <div className="w-20 h-20 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center ring-8 ring-emerald-500/5 animate-in zoom-in-50 duration-300">
                <ShieldCheck className="w-10 h-10" />
              </div>
            ) : isFailed ? (
              <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center ring-8 ring-destructive/5 animate-in zoom-in-50 duration-300">
                <XCircle className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center ring-8 ring-amber-500/5 animate-in zoom-in-50 duration-300">
                <Clock className="w-10 h-10 animate-pulse" />
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="mb-4">
            <Badge
              variant="outline"
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${
                isApproved
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                  : isFailed
                  ? "bg-destructive/10 text-destructive border-destructive/30"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
              }`}
            >
              {rawStatus}
            </Badge>
          </div>

          {/* Title & Description */}
          {isApproved ? (
            <>
              <h1 className="text-2xl font-extrabold tracking-tight mb-3">Identity Verified!</h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Your identity verification has been successfully processed and approved. Your profile now features the official <strong>Verified Identity Badge</strong>.
              </p>
            </>
          ) : isFailed ? (
            <>
              <h1 className="text-2xl font-extrabold tracking-tight mb-3">Verification Failed</h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                We were unable to verify your identity session. This can happen if documents were blurry or invalid. You can attempt verification again at any time.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold tracking-tight mb-3">Verification In Processing</h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Your identity documents have been received and are currently being processed. Your status will update automatically once review completes.
              </p>
            </>
          )}

          {/* Session ID Metadata Pill */}
          {rawSessionId && (
            <div className="bg-muted/50 rounded-xl px-3 py-2 text-[11px] font-mono text-muted-foreground mb-6 break-all">
              Session ID: <span className="text-foreground">{rawSessionId}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full font-semibold shadow-md gap-2"
              onClick={() => navigate(getDashboardRoute())}
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full font-medium gap-2"
              onClick={() => navigate(getProfileRoute())}
            >
              <User className="w-4 h-4" />
              View My Profile
            </Button>

            {isRefreshing && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                Syncing user profile status...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
