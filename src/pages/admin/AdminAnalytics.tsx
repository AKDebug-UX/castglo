 import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, FileText, Users, Shield, Loader2 } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { adminAPI } from "@/lib/api";
import { toast } from "sonner";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await adminAPI.getAnalytics();
        if (response.data.success) {
          setAnalytics(response.data.data);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    { 
      label: "User Growth Rate", 
      value: analytics?.userGrowthRate || "0%", 
      sublabel: "vs previous period", 
      icon: TrendingUp 
    },
    { 
      label: "Avg Submissions", 
      value: analytics?.avgSubmissions?.toString() || "0", 
      sublabel: "per casting call", 
      icon: FileText 
    },
    { 
      label: "Engagement Rate", 
      value: analytics?.engagementRate || "0%", 
      sublabel: "active users voting", 
      icon: Users 
    },
    { 
      label: "Blockchain Verified", 
      value: analytics?.blockchainVerifiedCount?.toLocaleString() || "0", 
      sublabel: "submissions verified", 
      icon: Shield 
    },
  ];

  const userGrowthData = analytics?.userGrowthData || [
    { name: "Jan 8", value: 180 },
    { name: "Jan 15", value: 220 },
    { name: "Jan 22", value: 280 },
    { name: "Jan 29", value: 350 },
  ];

  const submissionsVolumeData = analytics?.submissionsVolumeData || [
    { name: "Jan", value: 320 },
    { name: "Feb", value: 380 },
    { name: "Mar", value: 450 },
    { name: "Apr", value: 520 },
    { name: "May", value: 580 },
    { name: "Jun", value: 680 },
  ];

  const votesPerCastingData = analytics?.votesPerCastingData || [
    { name: "Lead Role", value: 480 },
    { name: "Commercial", value: 420 },
    { name: "Netflix Series", value: 380 },
    { name: "Voice Over", value: 280 },
    { name: "Theatre", value: 180 },
  ];

  const bookingsTrendData = analytics?.bookingsTrendData || [
    { name: "Week 1", value: 15 },
    { name: "Week 2", value: 22 },
    { name: "Week 3", value: 28 },
    { name: "Week 4", value: 35 },
  ];

  const topCastingCalls = analytics?.topCastingCalls || [
    { title: "Netflix Series - Lead Role", submissions: 312, votes: 1847, rank: 1 },
    { title: "Commercial Campaign", submissions: 245, votes: 1456, rank: 2 },
    { title: "Indie Drama Feature", submissions: 198, votes: 1234, rank: 3 },
  ];

  const mostActiveTalents = analytics?.mostActiveTalents || [
    { name: "Sarah Johnson", submissions: 28, views: 1245, initial: "S", rank: 1 },
    { name: "Michael Chen", submissions: 24, views: 1089, initial: "M", rank: 2 },
    { name: "Emma Davis", submissions: 22, views: 967, initial: "E", rank: 3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Platform activity and engagement metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">User Growth</CardTitle>
            <p className="text-sm text-muted-foreground">Total registered users over time</p>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--foreground))" fill="hsl(var(--foreground) / 0.1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Submissions Volume</CardTitle>
            <p className="text-sm text-muted-foreground">Monthly submission trends</p>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={submissionsVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="hsl(var(--foreground))" fill="hsl(var(--foreground) / 0.1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Votes Per Casting Call</CardTitle>
            <p className="text-sm text-muted-foreground">Top performing casting calls</p>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={votesPerCastingData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--foreground))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Bookings Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Weekly booking activity</p>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingsTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rankings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Performing Casting Calls</CardTitle>
            <p className="text-sm text-muted-foreground">Most submissions and votes</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCastingCalls.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.submissions} submissions • {item.votes} votes
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">#{item.rank || idx + 1}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Most Active Talents</CardTitle>
            <p className="text-sm text-muted-foreground">Highest submission rates</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {mostActiveTalents.map((talent: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {talent.initial || talent.name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{talent.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {talent.submissions} submissions • {talent.views} views
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">#{talent.rank || idx + 1}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}