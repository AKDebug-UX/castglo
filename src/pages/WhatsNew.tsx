import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, Zap, Layout, Database, Clock } from "lucide-react";

export default function WhatsNew() {
  const updates = [
    {
      category: "New Features",
      title: "Professional Booking System",
      icon: <Zap className="w-5 h-5 text-primary" />,
      description: "Direct talent engagement platform for industry professionals with date, budget, and project tracking.",
      details: ["Structured booking flow", "Budget negotiation tools", "Project notes & requirements"]
    },
    {
      category: "Profiles",
      title: "Professional Public Profiles",
      icon: <Layout className="w-5 h-5 text-blue-500" />,
      description: "Comprehensive public-facing profile tier for professionals with social media and portfolio integration.",
      details: ["Expertise showcase", "Portfolio work gallery", "Social media connectivity"]
    },
    {
      category: "Security",
      title: "Email Verification & Access Control",
      icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
      description: "Hardened security boundaries with a complete email verification workflow and unified access checks.",
      details: ["End-to-end verification portal", "Resend email capability", "Role-based security enforcement"]
    },
    {
        category: "System",
        title: "Data Sync & UI Refinement",
        icon: <Database className="w-5 h-5 text-orange-500" />,
        description: "Improved session management and synchronization between backend and frontend states.",
        details: ["Robust API mapping", "Synchronized profile data", "Blockchain history tracking"]
      }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F1FBFB]">
      <Header />
      <main className="flex-1 container py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="px-3 py-1 text-primary border-primary">
              April 3, 2026 - Update Report
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              What's New on CastGlo
            </h1>
            <p className="text-xl text-muted-foreground">
              A summary of the latest enhancements and features deployed in the last 48 hours.
            </p>
          </div>

          <div className="grid gap-6">
            {updates.map((update, index) => (
              <Card key={index} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-3 bg-muted rounded-xl">
                    {update.icon}
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-1 text-[10px] uppercase font-bold">
                      {update.category}
                    </Badge>
                    <CardTitle className="text-2xl">{update.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {update.description}
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {update.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-2xl bg-primary/5 p-8 border border-primary/20 text-center">
            <h3 className="text-lg font-bold text-primary flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5" />
              Next Steps for Preview
            </h3>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Please review the new features directly in the platform. You can access the <strong>Professional Profiles</strong> and the <strong>Booking System</strong> from the main navigation.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
