import { useState, useEffect } from "react";
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
  Mail,
  Loader2
} from "lucide-react";
import { bookingAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const statusColors: Record<string, string> = {
  Confirmed: "bg-green-100 text-green-700 border-green-200",
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Completed: "bg-blue-100 text-blue-700 border-blue-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function ProfessionalBookings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const fetchBookings = async () => {
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        bookingAPI.getProfessionalBookings({ status: activeTab }),
        bookingAPI.getStats()
      ]);

      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data || []);
      }
      if (statsRes.data.success) {
        const s = statsRes.data.data;
        setStats([
          { label: "Upcoming", value: s.upcomingCount || "0", change: "Session scheduled", icon: Calendar },
          { label: "Revenue", value: `£${s.totalRevenue || "0"}`, change: "Total earned", icon: DollarSign },
          { label: "Completed", value: s.completedCount || "0", change: "Jobs finished", icon: CheckCircle },
          { label: "Pending", value: s.pendingCount || "0", change: "Awaiting confirmation", icon: Clock },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Could not load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await bookingAPI.updateStatus(id, status);
      if (response.data.success) {
        toast.success(`Booking ${status.toLowerCase()} successfully`);
        fetchBookings();
      }
    } catch (error) {
      toast.error("Failed to update booking status");
    }
  };

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
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Manage your service bookings and clients</p>
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-8">Upcoming</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-8">Completed</TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-8">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No {activeTab} bookings found.</p>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking._id || booking.id} className="group border-none shadow-xl rounded-[32px] overflow-hidden transition-all hover:scale-[1.01]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 rounded-2xl shadow-inner">
                      <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-lg">
                        {booking.talentId?.fullName?.[0] || booking.talentName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-slate-900">{booking.talentId?.fullName || booking.talentName || 'Unknown Client'}</p>
                        <Badge className={`${statusColors[booking.status] || 'bg-slate-100'} border-none px-3 rounded-full text-xs font-bold`}>
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-[#009698]">{booking.serviceId?.title || booking.serviceName}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {booking.date ? new Date(booking.date).toLocaleDateString() : 'TBD'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {booking.time || 'Flexible'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {booking.location || 'Remote'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right mr-4">
                      <p className="text-2xl font-black text-slate-900">£{booking.amount}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {booking.status === "Pending" && (
                        <>
                          <Button size="sm" className="rounded-full px-6 font-bold bg-[#009698] hover:bg-[#009698]/90" onClick={() => handleUpdateStatus(booking._id || booking.id, 'Confirmed')}>
                            Accept
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full px-6 font-bold border-red-100 text-red-500 hover:bg-red-50" onClick={() => handleUpdateStatus(booking._id || booking.id, 'Cancelled')}>
                            Decline
                          </Button>
                        </>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-full px-6 font-bold border-slate-200 text-slate-600" onClick={() => setSelectedBooking(booking)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[32px] border-none shadow-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Booking Details</DialogTitle>
                            <p className="text-sm text-muted-foreground">Complete information about this session</p>
                          </DialogHeader>
                          {selectedBooking && (
                            <div className="space-y-6 mt-6">
                              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                                <Avatar className="h-16 w-14 rounded-xl">
                                  <AvatarFallback className="bg-white text-[#009698] font-bold text-xl">
                                    {selectedBooking.talentId?.fullName?.[0] || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-xl font-bold text-slate-900">{selectedBooking.talentId?.fullName || 'Client'}</p>
                                  <Badge className={`${statusColors[selectedBooking.status]} border-none px-3 rounded-full text-xs font-bold mt-1`}>
                                    {selectedBooking.status}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid gap-4">
                                <div className="p-4 rounded-2xl border border-slate-100">
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Service Requested</p>
                                  <p className="font-bold text-slate-900">{selectedBooking.serviceId?.title || selectedBooking.serviceName}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                                    <p className="font-bold text-slate-900">{selectedBooking.date ? new Date(selectedBooking.date).toLocaleDateString() : 'TBD'}</p>
                                  </div>
                                  <div className="p-4 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                                    <p className="font-bold text-slate-900">{selectedBooking.time || 'Flexible'}</p>
                                  </div>
                                </div>

                                <div className="p-4 rounded-2xl border border-slate-100">
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                                  <p className="font-bold text-slate-900">{selectedBooking.location || 'Remote / Online'}</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-[#DEFCFE]/30 border border-[#009698]/10">
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Status</p>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xl font-black text-slate-900">£{selectedBooking.amount}</p>
                                    <Badge className="bg-white text-[#009698] border-[#009698]/20 font-bold">Paid via Stripe</Badge>
                                  </div>
                                </div>
                              </div>

                              <Button className="w-full h-12 rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 transition-all">
                                <Mail className="w-5 h-5 mr-2" />
                                Open Messenger
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
