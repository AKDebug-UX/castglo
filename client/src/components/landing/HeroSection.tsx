import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, Video, Users } from "lucide-react";

import talentMichael from "@/assets/talent-michael.jpg";
import talentTom from "@/assets/talent-tom.jpg";
import talentSarah from "@/assets/talent-sarah.jpg";
import newsProduction from "@/assets/news-production.jpg";
import newsAudition from "@/assets/news-audition.jpg";

const talents = [
  {
    id: 1,
    name: "Michael Chen",
    role: "Character Actor • Comedy",
    image: talentMichael,
  },
  {
    id: 2,
    name: "Tom Andy",
    role: "Lead Actor • Drama",
    image: talentTom,
  },
  {
    id: 3,
    name: "Sarah Johnson",
    role: "Voice Actor • Animation",
    image: talentSarah,
  },
];

const newsArticles = [
  {
    id: 1,
    date: "March 15, 2025",
    readTime: "5 min read",
    title: "The Rise of Virtual Productions in 2025",
    excerpt: "Discover how virtual production technology is revolutionizing the film industry and creating new opportunities for talent and directors alike.",
    image: newsProduction,
  },
  {
    id: 2,
    date: "March 12, 2025",
    readTime: "7 min read",
    title: "10 Tips for Nailing Your Self-Tape Audition",
    excerpt: "Master the art of self-tape auditions with expert advice from industry professionals on lighting, framing, and performance techniques.",
    image: newsAudition,
  },
];

export function HeroSection() {

  return (
    <section className="bg-[#DEFCFE] py-12 lg:py-16">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-[1fr,320px] lg:gap-8">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Hero Text */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Where Talent
                <br />
                Meets <span className="text-gradient">Opportunity</span>
              </h1>
              <p className="text-sm text-muted-foreground max-w-md">
                Connect casting directors with exceptional talent. Discover your next role or find the perfect performer for your production.
              </p>
            </div>

            {/* Tab Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={"tab-outline"}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                size="sm"
              >
                Talent Hub
              </Button>
              <Button 
                variant={"tab-outline"}
                className="bg-secondary text-white hover:text-secondary-foreground"
                size="sm"
              >
                Casting Hub
              </Button>
              <Button 
                variant={"tab-outline"}
                size="sm"
              >
                Professional Hub
              </Button>
            </div>

            {/* Search Card */}
            <div className="rounded-xl bg-card p-5 shadow-card">
              <h3 className="font-semibold mb-3 text-sm">Search Casting Cals</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Keyword</label>
                  <Input placeholder="e.g. Lead Actor" className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                  <Input placeholder="e.g. Los Angeles" className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                  <Select>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="film">Film</SelectItem>
                      <SelectItem value="tv">Television</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="theater">Theater</SelectItem>
                      <SelectItem value="voice">Voice Over</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Deadline</label>
                  <Input type="text" placeholder="dd/mm/yy" className="h-9 text-sm" />
                </div>
              </div>
              <Button className="w-full bg-[#5443DB] text-white mt-4" size="default">
                Search Casting Calls
              </Button>
            </div>

            {/* Feature Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-[#F1FBFB] p-5 text-center shadow-card card-elevated">
                <div className="feature-icon-teal mx-auto mb-3">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-1.5 text-sm">For Talent</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Showcase your skills, build your portfolio, and connect with industry professionals.
                </p>
              </div>
              <div className="rounded-xl bg-[#F9F3FF] p-5 text-center shadow-card card-elevated">
                <div className="feature-icon-purple mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-1.5 text-sm">For Casting Directors</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Discover exceptional talent, streamline your casting process, and manage auditions.
                </p>
              </div>
              <div className="rounded-xl bg-[#FFF2E0] p-5 text-center shadow-card card-elevated">
                <div className="feature-icon-orange mx-auto mb-3">
                  <Video className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-1.5 text-sm">For Everyone</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Browse talent profiles, watch demo reels, and discover the next big star.
                </p>
              </div>
            </div>

            {/* Industry News */}
            <div>
              <h2 className="text-xl font-bold mb-1">
                Industry <span className="text-gradient">News</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                Stay updated with the latest trends, insights, and opportunities in the entertainment industry
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                {newsArticles.map((article) => (
                  <article key={article.id} className="rounded-xl bg-card overflow-hidden shadow-card card-elevated">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <div className="text-xs text-muted-foreground mb-1.5">
                        {article.date} • {article.readTime}
                      </div>
                      <h3 className="font-semibold text-sm mb-1.5 line-clamp-2">{article.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{article.excerpt}</p>
                      <Link to="/news" className="text-xs text-primary font-medium mt-2 inline-block hover:underline">
                        Read More
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Hot Pick Talent */}
          <div className="bg-[#F1FBFB] shadow-xl rounded-xl p-3 space-y-3">
            <div className="rounded-xl p-2">
              <h3 className="font-semibold text-black text-md">Hot Pick Talent</h3>
            </div>
            <div className="space-y-2">
              {talents.map((talent) => (
                <div key={talent.id} className="rounded-xl bg-card overflow-hidden shadow-card card-elevated">
                  <div className="relative h-54">
                    <img 
                      src={talent.image} 
                      alt={talent.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <h4 className="font-semibold text-white text-sm">{talent.name}</h4>
                      <p className="text-xs text-white/80">{talent.role}</p>
                    </div>
                  </div>
                  <div className="p-2">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8 text-primary border-primary hover:bg-primary/5" asChild>
                      <Link to={`/talent/${talent.id}`}>View Profile</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
