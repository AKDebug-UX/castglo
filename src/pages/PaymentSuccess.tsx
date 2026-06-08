import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Loader2, PartyPopper, Calendar, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionAPI, castingCallAPI } from "@/lib/api";
import { toast } from "sonner";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type");
  const projectId = searchParams.get("id");
  const { refreshUser, user } = useAuth();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      // If there's no session ID, we might be in a testing/direct access scenario
      if (!sessionId && !type) {
        setIsVerifying(false);
        return;
      }

      try {
        if (type === "boost") {
          // Boost payment verification handled by webhook
          await new Promise(resolve => setTimeout(resolve, 1500));
          setIsVerifying(false);
          toast.success("Project boosted and published successfully!");
        } else if (type === "instant-post") {
          // Instant post payment verification handled by webhook
          await new Promise(resolve => setTimeout(resolve, 1500));
          setIsVerifying(false);
          toast.success("Project published instantly!");
        } else {
          // Subscription payment verification
          await refreshUser();
          setIsVerifying(false);
          toast.success("Subscription activated successfully!");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, type, projectId, refreshUser]);

  const isBoost = type === "boost" || type === "instant-post";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          {isVerifying ? (
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardContent className="p-12 text-center flex flex-col items-center gap-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {isBoost ? "Finalising your project boost..." : "Activating your plan..."}
                  </h1>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    We're just finalizing your payment details. This will only take a moment.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
              {/* Main Success Card */}
              <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-[#009698] via-[#5849D7] to-[#FF7A30]" />
                <CardContent className="p-8 md:p-12 text-center">
                  <div className="mb-8 relative inline-block">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 relative z-10">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full bg-green-400/20 rounded-full animate-ping scale-125" />
                    <div className="absolute -top-4 -right-4 text-yellow-400 animate-bounce">
                      <PartyPopper className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="space-y-4 mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Payment Successful!</h1>
                    <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
                      {isBoost 
                        ? "Your casting call has been boosted and is now live on the platform! Expect to see more applicants soon."
                        : "Welcome to the premium community. Your account has been upgraded and all features are now unlocked."}
                    </p>
                  </div>

                  {isBoost ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-2">
                        <Star className="w-5 h-5 text-[#FF7A30]" />
                        <span className="text-xs font-bold uppercase text-slate-400">Type</span>
                        <span className="text-sm font-bold text-slate-700">{type === "instant-post" ? "Instant Post" : "Project Add-on"}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#009698]" />
                        <span className="text-xs font-bold uppercase text-slate-400">Status</span>
                        <span className="text-sm font-bold text-green-600">Published</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#5849D7]" />
                        <span className="text-xs font-bold uppercase text-slate-400">Next Billing</span>
                        <span className="text-sm font-bold text-slate-700">Next Month</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-2">
                        <Star className="w-5 h-5 text-[#FF7A30]" />
                        <span className="text-xs font-bold uppercase text-slate-400">Plan Type</span>
                        <span className="text-sm font-bold text-slate-700 capitalize">{user?.role?.replace('_', ' ') || 'Premium'}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#009698]" />
                        <span className="text-xs font-bold uppercase text-slate-400">Status</span>
                        <span className="text-sm font-bold text-green-600">Active</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="rounded-2xl h-14 px-8 text-lg font-bold group" asChild>
                      <Link to={isBoost ? "/director/projects" : (user?.role === "casting_director" ? "/director" : "/talent")}>
                        Go to Dashboard
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="rounded-2xl h-14 px-8 text-lg font-bold border-2" asChild>
                      <Link to={isBoost ? `/cast/${projectId}` : (user?.role === "casting_director" ? "/director/billing" : "/talent/profile?tab=subscription")}>
                        {isBoost ? "View Project" : "Manage Subscription"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Extra Support Info */}
              <div className="text-center">
                <p className="text-sm text-slate-400">
                  A receipt has been sent to your email. Need help? <Link to="/contact" className="text-primary font-bold hover:underline">Contact Support</Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
