"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Briefcase,
    Calendar,
    DollarSign,
    TrendingUp,
    Plus,
    Pencil,
    Trash2,
    Clock,
    Eye
} from "lucide-react";

const stats = [
    { label: "Active Services", value: "4", change: "Services listed", icon: Briefcase },
    { label: "Total Bookings", value: "119", change: "All time", icon: Calendar },
    { label: "Avg. Price", value: "$238", change: "Per service", icon: DollarSign },
    { label: "Most Popular", value: "Makeup", change: "45 bookings", icon: TrendingUp },
];

const services = [
    {
        id: 1,
        title: "Professional Headshot Session",
        description: "High-quality headshots for actors, models, and performers. Includes 2-hour session with multiple outfit changes and professional retouching.",
        price: 250,
        duration: "2 hours",
        bookings: 24,
        status: "Active",
    },
    {
        id: 2,
        title: "Portfolio Photography",
        description: "Complete portfolio shoot with various looks and settings. Perfect for building your professional portfolio.",
        price: 450,
        duration: "4 hours",
        bookings: 18,
        status: "Active",
    },
    {
        id: 3,
        title: "Styling Consultation",
        description: "One-on-one styling session to help you find your best look for auditions and performances.",
        price: 150,
        duration: "1 hour",
        bookings: 13,
        status: "Active",
    },
    {
        id: 4,
        title: "Makeup & Hair Services",
        description: "Professional makeup and hair styling for photoshoots, auditions, or performances.",
        price: 100,
        duration: "1.5 hours",
        bookings: 29,
        status: "Active",
    },
];

export default function ProfessionalServices() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Welcome back, Sarah!</h1>
                    <p className="text-muted-foreground">Here's what's happening with your casting opportunities</p>
                </div>
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

            {/* Upcoming Casting Calls */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Upcoming Casting Calls</CardTitle>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Service
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Service</DialogTitle>
                                <p className="text-sm text-muted-foreground">Add a new service to your offerings</p>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Service Title</label>
                                    <Input placeholder="e.g., Professional Headshot Session" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Description</label>
                                    <Textarea rows={3} placeholder="Describe your service in detail..." />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Price</label>
                                        <Input placeholder="250" type="number" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Duration</label>
                                        <Input placeholder="e.g., 2 hours" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={() => setIsDialogOpen(false)}>Create Service</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {services.map((service) => (
                            <Card key={service.id} className="card-elevated">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{service.title}</h3>
                                            <Badge className="bg-success text-success-foreground mt-1">
                                                {service.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground ml-2">
                                                {service.bookings} bookings
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {service.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-bold">${service.price}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {service.duration}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Eye className="w-3 h-3 mr-1" />
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
