"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    DollarSign,
    Users,
    Clock
} from "lucide-react";

// Image constant
import castingIndieDrama from "@/assets/casting-indie-drama.jpg";
import Image from "next/image";

const requirements = [
    "Previous film experience required",
    "Method acting background preferred",
    "Available for 6-week shoot starting March 1st",
    "Must be comfortable with emotional scenes",
    "Los Angeles area resident preferred",
];

const responsibilities = [
    "Lead character 'Alex' - complex emotional journey",
    "Work closely with director on character development",
    "Collaborate with ensemble cast of 8 actors",
    "Participate in 2 weeks of rehearsals",
    "Available for promotional activities",
];

export default function CastingDetail() {
    const { id } = useParams();

    return (
        <div className="space-y-6 animate-fade-in">
            <Link
                href="/dashboard/browse"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to browse
            </Link>

            <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
                {/* Main Content */}
                <div className="space-y-6">
                    {/* Hero Image */}
                    <div className="relative rounded-xl overflow-hidden">
                        <Image
                            src={castingIndieDrama}
                            alt="Lead Role - Indie Drama"
                            className="w-full h-64 md:h-96 object-cover"
                            fill
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                            <Badge className="mb-2 bg-success">Open</Badge>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Lead Role - Indie Drama</h1>
                            <p className="text-white/80">Moonlight Studios</p>
                        </div>
                    </div>

                    {/* Project Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                We are seeking a passionate and experienced actor for the lead role in our upcoming indie drama 'Echoes of Tomorrow'. This is a character-driven story about family relationships, loss, and redemption set in contemporary Los Angeles.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Requirements */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Requirements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {requirements.map((req, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                        <span className="text-muted-foreground">{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Role Responsibilities */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Responsibilities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {responsibilities.map((resp, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                                        <span className="text-muted-foreground">{resp}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-muted-foreground" />
                                <span>New York, NY</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                <span>Deadline: 1/20/2024</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                                <span>March 1 - April 12, 2024</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-muted-foreground" />
                                <span>$50K - $100K</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-muted-foreground" />
                                <span>Age Range: 25-35</span>
                            </div>
                            <Badge variant="secondary" className="mt-2">Drama</Badge>
                        </CardContent>
                    </Card>

                    {/* Casting Team */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Casting Team</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Director</p>
                                <p className="font-medium">Sarah Johnson</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Casting Director</p>
                                <p className="font-medium">Maria Rodriguez</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* CTA */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ready to Apply?</CardTitle>
                            <p className="text-sm text-muted-foreground">Submit your audition for this role</p>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" size="lg" asChild>
                                <Link href={`/dashboard/browse/${id}/submit`}>Submit Audition</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
