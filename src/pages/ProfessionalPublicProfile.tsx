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
  Globe, Instagram, Linkedin, Building2, Calendar, 
  CheckCircle2, Award, Zap, Plane, Monitor, Shield,
  FileText, Clock, Info, CheckSquare, Target, FolderOpen, DollarSign,
  User, ListChecks, LayoutGrid, Banknote, MessageCircle, MessageSquare, Image as ImageIcon
} from "lucide-react";
import { profileAPI } from "@/lib/api";
import { toast } from "sonner";
import { formatLocation, getAvatarUrl, cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function ProfessionalPublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const response = await profileAPI.getOne(id);
        if (response.data.success) {
          setProfile(response.data.data);
        }
      } catch (error) {
        toast.error("Failed to load professional profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
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
          {!profile ? (
            <div className="rounded-xl bg-card p-6 shadow-card text-center max-w-md mx-auto mt-12 border">
              <h1 className="text-xl font-semibold">Profile not found</h1>
              <p className="mt-2 text-sm text-muted-foreground">Please check the link and try again.</p>
              <Button className="mt-6" variant="outline" asChild>
                <Link to="/browse-talent">Back to Browse</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-[320px,1fr]">
              {/* Profile Sidebar */}
              <div className="space-y-6">
                <div className="rounded-2xl bg-card overflow-hidden shadow-card border">
                  <img 
                    src={profile.userId?.profilePicture || getAvatarUrl(profile.userId?.fullName)} 
                    alt={profile.userId?.fullName} 
                    className="w-full aspect-square object-cover" 
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-1">
                       <h1 className="text-2xl font-bold">{profile.userId?.fullName}</h1>
                       {profile.isVerified && <ShieldCheck className="w-5 h-5 text-success" />}
                    </div>
                     <p className="text-sm font-bold text-primary tracking-wide uppercase mt-1">
                        {profile.professional_title || profile.professionalCategory?.replace(/_/g, ' ') || "Industry Professional"}
                     </p>
                     {profile.display_name && (
                       <p className="text-xs text-muted-foreground mt-0.5">By {profile.display_name}</p>
                     )}
                    <div className="flex items-center gap-1 text-sm mt-3">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="font-medium">{profile.rating || "0.0"}</span>
                      <span className="text-muted-foreground">({profile.reviewCount || 0} reviews)</span>
                    </div>
                    
                    <div className="mt-6 flex flex-col gap-2">
                      <Button variant="hero" className="w-full" asChild>
                        <Link to={`/professional/messages?recipientId=${profile.userId?._id}`}>Message Professional</Link>
                      </Button>
                      <Button variant="outline" className="w-full">Book Service</Button>
                    </div>
                  </div>
                </div>

                {/* Additional Sidebar Info */}
                <Card className="rounded-2xl shadow-card border">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{formatLocation(profile.location) || "Remote / Worldwide"}</span>
                    </div>
                    
                    {profile.companyName && (
                      <div className="flex items-center gap-3 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{profile.companyName}</span>
                      </div>
                    )}

                    {profile.experienceYears && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{profile.experienceYears} Years in Industry</span>
                      </div>
                    )}

                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Online Presence</h4>
                      
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-primary hover:underline">
                          <Globe className="w-4 h-4" />
                          <span className="truncate">{profile.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      )}

                      {profile.instagram && (
                        <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                          <Instagram className="w-4 h-4" />
                          <span>@{profile.instagram.replace('@', '')}</span>
                        </a>
                      )}

                      {profile.linkedin && (
                        <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                          <Linkedin className="w-4 h-4" />
                          <span className="truncate">LinkedIn Profile</span>
                        </a>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Capabilities</h4>
                      {profile.willing_to_travel && (
                        <div className="flex items-center gap-3 text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                          <Plane className="w-4 h-4" /> Willing to Travel
                        </div>
                      )}
                      {profile.remote_services_available && (
                        <div className="flex items-center gap-3 text-xs text-purple-700 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                          <Monitor className="w-4 h-4" /> Remote Available
                        </div>
                      )}
                      {profile.studio_access && (
                        <div className="flex items-center gap-3 text-xs text-teal-700 bg-teal-50 px-3 py-2 rounded-lg border border-teal-100">
                          <Building2 className="w-4 h-4" /> Studio Access
                        </div>
                      )}
                      {profile.insurance_available && (
                        <div className="flex items-center gap-3 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                          <Shield className="w-4 h-4" /> Fully Insured
                        </div>
                      )}
                    </div>
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
                            {profile.experience_level || "Professional"}
                          </Badge>
                        </div>
                        
                        {profile.short_bio && (
                          <p className="text-base font-medium text-[#009698] italic leading-snug">
                            "{profile.short_bio}"
                          </p>
                        )}
                        
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm line-clamp-4">
                          {profile.full_bio || profile.bio || "No biography provided."}
                        </p>
                      </div>
                      
                      <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-muted/30 p-5 border">
                          <div className="flex items-center gap-2 mb-3">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Expertise & Experience</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold">{profile.professional_title || profile.professionalCategory?.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-muted-foreground">Level: <span className="capitalize text-foreground font-medium">{profile.experience_level || "Beginner"}</span></p>
                          </div>
                        </div>
                        
                        <div className="rounded-2xl bg-muted/30 p-5 border">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckSquare className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top Skills</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.skills?.slice(0, 6).map((skill: string) => (
                              <Badge key={skill} variant="secondary" className="bg-white border text-[9px] px-2 py-0">
                                {skill}
                              </Badge>
                            )) || <span className="text-xs text-muted-foreground">None specified</span>}
                          </div>
                        </div>
                      </div>

                      {/* Industry Specs Quick View */}
                      {profile.professionalCategory && (
                        <div className="mt-6">
                           <Card className="shadow-none bg-primary/[0.02] border-primary/10">
                             <CardContent className="p-5">
                                <h4 className="text-[10px] font-bold uppercase text-primary mb-3 tracking-widest">Core Capabilities</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                   <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Equipment</p>
                                      <p className="text-xs font-medium truncate">{profile.equipment_summary || "Standard"}</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Delivery</p>
                                      <p className="text-xs font-medium truncate">{profile.delivery_mode?.replace('_', ' ') || "On-site"}</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Studio</p>
                                      <p className="text-xs font-medium">{profile.studio_access ? "Available" : "No Access"}</p>
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
                      <h2 className="font-bold text-2xl mb-6">Offered Services</h2>
                      {profile.services && profile.services.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {profile.services.map((service: any) => (
                            <div key={service._id} className="p-4 rounded-xl border bg-muted/10">
                              <h4 className="font-bold text-sm mb-1">{service.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{service.description}</p>
                              <div className="flex items-center justify-between mt-auto">
                                <span className="text-sm font-bold text-primary">From {service.price || "Contact"}</span>
                                <Button size="sm" variant="outline" className="h-7 text-[10px]">Learn More</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center bg-muted/10 rounded-2xl border-2 border-dashed">
                          <ListChecks className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">No specific services listed yet.</p>
                          <Button variant="link" className="text-primary font-bold">Inquire about services</Button>
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  {/* 3. Portfolio Tab */}
                  <TabsContent value="portfolio" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="font-bold text-2xl">Work Portfolio</h2>
                        <span className="text-xs text-muted-foreground font-medium">{profile.headshots?.length || 0} Items</span>
                      </div>
                      
                      {profile.headshots && profile.headshots.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {profile.headshots.map((shot: any) => (
                            <div key={shot._id} className="aspect-[3/4] rounded-2xl overflow-hidden border bg-muted shadow-sm group relative cursor-zoom-in">
                              <img src={shot.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Portfolio" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Button size="sm" variant="secondary" className="h-8 rounded-full text-xs">Expand</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-16 text-center bg-muted/10 rounded-2xl border-2 border-dashed">
                          <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">Portfolio items are being curated.</p>
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  {/* 4. Pricing Tab */}
                  <TabsContent value="pricing" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                       <h2 className="font-bold text-2xl mb-6">Rates & Business Terms</h2>
                       
                       <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                             <div className="p-5 rounded-2xl bg-primary/[0.03] border border-primary/10">
                                <h4 className="text-xs font-bold text-primary uppercase mb-4 tracking-widest flex items-center gap-2">
                                   <DollarSign className="w-4 h-4" /> Expected Rates
                                </h4>
                                <div className="space-y-3">
                                   <div className="flex justify-between items-center pb-2 border-b border-dashed">
                                      <span className="text-sm text-muted-foreground">Base Day Rate</span>
                                      <span className="font-bold">{profile.expected_rate_range || "Open to discussion"}</span>
                                   </div>
                                   {profile.deposit_percent && (
                                     <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Booking Deposit</span>
                                        <span className="font-bold text-amber-600">{profile.deposit_percent}%</span>
                                     </div>
                                   )}
                                </div>
                             </div>

                             <div className="p-5 rounded-2xl bg-muted/20 border border-border/50">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-widest flex items-center gap-2">
                                   <ListChecks className="w-4 h-4" /> Operation Terms
                                </h4>
                                <div className="space-y-2">
                                   <p className="text-xs flex items-center gap-2">
                                      {profile.nda_friendly ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />} 
                                      {profile.nda_friendly ? "NDA Friendly Professional" : "NDA terms per discussion"}
                                   </p>
                                   <p className="text-xs flex items-center gap-2">
                                      {profile.contract_required ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />} 
                                      {profile.contract_required ? "Signed Contract Required" : "Standard agreement applies"}
                                   </p>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <div className="p-5 rounded-2xl bg-muted/20 border border-border/50 h-full">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-widest flex items-center gap-2">
                                   <Shield className="w-4 h-4" /> Policies
                                </h4>
                                <div className="space-y-6">
                                   {profile.cancellation_policy ? (
                                     <div>
                                        <p className="text-xs font-bold mb-1">Cancellation</p>
                                        <p className="text-sm text-slate-600">{profile.cancellation_policy}</p>
                                     </div>
                                   ) : (
                                     <p className="text-sm text-muted-foreground italic">Cancellation policy not specified.</p>
                                   )}
                                   
                                   {profile.refund_policy ? (
                                     <div>
                                        <p className="text-xs font-bold mb-1">Refunds</p>
                                        <p className="text-sm text-slate-600">{profile.refund_policy}</p>
                                     </div>
                                   ) : (
                                     <p className="text-sm text-muted-foreground italic">Refund policy not specified.</p>
                                   )}
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
                        <h2 className="font-bold text-2xl">Client Reviews</h2>
                        <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border">
                          <Star className="w-4 h-4 fill-warning text-warning" />
                          <span className="font-bold">{profile.rating || "0.0"}</span>
                          <span className="text-muted-foreground text-xs">({profile.reviewCount || 0} reviews)</span>
                        </div>
                      </div>

                      {profile.reviews && profile.reviews.length > 0 ? (
                        <div className="space-y-6">
                           {/* Reviews map would go here */}
                        </div>
                      ) : (
                        <div className="py-20 text-center bg-muted/10 rounded-2xl border-2 border-dashed">
                          <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">No public reviews yet.</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">Be the first to review this professional after your booking.</p>
                        </div>
                      )}
                    </Card>
                  </TabsContent>

                  {/* 6. Availability Tab */}
                  <TabsContent value="availability" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                       <h2 className="font-bold text-2xl mb-6">Work Availability</h2>
                       
                       <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                             <div className="p-5 rounded-2xl bg-muted/20 border border-border/50">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-widest">Notice & Timing</h4>
                                <div className="space-y-3">
                                   <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Booking Notice</span>
                                      <span className="font-bold">{profile.booking_notice_required || "Flexible"}</span>
                                   </div>
                                   <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">International</span>
                                      <span className="font-bold text-success">Available</span>
                                   </div>
                                </div>
                             </div>
                             
                             <div className="p-5 rounded-2xl bg-primary/[0.02] border border-primary/10">
                                <h4 className="text-xs font-bold text-primary uppercase mb-4 tracking-widest">Mobility</h4>
                                <div className="space-y-3">
                                   <div className="flex items-center gap-3 text-sm">
                                      <Plane className="w-4 h-4 text-primary" />
                                      <span>{profile.willing_to_travel ? "Willing to travel for work" : "Local projects only"}</span>
                                   </div>
                                   <div className="flex items-center gap-3 text-sm">
                                      <Globe className="w-4 h-4 text-primary" />
                                      <span>International opportunities welcome</span>
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center justify-center p-8 bg-muted/10 rounded-2xl border-2 border-dashed">
                             <div className="text-center">
                                <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-sm font-bold">Booking Calendar</p>
                                <p className="text-xs text-muted-foreground mt-1">Select dates to check specific availability</p>
                                <Button size="sm" className="mt-4 h-8 bg-primary text-xs">Open Calendar</Button>
                             </div>
                          </div>
                       </div>
                    </Card>
                  </TabsContent>

                  {/* 7. About Tab */}
                  <TabsContent value="about" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <h2 className="font-bold text-2xl mb-6">Professional Biography</h2>
                      <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                         <p className="whitespace-pre-wrap">{profile.full_bio || profile.bio || "No biography provided."}</p>
                      </div>

                      {/* Credibility & Recognition */}
                      {(profile.notable_clients || profile.notable_projects || profile.awards_recognition) && (
                        <div className="mt-10 pt-8 border-t">
                           <h3 className="font-bold text-lg mb-6">Recognition & Portfolio History</h3>
                           <div className="grid gap-8 sm:grid-cols-3">
                             {profile.notable_clients && (
                               <div className="space-y-2">
                                 <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2"><Target className="w-3.5 h-3.5" /> Notable Clients</h4>
                                 <p className="text-sm leading-relaxed text-muted-foreground">{profile.notable_clients}</p>
                               </div>
                             )}
                             {profile.notable_projects && (
                               <div className="space-y-2">
                                 <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5" /> Major Projects</h4>
                                 <p className="text-sm leading-relaxed text-muted-foreground">{profile.notable_projects}</p>
                               </div>
                             )}
                             {profile.awards_recognition && (
                               <div className="space-y-2">
                                 <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2"><Award className="w-3.5 h-3.5 text-amber-500" /> Awards</h4>
                                 <p className="text-sm leading-relaxed text-muted-foreground">{profile.awards_recognition}</p>
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
                       <h2 className="font-bold text-2xl mb-6">Get in Touch</h2>
                       <div className="grid gap-8 md:grid-cols-2">
                          <div className="space-y-6">
                             <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Contact Channels</h3>
                                <div className="space-y-4">
                                   <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border group hover:border-primary/30 transition-colors">
                                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                         <Mail className="w-5 h-5" />
                                      </div>
                                      <div>
                                         <p className="text-[10px] font-bold uppercase text-muted-foreground">Direct Message</p>
                                         <p className="text-sm font-medium">Message via Castglo Platform</p>
                                      </div>
                                   </div>

                                   <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border group hover:border-primary/30 transition-colors">
                                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                         <Globe className="w-5 h-5" />
                                      </div>
                                      <div>
                                         <p className="text-[10px] font-bold uppercase text-muted-foreground">Portfolio</p>
                                         <p className="text-sm font-medium">{profile.website ? profile.website.replace(/^https?:\/\//, '') : "Website not provided"}</p>
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <div className="space-y-4 pt-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Social Links</h3>
                                <div className="flex gap-3">
                                   {profile.instagram && (
                                     <Button size="icon" variant="outline" className="rounded-full hover:text-primary" asChild>
                                        <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"><Instagram className="w-4 h-4" /></a>
                                     </Button>
                                   )}
                                   {profile.linkedin && (
                                     <Button size="icon" variant="outline" className="rounded-full hover:text-primary" asChild>
                                        <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer"><Linkedin className="w-4 h-4" /></a>
                                     </Button>
                                   )}
                                   <Button size="icon" variant="outline" className="rounded-full hover:text-primary"><Globe className="w-4 h-4" /></Button>
                                </div>
                             </div>
                          </div>

                          <div className="p-6 rounded-2xl bg-primary/[0.02] border border-primary/10">
                             <h3 className="font-bold text-lg mb-4">Quick Inquiry</h3>
                             <div className="space-y-4">
                                <div className="space-y-1.5">
                                   <label className="text-xs font-bold uppercase tracking-tight">Your Message</label>
                                   <textarea className="w-full min-h-[120px] p-3 rounded-xl border bg-white text-sm focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Tell the professional about your project or request..."></textarea>
                                </div>
                                <Button className="w-full bg-primary">Send Message</Button>
                                <p className="text-[10px] text-center text-muted-foreground">Professionals typically respond within 24-48 hours.</p>
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
