import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Clapperboard, FileText, Clock, CheckCircle,
  Users, Calendar, Eye, Loader2, Video,
  Sparkles, ArrowRight, Plus, UserCheck,
  TrendingUp, BarChart2
} from "lucide-react";
import { castingCallAPI, applicationAPI, livestreamAPI, projectAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function DirectorDashboard() {
  const { user: authUser } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [isLoading, setIsLoading]     = useState(true);
  const [listings, setListings]       = useState<any[]>([]);
  const [recentApps, setRecentApps]   = useState<any[]>([]);
  const [activeStreams, setActiveStreams] = useState<any[]>([]);
  const [stats, setStats]             = useState<any[]>([]);

  // Pipeline mini-stats
  const [pipeline, setPipeline] = useState({ review: 0, shortlisted: 0, audition: 0, offer: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isPersonal = activeWorkspace === "Personal";
        if (isPersonal) {
          const streamsRes = await livestreamAPI.getMyStreams().catch(() => ({ data: { success: false } }));
          if (streamsRes.data?.success && Array.isArray(streamsRes.data.data)) {
            setActiveStreams(streamsRes.data.data.filter((s: any) => s.status === "live").slice(0, 2));
          }
        } else {
          setActiveStreams([]);
        }

        let myCastings: any[] = [];
        const getLocalProjects = async () => {
          let extractedProjects: any[] = [];
          if (activeWorkspace !== "Personal") {
            if (activeWorkspace.projectGrants && activeWorkspace.projectGrants.length > 0) {
              const promises = activeWorkspace.projectGrants.map(async (grant: any) => {
                const p = grant.projectId;
                if (p && typeof p === 'object' && (p._id || p.id)) {
                  return p.castingCall || p.project || p;
                }
                if (typeof p === 'string') {
                  const res = await projectAPI.getOne(p).catch(() => null);
                  const data = res?.data?.data;
                  return data?.castingCall || data?.project || data;
                }
                return null;
              });
              const results = await Promise.all(promises);
              extractedProjects = results.filter(Boolean);
            }
            
            if (extractedProjects.length === 0) {
              let singleProject = activeWorkspace.project || activeWorkspace.castingCall;
              if (singleProject && typeof singleProject === 'string') {
                const res = await projectAPI.getOne(singleProject).catch(() => null);
                const data = res?.data?.data;
                singleProject = data?.castingCall || data?.project || data;
              }
              if (singleProject && typeof singleProject === 'object' && (singleProject._id || singleProject.id)) {
                const unwrapped = singleProject.castingCall || singleProject.project || singleProject;
                extractedProjects = [unwrapped];
              }
            }
          }
          return extractedProjects;
        };

        try {
          const ownerId = !isPersonal ? (
            activeWorkspace.owner?._id || 
            activeWorkspace.owner || 
            activeWorkspace.inviter?._id || 
            activeWorkspace.inviter
          ) : null;

          if (!isPersonal && !ownerId) {
            throw new Error("Owner ID is undefined");
          }

          const listingsRes = isPersonal 
            ? await projectAPI.getMe() 
            : await projectAPI.getWorkspaceProjects(ownerId as string);

          if (listingsRes.data.success) {
            myCastings = Array.isArray(listingsRes.data.data)
              ? listingsRes.data.data
              : listingsRes.data.data?.projects || listingsRes.data.data?.castingCalls || [];
          }

          if (!isPersonal && myCastings.length === 0) {
            myCastings = await getLocalProjects();
          }

          if (!isPersonal && activeWorkspace.projectGrants && activeWorkspace.projectGrants.length > 0) {
            const grantedIds = activeWorkspace.projectGrants.map((g: any) => 
              typeof g.projectId === "object" ? g.projectId._id || g.projectId.id : g.projectId
            );
            myCastings = myCastings.filter((p: any) => grantedIds.includes(p._id || p.id));
          }
        } catch (apiError) {
          if (!isPersonal) {
            console.warn("Failed to fetch workspace projects from API, falling back to local data:", apiError);
            myCastings = await getLocalProjects();
          } else {
            throw apiError;
          }
        }

        if (myCastings.length > 0 || isPersonal) {
          setListings(myCastings.slice(0, 5));

          // Calculate active projects (handle multiple possible statuses)
          const activeCount       = myCastings.filter((c: any) => {
            const status = (c.status || "").toLowerCase();
            return ["open", "active", "open_for_applications"].includes(status);
          }).length;
          
          // Calculate total submissions (handle both applicationCount and maybe other fields)
          const totalSubmissions  = myCastings.reduce((acc: number, c: any) => {
            return acc + (c.applicationCount || c.applications?.length || 0);
          }, 0);

          // Collect all role queries
          const roleQueries: { projId: string; roleId: string }[] = [];
          myCastings.forEach((p) => {
            const roles = p.roles || p.castingCallRoles || [];
            roles.forEach((r: any) => {
              const roleId = r._id || r.id;
              const projId = p._id || p.id;
              if (projId && roleId) {
                roleQueries.push({ projId, roleId });
              }
            });
          });

          let allApps: any[] = [];
          if (roleQueries.length > 0) {
            const results = await Promise.all(
              roleQueries.map(q => projectAPI.getApplicants(q.projId, q.roleId).catch(() => null))
            );
            results.forEach((res) => {
              if (res?.data?.success && Array.isArray(res.data.data)) {
                allApps = [...allApps, ...res.data.data];
              }
            });
          }

          // Sort by creation date (most recent first)
          allApps.sort((a, b) => new Date(b.createdAt || b.appliedAt || 0).getTime() - new Date(a.createdAt || a.appliedAt || 0).getTime());

          const reviewCount = allApps.filter((a: any) => (a.status || "").toLowerCase() === "applied" || !(a.status)).length;
          const shortlistedCount = allApps.filter((a: any) => (a.status || "").toLowerCase() === "shortlisted").length;
          const auditionCount = allApps.filter((a: any) => ["audition_requested", "self_tape_requested"].includes((a.status || "").toLowerCase())).length;
          const offerCount = allApps.filter((a: any) => ["offer", "accepted"].includes((a.status || "").toLowerCase())).length;

          let tally = {
            review: reviewCount,
            shortlisted: shortlistedCount,
            audition: auditionCount,
            offer: offerCount
          };

          setPipeline(tally);
          setRecentApps(allApps.slice(0, 5));

          setStats([
            { label: "Active Projects",    value: activeCount.toString(),      change: "Live now",          Icon: Clapperboard, color: "text-primary",   bg: "bg-primary/10" },
            { label: "Total Applicants",   value: totalSubmissions.toString(), change: "Across all roles",  Icon: Users,        color: "text-secondary", bg: "bg-secondary/10" },
            { label: "Pending Reviews",    value: tally.review.toString(),      change: "Open in Applicants",Icon: Clock,        color: "text-accent",    bg: "bg-accent/10" },
            { label: "Roles Filled",       value: tally.offer.toString(),       change: "This quarter",      Icon: CheckCircle,  color: "text-green-600",  bg: "bg-green-50 dark:bg-green-950/20 dark:text-green-400" },
          ]);
        } else {
          setStats([
            { label: "Active Projects",  value: "0", change: "Live now",          Icon: Clapperboard, color: "text-primary",   bg: "bg-primary/10" },
            { label: "Total Applicants", value: "0", change: "Across all roles",  Icon: Users,        color: "text-secondary", bg: "bg-secondary/10" },
            { label: "Pending Reviews",  value: "0", change: "Needs attention",   Icon: Clock,        color: "text-accent",    bg: "bg-accent/10" },
            { label: "Roles Filled",     value: "0", change: "This quarter",      Icon: CheckCircle,  color: "text-green-600",  bg: "bg-green-50 dark:bg-green-950/20 dark:text-green-400" },
          ]);
        }
      } catch {
        toast.error("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeWorkspace]);

  const statusColors: Record<string, string> = {
    applied:             "bg-slate-100 text-slate-700",
    shortlisted:         "bg-blue-100 text-blue-700",
    audition_requested:  "bg-orange-100 text-orange-700",
    self_tape_requested: "bg-pink-100 text-pink-700",
    offer:               "bg-green-100 text-green-700",
    accepted:            "bg-green-200 text-green-800",
    rejected:            "bg-red-100 text-red-700",
  };
  const statusLabel: Record<string, string> = {
    applied: "Review", shortlisted: "Shortlisted",
    audition_requested: "Audition", self_tape_requested: "Self-Tape",
    offer: "Offer", accepted: "Hired", rejected: "Declined",
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
      {/* Welcome banner */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {authUser?.fullName?.split(" ")[0] || "Director"} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's an overview of your casting activity.
          </p>
        </div>
        <Button asChild className="gap-2 shadow-sm">
          <Link to="/director/create">
            <Plus className="w-4 h-4" /> Post New Project
          </Link>
        </Button>
      </div>

      {/* Active Livestreams */}
      {activeStreams.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-red-500">Live Audition Rooms</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {activeStreams.map((stream, index) => (
              <Card key={stream._id || stream.id || index} className="border-red-200 bg-red-50/40 overflow-hidden group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Video className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm group-hover:text-red-600 transition-colors">{stream.title}</h3>
                      <p className="text-xs text-muted-foreground">{stream.description || "Live virtual audition"}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="destructive" asChild>
                    <Link to={`/livestream/${stream._id || stream.id}`}>Join</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1 tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                  <stat.Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Mini-Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" /> Applicant Pipeline
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/director/applicants" className="gap-1">Manage <ArrowRight className="w-3 h-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "In Review",   value: pipeline.review,     color: "text-slate-700 dark:text-slate-300",  bg: "bg-slate-100 dark:bg-slate-800/40" },
              { label: "Shortlisted", value: pipeline.shortlisted, color: "text-secondary", bg: "bg-secondary/10" },
              { label: "Audition",    value: pipeline.audition,    color: "text-accent",    bg: "bg-accent/10" },
              { label: "Offer / Hire",value: pipeline.offer,       color: "text-green-700 dark:text-green-400",  bg: "bg-green-100 dark:bg-green-950/20" },
            ].map(item => (
              <div key={item.label} className={`p-4 rounded-xl text-center ${item.bg}`}>
                <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                <p className={`text-xs font-semibold mt-1 ${item.color}`}>{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clapperboard className="w-4 h-4 text-primary" /> My Projects
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/director/projects" className="gap-1">See all <ArrowRight className="w-3 h-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {listings.length > 0 ? listings.map((casting, index) => (
              <div key={casting._id || casting.id || index} className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/30 transition-colors group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm truncate">{casting.projectName || casting.title}</p>
                    <Badge className={casting.status === "open" ? "bg-green-100 text-green-700 border-green-200" : "bg-muted text-muted-foreground"} variant="outline">
                      {casting.status === "open" ? "Live" : casting.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {casting.applicationCount || 0} applicants
                    </span>
                    {(casting.dates?.submission || casting.deadline || casting.application_deadline) && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Deadline: {new Date(casting.dates?.submission || casting.deadline || casting.application_deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                  <Link to={`/director/applicants?project=${casting._id || casting.id}`}>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            )) : (
              <div className="text-center py-10 text-muted-foreground">
                <Clapperboard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No projects yet.</p>
                <Button size="sm" className="mt-3 gap-1" asChild>
                  <Link to="/director/create"><Plus className="w-4 h-4" /> Create First Project</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Recent Applicants
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/director/applicants" className="gap-1">See all <ArrowRight className="w-3 h-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {recentApps.length > 0 ? recentApps.map((app, index) => (
              <div key={app._id || app.id || index} className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {(app.talentId?.fullName || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{app.talentId?.fullName || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground truncate">{app.castingCall?.title}</p>
                  </div>
                </div>
                <Badge className={statusColors[app.status] || "bg-muted text-muted-foreground"} variant="outline">
                  {statusLabel[app.status] || app.status}
                </Badge>
              </div>
            )) : (
              <div className="text-center py-10 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No recent applications.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Post a Project",    href: "/director/create",       Icon: Plus,        color: "text-primary" },
              { label: "View Applicants",   href: "/director/applicants",   Icon: Users,       color: "text-purple-600" },
              { label: "Virtual Auditions", href: "/director/audition",     Icon: Video,       color: "text-red-600" },
              { label: "My Projects",       href: "/director/projects",     Icon: Clapperboard,color: "text-orange-600" },
            ].map(action => (
              <Link
                key={action.href}
                to={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background border hover:border-primary hover:shadow-md transition-all group text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <action.Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
