import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe, MapPin, Mail, Twitter, Instagram, Linkedin,
  CheckCircle, Star, Users, Briefcase, CalendarClock,
  Award, Shield, Clapperboard, Building2, Video,
  ExternalLink, Clock, ArrowRight, Loader2, Share2
} from "lucide-react";
import { castingCallAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
interface DirectorUser {
  _id: string;
  fullName?: string;
  displayName?: string;
  company_name?: string;
  professional_title?: string;
  email?: string;
  profilePicture?: string;
  coverImage?: string;
  bio?: string;
  full_bio?: string;
  city?: string;
  country?: string;
  website?: string;
  socialLinks?: { twitter?: string; instagram?: string; linkedin?: string };
  primary_account_type?: string;
  additional_account_types?: string[];
  verified?: boolean;
  years_of_experience?: string;
  experience_level?: string;
  industryAreas?: string[];
  notableProductions?: string[];
  notableClients?: string[];
  awards?: string[];
  memberships?: string[];
  completedCastings?: number;
  responseTime?: string;
}

const INDUSTRY_TAG_COLORS: Record<string, string> = {
  Film: "bg-purple-100 text-purple-700",
  TV: "bg-blue-100 text-blue-700",
  Theatre: "bg-yellow-100 text-yellow-700",
  "Music Videos": "bg-pink-100 text-pink-700",
  Commercials: "bg-orange-100 text-orange-700",
  Fashion: "bg-teal-100 text-teal-700",
  Voiceover: "bg-cyan-100 text-cyan-700",
  "Live Events": "bg-indigo-100 text-indigo-700",
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function CastingDirectorPublicProfile() {
  const { id } = useParams<{ id: string }>();
  const [director, setDirector] = useState<DirectorUser | null>(null);
  const [activeCalls, setActiveCalls] = useState<any[]>([]);
  const [pastProjects, setPastProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const userRes = await userAPI.getOne(id!);
        if (userRes.data.success || userRes.data.data) {
          setDirector(userRes.data.data || userRes.data);
        }

        const callsRes = await castingCallAPI.getAll({ postedBy: id, limit: 20 }).catch(() => null);
        if (callsRes?.data?.success) {
          const calls: any[] = Array.isArray(callsRes.data.data)
            ? callsRes.data.data
            : callsRes.data.data?.castingCalls || [];
          setActiveCalls(calls.filter(c => c.status === "open"));
          setPastProjects(calls.filter(c => c.status !== "open"));
        }
      } catch {
        toast.error("Profile not found.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!director) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-xl font-bold">Profile not found</h2>
        <Button asChild variant="outline"><Link to="/">Go Home</Link></Button>
      </div>
    );
  }

  const displayName = director.displayName || director.fullName || "Casting Director";
  const location    = [director.city, director.country].filter(Boolean).join(", ");
  const professionalTitle = director.professional_title || "Casting Professional";

  return (
    <div className="min-h-screen bg-background">

      {/* ── Cover + Hero ──────────────────────────────────────────────────── */}
      <div className="relative">
        <div className="h-52 sm:h-64 lg:h-80 w-full overflow-hidden bg-gradient-to-br from-slate-800 via-primary/30 to-slate-900">
          {director.coverImage && (
            <img src={director.coverImage} alt="Cover" className="w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end gap-4 pb-4">
            <Avatar className="h-28 w-28 sm:h-36 sm:w-36 border-4 border-background shadow-xl shrink-0">
              <AvatarImage src={director.profilePicture} />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-3xl">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold">{displayName}</h1>
                    {director.verified && (
                      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                        <Shield className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm mt-0.5">
                    <p>{professionalTitle}</p>
                    {director.company_name && <span>at {director.company_name}</span>}
                    {location && <span>· {location}</span>}
                  </div>
                  {director.bio && <p className="text-sm mt-1 text-muted-foreground max-w-xl line-clamp-2">{director.bio}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                  <Button size="sm" className="gap-1 bg-[#009698] hover:bg-[#009698]/90 text-white">
                    <Mail className="w-4 h-4" /> Contact
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { Icon: Clapperboard, label: "Active Calls",   value: activeCalls.length.toString() },
            { Icon: Award,        label: "Experience",    value: director.years_of_experience || "—" },
            { Icon: Clock,        label: "Response Time",  value: director.responseTime || "—" },
            { Icon: Sparkles,     label: "Level",         value: director.experience_level || "—" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{item.value}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto border-b rounded-none h-auto p-0 bg-transparent gap-6">
            {["overview", "active-calls", "past-projects", "about", "contact"].map(tab => (
              <TabsTrigger 
                key={tab} 
                value={tab}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 pt-2 font-bold capitalize"
              >
                {tab.replace("-", " ")}
                {tab === "active-calls" && activeCalls.length > 0 && (
                  <Badge className="ml-1.5 h-4 px-1 text-[10px] bg-primary/10 text-primary border-none">{activeCalls.length}</Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {director.industryAreas?.length ? (
                  <Card className="border-none shadow-sm bg-muted/30">
                    <CardHeader className="pb-3 px-6">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" /> Specialises In
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <div className="flex flex-wrap gap-2">
                        {director.industryAreas.map(area => (
                          <span key={area} className={`px-4 py-1.5 rounded-full text-sm font-bold border ${INDUSTRY_TAG_COLORS[area] || "bg-background text-foreground"}`}>
                            {area}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {activeCalls.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Clapperboard className="w-3.5 h-3.5" /> Now Casting
                      </h3>
                      {activeCalls.length > 3 && (
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("active-calls")} className="gap-1 text-xs text-primary font-bold">
                          See all <ArrowRight className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {activeCalls.slice(0, 3).map(call => <CastingCallCard key={call._id} call={call} />)}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Card className="border-none shadow-sm bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">Identity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Account Type</p>
                      <p className="text-sm font-bold capitalize">{director.primary_account_type?.replace(/_/g, " ") || "Director"}</p>
                    </div>
                    {director.additional_account_types?.length ? (
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Collaborations</p>
                        <p className="text-sm font-medium">{director.additional_account_types.join(", ")}</p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                {(director.website || director.socialLinks?.twitter || director.socialLinks?.instagram) && (
                  <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Professional Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {director.website && (
                        <a href={director.website} target="_blank" rel="noreferrer"
                          className="flex items-center gap-3 text-sm font-medium text-primary hover:underline">
                          <Globe className="w-4 h-4" /> {director.website.replace(/https?:\/\//, "")}
                        </a>
                      )}
                      {director.socialLinks?.twitter && (
                        <a href={director.socialLinks.twitter} target="_blank" rel="noreferrer"
                          className="flex items-center gap-3 text-sm font-medium hover:text-primary transition-colors">
                          <Twitter className="w-4 h-4" /> Twitter / X
                        </a>
                      )}
                      {director.socialLinks?.instagram && (
                        <a href={director.socialLinks.instagram} target="_blank" rel="noreferrer"
                          className="flex items-center gap-3 text-sm font-medium hover:text-primary transition-colors">
                          <Instagram className="w-4 h-4" /> Instagram
                        </a>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="active-calls" className="mt-6">
            <div className="space-y-3">
              {activeCalls.map(call => <CastingCallCard key={call._id} call={call} detailed />)}
            </div>
          </TabsContent>

          <TabsContent value="past-projects" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {pastProjects.map(call => <CastingCallCard key={call._id} call={call} past />)}
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="max-w-3xl space-y-8">
              {director.full_bio || director.bio ? (
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-bold mb-3">About {displayName}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {director.full_bio || director.bio}
                  </p>
                </div>
              ) : null}

              {director.notableProductions?.length ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notable Productions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {director.notableProductions.map(p => (
                      <div key={p} className="flex items-center gap-3 p-3 rounded-xl border bg-card font-bold text-sm">
                        <Clapperboard className="w-4 h-4 text-primary" /> {p}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <Card className="max-w-md border-none shadow-xl bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <CardTitle>Inquiries & Collaboration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                <p className="text-sm text-muted-foreground">
                  Send a professional inquiry to <strong>{displayName}</strong>.
                </p>
                <div className="space-y-3">
                  {location && (
                    <div className="flex items-center gap-3 text-sm font-medium">
                      <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      {location}
                    </div>
                  )}
                  {director.email && (
                    <div className="flex items-center gap-3 text-sm font-medium">
                      <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-sm">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      Secure Message via Castglo
                    </div>
                  )}
                </div>
                <Button className="w-full h-12 gap-2 text-md font-bold shadow-lg" size="lg">
                  <Rocket className="w-4 h-4" /> Send Inquiry
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ── Casting Call Card sub-component ─────────────────────────────────────────
function CastingCallCard({ call, detailed = false, past = false }: { call: any; detailed?: boolean; past?: boolean }) {
  return (
    <Card className={`group hover:shadow-md transition-all ${past ? "opacity-80" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm">{call.projectName || call.title}</h3>
              <Badge variant="outline" className={
                call.status === "open"
                  ? "border-green-200 text-green-700 bg-green-50"
                  : "text-muted-foreground bg-muted"
              }>
                {call.status === "open" ? "Open" : "Closed"}
              </Badge>
              {call.category && <Badge variant="secondary" className="text-xs">{call.category}</Badge>}
            </div>
            {detailed && call.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{call.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
              {call.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{call.location}</span>}
              {call.deadline && (
                <span className="flex items-center gap-1">
                  <CalendarClock className="w-3 h-3" />
                  Deadline: {new Date(call.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
              {call.applicationCount > 0 && (
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{call.applicationCount} applicants</span>
              )}
            </div>
          </div>
          {!past && (
            <Button size="sm" variant="outline" asChild className="shrink-0">
              <Link to={`/cast/${call._id}`}>
                <ExternalLink className="w-3.5 h-3.5 mr-1" /> View
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
