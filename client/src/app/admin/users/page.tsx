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
import { Eye, Ban, Trash2 } from "lucide-react";

const userStats = [
    { label: "Total Users", value: "1,248", color: "text-foreground" },
    { label: "Talent", value: "890", color: "text-success" },
    { label: "Directors", value: "245", color: "text-primary" },
    { label: "Professionals", value: "113", color: "text-accent" },
];

const users = [
    {
        id: 1,
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        role: "Talent",
        status: "Active",
        signupDate: "1/15/2024",
        verified: true,
        initial: "S",
    },
    {
        id: 2,
        name: "Michael Chen",
        email: "m.chen@email.com",
        role: "Casting Director",
        status: "Active",
        signupDate: "1/10/2024",
        verified: true,
        initial: "M",
    },
    {
        id: 3,
        name: "Emma Davis",
        email: "emma.d@email.com",
        role: "Industry Professional",
        status: "Active",
        signupDate: "1/15/2024",
        verified: true,
        initial: "E",
    },
    {
        id: 4,
        name: "Jessica Wilson",
        email: "j.wilson@email.com",
        role: "Talent",
        status: "Active",
        signupDate: "1/15/2024",
        verified: true,
        initial: "J",
    },
    {
        id: 5,
        name: "Luke Anderson",
        email: "l.anderson@email.com",
        role: "Casting Director",
        status: "Inactive",
        signupDate: "1/15/2024",
        verified: false,
        initial: "L",
    },
];

const getRoleBadgeVariant = (role: string) => {
    switch (role) {
        case "Talent":
            return "default";
        case "Casting Director":
            return "secondary";
        case "Industry Professional":
            return "outline";
        default:
            return "outline";
    }
};

export default function UsersManagement() {
    const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Monitor and manage user accounts</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {userStats.map((stat) => (
                    <Card key={stat.label} className="card-elevated">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Users Table */}
            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">All Users</CardTitle>
                    <p className="text-sm text-muted-foreground">Search, filter, and manage user accounts</p>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Signup Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-muted text-sm">{user.initial}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={user.status === "Active" ? "text-success border-success/20 bg-success/10" : "text-muted-foreground"}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.signupDate}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedUser(user)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-warning hover:text-warning">
                                                <Ban className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* User Details Dialog */}
            <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-muted text-lg">{selectedUser.initial}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-lg">{selectedUser.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedUser.role}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-lg border border-border">
                                <div>
                                    <p className="text-muted-foreground text-xs">Email</p>
                                    <p className="font-medium truncate" title={selectedUser.email}>{selectedUser.email}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Status</p>
                                    <p className="font-medium">{selectedUser.status}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Signup Date</p>
                                    <p className="font-medium">{selectedUser.signupDate}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-xs">Verified</p>
                                    <p className="font-medium">{selectedUser.verified ? "Yes" : "No"}</p>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => setSelectedUser(null)}>
                                Close
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
