import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Sparkles, Search, Filter, MapPin, User, RefreshCw,
  ExternalLink, ChevronDown, Loader2, Users,
  ArrowRight, XCircle, SlidersHorizontal
} from "lucide-react";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger
} from "@/components/ui/collapsible";
import { castingCallAPI, profileAPI } from "@/lib/api";
import { toast } from "sonner";

interface TalentProfile {
  _id: string;
  userId?: string;
  fullName?: string;
  city?: string;
  country?: string;
  talentType?: string[];
  gender?: string;
  age?: number;
  ethnicity?: string;
  skills?: string[];
  languages?: string[];
  accents?: string[];
  showreelUrl?: string;
  headshots?: { url: string }[];
  profilePicture?: string;
  unionStatus?: string;
  matchScore?: number; // computed client-side
}

interface Role {
  id: string;
  title: string;
  gender?: string;
  minAge?: string;
  maxAge?: string;
  ethnicity?: string;
  skills?: string[];
  unionStatus?: string;
}

interface Project {
  _id: string;
  title?: string;
  projectName?: string;
  roles?: Role[];
}

// ── Naive client-side match scoring ──────────────────────────────────────────
const scoreMatch = (talent: any, role: any): number => {
  let score = 0;
  
  // Basic Demographic (50%)
  if (role.gender && role.gender.length > 0 && !role.gender.includes("any")) {
    if (role.gender.includes(talent.gender)) score += 25;
  } else {
    score += 25; // open to all
  }

  if (role.age_range_min && role.age_range_max && talent.age) {
    const min = parseInt(role.age_range_min), max = parseInt(role.age_range_max);
    if (talent.age >= min && talent.age <= max) score += 25;
    else if (talent.age >= min - 5 && talent.age <= max + 5) score += 15; // close match
  } else {
    score += 25;
  }

  // Appearance (25%)
  if (role.hair_color?.length > 0 && talent.hairColor) {
    if (role.hair_color.includes(talent.hairColor)) score += 10;
  } else score += 10;

  if (role.eye_color?.length > 0 && talent.eyeColor) {
    if (role.eye_color.includes(talent.eyeColor)) score += 5;
  } else score += 5;

  if (role.height_min && talent.height) {
    const tHeight = parseInt(talent.height);
    const rMin = parseInt(role.height_min);
    const rMax = parseInt(role.height_max || "999");
    if (tHeight >= rMin && tHeight <= rMax) score += 10;
  } else score += 10;

  // Skills & Ethnicity (25%)
  if (role.ethnicities?.length > 0 && talent.ethnicity) {
    if (role.ethnicities.includes(talent.ethnicity) || role.ethnicities.includes("open_to_all")) score += 15;
  } else score += 15;

  const talentSkills = talent.skills || [];
  const roleSkills = role.role_skills || [];
  if (roleSkills.length > 0) {
    const overlap = roleSkills.filter((s: string) => talentSkills.includes(s));
    score += Math.round((overlap.length / roleSkills.length) * 10);
  } else {
    score += 10;
  }

  return Math.min(score, 100);
};

