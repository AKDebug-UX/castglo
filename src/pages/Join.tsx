import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Video, Briefcase, ChevronRight, Sparkles, Zap, Shield } from "lucide-react";

export default function Join() {
  const joinOptions = [
    {
      id: "talent",
      title: "Join as Talent",
      description: "Showcase your skills, apply for roles, and get discovered by top casting directors.",
      icon: Sparkles,
      color: "bg-blue-50 text-blue-600",
      link: "/join/talent"
    },
    {
      id: "casting_director",
      title: "Join as Casting Director",
      description: "Post projects, manage auditions, and find the perfect performers for your production.",
      icon: Zap,
      color: "bg-purple-50 text-purple-600",
      link: "/join/casting_director"
    },
    {
      id: "industry_professional",
      title: "Join as Professional",
      description: "Offer your services, connect with talent, and grow your industry presence.",
      icon: Shield,
      color: "bg-orange-50 text-orange-600",
      link: "/join/industry_professional"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#DEFCFE]">
      <Header />
      <main className="flex-1 py-16 lg:py-24 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#009698]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900">
              Get <span className="text-[#009698]">Started</span> with CastGlo
            </h1>
            <p className="text-xl text-slate-400 max-w-[700px] mx-auto">
              Select how you want to join our platform to begin your journey with us.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {joinOptions.map((option) => (
              <Card key={option.id} className="relative group overflow-hidden border-none shadow-xl rounded-[32px] hover:scale-[1.02] transition-all duration-300">
                <CardHeader className="pt-10 pb-6 text-center">
                  <div className={`mx-auto w-16 h-16 rounded-2xl ${option.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <option.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold mb-2">{option.title}</CardTitle>
                  <CardDescription className="text-slate-600 leading-relaxed px-4">
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-10 pt-4 flex justify-center">
                  <Button asChild className="rounded-full px-8 py-6 h-auto text-lg font-bold bg-[#009698] hover:bg-[#009698]/90 text-white transition-all duration-300 group shadow-lg shadow-[#009698]/20">
                    <Link to={option.link}>
                      Get Started
                      <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>


        </div>
      </main>
      <Footer />
    </div>
  );
}
