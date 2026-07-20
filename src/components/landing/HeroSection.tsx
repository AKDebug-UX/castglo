import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, User, Video, Loader2 } from "lucide-react";
import { castingCallAPI, profileAPI, livestreamAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatLocation, formatBudget } from "@/lib/utils";

import talentMichael from "@/assets/talent-michael.jpg";
import newsProduction from "@/assets/news-production.jpg";
import newsAudition from "@/assets/news-audition.jpg";

export function HeroSection() {
  const { user } = useAuth();
  const [featuredCalls, setFeaturedCalls] = useState([]);
  const [featuredTalents, setFeaturedTalents] = useState([]);
  const [publicStreams, setPublicStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const castingScrollRef = useRef(null);
  const talentScrollRef = useRef(null);
  const streamScrollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [callsRes, profilesRes, streamsRes] = await Promise.all([
          castingCallAPI.getAll({ limit: 5, status: 'open' }).catch(err => ({ data: { success: false } })),
          profileAPI.search({ limit: 4, userRole: 'talent' }).catch(err => ({ data: { success: false } })),
          livestreamAPI.getAll().catch(err => ({ data: { success: false } }))
        ]);

        if (callsRes.data?.success && Array.isArray(callsRes.data.data.castingCalls)) {
          setFeaturedCalls(callsRes.data.data.castingCalls.slice(0, 5));
        } else {
          setFeaturedCalls([]);
        }

        if (profilesRes.data?.success) {
          const payload = profilesRes.data.data;
          const talents = Array.isArray(payload) ? payload : (payload?.profiles || []);
          setFeaturedTalents(talents.slice(0, 4));
        } else {
          setFeaturedTalents([]);
        }

        if (streamsRes.data?.success && Array.isArray(streamsRes.data.data)) {
          setPublicStreams(streamsRes.data.data.filter((s) => {
            if (!s) return false;
            if (s.isPublic === false) return false;
            
            const hostId = typeof s.hostId === 'object' ? s.hostId?._id : s.hostId;
            return hostId !== user?.id;
          }).slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching landing page data:", error);
        setFeaturedCalls([]);
        setFeaturedTalents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (castingScrollRef.current && featuredCalls.length > 0) {
        const { scrollTop, scrollHeight, clientHeight } = castingScrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          castingScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          castingScrollRef.current.scrollBy({ top: 200, behavior: 'smooth' });
        }
      }
      
      if (talentScrollRef.current && featuredTalents.length > 0) {
        const { scrollTop, scrollHeight, clientHeight } = talentScrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          talentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          talentScrollRef.current.scrollBy({ top: 200, behavior: 'smooth' });
        }
      }

      if (streamScrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = streamScrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          streamScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          streamScrollRef.current.scrollBy({ top: 200, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

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

  return (
    <section className="bg-[#DEFCFE] py-12 lg:py-16">
      <div className="container">
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-[1fr,300px] xl:grid-cols-[300px,1fr,300px]">
          {/* Left Sidebar - Featured Casting Calls */}
          <div className="bg-[#F1FBFB] xl:block hidden shadow-xl rounded-xl p-3 flex flex-col h-[700px]">
            <div className="rounded-xl p-2 mb-2">
              <h3 className="font-semibold text-black text-md">Featured Castings</h3>
            </div>
            <div 
              ref={castingScrollRef}
              className="flex-1 overflow-y-auto h-[620px] scrollbar-hide scroll-smooth"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3 pb-10">
                  {(featuredCalls.length > 0 ? [...featuredCalls, ...featuredCalls] : []).map((call, index) => (
                    <div key={`${call._id}-${index}`} className="rounded-xl bg-card overflow-hidden shadow-card card-elevated">
                      <div className="relative h-48">
                        <img 
                          src={call.project_image || newsProduction} 
                          alt={call.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <h4 className="font-semibold text-white text-xs line-clamp-1">{call.title}</h4>
                          <p className="text-[10px] text-white/80">{formatLocation(call.location)} • {call.category}</p>
                        </div>
                      </div>
                      <div className="p-2">
                        <Button variant="outline" size="sm" className="w-full text-xs h-8 text-primary border-primary hover:bg-primary/5" asChild>
                          <Link to={call._id ? `/cast/${call._id}` : "/sign-in"}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Hero Text */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Where Talent
                <br />
                Meets <span className="text-primary">Opportunity</span>
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
                asChild
              >
                <Link to="/browse-talent">Talent Hub</Link>
              </Button>
              <Button 
                variant={"tab-outline"}
                className="bg-secondary text-white hover:text-secondary"
                size="sm"
                onClick={() => {
                  const element = document.getElementById('browse-castings');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Casting Hub
              </Button>
              <Button 
                variant={"tab-outline"}
                size="sm"
                asChild
              >
                <Link to="/professional">Professional Hub</Link>
              </Button>
              <Button 
                variant={"tab-outline"}
                className="bg-[#5443DB] text-white hover:bg-[#5443DB]/90"
                size="sm"
                asChild
              >
                <Link to="/director/create">Post a Job</Link>
              </Button>
            </div>

            {/* Search Card */}
            <div className="rounded-xl bg-card p-5 shadow-card">
              <h3 className="font-semibold mb-3 text-sm">Search Talent</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const keyword = formData.get("keyword");
                window.location.href = `/browse-talent?search=${keyword}`;
              }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Keyword</label>
                  <Input name="keyword" placeholder="e.g. Actor, Model" className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                  <Input name="location" placeholder="e.g. Los Angeles" className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                  <Select name="category">
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
                <div className="flex items-end">
                  <Button type="submit" className="w-full bg-[#5443DB] text-white h-9" size="sm">
                    Search Talent
                  </Button>
                </div>
              </form>
            </div>

            {/* Feature Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-primary/5 p-5 text-center shadow-card card-elevated">
                <div className="feature-icon-violet mx-auto mb-3">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-1.5 text-sm">For Talent</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Showcase your skills, build your portfolio, and connect with industry professionals.
                </p>
              </div>
              <div className="rounded-xl bg-accent/5 p-5 text-center shadow-card card-elevated">
                <div className="feature-icon-navy mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-1.5 text-sm">For Casting Directors</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Discover exceptional talent, streamline your casting process, and manage auditions.
                </p>
              </div>
              <div className="rounded-xl bg-secondary/5 p-5 text-center shadow-card card-elevated">
                <div className="feature-icon-coral mx-auto mb-3">
                  <Video className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-1.5 text-sm">For Everyone</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Browse talent profiles, watch demo reels, and discover the next big star.
                </p>
              </div>
            </div>

            {/* Active Public Auditions */}
            {/* {publicStreams.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
                    Live Auditions
                  </h2>
                  <Link to="/talent/livestreams" className="text-xs text-primary font-bold hover:underline">
                    View All
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {publicStreams.map((stream) => (
                    <Card key={stream._id} className="border-destructive/10 bg-destructive/[0.02] overflow-hidden group hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                            <Video className="h-6 w-6 text-destructive" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm group-hover:text-destructive transition-colors truncate">{stream.title}</h3>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {stream.viewerCount || 0} watching • {stream.category || "Audition"}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="destructive" className="h-8 rounded-lg text-[10px] font-bold px-4" asChild>
                          <Link to={`/talent/livestream/${stream._id}`}>
                            {(typeof stream.hostId === 'object' ? stream.hostId._id : stream.hostId) === user?.id ? "Start" : "Join"}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )} */}

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

          {/* Right Sidebar - Discover Talent */}
          <div className="bg-[#F9F3FF] lg:block shadow-xl rounded-xl p-3 flex flex-col h-[700px]">
            <div className="rounded-xl p-2 mb-2">
              <h3 className="font-semibold text-black text-md">Discover Talent</h3>
            </div>
            <div 
              ref={talentScrollRef}
              className="flex-1 overflow-y-auto h-[620px] scrollbar-hide scroll-smooth"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-3 pb-10">
                  {(featuredTalents.length > 0 ? [...featuredTalents, ...featuredTalents] : []).map((talent, index) => (
                    <div key={`${talent._id}-${index}`} className="rounded-xl bg-card overflow-hidden shadow-card card-elevated">
                      <div className="relative aspect-square">
                        <img 
                          src={talent.talent?.headshots?.[0]?.url || talentMichael} 
                          alt={talent.userId?.fullName || talent.fullName || "Talent Profile"}
                          className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <h4 className="font-semibold text-white text-xs">{talent.userId?.fullName || talent.fullName || "Talent Profile"}</h4>
                          <p className="text-[10px] text-white/80 line-clamp-1">
                            {talent.category || talent.userRole} {talent.subCategory ? `• ${talent.subCategory}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="p-2">
                        <Button variant="outline" size="sm" className="w-full text-xs h-8 text-secondary border-secondary hover:bg-secondary/5" asChild>
                          <Link to={talent.userId ? `/talent/${typeof talent.userId === 'object' ? (talent.userId?._id || talent.userId?.id) : talent.userId}` : "#"}>View Profile</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
