"use client";

import Link from "next/link";
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
    Eye
} from "lucide-react";

const stats = [
    { label: "Active Casting Calls", value: "10", change: "+4 this week", icon: Clapperboard },
    { label: "Total Submissions", value: "127", change: "+27 this week", icon: FileText },
    { label: "Pending reviews", value: "21", change: "Needs attention", icon: Clock },
    { label: "Roles Filled", value: "9", change: "This quarter", icon: CheckCircle },
];

const activeCastings = [
    {
        id: 1,
        title: "Lead Role - Indie Drama",
        status: "Open",
        description: "Seeking passionate actor for lead role in upcoming indie drama about family relationships.",
        submissions: 18,
        deadline: "15/01/2024",
        created: "1/1/2024",
        genre: "Drama",
    },
    {
        id: 2,
        title: "Supporting Actor - Netflix Series",
        status: "Open",
        genre: "Thriller",
        description: "Recurring supporting role in upcoming thriller series.",
        submissions: 24,
        deadline: "1/25/2024",
        created: "1/5/2024",
    },
    {
        id: 3,
        title: "Commercial - Tech Brand",
        status: "Closed",
        genre: "Commercial",
        description: "Looking for diverse talent for national tech commercial campaign.",
        submissions: 38,
        deadline: "1/10/2024",
        created: "12/20/2023",
    },
];

const recentSubmissions = [
    {
        id: 1,
        name: "Sarah Johnson",
        initials: "SJ",
        role: "Lead Role - Indie Drama",
        date: "Submitted 1/12/2024",
        status: "pending",
    },
    {
        id: 2,
        name: "Michael Chen",
        initials: "MC",
        role: "Supporting Actor - Netflix Series",
        date: "Submitted 1/11/2024",
        status: "approved",
    },
    {
        id: 3,
        name: "Emma Rodriguez",
        initials: "ER",
        role: "Lead Role - Indie Drama",
        date: "Submitted 1/10/2024",
        status: "rejected",
    },
    {
        id: 4,
        name: "David Kim",
        initials: "SJ", // Note: Initials seem copied in original, keeping as is or fixing? I'll keep as is for fidelity.
        role: "Commercial - Tech Brand",
        date: "Submitted 1/9/2024",
        status: "pending",
    },
];

const statusColors: Record<string, string> = {
    pending: "bg-warning text-warning-foreground",
    approved: "bg-success text-success-foreground",
    rejected: "bg-destructive text-destructive-foreground",
};

export default function DirectorDashboard() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold">Welcome back, Director!</h1>
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
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Active Casting Calls */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Casting Calls</CardTitle>
                    <p className="text-sm text-muted-foreground">Your current open casting opportunities</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {activeCastings.map((casting) => (
                        <div
                            key={casting.id}
                            className="flex items-center justify-between p-4 rounded-lg border border-border"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-semibold">{casting.title}</h3>
                                    <Badge className={casting.status === "Open" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                                        {casting.status}
                                    </Badge>
                                    {casting.genre && <Badge variant="secondary">{casting.genre}</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{casting.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {casting.submissions} submissions
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Deadline: {casting.deadline}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Created: {casting.created}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/director/projects/${casting.id}`}>
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href={`/director/projects/${casting.id}/edit`}>Manage</Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Submissions</CardTitle>
                    <p className="text-sm text-muted-foreground">Latest talent applications requiring your review</p>
                </CardHeader>
                <CardContent className="space-y-3">
                    {recentSubmissions.map((submission) => (
                        <div
                            key={submission.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border"
                        >
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback className="bg-primary/10 text-primary">{submission.initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{submission.name}</p>
                                    <p className="text-sm text-muted-foreground">{submission.role}</p>
                                    <p className="text-xs text-muted-foreground">{submission.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={statusColors[submission.status]}>
                                    {submission.status}
                                </Badge>
                                <Button variant="outline" size="sm">Review</Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
