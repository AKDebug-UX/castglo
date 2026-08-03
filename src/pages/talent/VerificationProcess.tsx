import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Zap, CheckCircle2, Lock, Sparkles, UserCheck, Shield, FileText } from 'lucide-react';
import { VerifyProfileButton } from '@/components/verification/VerifyProfileButton';

export default function VerificationProcess() {
  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-12 px-4 md:px-6 flex items-center justify-center">
      <div className="max-w-4xl mx-auto w-full space-y-10">
        
        {/* Hero Section Header */}
        <div className="text-center space-y-4">
          <Badge className="px-4 py-1.5 text-xs font-semibold border-teal-500/30 text-teal-300 bg-teal-500/10 rounded-full inline-flex items-center gap-1.5 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-[#009698]" /> Official Platform Verification
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent">
            Verify Your Castglo Identity
          </h1>
          
          <p className="text-slate-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Stand out in search results, unlock exclusive high-budget casting calls, and build instant trust with casting directors and recruiters.
          </p>
        </div>

        {/* Main Verification Showcase Card */}
        <Card className="bg-slate-900/80 border-2 border-[#009698]/30 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl relative">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-[#009698] to-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl shadow-md flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-current" /> Instant & Automated
          </div>

          <CardHeader className="p-8 sm:p-10 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-[#009698]/20 border border-[#009698]/40 flex items-center justify-center text-[#009698] shadow-inner">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  Instant Identity Verification
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm mt-0.5">
                  Complete your biometrics & photo ID verification in under 2 minutes.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 sm:p-10 space-y-8">
            
            {/* Feature Perks Grid */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2 hover:border-[#009698]/50 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-100">Biometric Matching</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time 3D selfie facial scan to match your face with your government photo ID.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2 hover:border-[#009698]/50 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-100">Government Photo ID</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Supports passport, driver's license, and national ID cards across 190+ countries.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2 hover:border-[#009698]/50 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-100">Official Verified Badge</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instantly receive the verified checkmark on your public & talent profile upon completion.
                </p>
              </div>
            </div>

            {/* Guarantees List */}
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#009698]" /> Security & Privacy Guarantees
              </h4>
              <div className="grid gap-2 sm:grid-cols-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>256-bit bank-grade encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Fully GDPR & Privacy compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>No physical document mailing required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Automated instant processing</span>
                </div>
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="pt-2">
              <VerifyProfileButton
                size="lg"
                className="w-full bg-[#009698] hover:bg-[#008082] text-white font-bold py-7 text-lg rounded-2xl shadow-xl shadow-[#009698]/20 transition-all duration-300 hover:scale-[1.01]"
              >
                <Zap className="w-6 h-6 mr-2 fill-current" /> Launch Instant Verification
              </VerifyProfileButton>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
