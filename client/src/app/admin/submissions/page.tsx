"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Play } from "lucide-react";

// Using placeholder images for now
import talentSarah from "@/assets/talent-sarah.jpg";
import talentMichael from "@/assets/talent-michael.jpg";
import talentTom from "@/assets/talent-tom.jpg";
import Image from "next/image";

const stats = [
    { label: "Total Submissions", value: "1,847", color: "text-foreground" },
    { label: "Approved", value: "1,592", color: "text-success" },
    { label: "Under Review", value: "243", color: "text-warning" },
    { label: "Flagged", value: "12", color: "text-destructive" },
];

const submissions = [
    {
        id: 1,
        title: "Lead Role - Indie Drama",
        author: "Sarah Johnson",
        aiScore: 8.5,
        submittedDate: "1/15/2024",
        status: "Under Review",
        image: talentSarah,
    },
    {
        id: 2,
        title: "Commercial Campaign",
        author: "Michael Chen",
        aiScore: 9.2,
        submittedDate: "1/14/2024",
        status: "Approved",
        image: talentMichael,
    },
    {
        id: 3,
        title: "Netflix Series",
        author: "Emma Davis",
        aiScore: 6.8,
        submittedDate: "1/13/2024",
        status: "Flagged",
        image: talentTom,
    },
    {
        id: 4,
        title: "Voice Over - Animation",
        author: "James Wilson",
        aiScore: 5.4,
        submittedDate: "1/12/2024",
        status: "Under Review",
        image: talentSarah,
    },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Approved":
            return <Badge className="bg-success text-success-foreground">{status}</Badge>;
        case "Under Review":
            return <Badge variant="outline">{status}</Badge>;
        case "Flagged":
            return <Badge variant="destructive">{status}</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

export default function AdminSubmissions() {
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredSubmissions = statusFilter === "all"
        ? submissions
        : submissions.filter((s) => s.status.toLowerCase().replace(" ", "-") === statusFilter);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold">Submissions Management</h1>
                <p className="text-muted-foreground">Monitor and manage all audition submissions</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="card-elevated">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Submissions List */}
            <Card className="card-elevated">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-base font-semibold">All Submissions</CardTitle>
                        <p className="text-sm text-muted-foreground">Review audition submissions and AI feedback</p>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="under-review">Under Review</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="flagged">Flagged</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="space-y-4">
                    {filteredSubmissions.map((submission) => (
                        <div
                            key={submission.id}
                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 transition-all hover:bg-muted"
                        >
                            <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <Image
                                    src={submission.image}
                                    alt={submission.title}
                                    className="w-full h-full object-cover"
                                    fill
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <Play className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium">{submission.title}</h4>
                                <p className="text-sm text-muted-foreground">by {submission.author}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">AI Score: {submission.aiScore}/10</span>
                                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-success"
                                            style={{ width: `${submission.aiScore * 10}%` }}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Submitted {submission.submittedDate}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusBadge(submission.status)}
                                <Button variant="outline" size="sm">Preview</Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
