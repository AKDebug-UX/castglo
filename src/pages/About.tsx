import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Briefcase, Users, ShieldCheck, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F9F7F2] to-white font-montserrat">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#DEFCFE] py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="container max-w-5xl relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight font-jakarta mb-6">
              About <span className="text-[#009698]">Us</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 font-jakarta">
              Welcome to Castglo
            </h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                Castglo is a next-generation global casting and talent discovery platform built to connect talents, casting directors, and entertainment industry professionals in one trusted digital ecosystem.
              </p>
              <p className="text-lg text-slate-500 leading-relaxed">
                We are creating a smarter, more accessible way for people in the entertainment and creator economy to discover opportunities, showcase their abilities, and build meaningful industry connections across borders.
              </p>
              <p className="text-lg text-slate-500 leading-relaxed">
                Whether you are an emerging actor, model, dancer, voice artist, content creator, photographer, crew member, or casting professional, Castglo is designed to help you find the right opportunities faster, more transparently, and with greater confidence.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 container max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 font-jakarta">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                To simplify how talent is discovered and how creative professionals connect by creating a platform that expands access, builds trust, and opens doors to real opportunities.
              </p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#D98EB3]/10 flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-[#D98EB3]" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 font-jakarta">Our Vision</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                To become a leading global platform for casting, talent visibility, and creative collaboration, shaping a more connected, inclusive, and opportunity-driven entertainment industry.
              </p>
            </div>
          </div>
        </section>

        {/* What We Do & Why Castglo */}
        <section className="py-20 bg-slate-50">
          <div className="container max-w-6xl">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h3 className="text-3xl font-black text-slate-900 mb-6 font-jakarta">What We Do</h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  We bring together talents, casting directors, and industry professionals in one place, making it easier to showcase portfolios, find opportunities, offer services, and build valuable creative partnerships.
                </p>
                <div className="space-y-4">
                  {[
                    "Portfolio Showcasing",
                    "Casting Opportunities",
                    "Professional Services",
                    "Creative Partnerships"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                <h3 className="text-3xl font-black text-slate-900 mb-6 font-jakarta">Why Castglo</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Castglo is designed to make discovery faster, visibility stronger, and collaboration easier. We combine technology, trust, and industry insight to create a platform where opportunity and professionalism meet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="py-20 container max-w-4xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 mx-auto">
            <Users className="w-8 h-8 text-[#5849D7]" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-6 font-jakarta">Our Team</h3>
          <p className="text-lg text-slate-600 leading-relaxed mb-10">
            Our team brings together entrepreneurial leadership, marketing expertise, and technology innovation to build a platform designed for the future of casting and creative opportunity. With experience spanning business growth, brand development, digital strategy, and scalable product development, we are building Castglo to be trusted, forward-looking, and industry focused.
          </p>
        </section>

        {/* Who We Serve */}
        <section className="py-20 bg-[#F5FBFC]">
          <div className="container max-w-6xl text-center">
            <h3 className="text-3xl font-black text-slate-900 mb-10 font-jakarta">Who We Serve</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Actors", "Models", "Dancers", "Musicians", "Voice Artists", 
                "Content Creators", "Casting Directors", "Photographers", 
                "Videographers", "Stylists", "Makeup Artists", "Crew Members"
              ].map((role) => (
                <span key={role} className="bg-white px-6 py-3 rounded-full text-slate-700 font-bold shadow-sm border border-slate-100 text-sm">
                  {role}
                </span>
              ))}
              <span className="bg-primary/10 px-6 py-3 rounded-full text-primary font-bold shadow-sm border border-primary/10 text-sm">
                & Many More
              </span>
            </div>
            <p className="mt-12 text-slate-500 font-medium italic">
              ...and other entertainment and creative professionals.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-white text-center">
          <div className="container">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <p className="text-2xl md:text-3xl font-black text-slate-900 font-jakarta">
                Castglo <span className="text-slate-400 font-medium">—</span> where talent meets opportunity.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
