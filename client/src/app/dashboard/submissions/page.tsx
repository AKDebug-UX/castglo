"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Eye, Star } from "lucide-react";

const stats = [
    { label: "Total Submissions", value: "12", sublabel: "All time", icon: FileText },
    { label: "In Review", value: "7", sublabel: "Pending Review", icon: Eye },
    { label: "Shortlisted", value: "3", sublabel: "Callbacks Pending", icon: Star },
];

const submissions = [
    {
        id: 1,
        projectTitle: "Lead Role - Indie Drama",
        company: "Moonlight Studios",
        role: "Lead Actor",
        submissionDate: "1/12/2024",
        status: "In Review",
    },
    {
        id: 2,
        projectTitle: "Commercial - Tech Brand",
        company: "Creative Agency",
        role: "Spokesperson",
        submissionDate: "1/11/2024",
        status: "Shortlisted",
    },
    {
        id: 3,
        projectTitle: "Supporting Actor - Netflix Series",
        company: "Netflix Originals",
        role: "Supporting Character",
        submissionDate: "1/09/2024",
        status: "Rejected",
    },
    {
        id: 4,
        projectTitle: "Voice Over - Animation",
        company: "Animation Studio",
        role: "Character Voice",
        submissionDate: "2/08/2024",
        status: "Awarded",
    },
    {
        id: 5,
        projectTitle: "TV Series Pilot",
        company: "HBO Productions",
        role: "Guest Star",
        submissionDate: "6/07/2024",
        status: "Submitted",
    },
];

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    "In Review": "secondary",
    "Shortlisted": "default",
    "Rejected": "destructive",
    "Awarded": "default",
    "Submitted": "outline",
};

const statusColors: Record<string, string> = {
    "In Review": "bg-info text-info-foreground",
    "Shortlisted": "bg-primary text-primary-foreground",
    "Rejected": "bg-destructive text-destructive-foreground",
    "Awarded": "bg-success text-success-foreground",
    "Submitted": "bg-muted text-muted-foreground",
};

export default function Submissions() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold">My Submissions</h1>
                <p className="text-muted-foreground">Track your audition submissions and feedback</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.label} className="card-elevated">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.sublabel}</p>
                                </div>
                                <div className="icon-circle-primary w-10 h-10">
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Submissions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Submission History</CardTitle>
                    <p className="text-sm text-muted-foreground">View and manage all your audition submissions</p>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project Title</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Submission Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell className="font-medium">{submission.projectTitle}</TableCell>
                                        <TableCell>{submission.company}</TableCell>
                                        <TableCell>{submission.role}</TableCell>
                                        <TableCell>{submission.submissionDate}</TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[submission.status]}>
                                                {submission.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
