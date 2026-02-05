"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Search,
    Filter,
    Grid3X3,
    List,
    MapPin,
    Calendar,
    DollarSign,
    ArrowUpRight
} from "lucide-react";

import castingIndieDrama from "@/assets/casting-indie-drama.jpg";
import castingCommercial from "@/assets/casting-commercial.jpg";
import Image from "next/image";

const castings = [
    {
        id: 1,
        title: "Lead Role - Indie Drama",
        company: "Moonlight Studios",
        description: "Seeking passionate actor for lead role in upcoming indie drama about family relationships.",
        location: "Los Angeles, CA",
        deadline: "15/01/2024",
        budget: "$50K - $100K",
        type: "Film",
        status: "Open",
        image: castingIndieDrama,
    },
    {
        id: 2,
        title: "Commercial - Tech Brand",
        company: "Creative Agency",
        description: "Looking for diverse talent for national tech commercial campaign.",
        location: "New York, NY",
        deadline: "12/01/2024",
        budget: "$50K - $100K",
        type: "Commercial",
        status: "Open",
        image: castingCommercial,
    },
    {
        id: 3,
        title: "Lead Role - Indie Drama",
        company: "Moonlight Studios",
        description: "Seeking passionate actor for lead role in upcoming indie drama about family relationships.",
        location: "Los Angeles, CA",
        deadline: "15/01/2024",
        budget: "$50K - $100K",
        type: "Drama",
        status: "Open",
        image: castingIndieDrama,
    },
    {
        id: 4,
        title: "Commercial - Tech Brand",
        company: "Creative Agency",
        description: "Looking for diverse talent for national tech commercial campaign.",
        location: "New York, NY",
        deadline: "12/01/2024",
        budget: "$50K - $100K",
        type: "Commercial",
        status: "Open",
        image: castingCommercial,
    },
    {
        id: 5,
        title: "Lead Role - Indie Drama",
        company: "Moonlight Studios",
        description: "Seeking passionate actor for lead role in upcoming indie drama about family relationships.",
        location: "Los Angeles, CA",
        deadline: "15/01/2024",
        budget: "$50K - $100K",
        type: "Film",
        status: "Open",
        image: castingIndieDrama,
    },
    {
        id: 6,
        title: "Commercial - Tech Brand",
        company: "Creative Agency",
        description: "Looking for diverse talent for national tech commercial campaign.",
        location: "New York, NY",
        deadline: "12/01/2024",
        budget: "$50K - $100K",
        type: "Commercial",
        status: "Open",
        image: castingCommercial,
    },
];

export default function BrowseCastings() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [showFilters, setShowFilters] = useState(false);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Browse Casting Calls</h1>
                    <p className="text-muted-foreground">Discover new opportunities that match your profile</p>
                </div>
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

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Filters</span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search Casting Call" className="pl-9" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">Locations</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="All locations" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All locations</SelectItem>
                                    <SelectItem value="la">Los Angeles, CA</SelectItem>
                                    <SelectItem value="ny">New York, NY</SelectItem>
                                    <SelectItem value="atl">Atlanta, GA</SelectItem>
                                    <SelectItem value="remote">Remote</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">Genre</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="All genres" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All genres</SelectItem>
                                    <SelectItem value="drama">Drama</SelectItem>
                                    <SelectItem value="comedy">Comedy</SelectItem>
                                    <SelectItem value="action">Action</SelectItem>
                                    <SelectItem value="thriller">Thriller</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">Status</label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="closing">Closing Soon</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button className="w-full">
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground">Showing 6 of 6 casting calls</p>

            {/* Grid View */}
            {viewMode === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {castings.map((casting) => (
                        <Card key={casting.id} className="overflow-hidden card-elevated">
                            <div className="relative h-40">
                                <Image
                                    src={casting.image}
                                    alt={casting.title}
                                    className="w-full h-full object-cover"
                                    fill
                                />
                                <Badge className="absolute top-2 right-2 bg-success">{casting.status}</Badge>
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-semibold mb-1">{casting.title}</h3>
                                <p className="text-sm text-muted-foreground mb-1">{casting.company}</p>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{casting.description}</p>

                                <div className="space-y-1 text-xs text-muted-foreground mb-3">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {casting.location}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Deadline: {casting.deadline}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        {casting.budget}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary">{casting.type}</Badge>
                                    <Button size="sm" asChild>
                                        <Link href={`/dashboard/browse/${casting.id}`}>
                                            View Details
                                            <ArrowUpRight className="w-3 h-3 ml-1" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="space-y-3">
                    {castings.map((casting) => (
                        <Card key={casting.id} className="card-elevated">
                            <CardContent className="p-4">
                                <div className="flex gap-4">
                                    <Image
                                        src={casting.image}
                                        alt={casting.title}
                                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                                        width={96}
                                        height={96}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-semibold">{casting.title}</h3>
                                                <p className="text-sm text-muted-foreground">{casting.company}</p>
                                            </div>
                                            <Badge className="bg-success flex-shrink-0">{casting.status}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{casting.description}</p>
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {casting.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {casting.deadline}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                {casting.budget}
                                            </span>
                                            <Badge variant="secondary">{casting.type}</Badge>
                                        </div>
                                    </div>
                                    <Button size="sm" className="flex-shrink-0 self-center" asChild>
                                        <Link href={`/dashboard/browse/${casting.id}`}>
                                            View Details
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
