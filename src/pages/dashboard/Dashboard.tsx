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
  Star
} from "lucide-react";
import { applicationAPI, castingCallAPI, authAPI } from "@/lib/api";
import { toast } from "sonner";
import { MOCK_CASTINGS } from "@/lib/data";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [upcomingCastings, setUpcomingCastings] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userRes, appsRes, castingsRes] = await Promise.all([
          authAPI.getMe(),
          applicationAPI.getMe(),
          castingCallAPI.getAll({ limit: 2 })
        ]);

        if (userRes.data.success) {
          setUserName(userRes.data.data.fullName);
        }

        if (appsRes.data.success && Array.isArray(appsRes.data.data)) {
          const apps = appsRes.data.data;
          setRecentSubmissions(apps.slice(0, 3).map((app) => ({
            id: app._id,
            title: app.castingCall?.title || "Unknown Position",
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

        if (castingsRes.data.success && Array.isArray(castingsRes.data.data) && castingsRes.data.data.length > 0) {
          setUpcomingCastings(castingsRes.data.data.slice(0, 2));
        } else {
          // If no actual data from API, show mock ones to avoid empty page
          setUpcomingCastings(MOCK_CASTINGS.slice(0, 2));
        }

      } catch (error) {
        toast.error("Failed to load dashboard data");
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
        <h1 className="text-2xl font-bold">Welcome back, {userName || "User"}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your casting opportunities</p>
      </div>

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
            <Link to="/dashboard/browse">View All</Link>
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
                      {casting.location || "Remote"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Deadline: {casting.deadline ? new Date(casting.deadline).toLocaleDateString() : "TBD"}
                    </span>
                  </div>
                  <Button size="sm" asChild>
                    <Link to={`/dashboard/browse/${casting._id}`}>
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
                  <Link to="/dashboard/browse">Browse all opportunities</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Submissions</CardTitle>
          <p className="text-sm text-muted-foreground">Track the status of your latest applications</p>
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
