"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Search,
    MapPin,
    Star,
    Mail,
    Eye
} from "lucide-react";

const talents = [
    {
        id: 1,
        name: "Sarah Johnson",
        initials: "S",
        role: "Actor",
        rating: 4.9,
        reviews: 24,
        location: "Los Angeles, CA",
        experience: "8 years experience",
        skills: ["Drama", "Comedy", "Voice Acting"],
        bio: "Versatile actor with extensive experience in film, television, and theater. Passionate about bringing authentic characters to life.",
    },
    {
        id: 2,
        name: "Michael Chen",
        initials: "M",
        role: "Model",
        rating: 4.8,
        reviews: 18,
        location: "New York, NY",
        experience: "5 years experience",
        skills: ["Fashion", "Commercial", "Editorial"],
        bio: "Professional model specializing in fashion and commercial work. Available for print, runway, and digital campaigns.",
    },
    {
        id: 3,
        name: "Emma Rodriguez",
        initials: "S",
        role: "Dancer",
        rating: 5.0,
        reviews: 24,
        location: "Miami, FL",
        experience: "10 years experience",
        skills: ["Contemporary", "Ballet", "Hip Hop"],
        bio: "Award-winning dancer with classical training and contemporary expertise. Choreographer and performer.",
    },
    {
        id: 4,
        name: "David Kim",
        initials: "D",
        role: "Voice Actor",
        rating: 4.8,
        reviews: 22,
        location: "Chicago, IL",
        experience: "6 years experience",
        skills: ["Animation", "Commercial", "Audiobooks"],
        bio: "Professional voice actor with a versatile range. Experienced in character voices, narration, and commercial work.",
    },
];

export default function BrowseTalents() {
    const [selectedTalent, setSelectedTalent] = useState<typeof talents[0] | null>(null);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold">Welcome back, Sarah!</h1>
                <p className="text-muted-foreground">Here's what's happening with your casting opportunities</p>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search talents by name, skill, or location"
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <Select>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="actor">Actor</SelectItem>
                                <SelectItem value="model">Model</SelectItem>
                                <SelectItem value="dancer">Dancer</SelectItem>
                                <SelectItem value="voice">Voice Actor</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Locations</SelectItem>
                                <SelectItem value="la">Los Angeles</SelectItem>
                                <SelectItem value="ny">New York</SelectItem>
                                <SelectItem value="miami">Miami</SelectItem>
                                <SelectItem value="chicago">Chicago</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground">Showing {talents.length} talents</p>

            {/* Talents Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {talents.map((talent) => (
                    <Card key={talent.id} className="card-elevated">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                                <Avatar className="w-12 h-12">
                                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                        {talent.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">{talent.name}</h3>
                                        <div className="flex items-center gap-1 text-sm">
                                            <Star className="w-4 h-4 fill-warning text-warning" />
                                            <span>{talent.rating}</span>
                                            <span className="text-muted-foreground">({talent.reviews})</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{talent.role}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3" />
                                        {talent.location} • {talent.experience}
                                    </p>

                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {talent.skills.map((skill) => (
                                            <Badge key={skill} variant="secondary" className="text-xs">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>

                                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                                        {talent.bio}
                                    </p>

                                    <div className="flex gap-2 mt-4">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="flex-1" onClick={() => setSelectedTalent(talent)}>
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    View Profile
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Talent Profile</DialogTitle>
                                                    <p className="text-sm text-muted-foreground">View detailed information about this talent</p>
                                                </DialogHeader>
                                                {selectedTalent && (
                                                    <div className="space-y-4 mt-4">
                                                        <div className="flex items-center gap-4">
                                                            <Avatar className="w-16 h-16">
                                                                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                                                    {selectedTalent.initials}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h3 className="font-semibold text-lg">{selectedTalent.name}</h3>
                                                                <p className="text-muted-foreground">{selectedTalent.role}</p>
                                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                                    <Star className="w-3 h-3 fill-warning text-warning" />
                                                                    {selectedTalent.rating} ({selectedTalent.reviews} reviews) •
                                                                    <MapPin className="w-3 h-3 ml-1" />
                                                                    {selectedTalent.location}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-medium mb-1">About</h4>
                                                            <p className="text-sm text-muted-foreground">{selectedTalent.bio}</p>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-medium mb-1">Experience</h4>
                                                            <p className="text-sm text-muted-foreground">{selectedTalent.experience}</p>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-medium mb-2">Skills</h4>
                                                            <div className="flex flex-wrap gap-1">
                                                                {selectedTalent.skills.map((skill) => (
                                                                    <Badge key={skill} variant="secondary">
                                                                        {skill}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <Button className="w-full">
                                                            <Mail className="w-4 h-4 mr-2" />
                                                            Send Message
                                                        </Button>
                                                    </div>
                                                )}
                                            </DialogContent>
                                        </Dialog>
                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                            <Mail className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