const getMatchColor = (score: number) => {
  if (score >= 75) return { text: "text-green-700", bg: "bg-green-50 border-green-200", label: "Excellent Match" };
  if (score >= 50) return { text: "text-blue-700", bg: "bg-blue-50 border-blue-200",  label: "Good Match" };
  if (score >= 25) return { text: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "Partial Match" };
  return { text: "text-slate-500", bg: "bg-slate-50 border-slate-200", label: "Low Match" };
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function MatchedTalent() {
  const [projects, setProjects]         = useState<Project[]>([]);
  const [allTalents, setAllTalents]     = useState<TalentProfile[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchQuery, setSearchQuery]   = useState("");
  const [filtersOpen, setFiltersOpen]   = useState(false);

  // Filters
  const [filterGender, setFilterGender]     = useState("any");
  const [filterAgeMin, setFilterAgeMin]     = useState(16);
  const [filterAgeMax, setFilterAgeMax]     = useState(65);
  const [filterEthnicity, setFilterEthnicity] = useState("any");
  const [filterUnion, setFilterUnion]       = useState("any");
  const [minScore, setMinScore]             = useState(0);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [listingsRes, profilesRes] = await Promise.all([
          castingCallAPI.getMyListings(),
          profileAPI.search({ limit: 100 }).catch(() => null),
        ]);
        const myProjects: Project[] = listingsRes.data?.success
          ? (Array.isArray(listingsRes.data.data) ? listingsRes.data.data : listingsRes.data.data?.castingCalls || [])
          : [];
        setProjects(myProjects);

        const talents: TalentProfile[] = profilesRes?.data?.success
          ? (Array.isArray(profilesRes.data.data) ? profilesRes.data.data : profilesRes.data.data?.profiles || [])
          : [];
        setAllTalents(talents);
      } catch {
        toast.error("Failed to load talent data.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Derive active role object
  const currentProject  = projects.find(p => p._id === selectedProject);
  const currentRoleObj  = currentProject?.roles?.find(r => r.id === selectedRole);
  const activeRoles     = currentProject?.roles || [];

  // Compute ranked matches
  const rankedTalents = useMemo(() => {
    return allTalents.map(t => ({
      ...t,
      matchScore: currentRoleObj ? scoreMatch(t, currentRoleObj) : 50,
    }));
  }, [allTalents, currentRoleObj]);

  // Apply filters
  const displayedTalents = useMemo(() => {
    return rankedTalents.filter(t => {
      if (searchQuery && !t.fullName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterGender !== "any" && t.gender !== filterGender) return false;
      if (t.age && (t.age < filterAgeMin || t.age > filterAgeMax)) return false;
      if (filterEthnicity !== "any" && t.ethnicity !== filterEthnicity) return false;
      if (filterUnion !== "any" && t.unionStatus !== filterUnion) return false;
      if ((t.matchScore ?? 0) < minScore) return false;
      return true;
    }).sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }, [rankedTalents, searchQuery, filterGender, filterAgeMin, filterAgeMax, filterEthnicity, filterUnion, minScore]);

  const resetFilters = () => {
    setSearchQuery("");
    setFilterGender("any");
    setFilterAgeMin(16);
    setFilterAgeMax(65);
    setFilterEthnicity("any");
    setFilterUnion("any");
    setMinScore(0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Matched Talent
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Castglo recommends talent from our database based on your role requirements.
          </p>
        </div>
        <Button variant="outline" onClick={resetFilters} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Reset Filters
        </Button>
      </div>

      {/* Role & Project selectors */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search talent..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={selectedProject} onValueChange={v => { setSelectedProject(v); setSelectedRole("all"); }}>
            <SelectTrigger><SelectValue placeholder="All Projects" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(p => (
                <SelectItem key={p._id} value={p._id}>{p.projectName || p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedRole}
            onValueChange={setSelectedRole}
            disabled={!activeRoles.length}
          >
            <SelectTrigger><SelectValue placeholder="Select role to match" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {activeRoles.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button variant={filtersOpen ? "default" : "outline"} className="w-full gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                More Filters
                <ChevronDown className={`w-3 h-3 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>

        {/* Expanded Filters */}
        <Collapsible open={filtersOpen}>
          <CollapsibleContent>
            <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={filterGender} onValueChange={setFilterGender}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ethnicity</Label>
                <Select value={filterEthnicity} onValueChange={setFilterEthnicity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="caucasian">Caucasian</SelectItem>
                    <SelectItem value="black">Black / African Descent</SelectItem>
                    <SelectItem value="asian">Asian</SelectItem>
                    <SelectItem value="latino">Latino / Hispanic</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Union Status</Label>
                <Select value={filterUnion} onValueChange={setFilterUnion}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="union">Union Only</SelectItem>
                    <SelectItem value="non-union">Non-Union</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Min Match Score: {minScore}%</Label>
                <Slider
                  min={0}
                  max={90}
                  step={10}
                  value={[minScore]}
                  onValueChange={([v]) => setMinScore(v)}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Results summary info box */}
      {currentRoleObj && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl text-sm">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span>
            Matching talent for role <strong>"{currentRoleObj.title}"</strong>
            {currentRoleObj.gender !== "any" && ` · ${currentRoleObj.gender}`}
            {currentRoleObj.minAge && ` · Age ${currentRoleObj.minAge}–${currentRoleObj.maxAge}`}
            {currentRoleObj.ethnicity !== "any" && ` · ${currentRoleObj.ethnicity}`}
          </span>
        </div>
      )}

      {/* Results grid */}
      {displayedTalents.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">No matches found</p>
          <p className="text-sm mt-1">Try widening your filters or selecting a different role.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedTalents.map(talent => {
            const score = talent.matchScore ?? 0;
            const matchStyle = getMatchColor(score);
            return (
              <Card key={talent._id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Header gradient */}
                <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative">
                  {/* Match badge pinned to top right */}
                  <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full border ${matchStyle.bg} ${matchStyle.text}`}>
                    {score}% · {matchStyle.label}
                  </div>
                </div>

                <CardContent className="px-4 pb-4 -mt-10">
                  <Avatar className="h-16 w-16 border-4 border-background shadow-md mb-3">
                    <AvatarImage src={talent.headshots?.[0]?.url || talent.profilePicture} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                      {(talent.fullName || "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="font-bold text-sm leading-tight">{talent.fullName || "Unknown Talent"}</h3>
                  {(talent.city || talent.country) && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {[talent.city, talent.country].filter(Boolean).join(", ")}
                    </p>
                  )}

                  {talent.age && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <User className="w-3 h-3" /> Age {talent.age}
                      {talent.gender && ` · ${talent.gender}`}
                    </p>
                  )}

                  {/* Skills */}
                  {talent.skills && talent.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {talent.skills.slice(0, 3).map(s => (
                        <span key={s} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{s}</span>
                      ))}
                      {talent.skills.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{talent.skills.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button asChild size="sm" variant="outline" className="flex-1 gap-1 text-xs h-8">
                      <Link to={`/talent/${talent.userId || talent._id}`}>
                        <ExternalLink className="w-3 h-3" /> Profile
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1 gap-1 text-xs h-8">
                      <ArrowRight className="w-3 h-3" /> Invite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
