"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, FileText, Users, Shield } from "lucide-react";
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

const stats = [
    { label: "User Growth Rate", value: "+12.5%", sublabel: "vs previous period", icon: TrendingUp },
    { label: "Avg Submissions", value: "243", sublabel: "per casting call", icon: FileText },
    { label: "Engagement Rate", value: "68.4%", sublabel: "active users voting", icon: Users },
    { label: "Blockchain Verified", value: "1,847", sublabel: "submissions verified", icon: Shield },
];

const userGrowthData = [
    { name: "Jan 8", value: 180 },
    { name: "Jan 15", value: 220 },
    { name: "Jan 22", value: 280 },
    { name: "Jan 29", value: 350 },
];

const submissionsVolumeData = [
    { name: "Jan", value: 320 },
    { name: "Feb", value: 380 },
    { name: "Mar", value: 450 },
    { name: "Apr", value: 520 },
    { name: "May", value: 580 },
    { name: "Jun", value: 680 },
];

const votesPerCastingData = [
    { name: "Lead Role", value: 480 },
    { name: "Commercial", value: 420 },
    { name: "Netflix Series", value: 380 },
    { name: "Voice Over", value: 280 },
    { name: "Theatre", value: 180 },
];

const bookingsTrendData = [
    { name: "Week 1", value: 15 },
    { name: "Week 2", value: 22 },
    { name: "Week 3", value: 28 },
    { name: "Week 4", value: 35 },
];

const topCastingCalls = [
    { title: "Netflix Series - Lead Role", submissions: 312, votes: 1847, rank: 1 },
    { title: "Commercial Campaign", submissions: 245, votes: 1456, rank: 2 },
    { title: "Indie Drama Feature", submissions: 198, votes: 1234, rank: 3 },
];

const mostActiveTalents = [
    { name: "Sarah Johnson", submissions: 28, views: 1245, initial: "S", rank: 1 },
    { name: "Michael Chen", submissions: 24, views: 1089, initial: "M", rank: 2 },
    { name: "Emma Davis", submissions: 22, views: 967, initial: "E", rank: 3 },
];

export default function AdminAnalytics() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Platform activity and engagement metrics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="card-elevated">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">{stat.label}</span>
                                <div className="icon-circle-primary w-8 h-8">
                                    <stat.icon className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground text-success mt-1">{stat.sublabel}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">User Growth</CardTitle>
                        <p className="text-sm text-muted-foreground">Total registered users over time</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={userGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Submissions Volume</CardTitle>
                        <p className="text-sm text-muted-foreground">Monthly submission trends</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={submissionsVolumeData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Votes Per Casting Call</CardTitle>
                        <p className="text-sm text-muted-foreground">Top performing casting calls</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={votesPerCastingData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            background: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                        cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                                    />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Bookings Trend</CardTitle>
                        <p className="text-sm text-muted-foreground">Weekly booking activity</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={bookingsTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            background: "hsl(var(--card))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                        cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                                    />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Rankings */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Top Performing Casting Calls</CardTitle>
                        <p className="text-sm text-muted-foreground">Most submissions and votes</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {topCastingCalls.map((item) => (
                            <div key={item.rank} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 transition-all hover:bg-muted">
                                <div>
                                    <p className="font-medium">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.submissions} submissions • {item.votes} votes
                                    </p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border">
                                    <span className="font-bold text-primary">#{item.rank}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="card-elevated">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Most Active Talents</CardTitle>
                        <p className="text-sm text-muted-foreground">Highest submission rates</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {mostActiveTalents.map((talent) => (
                            <div key={talent.rank} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 transition-all hover:bg-muted">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                    {talent.initial}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{talent.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {talent.submissions} submissions • {talent.views} views
                                    </p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border">
                                    <span className="font-bold text-primary">#{talent.rank}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
