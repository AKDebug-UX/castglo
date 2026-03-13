import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, Briefcase, Users, ShieldCheck, Heart, Globe, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function About() {
  const roles = [
    "Actors", "Models", "Dancers", "Musicians", "Voice Artists", 
    "Content Creators", "Casting Directors", "Photographers", 
    "Videographers", "Stylists", "Makeup Artists", "Crew Members"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Header />
      <main className="flex-1">
        {/* Hero Section - Matching Landing Page style */}
        <section className="bg-[#DEFCFE] py-16 lg:py-24 relative overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
                About <span className="text-gradient">Castglo</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 tracking-tight">
                Where Talent Meets Opportunity
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Castglo is a next-generation global casting and talent discovery platform built to connect talents, casting directors, and entertainment industry professionals in one trusted digital ecosystem.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We are creating a smarter, more accessible way for people in the entertainment and creator economy to discover opportunities, showcase their abilities, and build meaningful industry connections across borders.
                </p>
              </div>
            </div>
          </div>
          
          {/* Decorative elements matching landing page */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </section>

        {/* Mission & Vision - Using standard card styling */}
        <section className="py-20 container">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-none shadow-card hover:shadow-card-hover transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardContent className="p-10 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  To simplify how talent is discovered and how creative professionals connect by creating a platform that expands access, builds trust, and opens doors to real opportunities.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-card hover:shadow-card-hover transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardContent className="p-10 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Eye className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  To become a leading global platform for casting, talent visibility, and creative collaboration, shaping a more connected, inclusive, and opportunity-driven entertainment industry.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What We Do - Split section with feature items */}
        <section className="py-20 bg-slate-50">
          <div className="container max-w-6xl">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">What We Do</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We bring together talents, casting directors, and industry professionals in one place, making it easier to showcase portfolios, find opportunities, offer services, and build valuable creative partnerships.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "Portfolio Showcasing", icon: Star },
                    { title: "Casting Opportunities", icon: Zap },
                    { title: "Professional Services", icon: Briefcase },
                    { title: "Creative Partnerships", icon: Globe }
                  ].map((item) => (
                    <div key={item.title} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-semibold text-slate-700 text-sm">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-[2rem] blur-2xl" />
                <Card className="relative border-none shadow-card-hover rounded-2xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  <CardContent className="p-10 space-y-4">
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Why Castglo</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      Castglo is designed to make discovery faster, visibility stronger, and collaboration easier. We combine technology, trust, and industry insight to create a platform where opportunity and professionalism meet.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team - Focused and Clean */}
        <section className="py-24 container max-w-4xl text-center space-y-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto shadow-sm">
            <Users className="w-8 h-8 text-accent" />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Our Team</h3>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Our team brings together entrepreneurial leadership, marketing expertise, and technology innovation to build a platform designed for the future of casting and creative opportunity. We are building Castglo to be trusted, forward-looking, and industry focused.
            </p>
          </div>
        </section>

        {/* Who We Serve - Modern Pill design */}
        <section className="py-24 bg-[#F5FBFC]">
          <div className="container text-center space-y-12">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Who We Serve</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">Connecting professionals across the entire entertainment spectrum</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {roles.map((role) => (
                <Badge key={role} variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-2.5 rounded-full border-slate-200 shadow-sm transition-colors text-sm font-medium">
                  {role}
                </Badge>
              ))}
              <Badge className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full shadow-md transition-all text-sm font-bold">
                & Many More
              </Badge>
            </div>
            
            <p className="text-slate-400 font-medium italic animate-pulse">
              ...and other entertainment and creative professionals.
            </p>
          </div>
        </section>

        {/* Final CTA - Matching landing page emotional tone */}
        <section className="py-24 bg-white text-center">
          <div className="container">
            <div className="flex flex-col items-center justify-center gap-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center shadow-inner">
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              </div>
              <p className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Castglo <span className="text-slate-300 font-light">—</span> where talent meets opportunity.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
