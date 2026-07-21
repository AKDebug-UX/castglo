import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { castingCallAPI, messagingAPI, profileAPI, applicationAPI, projectAPI } from "@/lib/api";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/utils";
import { useWorkspace } from "@/contexts/WorkspaceContext";


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
  matchScore?: number;
  appliedProjects: string[];
  appliedRoles: string[];
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
  id?: string;
  title?: string;
  projectName?: string;
  roles?: Role[];
  applicationCount?: number;
  applicantCount?: number;
}

const getMatchColor = (score: number) => {
  if (score >= 75) return { text: "text-green-700", bg: "bg-green-50 border-green-200", label: "Excellent Match" };
  if (score >= 50) return { text: "text-blue-700", bg: "bg-blue-50 border-blue-200",  label: "Good Match" };
  if (score >= 25) return { text: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "Partial Match" };
  return { text: "text-slate-500", bg: "bg-slate-50 border-slate-200", label: "Low Match" };
};

export default function MatchedTalent() {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  
  // Helper functions (defined first so they can be used in any useEffect
  const getRoleId = (r: any) => String(r?.id || r?._id || r?.roleId || r?.role_id || r?.uuid || "");
  const getRoleTitle = (r: any) => String(r?.title || r?.role_name || r?.roleName || r?.name || "Role");

  const [projects, setProjects] = useState<Project[]>([]);
  const [allTalents, setAllTalents] = useState<TalentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [invitingTalentId, setInvitingTalentId] = useState<string>("");
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  // Filters
  const [filterGender, setFilterGender] = useState("any");
  const [filterAgeMin, setFilterAgeMin] = useState(16);
  const [filterAgeMax, setFilterAgeMax] = useState(65);
  const [filterEthnicity, setFilterEthnicity] = useState("any");
  const [filterUnion, setFilterUnion] = useState("any");
  const [minScore, setMinScore] = useState(0);

  // Live roles for the selected project
  const [liveRoles, setLiveRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // URL params
  const [searchParams] = useSearchParams();

  // Normalize talent function
  const normalizeTalent = (raw: any): Omit<TalentProfile, 'appliedProjects' | 'appliedRoles'> => {
    const userObj = raw?.userId && typeof raw.userId === "object" ? raw.userId : null;
    const userId = userObj?._id || userObj?.id || (typeof raw?.userId === "string" ? raw.userId : undefined);
    const fullName = userObj?.fullName || raw?.fullName || raw?.displayName || raw?.display_name;
    const city = raw?.location?.city || raw?.city || raw?.current_city || raw?.unifiedTalentProfile?.city;
    const country = raw?.location?.country || raw?.country || raw?.current_country || raw?.unifiedTalentProfile?.country;
    const skills = raw?.skills || raw?.unifiedTalentProfile?.skills || raw?.talent?.skills || [];
    const headshots = raw?.talent?.headshots || raw?.headshots || raw?.media?.additionalPhotos || [];
    const profilePicture =
      raw?.profilePicture ||
      userObj?.profilePicture ||
      raw?.talent?.headshots?.[0]?.url ||
      raw?.headshots?.[0]?.url ||
      raw?.media?.additionalPhotos?.[0]?.url;

    return {
      _id: raw?._id || userId || crypto.randomUUID(),
      userId,
      fullName,
      city,
      country,
      gender: raw?.gender || raw?.talent?.gender || raw?.talent?.appearance?.gender,
      age: raw?.age || raw?.talent?.age,
      ethnicity: raw?.ethnicity || raw?.talent?.ethnicity || raw?.talent?.appearance?.ethnicity,
      skills: Array.isArray(skills) ? skills : [],
      languages: raw?.languages || raw?.talent?.languages,
      accents: raw?.accents || raw?.talent?.accents,
      showreelUrl: raw?.showreelUrl || raw?.showreel || raw?.media?.showreel?.url,
      headshots: Array.isArray(headshots) ? headshots : [],
      profilePicture: resolveMediaUrl(profilePicture),
      unionStatus: raw?.unionStatus || raw?.talent?.unionStatus,
    };
  };

  // 1. Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        let myProjects: Project[] = [];
        if (activeWorkspace === "Personal") {
          const listingsRes = await projectAPI.getMe();
          myProjects = listingsRes.data?.success
            ? (Array.isArray(listingsRes.data.data) ? listingsRes.data.data : listingsRes.data.data?.projects || listingsRes.data.data?.castingCalls || [])
            : [];
        } else {
          myProjects = (activeWorkspace.projectGrants || [])
            .map((g: any) => g.projectId)
            .filter((p: any) => p && typeof p === "object")
            .map((p: any) => ({
              _id: p._id || p.id,
              title: p.title || p.projectName,
              projectName: p.projectName || p.title,
              roles: p.roles || []
            }));
        }
        setProjects(myProjects);

        // Auto-select the first project as default if there are projects and no URL query params
        const finalProjectId = searchParams.get("projectId") || searchParams.get("project");
        if (!finalProjectId && myProjects.length > 0) {
          const firstProj = myProjects[0];
          const firstProjId = firstProj._id || firstProj.id;
          if (firstProjId) {
            setSelectedProject(firstProjId);
          }
        }
      } catch {
        toast.error("Failed to load projects.");
      } finally {
        setProjectsLoaded(true);
      }
    };
    loadProjects();
  }, [searchParams, activeWorkspace]);

  // 2. Initialize selectedProject and selectedRole from URL params ONLY (no auto-select first project/role)
  useEffect(() => {
    if (!projectsLoaded) return;
    
    let finalProjectId = searchParams.get("projectId") || searchParams.get("project");
    let finalRoleId = searchParams.get("roleId") || searchParams.get("role");
    
    if (finalProjectId) {
      setSelectedProject(finalProjectId);
      
      // If we have a project from URL, then select role from URL or default to first role
      const checkAndSelectRole = () => {
        const selectedProj = projects.find(p => (p._id || p.id) === finalProjectId);
        const rolesForProject = liveRoles.length > 0 ? liveRoles : (selectedProj?.roles || []);
        
        if (!finalRoleId && rolesForProject.length > 0) {
          finalRoleId = getRoleId(rolesForProject[0]);
          setSelectedRole(finalRoleId);
        } else if (finalRoleId) {
          setSelectedRole(finalRoleId);
        }
      };
      checkAndSelectRole();
    }
  }, [searchParams, projectsLoaded, projects, liveRoles]);

  // 3. Load talents when selectedProject or selectedRole changes
  useEffect(() => {
    if (!projectsLoaded) return;

    const loadTalents = async () => {
      setIsLoading(true);
      try {
        if (selectedProject !== "all" && selectedRole !== "all") {
          // Fetch matches from API
          const matchesRes = await projectAPI.getMatches(selectedProject, selectedRole);
          if (matchesRes.data?.success) {
            const talents = Array.isArray(matchesRes.data.data)
              ? matchesRes.data.data
              : (matchesRes.data.data?.talents || matchesRes.data.data?.matches || []);
            
            setAllTalents(talents.map(t => ({
              ...normalizeTalent(t),
              matchScore: t.matchScore || t.score || 0,
              appliedProjects: [],
              appliedRoles: []
            })));
          } else {
            setAllTalents([]);
          }
        } else if (selectedProject !== "all" || selectedRole !== "all") {
          // Fallback to loading applicants only if either project or role is selected
          const targetProj = selectedProject !== "all" ? projects.find(p => (p._id || p.id) === selectedProject) : null;
          const allAppsPromises = selectedProject !== "all" 
            ? (targetProj && (targetProj.applicationCount === 0 || targetProj.applicantCount === 0)
                ? [Promise.resolve({ data: { success: true, data: [] } } as any)]
                : [applicationAPI.getByCastingCall(selectedProject).catch(() => null)])
            : projects.map(p => {
                if (p.applicationCount === 0 || p.applicantCount === 0) {
                  return Promise.resolve({ data: { success: true, data: [] } } as any);
                }
                return applicationAPI.getByCastingCall(p._id || p.id).catch(() => null);
              });
          const appsResults = await Promise.all(allAppsPromises);
          
          const allApps = appsResults.flatMap(res => 
            (res?.data?.success && Array.isArray(res.data.data)) ? res.data.data : []
          );

          const talentMap = new Map<string, TalentProfile>();
          
          allApps.forEach(app => {
            if (!app.talent) return;
            const tId = String(app.talent.userId?._id || app.talent.userId || app.talent._id || "");
            if (!tId) return;

            const projId = String(app.castingCall?._id || app.castingCall?.id || app.castingCall || "");
            const rId = String(app.roleId || "");

            // Filter by selectedRole if needed
            if (selectedRole !== "all" && rId !== selectedRole) return;

            if (!talentMap.has(tId)) {
              talentMap.set(tId, {
                ...normalizeTalent(app.talent),
                appliedProjects: [],
                appliedRoles: []
              });
            }

            const talent = talentMap.get(tId)!;
            if (projId && !talent.appliedProjects.includes(projId)) talent.appliedProjects.push(projId);
            if (rId && !talent.appliedRoles.includes(rId)) talent.appliedRoles.push(rId);
          });

          setAllTalents(Array.from(talentMap.values()));
        } else {
          // Don't load anything if both are "all"
          setAllTalents([]);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load talent data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedProject !== "all" || selectedRole !== "all") {
      loadTalents();
    } else {
      setIsLoading(false);
      setAllTalents([]);
    }
  }, [selectedProject, selectedRole, projects, projectsLoaded]);

  // Fetch live roles whenever the selected project changes
  useEffect(() => {
    if (selectedProject === "all") {
      setLiveRoles([]);
      return;
    }
    setRolesLoading(true);
    projectAPI.getRoles(selectedProject)
      .then(res => {
        const raw = res.data?.data || res.data?.data?.roles || [];
        const roles: Role[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: String(r.id || r._id || ""),
          title: r.role_name || r.name || r.title || "Unnamed Role",
          gender: r.gender,
          minAge: r.ageRange?.min,
          maxAge: r.ageRange?.max,
          ethnicity: r.ethnicity,
          skills: r.skillsRequired,
          unionStatus: r.unionStatusRequirement,
        }));
        setLiveRoles(roles);
      })
      .catch(() => setLiveRoles([]))
      .finally(() => setRolesLoading(false));
  }, [selectedProject]);

  // Auto-select the first role when liveRoles load and selectedRole is "all"
  useEffect(() => {
    if (selectedProject !== "all" && liveRoles.length > 0 && selectedRole === "all") {
      const firstRoleId = getRoleId(liveRoles[0]);
      if (firstRoleId) {
        setSelectedRole(firstRoleId);
      }
    }
  }, [selectedProject, liveRoles, selectedRole]);

  // Derive active role object from liveRoles
  const currentProject = projects.find(p => (p._id || p.id) === selectedProject);
  const activeRoles = liveRoles.length > 0 ? liveRoles : (currentProject?.roles || []);
  const currentRoleObj = activeRoles.find((r: any) => getRoleId(r) === selectedRole);

  // Compute ranked matches
  const rankedTalents = useMemo(() => {
    let filtered = allTalents;
    
    if (selectedProject !== "all" && selectedRole === "all") {
      filtered = filtered.filter(t => (t.appliedProjects || []).includes(selectedProject));
    } else if (selectedProject !== "all" && selectedRole !== "all") {
      // Already have filtered matches from API
    } else if (selectedProject === "all" && selectedRole !== "all") {
      filtered = filtered.filter(t => (t.appliedRoles || []).includes(selectedRole));
    }

    return filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [allTalents, selectedProject, selectedRole]);

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

  const inviteTalent = async (talent: TalentProfile) => {
    const talentId = String(talent.userId || talent._id || "");
    if (!talentId) {
      toast.error("Talent ID not found.");
      return;
    }

    setInvitingTalentId(talentId);
    try {
      const castingCallId = selectedProject !== "all" ? selectedProject : undefined;
      await messagingAPI.getOrCreateConversation(talentId, castingCallId);
      toast.success("Invite ready. Send your message to the talent.");
      navigate(`/director/messages?talentId=${encodeURIComponent(talentId)}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to invite talent.");
    } finally {
      setInvitingTalentId("");
    }
  };

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
                <SelectItem key={p._id || p.id} value={p._id || p.id}>{p.projectName || p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedRole}
            onValueChange={setSelectedRole}
            disabled={!activeRoles.length || rolesLoading}
          >
            <SelectTrigger><SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select role to match"} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {activeRoles.map(r => (
                <SelectItem key={getRoleId(r)} value={getRoleId(r)}>{getRoleTitle(r)}</SelectItem>
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
            Matching talent for role <strong>"{getRoleTitle(currentRoleObj)}"</strong>
          </span>
        </div>
      )}

      {/* Results grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground max-w-md mx-auto bg-slate-50 rounded-2xl p-8 border border-dashed">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#009698] opacity-75" />
          <p className="text-lg font-bold text-slate-800">No Projects Found</p>
          <p className="text-sm mt-2 text-slate-500 mb-6">You need to create a project with casting roles to start matching with talent.</p>
          <Button className="bg-[#009698] hover:bg-[#009698]/90" asChild>
            <Link to="/director/create">Create a Project</Link>
          </Button>
        </div>
      ) : (selectedProject === "all" || selectedRole === "all") ? (
        <div className="text-center py-20 text-muted-foreground max-w-md mx-auto bg-slate-50 rounded-2xl p-8 border border-dashed">
          <SlidersHorizontal className="w-12 h-12 mx-auto mb-4 text-[#009698] opacity-75" />
          <p className="text-lg font-bold text-slate-800">Select Project & Role</p>
          <p className="text-sm mt-2 text-slate-500">Please choose a project and a specific casting role from the dropdowns above to display matching talent results.</p>
        </div>
      ) : displayedTalents.length === 0 ? (
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
                    <AvatarImage
                      src={
                        resolveMediaUrl((talent as any)?.talent?.headshots?.[0]?.url) ||
                        resolveMediaUrl((talent.headshots as any)?.[0]?.url) ||
                        talent.profilePicture
                      }
                    />
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
                    <Button
                      size="sm"
                      className="flex-1 gap-1 text-xs h-8"
                      onClick={() => inviteTalent(talent)}
                      disabled={!!invitingTalentId && invitingTalentId === String(talent.userId || talent._id || "")}
                    >
                      {invitingTalentId && invitingTalentId === String(talent.userId || talent._id || "") ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <ArrowRight className="w-3 h-3" />
                      )}{" "}
                      Invite
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
