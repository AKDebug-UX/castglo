import { useState, useEffect } from "react";
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
  MessageSquare, ImageIcon, Calendar, Plane, Monitor, Shield,
  CheckCircle2, DollarSign, Target, FolderOpen, Clock, CheckSquare,
  VenetianMask, Music, Accessibility, Camera, Info, ExternalLink
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
                    src={talent.talent.headshots[0].url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"} 
                    alt={talent.userId?.fullName} 
                    className="w-full aspect-square object-cover" 
                  />
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">{talent.userId?.fullName}</h1>
                    <p className="text-sm text-primary font-medium capitalize mt-1">
                      {talent.professionalRoles?.join(" • ") || talent.userRole}
                    </p>
                    <div className="flex items-center gap-1 text-sm mt-3">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="font-medium">{talent.rating || "0.0"}</span>
                      <span className="text-muted-foreground">({talent.reviewCount || 0} reviews)</span>
                    </div>

                    {/* Social Media Links */}
                    <div className="flex gap-3 mt-4">
                      {talent.instagramUrl && (
                        <a href={talent.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors">
                          <Instagram className="w-4 h-4 text-primary" />
                        </a>
                      )}
                      {talent.tiktokUrl && (
                        <a href={talent.tiktokUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors">
                          <div className="w-4 h-4 flex items-center justify-center font-bold text-[10px]">TT</div>
                        </a>
                      )}
                      {talent.youtubeUrl && (
                        <a href={talent.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors">
                          <Youtube className="w-4 h-4 text-primary" />
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
                      <span>{formatLocation(talent.location) || "Remote / Worldwide"}</span>
                    </div>
                    {talent.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{talent.email}</span>
                      </div>
                    )}
                    {talent.isVerified && (
                      <div className="flex items-center gap-3 text-sm text-success">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-medium">Verified Profile</span>
                      </div>
                    )}
                    {talent.nationality && (
                      <div className="flex items-center gap-3 text-sm pt-2 border-t mt-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="capitalize">{talent.nationality}</span>
                      </div>
                    )}
                    {talent.unionStatus && (
                      <div className="flex items-center gap-3 text-sm mt-2">
                        <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="capitalize">{talent.unionStatus}</span>
                      </div>
                    )}
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
                      <TabsTrigger value="services" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <ListChecks className="w-4 h-4" /> Services
                      </TabsTrigger>
                      <TabsTrigger value="portfolio" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <ImageIcon className="w-4 h-4" /> Portfolio
                      </TabsTrigger>
                      <TabsTrigger value="pricing" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <Banknote className="w-4 h-4" /> Pricing
                      </TabsTrigger>
                      <TabsTrigger value="reviews" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <Star className="w-4 h-4" /> Reviews
                      </TabsTrigger>
                      <TabsTrigger value="availability" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <Calendar className="w-4 h-4" /> Availability
                      </TabsTrigger>
                      <TabsTrigger value="about" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <User className="w-4 h-4" /> About
                      </TabsTrigger>
                      <TabsTrigger value="contact" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <MessageSquare className="w-4 h-4" /> Contact
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
                            {talent.userRole || "Talent"}
                          </Badge>
                        </div>
                        
                        {talent.highlights && (
                          <p className="text-base font-medium text-[#009698] italic leading-snug">
                            "{talent.highlights.split('\n')[0]}"
                          </p>
                        )}
                        
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm line-clamp-4">
                          {talent.bio || "No biography provided."}
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
                      {talent.physicalAttributes && (
                        <div className="mt-6">
                           <Card className="shadow-none bg-primary/[0.02] border-primary/10">
                             <CardContent className="p-5">
                                <h4 className="text-[10px] font-bold uppercase text-primary mb-3 tracking-widest">Physical Attributes</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                   <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Height</p>
                                      <p className="text-xs font-medium truncate">{talent.physicalAttributes.height || "N/A"}</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Eye Color</p>
                                      <p className="text-xs font-medium truncate">{talent.physicalAttributes.eyeColor || "N/A"}</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Hair</p>
                                      <p className="text-xs font-medium truncate">{talent.physicalAttributes.hairColor || "N/A"}</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Build</p>
                                      <p className="text-xs font-medium truncate">{talent.physicalAttributes.build || "N/A"}</p>
                                   </div>
                                </div>
                             </CardContent>
                           </Card>
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  {/* 2. Services Tab */}
                  <TabsContent value="services" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <h2 className="font-bold text-2xl mb-6">Booking Options</h2>
                      {talent.services && talent.services.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {talent.services.map((service: any) => (
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
                        <span className="text-xs text-muted-foreground font-medium">{talent.talent?.headshots?.length || 0} Images</span>
                      </div>
                      
                      {talent.talent?.headshots && talent.talent?.headshots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {talent.talent.headshots.map((shot: any) => (
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
                                      <span className="font-bold">{talent.expectedRate || "Discuss with Talent"}</span>
                                   </div>
                                   {talent.unionStatus && (
                                     <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Union Terms</span>
                                        <span className="font-bold text-primary uppercase text-xs">{talent.unionStatus}</span>
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
                                      {talent.openToUnpaid ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />} 
                                      {talent.openToUnpaid ? "Open to TFP/Collaborations" : "Paid opportunities only"}
                                   </p>
                                   <p className="text-xs flex items-center gap-2">
                                      {talent.agencyName ? <Shield className="w-3.5 h-3.5 text-primary" /> : <User className="w-3.5 h-3.5 text-muted-foreground" />} 
                                      {talent.agencyName ? `Represented by ${talent.agencyName}` : "Self-represented talent"}
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
                          <span className="font-bold">{talent.rating || "0.0"}</span>
                          <span className="text-muted-foreground text-xs">({talent.reviewCount || 0} reviews)</span>
                        </div>
                      </div>

                      {talent.reviews && talent.reviews.length > 0 ? (
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
                                      <span className="font-bold">{formatLocation(talent.location) || "Global"}</span>
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
                                      <span>{talent.willing_to_travel ? "Willing to travel for work" : "Local opportunities only"}</span>
                                   </div>
                                   <div className="flex items-center gap-3 text-sm">
                                      <Globe className="w-4 h-4 text-primary" />
                                      <span>Available for international projects</span>
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
                         <p className="whitespace-pre-wrap">{talent.bio || "No biography provided."}</p>
                      </div>

                      {talent.careerGoals && (
                        <div className="mt-8 p-6 rounded-2xl bg-primary/[0.02] border border-primary/10">
                           <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                              <Star className="w-3.5 h-3.5" /> Career Ambition
                           </h4>
                           <p className="text-sm text-muted-foreground italic leading-relaxed">"{talent.careerGoals}"</p>
                        </div>
                      )}

                      {/* Specialized Industry Details */}
                      {talent.specialties && Object.keys(talent.specialties).length > 0 && (
                        <div className="mt-10 pt-8 border-t">
                          <h3 className="font-bold text-xl mb-8">Industry Specializations</h3>
                          <div className="grid gap-8 md:grid-cols-2">
                            {talent.specialties.actor && (
                              <div className="space-y-4 p-5 rounded-2xl bg-muted/20 border">
                                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                   <VenetianMask className="w-4 h-4" /> Acting Credentials
                                </h4>
                                <div className="grid grid-cols-1 gap-3 text-xs">
                                  {talent.specialties.actor.training && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Training</span>{talent.specialties.actor.training}</div>}
                                  {talent.specialties.actor.techniques && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Techniques</span>{talent.specialties.actor.techniques}</div>}
                                  {talent.specialties.actor.accents && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Accents</span>{talent.specialties.actor.accents}</div>}
                                  {talent.specialties.actor.monologueLink && (
                                    <div className="pt-1">
                                       <a href={talent.specialties.actor.monologueLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline font-bold">
                                          Watch Monologue Reel <ExternalLink className="w-3 h-3" />
                                       </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {talent.specialties.model && (
                              <div className="space-y-4 p-5 rounded-2xl bg-muted/20 border">
                                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                   <Camera className="w-4 h-4" /> Modeling Specs
                                </h4>
                                <div className="grid grid-cols-1 gap-3 text-xs">
                                  {talent.specialties.model.categories && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Categories</span>{talent.specialties.model.categories}</div>}
                                  {talent.specialties.model.measurements && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Measurements</span>{talent.specialties.model.measurements}</div>}
                                  {talent.specialties.model.shoeSize && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Shoe Size</span>{talent.specialties.model.shoeSize}</div>}
                                </div>
                              </div>
                            )}
                            {talent.specialties.singer && (
                              <div className="space-y-4 p-5 rounded-2xl bg-muted/20 border">
                                <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                   <Music className="w-4 h-4" /> Musical Profile
                                </h4>
                                <div className="grid grid-cols-1 gap-3 text-xs">
                                  {talent.specialties.singer.voiceType && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Voice/Instruments</span>{talent.specialties.singer.voiceType}</div>}
                                  {talent.specialties.singer.genres && <div><span className="text-muted-foreground font-bold uppercase tracking-tighter block mb-0.5">Genres</span>{talent.specialties.singer.genres}</div>}
                                  {talent.specialties.singer.reelLink && (
                                    <div className="pt-1">
                                       <a href={talent.specialties.singer.reelLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline font-bold">
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
                       <h2 className="font-bold text-2xl mb-6">Connect with {talent.userId?.fullName?.split(' ')[0]}</h2>
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

                                   {talent.email && (
                                     <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border group hover:border-primary/30 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                           <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                           <p className="text-[10px] font-bold uppercase text-muted-foreground">Email</p>
                                           <p className="text-sm font-medium truncate max-w-[180px]">{talent.email}</p>
                                        </div>
                                     </div>
                                   )}
                                </div>
                             </div>

                             <div className="space-y-4 pt-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Social Profiles</h3>
                                <div className="flex gap-3">
                                   {talent.instagramUrl && (
                                     <Button size="icon" variant="outline" className="rounded-full hover:text-primary" asChild>
                                        <a href={talent.instagramUrl} target="_blank" rel="noopener noreferrer"><Instagram className="w-4 h-4" /></a>
                                     </Button>
                                   )}
                                   {talent.youtubeUrl && (
                                     <Button size="icon" variant="outline" className="rounded-full hover:text-primary" asChild>
                                        <a href={talent.youtubeUrl} target="_blank" rel="noopener noreferrer"><Youtube className="w-4 h-4" /></a>
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
                                   Interested in working with {talent.userId?.fullName?.split(' ')[0]}? 
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
