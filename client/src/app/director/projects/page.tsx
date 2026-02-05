"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Grid3X3,
    List,
    Plus,
    Users,
    Calendar,
    Clock,
    Eye,
    Pencil,
    Trash2
} from "lucide-react";

const projects = [
    {
        id: 1,
        title: "Lead Role - Indie Drama",
        genre: "Drama",
        status: "Open",
        description: "Seeking passionate actor for lead role in upcoming indie drama about family relationships.",
        submissions: 24,
        deadline: "1/15/2024",
        location: "Los Angeles, CA",
        created: "1/1/2024",
        publicVoting: true,
    },
    {
        id: 2,
        title: "Supporting Actor - Netflix Series",
        genre: "Thriller",
        status: "Closed",
        description: "Recurring supporting role in upcoming thriller series.",
        submissions: 18,
        deadline: "1/25/2024",
        location: "Atlanta, GA",
        created: "1/5/2024",
        publicVoting: false,
        escrowPrize: true,
    },
    {
        id: 3,
        title: "Commercial - Tech Brand",
        genre: "Commercial",
        status: "Closed",
        description: "Looking for diverse talent for national tech commercial campaign.",
        submissions: 45,
        deadline: "1/10/2024",
        location: "New York, NY",
        created: "12/20/2023",
        publicVoting: true,
    },
    {
        id: 4,
        title: "Voice Over - Animation",
        genre: "Animation",
        status: "Draft",
        description: "Character voice for animated feature film.",
        submissions: 0,
        deadline: "1/1/2024",
        location: "Remote",
        created: "12/20/2023",
        publicVoting: true,
    },
];

export default function MyProjects() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [activeTab, setActiveTab] = useState("all");

    const filteredProjects = projects.filter((project) => {
        if (activeTab === "all") return true;
        if (activeTab === "open") return project.status === "Open";
        if (activeTab === "closed") return project.status === "Closed";
        if (activeTab === "drafts") return project.status === "Draft";
        return true;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">My Projects</h1>
                    <p className="text-muted-foreground">Manage all your casting calls and projects</p>
                </div>
                <Button asChild>
                    <Link href="/director/create">
                        <Plus className="w-4 h-4 mr-2" />
                        New Casting Call
                    </Link>
                </Button>
            </div>

            {/* Tabs and View Toggle */}
            <div className="flex items-center justify-between">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="all">All Projects</TabsTrigger>
                        <TabsTrigger value="open">Open</TabsTrigger>
                        <TabsTrigger value="closed">Closed</TabsTrigger>
                        <TabsTrigger value="drafts">Drafts</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                    >
                        <List className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <Card key={project.id} className="card-elevated">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-semibold">{project.title}</h3>
                                        <p className="text-sm text-muted-foreground">{project.genre}</p>
                                    </div>
                                    <Badge
                                        className={
                                            project.status === "Open" ? "bg-success text-success-foreground" :
                                                project.status === "Draft" ? "bg-warning text-warning-foreground" :
                                                    "bg-muted text-muted-foreground"
                                        }
                                    >
                                        {project.status}
                                    </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>

                                <div className="space-y-2 text-xs text-muted-foreground mb-4">
                                    <div className="flex justify-between">
                                        <span>Submissions:</span>
                                        <span className="font-medium text-foreground">{project.submissions}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Deadline:</span>
                                        <span className="font-medium text-foreground">{project.deadline}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Location:</span>
                                        <span className="font-medium text-foreground">{project.location}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1 mb-4">
                                    {project.publicVoting && (
                                        <Badge variant="outline" className="text-xs">Public Voting</Badge>
                                    )}
                                    {project.escrowPrize && (
                                        <Badge variant="outline" className="text-xs">Escrow Prize</Badge>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                        <Link href={`/director/projects/${project.id}`}>
                                            <Eye className="w-3 h-3 mr-1" />
                                            View
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                        <Link href={`/director/projects/${project.id}/edit`}>
                                            <Pencil className="w-3 h-3 mr-1" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="space-y-3">
                    {filteredProjects.map((project) => (
                        <Card key={project.id} className="card-elevated">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold">{project.title}</h3>
                                            <Badge
                                                className={
                                                    project.status === "Open" ? "bg-success text-success-foreground" :
                                                        project.status === "Draft" ? "bg-warning text-warning-foreground" :
                                                            "bg-muted text-muted-foreground"
                                                }
                                            >
                                                {project.status}
                                            </Badge>
                                            <Badge variant="secondary">{project.genre}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {project.submissions} submissions
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Deadline: {project.deadline}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Created: {project.created}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/director/projects/${project.id}`}>
                                                <Eye className="w-3 h-3 mr-1" />
                                                View
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/director/projects/${project.id}/edit`}>
                                                <Pencil className="w-3 h-3 mr-1" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
