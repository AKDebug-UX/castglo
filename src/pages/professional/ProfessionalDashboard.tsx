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
import { profileAPI, authAPI } from "@/lib/api";
import { toast } from "sonner";

export default function ProfessionalDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, profileRes] = await Promise.all([
          authAPI.getMe(),
          profileAPI.getMe()
        ]);

        if (userRes.data.success) {
          setUser(userRes.data.data);
        }

        if (profileRes.data.success) {
          const profileData = profileRes.data.data;
          setProfile(profileData);

          // Calculate basic stats
          setStats([
            { label: "Total Bookings", value: "0", change: "Live data", Icon: Calendar },
            { label: "Revenue", value: "$0", change: "This month", Icon: DollarSign },
            { label: "Profile Views", value: profileData.views?.toString() || "0", change: "Total views", Icon: Eye },
            { label: "Rating", value: profileData.rating?.toString() || "0.0", change: "From reviews", Icon: Star },
          ]);
        }
      } catch (error) {
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
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.fullName || 'Professional'}!</h1>
        <p className="text-muted-foreground">Manage your services and connect with talent</p>
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

      {/* Upcoming Bookings - Mocked for now until Booking API is ready */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
          <p className="text-sm text-muted-foreground">Your scheduled sessions with clients</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No upcoming bookings found. Listings will appear here once booked.
          </div>
        </CardContent>
      </Card>

      {/* Recent Booking Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Booking Requests</CardTitle>
          <p className="text-sm text-muted-foreground">New requests awaiting your response</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No new booking requests.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
