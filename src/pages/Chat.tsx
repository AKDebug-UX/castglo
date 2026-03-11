import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Shield, Zap, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Chat() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-12 max-w-4xl space-y-10">
          <header className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Glo Chat</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time professional communication for the casting world. Connect instantly with casting directors, agents, and talent.
            </p>
          </header>

          <div className="grid gap-8 items-center md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Fast, Secure, and Direct</h2>
                <p className="text-muted-foreground">
                  Glo Chat is designed specifically for the entertainment industry workflow. Send scripts, share showreels, and coordinate audition times without leaving the platform.
                </p>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">End-to-End Privacy</p>
                    <p className="text-xs text-muted-foreground">Your professional conversations and shared materials are always protected.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-3 w-3 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Instant Notifications</p>
                    <p className="text-xs text-muted-foreground">Never miss a casting update or an invitation to read for a role.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 h-5 w-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-3 w-3 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Rich Media Sharing</p>
                    <p className="text-xs text-muted-foreground">Seamlessly share high-quality video, audio, and documents.</p>
                  </div>
                </li>
              </ul>

              <div className="pt-4">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to="/sign-in">Start Chatting</Link>
                </Button>
              </div>
            </div>

            <Card className="border-2 border-dashed bg-card/50 relative overflow-hidden h-[400px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
              <div className="relative text-center space-y-4 p-8">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-6">
                  <Lock className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">Authentication Required</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sign in to access your professional inbox and start communicating with industry partners.
                </p>
                <Button variant="outline" asChild>
                  <Link to="/sign-in">Sign In to Inbox</Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
