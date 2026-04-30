import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, MapPin, Star, Briefcase, Mail, ShieldCheck, 
  Instagram, Youtube, Globe, User, Languages as LangIcon, 
  Ruler, Weight, Eye as EyeIcon, Palette, BriefcaseIcon, 
  BadgeCheck, ListChecks, LayoutGrid, Banknote, MessageCircle, 
  MessageSquare, Image as ImageIcon, Calendar, Plane, Monitor, Shield,
  CheckCircle2, DollarSign, Target, FolderOpen, Clock, CheckSquare,
  VenetianMask, Music, Accessibility, Camera, Info, ExternalLink, Linkedin
} from "lucide-react";
import { profileAPI } from "@/lib/api";
import { toast } from "sonner";
import { formatLocation } from "@/lib/utils";
import { BookingDialog } from "@/components/BookingDialog";

export default function TalentProfile() {
  const { id } = useParams();
  const [talent, setTalent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchTalent = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const response = await profileAPI.getOne(id);
        if (response.data.success) {
          setTalent(response.data.data);
        }
      } catch (error) {
        toast.error("Failed to load talent profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTalent();
  }, [id]);

  const unifiedSnapshot = useMemo(() => {
    if (!talent) return null;
    const utp = talent.unifiedTalentProfile || {};
    
    // Helper to merge arrays/comma-separated strings
    const mergeList = (val1: any, val2: any) => {
      const arr1 = Array.isArray(val1) ? val1 : (val1 ? String(val1).split(',').map(s => s.trim()) : []);
      const arr2 = Array.isArray(val2) ? val2 : (val2 ? String(val2).split(',').map(s => s.trim()) : []);
      return [...new Set([...arr1, ...arr2])].filter(Boolean);
    };

    return {
      ...talent,
      ...utp,
      fullName: talent.userId?.fullName || talent.fullName || utp.full_name,
      stageName: talent.stageName || utp.display_name,
      location: utp.current_city ? `${utp.current_city}${utp.current_country ? `, ${utp.current_country}` : ''}` : (formatLocation(talent.location) || "Global"),
      bio: utp.short_bio || talent.bio,
      roles: mergeList(talent.professionalRoles, utp.primary_talent_type),
      skills: mergeList(talent.skills, utp.skills),
      instagram: utp.instagram_url || talent.instagramUrl,
      linkedin: utp.linkedin_url || talent.linkedinUrl,
      youtube: utp.social_youtube || talent.youtubeUrl,
      vimeo: utp.vimeo_url || talent.vimeoUrl,
      portfolio_url: utp.portfolio_url || talent.portfolioUrl || talent.website,
      isVerified: talent.isVerified || utp.isVerified,
    };
  }, [talent]);

  const t = unifiedSnapshot;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F1FBFB]">
        <section className="container py-8">
          {!talent ? (
            <div className="rounded-xl bg-card p-6 shadow-card text-center max-w-md mx-auto mt-12">
              <h1 className="text-xl font-semibold">Talent not found</h1>
              <p className="mt-2 text-sm text-muted-foreground">Please go back and select a profile again.</p>
              <Button className="mt-6" variant="outline" asChild>
                <Link to="/browse-talent">Back to Browse</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-[320px,1fr]">
              {/* Profile Sidebar */}
              <div className="space-y-6">
                <div className="rounded-2xl bg-card overflow-hidden shadow-card">
                  <img 
                    src={talent.talent?.headshots?.[0]?.url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"} 
                    alt={talent.userId?.fullName} 
                    className="w-full aspect-square object-cover" 
                  />
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">{t.fullName}</h1>
                    <p className="text-sm text-primary font-medium capitalize mt-1">
                      {t.roles?.join(" • ") || t.userRole}
                    </p>
                    <div className="flex items-center gap-1 text-sm mt-3">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="font-medium">{t.rating || "0.0"}</span>
                      <span className="text-muted-foreground">({t.reviewCount || 0} reviews)</span>
                    </div>

                    <div className="flex gap-3 mt-4">
                      {t.instagram && (
                        <a href={t.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors">
                          <Instagram className="w-4 h-4 text-primary" />
                        </a>
                      )}
                      {t.linkedin && (
                        <a href={t.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors">
                          <Linkedin className="w-4 h-4 text-primary" />
                        </a>
                      )}
                      {t.youtube && (
                        <a href={t.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors">
                          <Youtube className="w-4 h-4 text-primary" />
                        </a>
                      )}
                      {t.vimeo && (
                        <a href={t.vimeo} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors">
                          <Globe className="w-4 h-4 text-primary" />
                        </a>
                      )}
                      {t.portfolio_url && (
                        <a href={t.portfolio_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors" title="Portfolio">
                          <ExternalLink className="w-4 h-4 text-primary" />
                        </a>
                      )}
                    </div>
                    <div className="mt-6 flex flex-col gap-2">
                      <Button variant="hero" className="w-full" onClick={() => setIsBookingOpen(true)}>Book Talent</Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/browse-talent">Back to Browse</Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Booking Dialog */}
                {talent && (
                  <BookingDialog 
                    isOpen={isBookingOpen} 
                    onOpenChange={setIsBookingOpen} 
                    talent={talent} 
                  />
                )}

                {/* Additional Sidebar Info */}
                <Card className="rounded-2xl shadow-card">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{t.location}</span>
                    </div>
                    {t.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{t.email}</span>
                      </div>
                    )}
                    {t.isVerified && (
                      <div className="flex items-center gap-3 text-sm text-success">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-medium">Verified Profile</span>
                      </div>
                    )}
                    {t.nationality && (
                      <div className="flex items-center gap-3 text-sm pt-2 border-t mt-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="capitalize">{t.nationality}</span>
                      </div>
                    )}
                    {t.unionStatus || t.union_membership ? (
                      <div className="flex items-center gap-3 text-sm mt-2">
                        <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="capitalize">{t.union_membership || t.unionStatus}</span>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>

              {/* Profile Main Content */}
              <div className="space-y-6 min-w-0">
                <Tabs defaultValue="overview" className="w-full">
                  <div className="overflow-x-auto pb-2 scrollbar-hide">
                    <TabsList className="h-11 p-1 bg-white border shadow-sm inline-flex min-w-full">
                      <TabsTrigger value="overview" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <LayoutGrid className="w-4 h-4" /> Overview
                      </TabsTrigger>
                      <TabsTrigger value="headshots" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <ImageIcon className="w-4 h-4" /> Headshots
                      </TabsTrigger>
                      <TabsTrigger value="showreel" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <Youtube className="w-4 h-4" /> Showreel
                      </TabsTrigger>
                      <TabsTrigger value="short_bio" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <User className="w-4 h-4" /> Short Bio
                      </TabsTrigger>
                      <TabsTrigger value="cv_credits" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <FolderOpen className="w-4 h-4" /> CV / Credits
                      </TabsTrigger>
                      <TabsTrigger value="skills" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <CheckSquare className="w-4 h-4" /> Skills
                      </TabsTrigger>
                      <TabsTrigger value="accents_languages" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <LangIcon className="w-4 h-4" /> Accents & Languages
                      </TabsTrigger>
                      <TabsTrigger value="availability" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <Calendar className="w-4 h-4" /> Availability
                      </TabsTrigger>
                      <TabsTrigger value="representation" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <Shield className="w-4 h-4" /> Representation
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* 1. Overview Tab */}
                  <TabsContent value="overview" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="font-bold text-2xl">Overview</h2>
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 h-7 px-3 capitalize">
                            {t.userRole || "Talent"}
                          </Badge>
                        </div>
                        
                        {t.highlights && (
                          <p className="text-base font-medium text-[#009698] italic leading-snug">
                            "{t.highlights.split('\n')[0]}"
                          </p>
                        )}
                        
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm line-clamp-4">
                          {t.bio || "No biography provided."}
                        </p>
                      </div>
                      
                      <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-muted/30 p-5 border">
                          <div className="flex items-center gap-2 mb-3">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Professional Status</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold">{talent.professionalRoles?.join(", ") || "Active Talent"}</p>
                            <p className="text-xs text-muted-foreground">Experience: <span className="capitalize text-foreground font-medium">{talent.experience || "Not specified"}</span></p>
                          </div>
                        </div>
                        
                        <div className="rounded-2xl bg-muted/30 p-5 border">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckSquare className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Key Skills</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {talent.skills?.slice(0, 6).map((skill: string) => (
                              <Badge key={skill} variant="secondary" className="bg-white border text-[9px] px-2 py-0">
                                {skill}
                              </Badge>
                            )) || <span className="text-xs text-muted-foreground">None specified</span>}
                          </div>
                        </div>
                      </div>

                      {/* Physical Stats Quick View */}
                      {t && (
                        <div className="mt-6">
                           <Card className="shadow-none bg-primary/[0.02] border-primary/10">
                             <CardContent className="p-5">
                                <h4 className="text-[10px] font-bold uppercase text-primary mb-3 tracking-widest">Physical Attributes</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                   <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Height</p>
                                      <p className="text-xs font-medium truncate">{t.height || "N/A"}</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Eye Color</p>
                                      <p className="text-xs font-medium truncate">{t.eye_colour || "N/A"}</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Hair</p>
                                      <p className="text-xs font-medium truncate">{t.hair_colour || "N/A"}</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Build</p>
                                      <p className="text-xs font-medium truncate">{t.build || "N/A"}</p>
                                   </div>
                                </div>
                             </CardContent>
                           </Card>
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  <TabsContent value="headshots" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="font-bold text-2xl">Headshots</h2>
                        <span className="text-xs text-muted-foreground font-medium">{t.headshots?.length || 0} Images</span>
                      </div>

                      {t.headshots && t.headshots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {t.headshots?.map((shot: any) => (
                            <div key={shot._id} className="aspect-square rounded-2xl overflow-hidden border bg-muted shadow-sm group relative cursor-zoom-in">
                              <img
                                src={shot.url}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                alt="Headshot"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Button size="sm" variant="secondary" className="h-8 rounded-full text-xs">
                                  View
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-16 text-center bg-muted/10 rounded-2xl border-2 border-dashed">
                          <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">No headshots uploaded yet.</p>
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  <TabsContent value="showreel" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <h2 className="font-bold text-2xl mb-6">Showreel</h2>
                      {t.intro_video ? (
                        <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                          <video src={t.intro_video} controls className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="py-16 text-center bg-muted/10 rounded-2xl border-2 border-dashed">
                          <Youtube className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">No showreel uploaded yet.</p>
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  <TabsContent value="short_bio" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <h2 className="font-bold text-2xl mb-6">Short Bio</h2>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {t.short_bio || t.bio || "No biography provided."}
                      </p>
                      {t.career_goals && (
                        <div className="mt-8 rounded-2xl border bg-muted/20 p-6">
                          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            Career Goals
                          </h3>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t.career_goals}</p>
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  <TabsContent value="cv_credits" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <h2 className="font-bold text-2xl mb-6">CV / Credits</h2>
                      {t.cv_resume ? (
                        <Button asChild className="bg-[#009698] hover:bg-[#009698]/90">
                          <a href={t.cv_resume} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View CV / Resume
                          </a>
                        </Button>
                      ) : (
                        <div className="py-16 text-center bg-muted/10 rounded-2xl border-2 border-dashed">
                          <FolderOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">No CV uploaded yet.</p>
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  <TabsContent value="skills" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <h2 className="font-bold text-2xl mb-6">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {t.skills && t.skills.length > 0 ? (
                          t.skills.map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="bg-white border text-xs px-3 py-1">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No skills listed.</p>
                        )}
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="accents_languages" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <h2 className="font-bold text-2xl mb-6">Accents & Languages</h2>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="rounded-2xl border bg-muted/20 p-6">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                            <LangIcon className="w-4 h-4" />
                            Languages Spoken
                          </h3>
                          <p className="text-sm font-semibold">
                            {t.languages_spoken || "Not specified"}
                          </p>
                          {t.fluent_languages && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Fluent: {t.fluent_languages}
                            </p>
                          )}
                        </div>
                        <div className="rounded-2xl border bg-muted/20 p-6">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            Natural Accent
                          </h3>
                          <p className="text-sm font-semibold">
                            {t.natural_accent || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="representation" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <h2 className="font-bold text-2xl mb-6">Representation</h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border bg-muted/20 p-6">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Status</h3>
                          <p className="text-sm font-semibold capitalize">
                            {t.representation_status || (t.agencyName ? "represented" : "self-represented")}
                          </p>
                        </div>
                        <div className="rounded-2xl border bg-muted/20 p-6">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Agency / Manager</h3>
                          <p className="text-sm font-semibold">{t.agency_name || t.agencyName || "Not listed"}</p>
                          {t.agency_contact && (
                            <p className="text-xs text-muted-foreground mt-2">{t.agency_contact}</p>
                          )}
                        </div>
                        <div className="rounded-2xl border bg-muted/20 p-6 md:col-span-2">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Union / Membership</h3>
                          <p className="text-sm font-semibold">{t.union_membership || t.unionStatus || "Not specified"}</p>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  {/* 2. Services Tab */}
                  <TabsContent value="services" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <h2 className="font-bold text-2xl mb-6">Booking Options</h2>
                      {t.services && t.services.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {t.services.map((service: any) => (
                            <div key={service._id} className="p-4 rounded-xl border bg-muted/10">
                              <h4 className="font-bold text-sm mb-1">{service.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{service.description}</p>
                              <div className="flex items-center justify-between mt-auto">
                                <span className="text-sm font-bold text-primary">From {service.price || "Inquire"}</span>
                                <Button size="sm" variant="outline" className="h-7 text-[10px]">Details</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center bg-muted/10 rounded-2xl border-2 border-dashed">
                          <VenetianMask className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">Standard booking rates apply.</p>
                          <Button variant="link" className="text-primary font-bold" onClick={() => setIsBookingOpen(true)}>Book now</Button>
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  {/* 3. Portfolio Tab */}
                  <TabsContent value="portfolio" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="font-bold text-2xl">Portfolio Gallery</h2>
                        <span className="text-xs text-muted-foreground font-medium">{t.headshots?.length || 0} Images</span>
                      </div>
                      
                      {t.headshots && t.headshots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {t.headshots?.map((shot: any) => (
                            <div key={shot._id} className="aspect-square rounded-2xl overflow-hidden border bg-muted shadow-sm group relative cursor-zoom-in">
                              <img src={shot.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Portfolio" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Button size="sm" variant="secondary" className="h-8 rounded-full text-xs">View</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-16 text-center bg-muted/10 rounded-2xl border-2 border-dashed">
                          <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">Portfolio is currently being updated.</p>
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  {/* 4. Pricing Tab */}
                  <TabsContent value="pricing" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                       <h2 className="font-bold text-2xl mb-6">Rates & Working Terms</h2>
                       
                       <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                             <div className="p-5 rounded-2xl bg-primary/[0.03] border border-primary/10">
                                <h4 className="text-xs font-bold text-primary uppercase mb-4 tracking-widest flex items-center gap-2">
                                   <DollarSign className="w-4 h-4" /> Professional Rates
                                </h4>
                                <div className="space-y-3">
                                   <div className="flex justify-between items-center pb-2 border-b border-dashed">
                                      <span className="text-sm text-muted-foreground">Base Booking Rate</span>
                                      <span className="font-bold">{t.expectedRate || "Discuss with Talent"}</span>
                                   </div>
                                   {t.unionStatus && (
                                     <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Union Terms</span>
                                        <span className="font-bold text-primary uppercase text-xs">{t.unionStatus}</span>
                                     </div>
                                   )}
                                </div>
                             </div>

                             <div className="p-5 rounded-2xl bg-muted/20 border border-border/50">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-widest flex items-center gap-2">
                                   <ListChecks className="w-4 h-4" /> Business Terms
                                </h4>
                                <div className="space-y-2">
                                   <p className="text-xs flex items-center gap-2">
                                      {t.openToUnpaid ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />} 
                                      {t.openToUnpaid ? "Open to TFP/Collaborations" : "Paid opportunities only"}
                                   </p>
                                   <p className="text-xs flex items-center gap-2">
                                      {t.agencyName ? <Shield className="w-3.5 h-3.5 text-primary" /> : <User className="w-3.5 h-3.5 text-muted-foreground" />} 
                                      {t.agencyName ? `Represented by ${t.agencyName}` : "Self-represented talent"}
                                   </p>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <div className="p-5 rounded-2xl bg-muted/20 border border-border/50 h-full">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-widest flex items-center gap-2">
                                   <Info className="w-4 h-4" /> Booking Information
                                </h4>
                                <div className="space-y-4">
                                   <p className="text-sm text-slate-600 leading-relaxed">
                                      Rates listed are indicative. Final pricing depends on project scope, duration, and usage rights. 
                                      Direct bookings are managed via the Castglo platform for secure payments.
                                   </p>
                                   <div className="pt-2">
                                      <Button size="sm" className="w-full bg-primary" onClick={() => setIsBookingOpen(true)}>Request Quote</Button>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </Card>
                  </TabsContent>

                  {/* 5. Reviews Tab */}
                  <TabsContent value="reviews" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="font-bold text-2xl">Client Feedback</h2>
                        <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border">
                          <Star className="w-4 h-4 fill-warning text-warning" />
                          <span className="font-bold">{t.rating || "0.0"}</span>
                          <span className="text-muted-foreground text-xs">({t.reviewCount || 0} reviews)</span>
                        </div>
                      </div>

                      {t.reviews && t.reviews.length > 0 ? (
                        <div className="space-y-6">
                           {/* Reviews map would go here */}
                        </div>
                      ) : (
                        <div className="py-20 text-center bg-muted/10 rounded-2xl border-2 border-dashed">
                          <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">No public reviews yet.</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">Book this talent and be the first to leave a review.</p>
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  {/* 6. Availability Tab */}
                  <TabsContent value="availability" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                       <h2 className="font-bold text-2xl mb-6">Availability & Travel</h2>
                       
                       <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                             <div className="p-5 rounded-2xl bg-muted/20 border border-border/50">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-widest">Global Status</h4>
                                <div className="space-y-3">
                                   <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Base Location</span>
                                      <span className="font-bold">{formatLocation(t.location) || "Global"}</span>
                                   </div>
                                   <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Right to Work</span>
                                      <span className="font-bold text-success">Verified</span>
                                   </div>
                                </div>
                             </div>
                             
                             <div className="p-5 rounded-2xl bg-primary/[0.02] border border-primary/10">
                                <h4 className="text-xs font-bold text-primary uppercase mb-4 tracking-widest">Mobility</h4>
                                <div className="space-y-3">
                                   <div className="flex items-center gap-3 text-sm">
                                      <Plane className="w-4 h-4 text-primary" />
                                      <span>{t.willing_to_travel === "Yes" || t.willing_to_travel === true ? "Willing to travel for work" : "Local opportunities only"}</span>
                                   </div>
                                   <div className="flex items-center gap-3 text-sm">
                                      <Globe className="w-4 h-4 text-primary" />
                                      <span>{t.international_availability === "Yes" || t.international_availability === true ? "Available for international projects" : "Not available for international projects"}</span>
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center justify-center p-8 bg-muted/10 rounded-2xl border-2 border-dashed">
                             <div className="text-center">
                                <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-sm font-bold">Booking Calendar</p>
                                <p className="text-xs text-muted-foreground mt-1">Calendar view is managed by Talent</p>
                                <Button size="sm" className="mt-4 h-8 bg-primary text-xs" onClick={() => setIsBookingOpen(true)}>Check Availability</Button>
                             </div>
                          </div>
                       </div>
                    </Card>
                  </TabsContent>

                  {/* 7. About Tab */}
                  <TabsContent value="about" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <h2 className="font-bold text-2xl mb-6">Full Biography</h2>
                      <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                         <p className="whitespace-pre-wrap">{t.full_bio || t.bio || "No biography provided."}</p>
                      </div>

                      {t.career_goals && (
                        <div className="mt-8 p-6 rounded-2xl bg-primary/[0.02] border border-primary/10">
                           <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                              <Star className="w-3.5 h-3.5" /> Career Ambition
                           </h4>
                           <p className="text-sm text-muted-foreground italic leading-relaxed">"{t.career_goals}"</p>
                        </div>
                      )}

                      {/* Specialized Industry Details */}
                      {t.specialties && Object.keys(t.specialties).length > 0 && (
                        <div className="mt-10 pt-8 border-t">
                          <h3 className="font-bold text-xl mb-8">Industry Specializations</h3>
                          <div className="grid gap-8 md:grid-cols-2">
                            {t.specialties.actor && (
                              <div className="space-y-4 p-5 rounded-2xl bg-muted/20 border">
                                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                   <VenetianMask className="w-4 h-4" /> Acting Credentials
                                </h4>
                                <div className="grid grid-cols-1 gap-3 text-xs">
                                  {t.specialties.actor.training && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Training</span>{t.specialties.actor.training}</div>}
                                  {t.specialties.actor.techniques && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Techniques</span>{t.specialties.actor.techniques}</div>}
                                  {t.specialties.actor.accents && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Accents</span>{t.specialties.actor.accents}</div>}
                                  {t.specialties.actor.monologueLink && (
                                    <div className="pt-1">
                                       <a href={t.specialties.actor.monologueLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline font-bold">
                                          Watch Monologue Reel <ExternalLink className="w-3 h-3" />
                                       </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {t.specialties.model && (
                              <div className="space-y-4 p-5 rounded-2xl bg-muted/20 border">
                                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                   <Camera className="w-4 h-4" /> Modeling Specs
                                </h4>
                                <div className="grid grid-cols-1 gap-3 text-xs">
                                  {t.specialties.model.categories && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Categories</span>{t.specialties.model.categories}</div>}
                                  {t.specialties.model.measurements && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Measurements</span>{t.specialties.model.measurements}</div>}
                                  {t.specialties.model.shoeSize && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Shoe Size</span>{t.specialties.model.shoeSize}</div>}
                                </div>
                              </div>
                            )}
                            {t.specialties.singer && (
                              <div className="space-y-4 p-5 rounded-2xl bg-muted/20 border">
                                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                   <Music className="w-4 h-4" /> Musical Profile
                                </h4>
                                <div className="grid grid-cols-1 gap-3 text-xs">
                                  {t.specialties.singer.voiceType && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Voice/Instruments</span>{t.specialties.singer.voiceType}</div>}
                                  {t.specialties.singer.genres && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Genres</span>{t.specialties.singer.genres}</div>}
                                  {t.specialties.singer.reelLink && (
                                    <div className="pt-1">
                                       <a href={t.specialties.singer.reelLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline font-bold">
                                          Listen to Vocal Reel <ExternalLink className="w-3 h-3" />
                                       </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  {/* 8. Contact Tab */}
                  <TabsContent value="contact" className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                       <h2 className="font-bold text-2xl mb-6">Connect with {t.fullName?.split(' ')[0]}</h2>
                       <div className="grid gap-8 md:grid-cols-2">
                          <div className="space-y-6">
                             <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Direct Channels</h3>
                                <div className="space-y-4">
                                   <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border group hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setIsBookingOpen(true)}>
                                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                         <MessageCircle className="w-5 h-5" />
                                      </div>
                                      <div>
                                         <p className="text-[10px] font-bold uppercase text-muted-foreground">Inquiry</p>
                                         <p className="text-sm font-medium">Send a Booking Request</p>
                                      </div>
                                   </div>

                                   {t.email && (
                                     <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border group hover:border-primary/30 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                           <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                           <p className="text-[10px] font-bold uppercase text-muted-foreground">Email</p>
                                           <p className="text-sm font-medium truncate max-w-[180px]">{t.email}</p>
                                        </div>
                                     </div>
                                   )}
                                </div>
                             </div>

                             <div className="space-y-4 pt-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Social Profiles</h3>
                                <div className="flex gap-3">
                                   {t.instagram && (
                                     <Button size="icon" variant="outline" className="rounded-full hover:text-primary" asChild>
                                        <a href={t.instagram} target="_blank" rel="noopener noreferrer"><Instagram className="w-4 h-4" /></a>
                                     </Button>
                                   )}
                                   {t.youtube && (
                                     <Button size="icon" variant="outline" className="rounded-full hover:text-primary" asChild>
                                        <a href={t.youtube} target="_blank" rel="noopener noreferrer"><Youtube className="w-4 h-4" /></a>
                                     </Button>
                                   )}
                                   <Button size="icon" variant="outline" className="rounded-full hover:text-primary"><Globe className="w-4 h-4" /></Button>
                                </div>
                             </div>
                          </div>

                          <div className="p-6 rounded-2xl bg-primary/[0.02] border border-primary/10">
                             <h3 className="font-bold text-lg mb-4">Quick Booking</h3>
                             <div className="space-y-4">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                   Interested in working with {t.fullName?.split(' ')[0]}? 
                                   Click the button below to start the booking process.
                                </p>
                                <Button className="w-full bg-primary" onClick={() => setIsBookingOpen(true)}>Book Now</Button>
                                <div className="pt-2 flex items-center gap-2 justify-center text-[10px] text-muted-foreground">
                                   <ShieldCheck className="w-3 h-3" /> Secure Payment via Castglo
                                </div>
                             </div>
                          </div>
                       </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
