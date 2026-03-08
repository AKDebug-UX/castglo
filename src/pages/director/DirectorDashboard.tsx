import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Clapperboard, 
  FileText, 
  Clock, 
  CheckCircle,
  Users,
  Calendar,
  Eye,
  Loader2
} from "lucide-react";
import { castingCallAPI, applicationAPI, authAPI } from "@/lib/api";
import { toast } from "sonner";

export default function DirectorDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [recentApps, setRecentApps] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, listingsRes] = await Promise.all([
          authAPI.getMe(),
          castingCallAPI.getMyListings()
        ]);

        if (userRes.data.success) {
          setUser(userRes.data.data);
        }

        if (listingsRes.data.success && Array.isArray(listingsRes.data.data)) {
          const myCastings = listingsRes.data.data;
          setListings(myCastings);

          // Calculate basic stats from listings
          const activeCount = myCastings.filter((c: any) => c.status === 'open').length;
          const totalSubmissions = myCastings.reduce((acc: number, c: any) => acc + (c.applicationCount || 0), 0);
          
          setStats([
            { label: "Active Casting Calls", value: activeCount.toString(), change: "Live", Icon: Clapperboard },
            { label: "Total Submissions", value: totalSubmissions.toString(), change: "Across all projects", Icon: FileText },
            { label: "Pending Reviews", value: "0", change: "Needs attention", Icon: Clock },
            { label: "Roles Filled", value: "0", change: "This quarter", Icon: CheckCircle },
          ]);

          // Fetch recent applications for these listings (simplified)
          if (myCastings.length > 0) {
             const allAppsPromises = myCastings.slice(0, 3).map((c: any) => applicationAPI.getByCastingCall(c._id));
             const appsResults = await Promise.all(allAppsPromises);
             const allApps = appsResults.flatMap(res => (res.data.success && Array.isArray(res.data.data)) ? res.data.data : []);
             setRecentApps(allApps.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
          }
        } else {
          setListings([]);
          setStats([
            { label: "Active Casting Calls", value: "0", change: "Live", Icon: Clapperboard },
            { label: "Total Submissions", value: "0", change: "Across all projects", Icon: FileText },
            { label: "Pending Reviews", value: "0", change: "Needs attention", Icon: Clock },
            { label: "Roles Filled", value: "0", change: "This quarter", Icon: CheckCircle },
          ]);
        }
      } catch (error: any) {
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statusColors: Record<string, string> = {
    applied: "bg-warning text-warning-foreground",
    shortlisted: "bg-primary text-primary-foreground",
    accepted: "bg-success text-success-foreground",
    rejected: "bg-destructive text-destructive-foreground",
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
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.fullName || 'Director'}!</h1>
        <p className="text-muted-foreground">Manage your casting calls and discover amazing talent</p>
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

      {/* Active Casting Calls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Projects</CardTitle>
            <p className="text-sm text-muted-foreground">Your current open casting opportunities</p>
          </div>
          <Button size="sm" asChild>
            <Link to="/director/create">Create New</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {listings.length > 0 ? listings.map((casting) => (
            <div 
              key={casting._id} 
              className="flex items-center justify-between p-4 rounded-lg border border-border"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{casting.title}</h3>
                  <Badge className={casting.status === "open" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                    {casting.status}
                  </Badge>
                  {casting.category && <Badge variant="secondary">{casting.category}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{casting.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {casting.applicationCount || 0} submissions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Deadline: {new Date(casting.deadline).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Created: {new Date(casting.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/director/projects/${casting._id}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    Submissions
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to={`/director/projects/${casting._id}/edit`}>Edit</Link>
                </Button>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-muted-foreground">
              No projects found. Create your first casting call!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <p className="text-sm text-muted-foreground">Latest talent applications requiring your review</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentApps.length > 0 ? recentApps.map((submission) => (
            <div 
              key={submission._id} 
              className="flex items-center justify-between p-3 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {submission.talent?.fullName?.[0] || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{submission.talent?.fullName}</p>
                  <p className="text-sm text-muted-foreground">{submission.castingCall?.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(submission.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[submission.status] || "bg-muted"}>
                  {submission.status}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                   <Link to={`/director/submissions/${submission._id}`}>Review</Link>
                </Button>
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent submissions to review.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
