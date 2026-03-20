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
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await adminAPI.getAnalytics();
        if (response.data.success) {
          setAnalytics(response.data.data);
        }
      } catch (error) {
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
      label: "Total Users", 
      value: analytics?.summary?.totalUsers?.toString() || "0", 
      sublabel: `${analytics?.summary?.suspendedUsers || 0} suspended`, 
      icon: Users 
    },
    { 
      label: "Active Castings", 
      value: analytics?.castingCallStatus?.find((s: any) => s._id === 'open')?.count?.toString() || "0", 
      sublabel: "currently live", 
      icon: FileText 
    },
    { 
      label: "Applications", 
      value: analytics?.summary?.totalApplications?.toString() || "0", 
      sublabel: "total submitted", 
      icon: TrendingUp 
    },
    { 
      label: "Total Leads", 
      value: analytics?.summary?.totalLeads?.toLocaleString() || "0", 
      sublabel: "potential users", 
      icon: Shield 
    },
  ];

  // Map users by role for a bar chart if time-series isn't available
  const usersByRoleData = analytics?.usersByRole?.map((item: any) => ({
    name: item._id.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: item.count
  })) || [];

  const castingStatusData = analytics?.castingCallStatus?.map((item: any) => ({
    name: item._id.replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: item.count
  })) || [];

  const userGrowthData = analytics?.userGrowthData || [];
  const submissionsVolumeData = analytics?.submissionsVolumeData || [];
  const topCastingCalls = analytics?.topCastingCalls || [];
  const mostActiveTalents = analytics?.mostActiveTalents || [];

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
            <CardTitle className="text-base font-semibold">Users by Role</CardTitle>
            <p className="text-sm text-muted-foreground">Distribution of platform user categories</p>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {usersByRoleData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usersByRoleData}>
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
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No role data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Casting Calls Status</CardTitle>
            <p className="text-sm text-muted-foreground">Live vs completed listings</p>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {castingStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={castingStatusData}>
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
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No status data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rankings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Performing Casting Calls</CardTitle>
            <p className="text-sm text-muted-foreground">Most submissions and engagement</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCastingCalls.length > 0 ? topCastingCalls.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.submissions} submissions • {item.votes} votes
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">#{item.rank || idx + 1}</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">No performance data available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Most Active Talents</CardTitle>
            <p className="text-sm text-muted-foreground">Highest platform participation</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {mostActiveTalents.length > 0 ? mostActiveTalents.map((talent: any, idx: number) => (
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
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">No talent data available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}