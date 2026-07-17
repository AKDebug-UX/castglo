 import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
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

        if (analyticsRes.data && analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.data);
        }
        if (logsRes.data && logsRes.data.success) {
          setLogs(logsRes.data.data || []);
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
      change: analytics?.summary?.suspendedUsers || "0",
      changeLabel: "suspended",
      Icon: Users,
    },
    {
      label: "Total Castings",
      value: analytics?.summary?.totalCastingCalls?.toLocaleString() || "0",
      change: analytics?.castingCallStatus?.find(s => s._id === 'open')?.count || "0",
      changeLabel: "active calls",
      Icon: FileText,
    },
    {
      label: "Applications",
      value: analytics?.summary?.totalApplications?.toLocaleString() || "0",
      change: "0",
      changeLabel: "new today",
      Icon: ThumbsUp,
    },
    {
      label: "Total Leads",
      value: analytics?.summary?.totalLeads?.toLocaleString() || "0",
      change: "+0%",
      changeLabel: "conversion",
      Icon: Calendar,
    },
  ];

  // Map analytics chart data
  const usersByRoleData = analytics?.usersByRole?.map(item => ({
    name: item._id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: item.count
  })) || [];

  const castingStatusData = analytics?.castingCallStatus?.map(item => ({
    name: item._id.replace(/\b\w/g, l => l.toUpperCase()),
    value: item.count
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const isTotalCastings = stat.label === "Total Castings";
          return (
            <Card 
              key={stat.label}
              className={cn(
                isTotalCastings && "bg-secondary border-secondary text-secondary-foreground"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-sm",
                    isTotalCastings ? "text-secondary-foreground/85" : "text-muted-foreground"
                  )}>{stat.label}</span>
                  <stat.Icon className={cn(
                    "w-5 h-5",
                    isTotalCastings ? "text-secondary-foreground" : "text-muted-foreground"
                  )} />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 text-sm mt-1">
                  <TrendingUp className={cn(
                    "w-4 h-4",
                    isTotalCastings ? "text-secondary-foreground" : "text-success"
                  )} />
                  <span className={cn(
                    "font-medium",
                    isTotalCastings ? "text-secondary-foreground" : "text-slate-900"
                  )}>{stat.change}</span>{" "}
                  <span className={isTotalCastings ? "text-secondary-foreground/85" : "text-muted-foreground"}>
                    {stat.changeLabel}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Users by Role</CardTitle>
            <p className="text-sm text-muted-foreground">Distribution of platform users</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
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
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Casting Calls Status</CardTitle>
            <p className="text-sm text-muted-foreground">Active vs Closed listings</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
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
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--secondary))"
                    fill="hsl(var(--secondary) / 0.2)"
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