import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  DollarSign, 
  Briefcase, 
  Star,
  Clock,
  MapPin,
  Eye
} from "lucide-react";

const stats = [
  { label: "Total Bookings", value: "24", change: "+4 this month", icon: Calendar },
  { label: "Revenue", value: "$5,240", change: "This month", icon: DollarSign },
  { label: "Active Services", value: "6", change: "Services listed", icon: Briefcase },
  { label: "Rating", value: "4.9", change: "From 18 reviews", icon: Star },
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

const bookingRequests = [
  {
    id: 1,
    client: "Alex Thompson",
    initials: "A",
    service: "Headshot Photography",
    date: "Requested 1/15/2024",
  },
  {
    id: 2,
    client: "Jordan Lee",
    initials: "J",
    service: "Makeup & Styling",
    date: "Requested 1/14/2024",
  },
  {
    id: 3,
    client: "Taylor Kim",
    initials: "T",
    service: "Portfolio Review",
    date: "Requested 1/13/2024",
    accepted: true,
  },
];

const statusColors: Record<string, string> = {
  Confirmed: "bg-success text-success-foreground",
  Pending: "bg-warning text-warning-foreground",
};

export default function ProfessionalDashboard() {
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

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
          <p className="text-sm text-muted-foreground">Your scheduled sessions with clients</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingBookings.map((booking) => (
            <div 
              key={booking.id} 
              className="flex items-center justify-between p-4 rounded-lg border border-border"
            >
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
              <div className="text-right">
                <p className="font-semibold">{booking.amount}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Booking Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Booking Requests</CardTitle>
          <p className="text-sm text-muted-foreground">New requests awaiting your response</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {bookingRequests.map((request) => (
            <div 
              key={request.id} 
              className="flex items-center justify-between p-3 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">{request.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{request.client}</p>
                  <p className="text-sm text-muted-foreground">{request.service}</p>
                  <p className="text-xs text-muted-foreground">{request.date}</p>
                </div>
              </div>
              {request.accepted ? (
                <Badge className="bg-success text-success-foreground">Accepted</Badge>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm">Accept</Button>
                  <Button variant="destructive" size="sm">Decline</Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
