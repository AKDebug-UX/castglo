"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Eye, CheckCircle, Clock } from "lucide-react";

const stats = [
    { label: "Total Bookings", value: "89", color: "text-foreground" },
    { label: "Completed", value: "43", color: "text-success" },
    { label: "Confirmed", value: "34", color: "text-primary" },
    { label: "Pending", value: "12", color: "text-warning" },
];

const bookings = [
    {
        id: 1,
        service: "Professional Headshot",
        price: 250,
        professional: { name: "Emma Davis", initial: "E" },
        talent: { name: "Sarah Johnson", initial: "S" },
        date: "1/10/2024",
        time: "10:00 AM",
        status: "Confirmed",
    },
    {
        id: 2,
        service: "Acting Coach Session",
        price: 150,
        professional: { name: "Michael Chen", initial: "M" },
        talent: { name: "James Wilson", initial: "J" },
        date: "1/22/2024",
        time: "2:00 PM",
        status: "Pending",
    },
    {
        id: 3,
        service: "Voice Training",
        price: 200,
        professional: { name: "Lisa Anderson", initial: "L" },
        talent: { name: "Emma Davis", initial: "E" },
        date: "1/18/2024",
        time: "11:00 AM",
        status: "Completed",
    },
    {
        id: 4,
        service: "Portfolio Review",
        price: 100,
        professional: { name: "Emma Davis", initial: "E" },
        talent: { name: "Michael Chen", initial: "S" },
        date: "1/25/2024",
        time: "3:00 PM",
        status: "Confirmed",
    },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Completed":
            return <Badge className="bg-success text-success-foreground">{status}</Badge>;
        case "Confirmed":
            return <Badge className="bg-primary text-primary-foreground">{status}</Badge>;
        case "Pending":
            return <Badge variant="secondary">{status}</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export default function AdminBookings() {
    const [selectedBooking, setSelectedBooking] = useState<typeof bookings[0] | null>(null);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold">Admin Bookings</h1>
                <p className="text-muted-foreground">Manage and monitor all platform bookings</p>
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

            {/* Bookings Table */}
            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">All Bookings</CardTitle>
                    <p className="text-sm text-muted-foreground">Manage service bookings between professionals and talent</p>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service</TableHead>
                                <TableHead>Professional</TableHead>
                                <TableHead>Talent</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{booking.service}</p>
                                            <p className="text-sm text-muted-foreground">${booking.price}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7">
                                                <AvatarFallback className="bg-muted text-xs">{booking.professional.initial}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{booking.professional.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7">
                                                <AvatarFallback className="bg-muted text-xs">{booking.talent.initial}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{booking.talent.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="text-sm">{booking.date}</p>
                                            <p className="text-xs text-muted-foreground">{booking.time}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedBooking(booking)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Booking Details Dialog */}
            <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                        <p className="text-sm text-muted-foreground">{selectedBooking?.service}</p>
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Service:</p>
                                    <p className="font-medium">{selectedBooking.service}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Price:</p>
                                    <p className="font-medium">${selectedBooking.price}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Professional:</p>
                                    <p className="font-medium">{selectedBooking.professional.name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Talent:</p>
                                    <p className="font-medium">{selectedBooking.talent.name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Date:</p>
                                    <p className="font-medium">{selectedBooking.date}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Time:</p>
                                    <p className="font-medium">{selectedBooking.time}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-muted-foreground">Status:</p>
                                    <p className="font-medium">{selectedBooking.status}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" className="flex-1" onClick={() => setSelectedBooking(null)}>
                                    Close
                                </Button>
                                {selectedBooking.status === "Pending" && (
                                    <>
                                        <Button variant="destructive" className="flex-1">Reject</Button>
                                        <Button className="flex-1 bg-success hover:bg-success/90">Approve</Button>
                                    </>
                                )}
                                {selectedBooking.status === "Confirmed" && (
                                    <Button className="flex-1 bg-success hover:bg-success/90">Mark Complete</Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
