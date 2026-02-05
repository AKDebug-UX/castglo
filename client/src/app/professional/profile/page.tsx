"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Upload, Camera } from "lucide-react";

// Using a simplified image path for now, assuming assets are migrated
import userAvatar from "@/assets/user-avatar.jpg";

const workingDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProfessionalProfile() {
    const [selectedDays, setSelectedDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);

    const toggleDay = (day: string) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <Link
                href="/professional"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>

            <div>
                <h1 className="text-2xl font-bold">Profile Management</h1>
                <p className="text-muted-foreground">Update your professional profile and showcase your services</p>
            </div>

            {/* Profile Photo */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Photo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={userAvatar.src} />
                                <AvatarFallback>JP</AvatarFallback>
                            </Avatar>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
                            >
                                <Camera className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        <div>
                            <Button variant="outline" size="sm">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Photo
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max size 5MB.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <p className="text-sm text-muted-foreground">Your professional details and contact information</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">First Name</label>
                            <Input placeholder="Enter first name" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Last Name</label>
                            <Input placeholder="Enter last name" />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Profession</label>
                        <Input placeholder="e.g., Photographer, Makeup Artist, Stylist" />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1.5 block">About Me</label>
                        <Textarea
                            rows={3}
                            placeholder="Tell clients about your experience and expertise..."
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Portfolio Samples */}
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio Samples</CardTitle>
                    <p className="text-sm text-muted-foreground">Showcase your best work to attract clients</p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop"
                                alt="Portfolio sample 1"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop"
                                alt="Portfolio sample 2"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="aspect-square rounded-lg bg-muted overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop"
                                alt="Portfolio sample 3"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                            <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">Add Image</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Services & Rates */}
            <Card>
                <CardHeader>
                    <CardTitle>Services & Rates</CardTitle>
                    <p className="text-sm text-muted-foreground">List your services and pricing information</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Services Offered</label>
                        <Textarea
                            rows={2}
                            placeholder="List the services you offer..."
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Hourly Rate</label>
                            <Input placeholder="e.g., $150" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Session Rate</label>
                            <Input placeholder="e.g., $500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Availability */}
            <Card>
                <CardHeader>
                    <CardTitle>Availability</CardTitle>
                    <p className="text-sm text-muted-foreground">Set your working hours and availability</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Working Days</label>
                        <div className="flex flex-wrap gap-2">
                            {workingDays.map((day) => (
                                <Button
                                    key={day}
                                    variant={selectedDays.includes(day) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleDay(day)}
                                >
                                    {day}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Start Time</label>
                            <Input type="time" />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">End Time</label>
                            <Input type="time" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
                <Button variant="outline" size="lg">Cancel</Button>
                <Button size="lg">Save Profile</Button>
            </div>
        </div>
    );
}
