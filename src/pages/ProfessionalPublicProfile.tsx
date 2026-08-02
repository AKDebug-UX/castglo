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
  Globe, Instagram, Linkedin, Building2, Calendar, 
  CheckCircle2, Award, Zap, Plane, Monitor, Shield,
  FileText, Clock, Info, CheckSquare, Target, FolderOpen, DollarSign,
  User, ListChecks, LayoutGrid, Banknote, MessageCircle, MessageSquare, Image as ImageIcon
} from "lucide-react";
import { API_BASE_URL, castingCallAPI, profileAPI } from "@/lib/api";
import { toast } from "sonner";
import { formatLocation, getAvatarUrl, cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";


const camelToSnake = (str: string) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const snakeToCamel = (str: string) => str.replace(/(_\w)/g, (m) => m[1].toUpperCase());

export default function ProfessionalPublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [castingCalls, setCastingCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const response = await profileAPI.getOne(id);
        if (response.data.success) {
          setProfile(response.data.data);
          
          // If it's a casting director, fetch their projects
          if (response.data.data.professionalCategory === "casting_director") {
            try {
              const callsResponse = await castingCallAPI.getAll({ directorId: id });
              if (callsResponse.data.success) {
                setCastingCalls(callsResponse.data.data);
              }
            } catch (err) {
              console.error("Failed to load director's casting calls");
            }
          }
        }
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const unifiedSnapshot = useMemo(() => {
    if (!profile) return null;
    
    const flatData: Record<string, any> = {};
    const flatten = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      Object.entries(obj).forEach(([key, value]) => {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          flatten(value);
        } else {
          if (value !== undefined && value !== null && value !== "" && (!flatData[key] || flatData[key] === "")) {
            const snakeKey = camelToSnake(key);
            const camelKey = snakeToCamel(key);
            flatData[key] = value;
            flatData[snakeKey] = value;
            flatData[camelKey] = value;
          }
        }
      });
    };

    flatten(profile);
    const up = profile.unifiedProfessionalProfile || {};
    const ucdp = profile.unifiedCastingDirectorProfile || {};
    
    // Merge everything with flatData as base, then casting director, then professional
    const base = { ...flatData, ...ucdp, ...up };

    // Helper to merge arrays/comma-separated strings
    const mergeList = (val1: any, val2: any) => {
      const arr1 = Array.isArray(val1) ? val1 : (val1 ? String(val1).split(',').map(s => s.trim()) : []);
      const arr2 = Array.isArray(val2) ? val2 : (val2 ? String(val2).split(',').map(s => s.trim()) : []);
      return [...new Set([...arr1, ...arr2])].filter(Boolean);
    };

    return {
      ...base,
      fullName: profile.userId?.fullName || profile.fullName || base.full_name || base.fullName,
      displayName: base.display_name || base.displayName || profile.display_name,
      location: base.current_city ? `${base.current_city}${base.current_country ? `, ${base.current_country}` : ''}` : (formatLocation(profile.location) || "Global"),
      bio: base.short_bio || base.bio || profile.bio,
      fullAbout: base.full_about || base.fullAbout || base.full_bio || profile.full_bio,
      instagram: base.instagram_url || base.instagramUrl || base.instagram || profile.instagram,
      linkedin: base.linkedin_url || base.linkedinUrl || base.linkedin || profile.linkedin,
      website: base.portfolio_url || base.portfolioUrl || base.website || profile.website,
      skills: mergeList(profile.skills, base.industry_areas || base.skills || base.core_skills),
      isVerified: profile.isVerified || base.isVerified,
      professionalTypes: mergeList([base.primary_professional_type], base.additional_professional_types || base.additional_account_types),
      clientFocus: mergeList(base.serves_client_types, base.target_client_types),
      software: base.software_tools || [],
      certifications: base.certifications || "",
      memberships: base.professional_memberships || "",
      workingDays: base.working_days || [],
      paymentMethods: base.payment_methods || [],
    };
  }, [profile]);

  const p = unifiedSnapshot;
  const fullName = (p as any)?.fullName || (p as any)?.displayName || (profile as any)?.userId?.fullName || (profile as any)?.fullName || "Unknown";
  const displayName = (p as any)?.display_name || (p as any)?.displayName;

  const apiOrigin = useMemo(() => {
    try {
      return new URL(API_BASE_URL).origin;
    } catch {
      return "";
    }
  }, []);

  const resolveMediaUrl = (value: unknown) => {
    if (!value) return "";
    const raw = typeof value === "string" ? value : typeof value === "object" && (value as any)?.url ? String((value as any).url) : "";
    const url = raw.trim();
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith("//")) return `https:${url}`;
    if (url.startsWith("/")) return apiOrigin ? `${apiOrigin}${url}` : url;
    return apiOrigin ? `${apiOrigin}/${url}` : url;
  };

  const normalizeExternalUrl = (value: unknown) => {
    const url = typeof value === "string" ? value.trim() : "";
    if (!url) return "";
    if (/^https?:\/\//i.test(url) || url.startsWith("mailto:")) return url;
    return `https://${url}`;
  };

  const portfolioItems = useMemo(() => {
    const items: Array<{ id: string; url: string }> = [];
    const pushItem = (idValue: unknown, urlValue: unknown) => {
      const url = resolveMediaUrl(urlValue);
      if (!url) return;
      const id = typeof idValue === "string" && idValue ? idValue : url;
      items.push({ id, url });
    };

    const headshots = (p as any)?.headshots || (profile as any)?.headshots;
    if (Array.isArray(headshots)) {
      headshots.forEach((s: any, idx: number) => pushItem(s?._id || `headshot-${idx}`, s?.url || s));
    }

    const mediaPhotos = (profile as any)?.media?.additionalPhotos;
    if (Array.isArray(mediaPhotos)) {
      mediaPhotos.forEach((s: any, idx: number) => pushItem(s?._id || `media-${idx}`, s?.url || s));
    }

    const unique = new Map<string, { id: string; url: string }>();
    items.forEach((it) => unique.set(it.url, it));
    return Array.from(unique.values());
  }, [p, profile, apiOrigin]);

  const roleLabel = useMemo(() => {
    const raw =
      (p as any)?.professional_title ||
      (p as any)?.professionalCategory ||
      (profile as any)?.professionalCategory ||
      "industry_professional";

    const titleCase = (value: string) =>
      value
        .replace(/_/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return titleCase(String(raw));
  }, [p, profile]);

  const initialAvatarSrc = useMemo(() => {
    const possible =
      (profile as any)?.profilePicture ||
      (profile as any)?.avatar ||
      (profile as any)?.userId?.profilePicture ||
      (profile as any)?.userId?.avatar ||
      (profile as any)?.headshots?.[0]?.url ||
      (profile as any)?.media?.additionalPhotos?.[0]?.url ||
      (p as any)?.headshots?.[0]?.url ||
      (p as any)?.profilePicture ||
      (p as any)?.avatar ||
      "/avatar-placeholder.png";

    const resolved = resolveMediaUrl(possible);
    if (resolved) return resolved;
    return getAvatarUrl(fullName, id);
  }, [fullName, id, p, profile, apiOrigin]);

  const [avatarSrc, setAvatarSrc] = useState<string>(initialAvatarSrc);
  useEffect(() => {
    setAvatarSrc(initialAvatarSrc);
  }, [initialAvatarSrc]);

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
                    src={avatarSrc || "/avatar-placeholder.png"} 
                    alt={fullName} 
                    className="w-full aspect-square object-cover" 
                    onError={() => setAvatarSrc(getAvatarUrl(fullName, id))}
                  />
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h1 className="text-3xl font-semibold leading-tight">{fullName}</h1>
                      {p?.isVerified && <ShieldCheck className="w-5 h-5 text-success mt-1 shrink-0" />}
                    </div>
                    <p className="text-sm font-semibold text-slate-600 mt-2">
                      {roleLabel || "Industry Professional"}
                    </p>
                    {displayName && (
                      <p className="text-xs text-muted-foreground mt-1">By {displayName}</p>
                    )}
                    <div className="flex items-center gap-1 text-sm mt-3">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="font-medium">{p.rating || "0.0"}</span>
                      <span className="text-muted-foreground">({p.reviewCount || 0} reviews)</span>
                    </div>
                    
                    <div className="mt-6 flex flex-col gap-2">
                      <Button variant="hero" className="w-full" asChild>
                        <Link to={`/professional/messages?recipientId=${(profile as any)?.userId?._id || (profile as any)?.userId?.id || id}`}>Message Professional</Link>
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
                      <span>{p.location || "Remote / Worldwide"}</span>
                    </div>
                    
                    {p.company_name && (
                      <div className="flex items-center gap-3 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{p.company_name}</span>
                      </div>
                    )}

                    {p.years_of_experience && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{p.years_of_experience}{!String(p.years_of_experience).toLowerCase().includes('year') && " Years in Industry"}</span>
                      </div>
                    )}

                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Online Presence</h4>
                      
                      {p.website && (
                        <a href={normalizeExternalUrl(p.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-primary hover:underline">
                          <Globe className="w-4 h-4" />
                          <span className="truncate">{String(p.website).replace(/^https?:\/\//, '')}</span>
                        </a>
                      )}

                      {p.instagram && (
                        <a href={p.instagram.startsWith('http') ? p.instagram : `https://instagram.com/${p.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                          <Instagram className="w-4 h-4" />
                          <span>{p.instagram.includes('/') ? "Instagram" : `@${p.instagram.replace('@', '')}`}</span>
                        </a>
                      )}

                      {p.linkedin && (
                        <a href={p.linkedin.startsWith('http') ? p.linkedin : `https://linkedin.com/in/${p.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                          <Linkedin className="w-4 h-4" />
                          <span className="truncate">LinkedIn Profile</span>
                        </a>
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
                      {p.professionalCategory === "casting_director" && (
                        <TabsTrigger value="projects" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                          <FileText className="w-4 h-4" /> Casting Calls
                        </TabsTrigger>
                      )}
                      <TabsTrigger value="portfolio" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <ImageIcon className="w-4 h-4" /> Portfolio
                      </TabsTrigger>
                      <TabsTrigger value="pricing" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <Banknote className="w-4 h-4" /> Pricing
                      </TabsTrigger>
                      <TabsTrigger value="availability" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <Calendar className="w-4 h-4" /> Availability
                      </TabsTrigger>
                      <TabsTrigger value="about" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <User className="w-4 h-4" /> About
                      </TabsTrigger>
                      <TabsTrigger value="reviews" className="gap-2 px-4 h-9 data-[state=active]:bg-[#009698] data-[state=active]:text-white">
                        <Star className="w-4 h-4" /> Reviews
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* 1. Overview Tab */}
                  <TabsContent value="overview" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="font-bold text-2xl">Overview</h2>
                          <Badge variant="outline" className={cn(
                            "h-7 px-3 capitalize",
                            p.professionalCategory === "casting_director" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-primary/5 text-primary border-primary/20"
                          )}>
                            {p.professionalCategory === "casting_director" ? "Casting Director" : (profile.experience_level || "Professional")}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm line-clamp-4">
                          {p.bio || "No biography provided."}
                        </p>
                      </div>
                      
                      <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-muted/30 p-5 border">
                          <div className="flex items-center gap-2 mb-3">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Expertise & Experience</span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold">{roleLabel}</p>
                            {p.professionalTypes?.length > 0 && (
                              <p className="text-[10px] text-muted-foreground">Focus: {p.professionalTypes.join(", ")}</p>
                            )}
                            <p className="text-xs text-muted-foreground">Level: <span className="capitalize text-foreground font-medium">{p.experience_level || "Beginner"}</span></p>
                          </div>
                        </div>
                        
                        <div className="rounded-2xl bg-muted/30 p-5 border">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckSquare className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top Skills</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.isArray(p.skills) && p.skills.length > 0 ? (
                              p.skills.slice(0, 12).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="bg-white border text-[9px] px-2 py-0">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">None specified</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Director Stats Bar */}
                      {p.professionalCategory === "casting_director" && (
                        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#009698]/5 border border-[#009698]/10">
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Completed</p>
                            <p className="text-lg font-bold text-[#009698]">{p.completed_castings || 0}</p>
                            <p className="text-[9px] text-muted-foreground">Castings</p>
                          </div>
                          <div className="text-center border-l border-dashed border-[#009698]/20">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active</p>
                            <p className="text-lg font-bold text-[#009698]">{p.active_calls_count || 0}</p>
                            <p className="text-[9px] text-muted-foreground">Calls</p>
                          </div>
                          <div className="text-center border-l border-dashed border-[#009698]/20">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Experience</p>
                            <p className="text-lg font-bold text-[#009698]">{p.years_of_experience || "N/A"}</p>
                            <p className="text-[9px] text-muted-foreground">Years</p>
                          </div>
                          <div className="text-center border-l border-dashed border-[#009698]/20">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Response</p>
                            <p className="text-lg font-bold text-[#009698]">{p.response_time || "48h"}</p>
                            <p className="text-[9px] text-muted-foreground">Typical</p>
                          </div>
                        </div>
                      )}

                      {/* Professional Focus Info */}
                      {p.clientFocus?.length > 0 && (
                        <div className="mt-6 p-5 rounded-2xl bg-[#009698]/5 border border-[#009698]/10">
                           <div className="flex items-center gap-2 mb-4">
                              <Target className="w-4 h-4 text-primary" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Market Focus</span>
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {p.clientFocus.map((client: string) => (
                                <Badge key={client} className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 text-xs">
                                  {client}
                                </Badge>
                              ))}
                           </div>
                        </div>
                      )}

                      {/* Industry Specs Quick View */}
                      {p.professionalCategory && (
                        <div className="mt-6">
                           <Card className="shadow-none bg-primary/[0.02] border-primary/10">
                             <CardContent className="p-5">
                                <h4 className="text-[10px] font-bold uppercase text-primary mb-3 tracking-widest">Core Capabilities</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                   <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Equipment</p>
                                      <p className="text-xs font-medium truncate">{p.equipment_summary || "Standard"}</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Delivery</p>
                                      <p className="text-xs font-medium truncate">{p.delivery_mode?.replace('_', ' ') || "On-site"}</p>
                                   </div>
                                   <div className="space-y-1">
                                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Studio</p>
                                      <p className="text-xs font-medium">{(p.studio_access === "Yes" || p.studio_access === true) ? "Available" : "No Access"}</p>
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
                      {p.services && p.services.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {p.services.map((service: any) => (
                            <div key={service._id} className="p-4 rounded-xl border bg-muted/10">
                              <h4 className="font-bold text-sm mb-1">{service.serviceTitle || service.title || service.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{service.serviceShortDescription || service.description}</p>
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


                  {/* Casting Calls Tab (For Directors) */}
                  {p.professionalCategory === "casting_director" && (
                    <TabsContent value="projects" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                      <Card className="rounded-2xl p-8 border shadow-card bg-card">
                         <div className="flex items-center justify-between mb-8">
                            <h2 className="font-bold text-2xl">Active Casting Calls</h2>
                            <span className="text-xs text-muted-foreground font-medium">{castingCalls.length} Listings</span>
                         </div>
                         
                         {castingCalls.length > 0 ? (
                           <div className="grid gap-4 md:grid-cols-2">
                              {castingCalls.map((call: any) => (
                                <Link key={call._id} to={`/cast/${call._id}`} className="block group">
                                  <div className="p-5 rounded-2xl border bg-muted/5 group-hover:border-primary/50 group-hover:bg-white group-hover:shadow-md transition-all">
                                     <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{call.projectTitle}</h4>
                                        <Badge variant="secondary" className="text-[9px] uppercase tracking-tighter">
                                           {call.productionType}
                                        </Badge>
                                     </div>
                                     <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4">
                                        {call.productionDescription}
                                     </p>
                                     <div className="flex items-center justify-between text-[10px]">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                           <MapPin className="w-3 h-3" />
                                           <span>{call.locationCity}, {call.locationCountry}</span>
                                        </div>
                                        <span className="font-bold text-primary">View Details →</span>
                                     </div>
                                  </div>
                                </Link>
                              ))}
                           </div>
                         ) : (
                           <div className="py-20 text-center bg-muted/5 rounded-2xl border-2 border-dashed">
                              <FileText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
                              <p className="text-sm text-muted-foreground">No active casting calls at the moment.</p>
                           </div>
                         )}
                      </Card>
                    </TabsContent>
                  )}

                  {/* 3. Portfolio Tab */}
                  <TabsContent value="portfolio" className="mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <Card className="rounded-2xl p-8 border shadow-card bg-card">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="font-bold text-2xl">Work Portfolio</h2>
                        <span className="text-xs text-muted-foreground font-medium">{portfolioItems.length} Items</span>
                      </div>
                      
                      {portfolioItems.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {portfolioItems.map((shot, idx) => (
                            <div key={shot.id} className="aspect-[3/4] rounded-2xl overflow-hidden border bg-muted shadow-sm group relative cursor-zoom-in">
                              <img
                                src={shot.url}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                alt="Portfolio"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = getAvatarUrl(fullName, `${id || "user"}-${idx}`);
                                }}
                              />
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
                                      <span className="font-bold">{p.expected_rate_range || "Open to discussion"}</span>
                                   </div>
                                   {p.deposit_percent && (
                                     <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Booking Deposit</span>
                                        <span className="font-bold text-amber-600">{p.deposit_percent}%</span>
                                     </div>
                                   )}
                                </div>
                             </div>

                             {p.paymentMethods?.length > 0 && (
                               <div className="p-5 rounded-2xl bg-muted/20 border border-border/50">
                                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-widest flex items-center gap-2">
                                     <DollarSign className="w-4 h-4" /> Accepted Methods
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                     {p.paymentMethods.map((m: string) => (
                                       <Badge key={m} variant="outline" className="text-[10px] px-2 py-0.5">{m}</Badge>
                                     ))}
                                  </div>
                               </div>
                             )}

                             <div className="p-5 rounded-2xl bg-muted/20 border border-border/50">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-widest flex items-center gap-2">
                                   <ListChecks className="w-4 h-4" /> Operation Terms
                                </h4>
                                <div className="space-y-2">
                                   <p className="text-xs flex items-center gap-2">
                                      {(p.nda_friendly === "Yes" || p.nda_friendly === true) ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />} 
                                      {(p.nda_friendly === "Yes" || p.nda_friendly === true) ? "NDA Friendly Professional" : "NDA terms per discussion"}
                                   </p>
                                   <p className="text-xs flex items-center gap-2">
                                      {(p.contract_required === "Yes" || p.contract_required === true) ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />} 
                                      {(p.contract_required === "Yes" || p.contract_required === true) ? "Signed Contract Required" : "Standard agreement applies"}
                                   </p>
                                   {p.invoicing_available && (
                                     <p className="text-xs flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                                        Invoicing Available
                                     </p>
                                   )}
                                   {p.tax_registered && (
                                     <p className="text-xs flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5 text-slate-500" />
                                        Tax / VAT Registered
                                     </p>
                                   )}
                                </div>
                             </div>
                          </div>

                          <div className="space-y-4">
                             <div className="p-5 rounded-2xl bg-muted/20 border border-border/50 h-full">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-widest flex items-center gap-2">
                                   <Shield className="w-4 h-4" /> Policies
                                </h4>
                                <div className="space-y-6">
                                   {p.cancellation_policy ? (
                                     <div>
                                        <p className="text-xs font-bold mb-1">Cancellation</p>
                                        <p className="text-sm text-slate-600">{p.cancellation_policy}</p>
                                     </div>
                                   ) : (
                                     <p className="text-sm text-muted-foreground italic">Cancellation policy not specified.</p>
                                   )}
                                   
                                   {p.refund_policy ? (
                                     <div>
                                        <p className="text-xs font-bold mb-1">Refunds</p>
                                        <p className="text-sm text-slate-600">{p.refund_policy}</p>
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
                          <span className="font-bold">{p.rating || "0.0"}</span>
                          <span className="text-muted-foreground text-xs">({p.reviewCount || 0} reviews)</span>
                        </div>
                      </div>

                      {p.reviews && p.reviews.length > 0 ? (
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
                                      <span className="font-bold">{p.booking_notice_required || p.notice_required || "Flexible"}</span>
                                   </div>
                                   {p.working_hours_summary && (
                                     <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Working Hours</span>
                                        <span className="font-medium text-xs">{p.working_hours_summary}</span>
                                     </div>
                                   )}
                                   <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">International</span>
                                      <span className="font-bold text-success">Available</span>
                                   </div>
                                </div>
                             </div>

                             {p.workingDays?.length > 0 && (
                               <div className="p-5 rounded-2xl bg-muted/10 border border-dashed">
                                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3 tracking-widest">Active Days</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                     {p.workingDays.map((day: string) => (
                                       <span key={day} className="px-2 py-0.5 rounded bg-white text-[10px] font-bold border shadow-sm">{day}</span>
                                     ))}
                                  </div>
                               </div>
                             )}
                             
                             <div className="p-5 rounded-2xl bg-primary/[0.02] border border-primary/10">
                                <h4 className="text-xs font-bold text-primary uppercase mb-4 tracking-widest">Mobility</h4>
                                <div className="space-y-3">
                                   <div className="flex items-center gap-3 text-sm">
                                      <Plane className="w-4 h-4 text-primary" />
                                      <span>{(p.willing_to_travel === "Yes" || p.willing_to_travel === true) ? "Willing to travel for work" : "Local projects only"}</span>
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
                         <p className="whitespace-pre-wrap">{p.fullAbout || "No biography provided."}</p>
                      </div>

                      {/* Credibility & Recognition */}
                      {(p.notable_clients || p.notable_productions || p.awards_recognition || p.professional_memberships || p.certifications || p.software?.length > 0) && (
                        <div className="mt-10 pt-8 border-t">
                           <h3 className="font-bold text-lg mb-6">Recognition & Industry Standing</h3>
                           <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                             {p.notable_clients && (
                               <div className="space-y-2">
                                 <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2"><Target className="w-3.5 h-3.5" /> Notable Clients</h4>
                                 <p className="text-sm leading-relaxed text-muted-foreground">{p.notable_clients}</p>
                               </div>
                             )}
                             {p.notable_productions && (
                               <div className="space-y-2">
                                 <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2"><FolderOpen className="w-3.5 h-3.5" /> Major Productions</h4>
                                 <p className="text-sm leading-relaxed text-muted-foreground">{p.notable_productions}</p>
                               </div>
                             )}
                             {p.awards_recognition && (
                               <div className="space-y-2">
                                 <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2"><Award className="w-3.5 h-3.5 text-amber-500" /> Awards</h4>
                                 <p className="text-sm leading-relaxed text-muted-foreground">{p.awards_recognition}</p>
                               </div>
                             )}
                             {p.professional_memberships && (
                               <div className="space-y-2">
                                 <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Memberships</h4>
                                 <p className="text-sm leading-relaxed text-muted-foreground">{p.professional_memberships}</p>
                               </div>
                             )}
                             {p.certifications && (
                               <div className="col-span-full mt-4 p-4 rounded-xl bg-muted/20 border-l-4 border-primary">
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Professional Certifications</h4>
                                  <p className="text-sm text-muted-foreground italic">{p.certifications}</p>
                               </div>
                             )}
                             {p.software?.length > 0 && (
                               <div className="col-span-full mt-2">
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Software & Technical Tools</h4>
                                  <div className="flex flex-wrap gap-2">
                                     {p.software.map((s: string) => (
                                       <Badge key={s} variant="secondary" className="bg-white border text-xs px-3">{s}</Badge>
                                     ))}
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
                                         <p className="text-sm font-medium">{p.website ? p.website.replace(/^https?:\/\//, '') : "Website not provided"}</p>
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <div className="space-y-4 pt-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Social Links</h3>
                                <div className="flex gap-3">
                                   {p.instagram && (
                                     <Button size="icon" variant="outline" className="rounded-full hover:text-primary" asChild>
                                        <a href={p.instagram.startsWith('http') ? p.instagram : `https://instagram.com/${p.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"><Instagram className="w-4 h-4" /></a>
                                     </Button>
                                   )}
                                   {p.linkedin && (
                                     <Button size="icon" variant="outline" className="rounded-full hover:text-primary" asChild>
                                        <a href={p.linkedin.startsWith('http') ? p.linkedin : `https://linkedin.com/in/${p.linkedin}`} target="_blank" rel="noopener noreferrer"><Linkedin className="w-4 h-4" /></a>
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
