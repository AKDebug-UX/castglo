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
  User, ListChecks, LayoutGrid, Banknote, MessageCircle, MessageSquare
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
              <div className="space-y-6">
                <div className="rounded-2xl bg-card p-8 shadow-card border">
                  {/* Bio Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-2xl">About</h2>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 h-7 px-3 capitalize">
                        {profile.experience_level || "Professional"}
                      </Badge>
                    </div>
                    
                    {profile.short_bio && (
                      <p className="text-sm font-bold text-[#009698] italic tracking-tight">
                        "{profile.short_bio}"
                      </p>
                    )}
                    
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
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
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills?.slice(0, 8).map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="bg-white border text-[9px] px-2 py-0">
                            {skill}
                          </Badge>
                        )) || <span className="text-xs text-muted-foreground">None specified</span>}
                      </div>
                    </div>
                  </div>

                  {/* Specialized Industry Details */}
                  {profile.professionalCategory && (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                       <Card className="shadow-none bg-primary/[0.02] border-primary/10">
                         <CardContent className="p-5">
                            <h4 className="text-[10px] font-bold uppercase text-primary mb-3">Industry Specs</h4>
                            <div className="space-y-2">
                               {profile.equipment_summary && (
                                 <p className="text-xs"><span className="text-muted-foreground font-medium">Equipment:</span> {profile.equipment_summary}</p>
                               )}
                               {profile.brands_used && (
                                 <p className="text-xs"><span className="text-muted-foreground font-medium">Brands:</span> {profile.brands_used}</p>
                               )}
                               {profile.delivery_mode && (
                                 <p className="text-xs"><span className="text-muted-foreground font-medium">Delivery:</span> {profile.delivery_mode.replace('_', ' ')}</p>
                               )}
                               {!profile.equipment_summary && !profile.brands_used && !profile.delivery_mode && (
                                 <p className="text-xs text-muted-foreground italic">No specialized data provided.</p>
                               )}
                            </div>
                         </CardContent>
                       </Card>
                       <Card className="shadow-none bg-muted/20 border-border/50">
                         <CardContent className="p-5">
                            <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-3">Business Operation</h4>
                            <div className="space-y-1.5">
                               {profile.nda_friendly && <p className="text-xs flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-success" /> NDA Friendly</p>}
                               {profile.contract_required && <p className="text-xs flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Contract Required</p>}
                               {profile.deposit_percent && <p className="text-xs flex items-center gap-2"><DollarSign className="w-3.5 h-3.5 text-amber-600" /> {profile.deposit_percent}% Deposit</p>}
                            </div>
                         </CardContent>
                       </Card>
                    </div>
                  )}

                  {/* Credibility & Clients */}
                  {(profile.notable_clients || profile.notable_projects || profile.awards_recognition) && (
                    <div className="mt-10 pt-8 border-t">
                       <h3 className="font-bold text-xl mb-6">Credibility & Recognition</h3>
                       <div className="grid gap-6 sm:grid-cols-3">
                         {profile.notable_clients && (
                           <div className="space-y-2">
                             <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Target className="w-3.5 h-3.5" /> Clients</h4>
                             <p className="text-sm leading-relaxed">{profile.notable_clients}</p>
                           </div>
                         )}
                         {profile.notable_projects && (
                           <div className="space-y-2">
                             <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5" /> Projects</h4>
                             <p className="text-sm leading-relaxed">{profile.notable_projects}</p>
                           </div>
                         )}
                         {profile.awards_recognition && (
                           <div className="space-y-2">
                             <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Award className="w-3.5 h-3.5 text-amber-500" /> Awards</h4>
                             <p className="text-sm leading-relaxed">{profile.awards_recognition}</p>
                           </div>
                         )}
                       </div>
                    </div>
                  )}

                  {/* Portfolio Gallery */}
                  {profile.headshots && profile.headshots.length > 0 && (
                    <div className="mt-10 border-t pt-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-xl">Work Portfolio</h3>
                        <Button variant="link" className="text-[#009698] font-bold text-sm">View Full Gallery</Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {profile.headshots.map((shot) => (
                          <div key={shot._id} className="aspect-[3/4] rounded-2xl overflow-hidden border bg-muted shadow-sm group relative">
                            <img src={shot.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Portfolio" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business Terms */}
                  {(profile.cancellation_policy || profile.refund_policy) && (
                    <div className="mt-10 border-t pt-8">
                       <h3 className="font-bold text-xl mb-4">Terms & Policies</h3>
                       <div className="grid gap-6 md:grid-cols-2">
                         {profile.cancellation_policy && (
                           <div className="p-4 rounded-2xl bg-muted/30 border">
                             <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Cancellation</p>
                             <p className="text-sm text-slate-600">{profile.cancellation_policy}</p>
                           </div>
                         )}
                         {profile.refund_policy && (
                           <div className="p-4 rounded-2xl bg-muted/30 border">
                             <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Refunds</p>
                             <p className="text-sm text-slate-600">{profile.refund_policy}</p>
                           </div>
                         )}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
