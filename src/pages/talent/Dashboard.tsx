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
import { formatLocation } from "@/lib/utils";
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

        if (appsRes.data?.success && Array.isArray(appsRes.data.data)) {
          const apps = appsRes.data.data;
          setRecentSubmissions(apps.slice(0, 3).map((app) => ({
            id: app._id,
            title: app.project?.title || app.project?.projectName || app.castingCall?.title || "Unknown Position",
            date: new Date(app.createdAt).toLocaleDateString(),
            status: app.status
          })));

          // Calculate stats based on actual application status from schema:
          // submitted, viewed, shortlisted, rejected, accepted, withdrawn
          const activeApps = apps.filter((a) => ["submitted", "viewed", "shortlisted"].includes(a.status)).length;
          const accepted = apps.filter((a) => a.status === "accepted").length;
          const shortlisted = apps.filter((a) => a.status === "shortlisted").length;
          
          setStats([
            { label: "Active Applications", value: activeApps.toString(), change: "In progress", Icon: FileText },
            { label: "Shortlisted", value: shortlisted.toString(), change: "Next steps", Icon: Star },
            { label: "Accepted", value: accepted.toString(), change: "Hired", Icon: Phone },
            { label: "Success Rate", value: apps.length > 0 ? `${Math.round((accepted / apps.length) * 100)}%` : "0%", change: "Total efficiency", Icon: TrendingUp },
          ]);
        } else {
          setStats([
            { label: "Active Applications", value: "0", change: "In progress", Icon: FileText },
            { label: "Shortlisted", value: "0", change: "Next steps", Icon: Star },
            { label: "Accepted", value: "0", change: "Hired", Icon: Phone },
            { label: "Success Rate", value: "0%", change: "Total efficiency", Icon: TrendingUp },
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {authUser?.fullName || "User"}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your casting opportunities</p>
      </div>

      {/* Active Livestreams */}
      {activeStreams.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-destructive">My Active Sessions</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {activeStreams.map((stream) => (
              <Card key={stream._id} className="border-destructive/20 bg-destructive/5 overflow-hidden group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Video className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm group-hover:text-destructive transition-colors">{stream.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{stream.description || "Live virtual audition session"}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="destructive" asChild>
                    <Link to={`/livestream/${stream._id}`}>Join Room</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className="icon-circle-primary w-10 h-10">
                  <stat.Icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Casting Calls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Upcoming Casting Calls</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/talent/browse-cast">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingCastings.length > 0 ? upcomingCastings.map((casting) => (
              <div key={casting._id} className="rounded-lg border border-border overflow-hidden card-elevated">
                <div className="relative h-40">
                  <img 
                    src={casting.image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400"} 
                    alt={casting.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-primary">{casting.category}</Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{casting.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{casting.description || "No description available"}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {formatLocation(casting.location)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Deadline: {casting.deadline ? new Date(casting.deadline).toLocaleDateString() : "TBD"}
                    </span>
                  </div>
                  <Button size="sm" asChild>
                    <Link to={`/talent/browse-cast/${casting._id}`}>
                      View Details
                      <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-8 text-center border-2 border-dashed border-muted rounded-lg">
                <p className="text-muted-foreground">No upcoming casting calls at the moment.</p>
                <Button variant="link" size="sm" asChild>
                  <Link to="/talent/browse-cast">Browse all opportunities</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">Recent Submissions</CardTitle>
            <p className="text-sm text-muted-foreground">Track the status of your latest applications</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/talent/submissions">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSubmissions.length > 0 ? recentSubmissions.map((submission) => (
              <div 
                key={submission.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div>
                  <p className="font-medium">{submission.title}</p>
                  <p className="text-sm text-muted-foreground">Submitted {submission.date}</p>
                </div>
                <Badge 
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
              <p className="text-sm text-muted-foreground text-center py-4">No submissions yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
