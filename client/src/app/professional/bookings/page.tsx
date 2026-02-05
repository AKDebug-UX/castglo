"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    Calendar,
    DollarSign,
    CheckCircle,
    Clock,
    MapPin,
    Eye,
    Mail
} from "lucide-react";

const stats = [
    { label: "Upcoming", value: "3", change: "Session scheduled", icon: Calendar },
    { label: "Revenue", value: "$3,240", change: "This month", icon: DollarSign },
    { label: "This Month", value: "12", change: "Services listed", icon: CheckCircle },
    { label: "Pending", value: "1", change: "Awaiting confirmation", icon: Clock },
];

const upcomingBookings = [
    {
        id: 1,
        client: "Sarah Johnson",
        initials: "S",
        service: "Professional Headshot Session",
        date: "1/18/2024",
        time: "10:00 AM",
        location: "Studio A, Downtown",
        amount: "$250",
        status: "Confirmed",
    },
    {
        id: 2,
        client: "Michael Chen",
        initials: "M",
        service: "Portfolio Photography",
        date: "1/20/2024",
        time: "2:00 PM",
        location: "Outdoor Location - Central Park",
        amount: "$450",
        status: "Confirmed",
    },
    {
        id: 3,
        client: "Emma Rodriguez",
        initials: "E",
        service: "Styling Consultation",
        date: "1/22/2024",
        time: "11:00 AM",
        location: "Client's Home",
        amount: "$150",
        status: "Pending",
    },
];

const completedBookings = [
    {
        id: 4,
        client: "David Kim",
        initials: "D",
        service: "Makeup & Hair Services",
        date: "1/15/2024",
        time: "9:00 AM",
        location: "Studio B, Midtown",
        amount: "$100",
        status: "Completed",
    },
];

const statusColors: Record<string, string> = {
    Confirmed: "bg-success text-success-foreground",
    Pending: "bg-warning text-warning-foreground",
    Completed: "bg-primary text-primary-foreground",
};

export default function ProfessionalBookings() {
    const [activeTab, setActiveTab] = useState("upcoming");
    const [selectedBooking, setSelectedBooking] = useState<typeof upcomingBookings[0] | null>(null);

    const bookings = activeTab === "upcoming" ? upcomingBookings : completedBookings;

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold">Welcome back, Jamie!</h1>
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

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Bookings List */}
            <div className="space-y-4">
                {bookings.map((booking) => (
                    <Card key={booking.id} className="card-elevated">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarFallback className="bg-muted">{booking.initials}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{booking.client}</p>
                                            <Badge className={statusColors[booking.status]}>{booking.status}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{booking.service}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {booking.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {booking.time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {booking.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {booking.status === "Pending" && (
                                        <>
                                            <Button size="sm">Accept</Button>
                                            <Button variant="destructive" size="sm">Decline</Button>
                                        </>
                                    )}
                                    <span className="font-semibold">{booking.amount}</span>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>
                                                <Eye className="w-3 h-3 mr-1" />
                                                View Details
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Booking Details</DialogTitle>
                                                <p className="text-sm text-muted-foreground">Complete information about this booking</p>
                                            </DialogHeader>
                                            {selectedBooking && (
                                                <div className="space-y-4 mt-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-12 h-12">
                                                            <AvatarFallback className="bg-muted">{selectedBooking.initials}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold">{selectedBooking.client}</p>
                                                            <Badge className={statusColors[selectedBooking.status]}>
                                                                {selectedBooking.status}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-3">
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Service</p>
                                                            <p className="font-medium">{selectedBooking.service}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Date</p>
                                                                <p className="font-medium">{selectedBooking.date}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-muted-foreground">Time</p>
                                                                <p className="font-medium">{selectedBooking.time}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Location</p>
                                                            <p className="font-medium">{selectedBooking.location}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Amount</p>
                                                            <p className="font-medium">{selectedBooking.amount}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Notes</p>
                                                            <p className="font-medium text-muted-foreground">
                                                                {selectedBooking.status === "Completed"
                                                                    ? "Great session! Client was very happy with the results."
                                                                    : "Client prefers natural lighting. Bring multiple outfit options."
                                                                }
                                                            </p>
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
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
