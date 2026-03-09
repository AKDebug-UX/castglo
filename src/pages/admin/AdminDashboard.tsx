 import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, FileText, ThumbsUp, Calendar, TrendingUp, Loader2 } from "lucide-react";
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

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, logsRes] = await Promise.all([
          adminAPI.getAnalytics(),
          adminAPI.getActionLogs({ limit: 4 })
        ]);

        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.data);
          // console.log(analyticsRes.data.data);
        }
        if (logsRes.data.success) {
          setLogs(logsRes.data.data);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
      value: analytics?.summary?.totalUsers?.toLocaleString() || "0",
      change: analytics?.userGrowthRate || "0%",
      Icon: Users,
    },
    {
      label: "Active Castings",
      value: analytics?.activeCastingCalls?.toLocaleString() || "0",
      change: "+8.2%",
      Icon: FileText,
    },
    {
      label: "Applications",
      value: analytics?.totalApplications?.toLocaleString() || "0",
      change: "+18.3%",
      Icon: ThumbsUp,
    },
    {
      label: "Total Revenue",
      value: `$${analytics?.totalRevenue?.toLocaleString() || "0"}`,
      change: "+5.7%",
      Icon: Calendar,
    },
  ];

  // Map analytics chart data or fallback to defaults
  const userGrowthData = analytics?.userGrowthData || [
    { name: "Jan", value: 120 },
    { name: "Feb", value: 180 },
    { name: "Mar", value: 250 },
    { name: "Apr", value: 380 },
    { name: "May", value: 520 },
    { name: "Jun", value: 680 },
  ];

  const submissionsData = analytics?.submissionsData || [
    { name: "Mon 1", value: 65 },
    { name: "Mon 2", value: 72 },
    { name: "Mon 3", value: 58 },
    { name: "Mon 4", value: 80 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-sm text-success">
                <TrendingUp className="w-4 h-4" />
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Submissions Volume</CardTitle>
            <p className="text-sm text-muted-foreground">Weekly submission trends</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={submissionsData}>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">User Growth</CardTitle>
            <p className="text-sm text-muted-foreground">Monthly user registration by role</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
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
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          <p className="text-sm text-muted-foreground">Latest platform actions</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {logs.length > 0 ? logs.map((log, i) => (
            <div key={log._id || i} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-muted">{log.adminName?.[0] || "A"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{log.adminName || "Admin"}</span> {log.action}{" "}
                  <span className="text-muted-foreground">{log.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : "Recently"}
                </p>
              </div>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity logs.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}