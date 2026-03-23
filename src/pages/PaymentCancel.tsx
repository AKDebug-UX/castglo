import { Link } from "react-router-dom";
import { XCircle, ArrowLeft, MessageCircle, HelpCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main Cancel Card */}
            <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
              <div className="h-3 bg-slate-200" />
              <CardContent className="p-8 md:p-12 text-center">
                <div className="mb-8 relative inline-block">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <XCircle className="w-12 h-12" />
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">Payment Cancelled</h1>
                  <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
                    No worries! Your transaction was cancelled and no charges were made to your account.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800">Changed your mind?</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      You can return to the pricing page anytime to choose a different plan that fits your needs.
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#FF7A30]">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800">Payment Issue?</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      If your card was declined or you encountered a technical error, please try a different payment method.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="rounded-2xl h-14 px-8 text-lg font-bold group" asChild>
                    <Link to="/pricing">
                      <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                      Back to Pricing
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-2xl h-14 px-8 text-lg font-bold border-2" asChild>
                    <Link to="/contact">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Contact Support
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Extra Help Info */}
            <div className="text-center">
              <p className="text-sm text-slate-400">
                Need immediate assistance? Our team is available 24/7. <Link to="/faq" className="text-primary font-bold hover:underline">Check FAQs</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
