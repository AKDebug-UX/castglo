"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, XCircle, Play } from "lucide-react";

// Use placeholder images
import talentSarah from "@/assets/talent-sarah.jpg";
import talentMichael from "@/assets/talent-michael.jpg";
import talentTom from "@/assets/talent-tom.jpg";
import Image from "next/image";

const stats = [
    { label: "Pending Review", value: "3", sublabel: "Requires immediate attention", icon: AlertTriangle, color: "text-warning" },
    { label: "Resolved Today", value: "12", sublabel: "Content moderated", icon: CheckCircle, color: "text-success" },
    { label: "Escalated", value: "2", sublabel: "Needs senior review", icon: XCircle, color: "text-destructive" },
];

const flaggedContent = [
    {
        id: 1,
        title: "Audition Video",
        author: "Sarah Johnson",
        reason: "Inappropriate Content",
        confidence: 87,
        timestamp: "2024-01-15 10:30 AM",
        status: "Pending",
        image: talentSarah,
    },
    {
        id: 2,
        title: "Profile Image",
        author: "Michael Chen",
        reason: "Copyright Violation",
        confidence: 92,
        timestamp: "2024-01-15 09:15 AM",
        status: "Pending",
        image: talentMichael,
    },
    {
        id: 3,
        title: "Submission",
        author: "Emma Davis",
        reason: "Spam Content",
        confidence: 78,
        timestamp: "2024-01-15 08:45 AM",
        status: "Pending",
        image: talentTom,
    },
    {
        id: 4,
        title: "Audition Video",
        author: "James Wilson",
        reason: "Quality Issues",
        confidence: 65,
        timestamp: "2024-01-14 04:20 PM",
        status: "Resolved",
        image: talentSarah,
    },
];

export default function ModerationQueue() {
    const [selectedContent, setSelectedContent] = useState<typeof flaggedContent[0] | null>(null);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold">Moderation Queue</h1>
                <p className="text-muted-foreground">Review and manage AI-flagged content</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.label} className="card-elevated">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">{stat.label}</span>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Flagged Content List */}
            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Flagged Content</CardTitle>
                    <p className="text-sm text-muted-foreground">AI-detected content requiring moderation</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {flaggedContent.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 transition-all hover:bg-muted"
                        >
                            <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    fill
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <Play className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">by {item.author}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                    <p className="text-xs text-destructive font-medium">Reason: {item.reason}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Confidence: {item.confidence}%</span>
                                        <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${item.confidence}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{item.timestamp}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={item.status === "Pending" ? "secondary" : "outline"}>
                                    {item.status}
                                </Badge>
                                <Button variant="outline" size="sm" onClick={() => setSelectedContent(item)}>
                                    Preview
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={!!selectedContent} onOpenChange={(open) => !open && setSelectedContent(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Review Flagged Content</DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            {selectedContent?.title} by {selectedContent?.author}
                        </p>
                    </DialogHeader>
                    {selectedContent && (
                        <div className="space-y-4">
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                <Image
                                    src={selectedContent.image}
                                    alt={selectedContent.title}
                                    className="w-full h-full object-cover"
                                    fill
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <Play className="w-12 h-12 text-white" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Reason:</p>
                                    <p className="font-medium text-destructive">{selectedContent.reason}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Confidence Score:</p>
                                    <p className="font-medium">{selectedContent.confidence}%</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Timestamp:</p>
                                    <p className="font-medium">{selectedContent.timestamp}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Status:</p>
                                    <p className="font-medium">{selectedContent.status}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button variant="outline" className="flex-1">Escalate</Button>
                                <Button variant="destructive" className="flex-1">Reject</Button>
                                <Button className="flex-1 bg-success hover:bg-success/90">Approve</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
