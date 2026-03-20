 import { useState, useEffect } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback } from "@/components/ui/avatar";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
 } from "@/components/ui/dialog";
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from "@/components/ui/table";
 import { Eye, Loader2, Calendar, Clock, DollarSign, User } from "lucide-react";
 import { adminAPI } from "@/lib/api";
 import { toast } from "sonner";

 export default function AdminBookings() {
   const [bookings, setBookings] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [stats, setStats] = useState([]);
   const [selectedBooking, setSelectedBooking] = useState(null);
   const [isActionLoading, setIsActionLoading] = useState(false);

   const fetchData = async () => {
     setIsLoading(true);
     try {
       const [bookingsRes, statsRes] = await Promise.all([
         adminAPI.getAdminBookings(),
         adminAPI.getAdminBookingStats()
       ]);

       if (bookingsRes.data.success) {
         setBookings(bookingsRes.data.data.bookings || []);
       }
       if (statsRes.data.success) {
         const s = statsRes.data.data;
         setStats([
           { label: "Total Bookings", value: s.total?.toLocaleString() || "0", color: "foreground" },
           { label: "Completed", value: s.completed?.toLocaleString() || "0", color: "success" },
           { label: "Confirmed", value: s.confirmed?.toLocaleString() || "0", color: "primary" },
           { label: "Pending", value: s.pending?.toLocaleString() || "0", color: "warning" },
         ]);
       }
     } catch (error) {
       toast.error(error.response?.data?.message || "Failed to load bookings");
     } finally {
       setIsLoading(false);
     }
   };

   useEffect(() => {
     fetchData();
   }, []);

   const handleUpdateStatus = async (id: string, status: string) => {
     setIsActionLoading(true);
     try {
       const response = await adminAPI.updateAdminBookingStatus(id, status);
       if (response.data.success) {
         toast.success(`Booking ${status.toLowerCase()} successfully`);
         setSelectedBooking(null);
         fetchData();
       }
     } catch (error) {
       toast.error(error.response?.data?.message || "Failed to update status");
     } finally {
       setIsActionLoading(false);
     }
   };

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

   return (
     <div className="space-y-6">
       <div>
         <h1 className="text-2xl font-bold">Bookings Management</h1>
         <p className="text-muted-foreground">Monitor and manage all service bookings across the platform</p>
       </div>
 
       {/* Stats */}
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
         {stats.map((stat) => (
           <Card key={stat.label}>
             <CardContent className="p-4">
               <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
               <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
             </CardContent>
           </Card>
         ))}
       </div>
 
       {/* Bookings Table */}
       <Card>
         <CardHeader>
           <CardTitle className="text-base font-semibold">All Bookings</CardTitle>
           <p className="text-sm text-muted-foreground">Manage service bookings between professionals and talent</p>
         </CardHeader>
         <CardContent>
           {isLoading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
           ) : bookings.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
               No bookings found.
             </div>
           ) : (
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
                   <TableRow key={booking._id || booking.id}>
                     <TableCell>
                       <div>
                         <p className="font-medium">{booking.serviceId?.title || booking.serviceName}</p>
                         <p className="text-sm text-muted-foreground">£{booking.amount || booking.price}</p>
                       </div>
                     </TableCell>
                     <TableCell>
                       <div className="flex items-center gap-2">
                         <Avatar className="h-7 w-7">
                           <AvatarFallback className="bg-muted text-xs">
                             {booking.professionalId?.fullName?.[0] || "P"}
                           </AvatarFallback>
                         </Avatar>
                         <span className="text-sm">{booking.professionalId?.fullName || "Unknown"}</span>
                       </div>
                     </TableCell>
                     <TableCell>
                       <div className="flex items-center gap-2">
                         <Avatar className="h-7 w-7">
                           <AvatarFallback className="bg-muted text-xs">
                             {booking.talentId?.fullName?.[0] || "T"}
                           </AvatarFallback>
                         </Avatar>
                         <span className="text-sm">{booking.talentId?.fullName || "Unknown"}</span>
                       </div>
                     </TableCell>
                     <TableCell>
                       <div>
                         <p className="text-sm">{booking.date ? new Date(booking.date).toLocaleDateString() : "TBD"}</p>
                         <p className="text-xs text-muted-foreground">{booking.time || "Flexible"}</p>
                       </div>
                     </TableCell>
                     <TableCell>{getStatusBadge(booking.status)}</TableCell>
                     <TableCell>
                       <div className="flex justify-end">
                         <Button variant="ghost" size="icon" onClick={() => setSelectedBooking(booking)}>
                           <Eye className="w-4 h-4" />
                         </Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           )}
         </CardContent>
       </Card>
 
       {/* Booking Details Dialog */}
       <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle>Booking Details</DialogTitle>
             <p className="text-sm text-muted-foreground">{selectedBooking?.serviceId?.title || selectedBooking?.serviceName}</p>
           </DialogHeader>
           {selectedBooking && (
             <div className="space-y-6 mt-4">
               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-1">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <Calendar className="w-3 h-3" /> Date
                   </p>
                   <p className="text-sm font-semibold">{selectedBooking.date ? new Date(selectedBooking.date).toLocaleDateString() : "TBD"}</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <Clock className="w-3 h-3" /> Time
                   </p>
                   <p className="text-sm font-semibold">{selectedBooking.time || "Flexible"}</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <DollarSign className="w-3 h-3" /> Price
                   </p>
                   <p className="text-sm font-semibold">£{selectedBooking.amount || selectedBooking.price}</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</p>
                   {getStatusBadge(selectedBooking.status)}
                 </div>
               </div>

               <div className="space-y-4">
                 <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                     <User className="w-3 h-3" /> Professional
                   </p>
                   <div className="flex items-center gap-3">
                     <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-white">{selectedBooking.professionalId?.fullName?.[0]}</AvatarFallback>
                     </Avatar>
                     <p className="text-sm font-bold">{selectedBooking.professionalId?.fullName || "Unknown Professional"}</p>
                   </div>
                 </div>

                 <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                     <User className="w-3 h-3" /> Talent
                   </p>
                   <div className="flex items-center gap-3">
                     <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-white">{selectedBooking.talentId?.fullName?.[0]}</AvatarFallback>
                     </Avatar>
                     <p className="text-sm font-bold">{selectedBooking.talentId?.fullName || "Unknown Talent"}</p>
                   </div>
                 </div>
               </div>

               <DialogFooter className="flex gap-2 sm:justify-center">
                 {selectedBooking.status === "Pending" && (
                   <>
                     <Button 
                       variant="destructive" 
                       className="flex-1 rounded-xl font-bold"
                       disabled={isActionLoading}
                       onClick={() => handleUpdateStatus(selectedBooking._id || selectedBooking.id, 'Cancelled')}
                     >
                       Cancel
                     </Button>
                     <Button 
                       className="flex-1 rounded-xl font-bold bg-[#009698] hover:bg-[#009698]/90"
                       disabled={isActionLoading}
                       onClick={() => handleUpdateStatus(selectedBooking._id || selectedBooking.id, 'Confirmed')}
                     >
                       Confirm
                     </Button>
                   </>
                 )}
                 {selectedBooking.status === "Confirmed" && (
                   <Button 
                     className="w-full rounded-xl font-bold bg-slate-900"
                     disabled={isActionLoading}
                     onClick={() => handleUpdateStatus(selectedBooking._id || selectedBooking.id, 'Completed')}
                   >
                     Mark as Completed
                   </Button>
                 )}
                 {(selectedBooking.status === "Completed" || selectedBooking.status === "Cancelled") && (
                   <Button variant="outline" className="w-full rounded-xl" onClick={() => setSelectedBooking(null)}>
                     Close
                   </Button>
                 )}
               </DialogFooter>
             </div>
           )}
         </DialogContent>
       </Dialog>
     </div>
   );
 }