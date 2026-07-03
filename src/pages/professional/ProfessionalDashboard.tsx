import { useState, useEffect } from "react";
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
  Eye,
  Loader2
} from "lucide-react";
import { profileAPI, authAPI, bookingAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

import { Link } from "react-router-dom";

export default function ProfessionalDashboard() {
  const { user: authUser, formatPrice } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes, bookingsRes] = await Promise.all([
          profileAPI.getMe().catch(err => {
            console.error("Profile fetch error:", err);
            return { data: { success: false } };
          }),
          bookingAPI.getStats().catch(() => ({ data: { success: false } })),
          bookingAPI.getProfessionalBookings().catch(() => ({ data: { success: false, data: [] } }))
        ]);

        const profileData = profileRes.data?.success ? profileRes.data.data : null;
        setProfile(profileData);

        const statsData = statsRes.data?.success ? statsRes.data.data : {};
        const bookingsList = bookingsRes.data?.success ? bookingsRes.data.data : [];

        const upcoming = bookingsList.filter((b: any) => b.status === "confirmed" || b.status === "scheduled");
        const requests = bookingsList.filter((b: any) => b.status === "pending");

        setUpcomingBookings(upcoming);
        setRecentRequests(requests);

        // Calculate stats with safe defaults
        setStats([
          { label: "Total Bookings", value: statsData.totalBookings?.toString() || "0", change: "Live data", Icon: Calendar },
          { label: "Revenue", value: formatPrice(statsData.totalRevenue || 0), change: "This month", Icon: DollarSign },
          { label: "Profile Views", value: profileData?.views?.toString() || "0", change: "Total views", Icon: Eye },
          { label: "Rating", value: profileData?.rating?.toString() || "0.0", change: "From reviews", Icon: Star },
        ]);
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {authUser?.fullName || 'Professional'}!</h1>
          <p className="text-muted-foreground">Manage your services and connect with talent</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={`/professional/${authUser?.id || authUser?._id}`}>
              <Eye className="w-4 h-4 mr-2" />
              View Public Profile
            </Link>
          </Button>
          <Button asChild>
            <Link to="/professional/profile">Edit Profile</Link>
          </Button>
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
                  <stat.Icon className="w-5 h-5" />
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
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking: any) => (
                <div key={booking._id || booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{booking.serviceName || "Professional Service"}</p>
                    <p className="text-sm text-muted-foreground">{booking.clientName || "Client"} - {booking.date ? format(new Date(booking.date), "PPP") : "TBD"}</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary">Scheduled</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming bookings found. Listings will appear here once booked.
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => setUpcomingBookings([
                  { _id: 'mock1', serviceName: 'Headshot Photography', clientName: 'Jane Smith', date: new Date(Date.now() + 86400000).toISOString() },
                  { _id: 'mock2', serviceName: 'Acting Coaching', clientName: 'Mike Johnson', date: new Date(Date.now() + 172800000).toISOString() }
                ])}>
                  Load Mock Bookings
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Booking Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Booking Requests</CardTitle>
          <p className="text-sm text-muted-foreground">New requests awaiting your response</p>
        </CardHeader>
        <CardContent>
          {recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.map((request: any) => (
                <div key={request._id || request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{request.serviceName || "Professional Service"}</p>
                    <p className="text-sm text-muted-foreground">Requested by {request.clientName || "Client"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">Accept</Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No new booking requests.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
