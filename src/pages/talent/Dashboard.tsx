import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Phone, 
  Eye, 
  TrendingUp,
  MapPin,
  Calendar,
  ArrowUpRight,
  Loader2,
  Star,
  Video
} from "lucide-react";
import { applicationAPI, castingCallAPI, livestreamAPI } from "@/lib/api";
import { toast } from "sonner";
import { formatLocation, resolveMediaUrl } from "@/lib/utils";
import { getProjectCoverImage } from "@/lib/project.utils";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user: authUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [upcomingCastings, setUpcomingCastings] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [activeStreams, setActiveStreams] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appsRes, castingsRes, streamsRes] = await Promise.all([
          applicationAPI.getMe().catch(err => ({ data: { success: false } })),
          castingCallAPI.getAll({ limit: 2 }).catch(err => ({ data: { success: false } })),
          livestreamAPI.getMyStreams().catch(err => ({ data: { success: false } }))
        ]);

        if (streamsRes.data?.success && Array.isArray(streamsRes.data.data)) {
          setActiveStreams(streamsRes.data.data.slice(0, 2));
        } else {
          setActiveStreams([]);
        }

        if (appsRes.data?.success) {
          let apps: any[] = [];
          if (Array.isArray(appsRes.data.data)) {
            apps = appsRes.data.data;
          } else if (appsRes.data.data && Array.isArray(appsRes.data.data.applications)) {
            apps = appsRes.data.data.applications;
          }
          
          setRecentSubmissions(apps.slice(0, 3).map((app) => ({
            id: app._id,
            title: app.project?.title || app.project?.projectName || app.castingCall?.title || "Unknown Position",
            date: new Date(app.createdAt).toLocaleDateString(),
            status: app.status
          })));

          // Calculate stats based on actual application status from schema:
          // submitted, viewed, shortlisted, rejected, accepted, withdrawn
          const activeApps = apps.filter((a) => ["submitted", "viewed", "shortlisted", "applied"].includes(a.status)).length;
          const accepted = apps.filter((a) => a.status === "accepted").length;
          const shortlisted = apps.filter((a) => a.status === "shortlisted").length;
          
          setStats([
            { label: "Active Applications", value: activeApps.toString(), change: "In progress", Icon: FileText, circleClass: "bg-primary/10 text-primary" },
            { label: "Shortlisted", value: shortlisted.toString(), change: "Next steps", Icon: Star, circleClass: "bg-secondary/10 text-secondary" },
            { label: "Accepted", value: accepted.toString(), change: "Hired", Icon: Phone, circleClass: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" },
            { label: "Success Rate", value: apps.length > 0 ? `${Math.round((accepted / apps.length) * 100)}%` : "0%", change: "Total efficiency", Icon: TrendingUp, circleClass: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-foreground" },
          ]);
        } else {
          setStats([
            { label: "Active Applications", value: "0", change: "In progress", Icon: FileText, circleClass: "bg-primary/10 text-primary" },
            { label: "Shortlisted", value: "0", change: "Next steps", Icon: Star, circleClass: "bg-secondary/10 text-secondary" },
            { label: "Accepted", value: "0", change: "Hired", Icon: Phone, circleClass: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" },
            { label: "Success Rate", value: "0%", change: "Total efficiency", Icon: TrendingUp, circleClass: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-foreground" },
          ]);
        }

        if (castingsRes.data?.success && Array.isArray(castingsRes.data.data.castingCalls) && castingsRes.data.data.castingCalls.length > 0) {
          setUpcomingCastings(castingsRes.data.data.castingCalls.slice(0, 2));
        } else {
          setUpcomingCastings([]);
        }

      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        toast.error("Some dashboard data could not be loaded. Showing latest updates.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#009698] via-[#008183] to-[#006e70] p-6 lg:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide text-white/90 mb-3 border border-white/20">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              Talent Workspace
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Welcome back, {authUser?.fullName || "Artist"}!
            </h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Track your auditions, stay updated on casting calls, and manage your industry presence.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button size="sm" className="bg-white text-[#009698] hover:bg-white/90 font-bold rounded-xl shadow-md transition-all hover:scale-105" asChild>
              <Link to="/talent/browse-cast">
                Browse Castings
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Active Livestreams */}
      {activeStreams.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-destructive">My Active Sessions</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {activeStreams.map((stream: any, index: number) => (
              <Card key={stream._id || stream.id || index} className="border-destructive/30 bg-destructive/5 backdrop-blur-md overflow-hidden group rounded-2xl transition-all hover:shadow-md">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
                      <Video className="h-6 w-6 text-destructive" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm group-hover:text-destructive transition-colors truncate">{stream.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{stream.description || "Live virtual audition session"}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="destructive" className="rounded-xl font-semibold shadow-xs" asChild>
                    <Link to={`/livestream/${stream._id || stream.id}`}>Join Room</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat: any) => (
          <Card key={stat.label} className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-black tracking-tight mt-1 text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${stat.circleClass || 'bg-primary/10 text-primary'}`}>
                  <stat.Icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Casting Calls */}
      <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6 border-b border-border/40 bg-muted/20">
          <div>
            <CardTitle className="text-base font-bold">Upcoming Casting Calls</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Explore open roles matching your talents</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-semibold rounded-xl text-xs" asChild>
            <Link to="/talent/browse-cast">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingCastings.length > 0 ? (
              upcomingCastings.map((casting: any, index: number) => (
                <div key={casting._id || casting.id || index} className="rounded-2xl border border-border/60 overflow-hidden bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col group">
                  <div className="relative h-44 overflow-hidden">
                    <img 
                      src={resolveMediaUrl(getProjectCoverImage(casting)) || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400"} 
                      alt={casting.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-md border border-white/20 text-white font-semibold text-xs px-2.5 py-0.5 rounded-full">
                      {casting.category}
                    </Badge>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-1">{casting.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{casting.description || "No description available"}</p>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4 pt-3 border-t border-border/40">
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          {formatLocation(casting.location)}
                        </span>
                        {casting.deadline && (
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            {new Date(casting.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <Button size="sm" className="w-full rounded-xl font-semibold shadow-xs transition-all" asChild>
                        <Link to={`/talent/browse-cast/${casting._id || casting.id}`}>
                          View Details
                          <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-border/60 rounded-2xl bg-muted/10">
                <p className="text-sm font-semibold text-muted-foreground">No upcoming casting calls at the moment.</p>
                <Button variant="link" size="sm" className="text-primary font-semibold mt-1" asChild>
                  <Link to="/talent/browse-cast">Browse all opportunities</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6 border-b border-border/40 bg-muted/20">
          <div>
            <CardTitle className="text-base font-bold">Recent Submissions</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Track the status of your latest applications</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-semibold rounded-xl text-xs" asChild>
            <Link to="/talent/applications">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {recentSubmissions.length > 0 ? recentSubmissions.map((submission: any) => (
              <div 
                key={submission.id} 
                className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-all"
              >
                <div>
                  <p className="font-bold text-sm text-foreground">{submission.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Submitted {submission.date}</p>
                </div>
                <Badge 
                  className="rounded-full text-xs font-semibold px-3 py-1 uppercase tracking-wider"
                  variant={
                    submission.status === "accepted" ? "default" : 
                    submission.status === "rejected" ? "destructive" : 
                    "secondary"
                  }
                >
                  {submission.status}
                </Badge>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground text-center py-6">No submissions yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
