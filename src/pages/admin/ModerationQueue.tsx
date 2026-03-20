 import { useState, useEffect } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { AlertTriangle, CheckCircle, XCircle, Play, Loader2 } from "lucide-react";
 import { adminAPI } from "@/lib/api";
 import { toast } from "sonner";

 export default function ModerationQueue() {
   const [selectedContent, setSelectedContent] = useState(null);
   const [flaggedContent, setFlaggedContent] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isActionLoading, setIsActionLoading] = useState(false);
   const [stats, setStats] = useState([
     { label: "Pending Review", value: "0", sublabel: "Requires immediate attention", icon: AlertTriangle, color: "warning" },
     { label: "Resolved Today", value: "0", sublabel: "Content moderated", icon: CheckCircle, color: "success" },
     { label: "Escalated", value: "0", sublabel: "Needs senior review", icon: XCircle, color: "destructive" },
   ]);

   const fetchModerationData = async () => {
     setIsLoading(true);
     try {
       const response = await adminAPI.getModerationQueue();
       if (response.data.success) {
         const data = response.data.data;
         setFlaggedContent(data.queue || []);
         
         // Update stats if provided by backend, otherwise use lengths
         const pending = data.queue?.filter((item) => item.status === "Pending").length || 0;
         const resolved = data.resolvedCount || 0;
         const escalated = data.queue?.filter((item) => item.status === "Escalated").length || 0;

         setStats([
           { label: "Pending Review", value: pending.toString(), sublabel: "Requires immediate attention", icon: AlertTriangle, color: "warning" },
           { label: "Resolved Today", value: resolved.toString(), sublabel: "Content moderated", icon: CheckCircle, color: "success" },
           { label: "Escalated", value: escalated.toString(), sublabel: "Needs senior review", icon: XCircle, color: "destructive" },
         ]);
       }
     } catch (error) {
       toast.error(error.response?.data?.message || "Failed to fetch moderation queue");
     } finally {
       setIsLoading(false);
     }
   };

   useEffect(() => {
     fetchModerationData();
   }, []);

   const handleModerationAction = async (id: string, status: string) => {
     setIsActionLoading(true);
     try {
       const response = await adminAPI.updateModerationStatus(id, status);
       if (response.data.success) {
         toast.success(`Content ${status.toLowerCase()} successfully`);
         setSelectedContent(null);
         fetchModerationData();
       }
     } catch (error) {
       toast.error(error.response?.data?.message || `Failed to ${status.toLowerCase()} content`);
     } finally {
       setIsActionLoading(false);
     }
   };

   return (
     <div className="space-y-6">
       <div>
         <h1 className="text-2xl font-bold">Moderation Queue</h1>
         <p className="text-muted-foreground">Review and manage AI-flagged content</p>
       </div>
 
       {/* Stats */}
       <div className="grid gap-4 sm:grid-cols-3">
         {stats.map((stat) => (
           <Card key={stat.label}>
             <CardContent className="p-4">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-sm text-muted-foreground">{stat.label}</span>
                 <stat.icon className={`w-5 h-5 text-${stat.color}`} />
               </div>
               <div className="text-2xl font-bold">{stat.value}</div>
               <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
             </CardContent>
           </Card>
         ))}
       </div>
 
       {/* Flagged Content List */}
       <Card>
         <CardHeader>
           <CardTitle className="text-base font-semibold">Flagged Content</CardTitle>
           <p className="text-sm text-muted-foreground">AI-detected content requiring moderation</p>
         </CardHeader>
         <CardContent className="space-y-4">
           {isLoading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
           ) : flaggedContent.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
               No flagged content found.
             </div>
           ) : (
             flaggedContent.map((item) => (
               <div
                 key={item._id || item.id}
                 className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
               >
                 <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                   <img src={item.mediaUrl || item.image} alt={item.title} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                     <Play className="w-6 h-6 text-white" />
                   </div>
                 </div>
                 <div className="flex-1 min-w-0">
                   <h4 className="font-medium">{item.title}</h4>
                   <p className="text-sm text-muted-foreground">by {item.author || item.userId?.fullName}</p>
                   <p className="text-xs text-destructive font-bold">Reason: {item.reason}</p>
                   <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs text-muted-foreground">Confidence: {item.confidenceScore || item.confidence}%</span>
                     <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                       <div
                         className="h-full bg-primary"
                         style={{ width: `${item.confidenceScore || item.confidence}%` }}
                       />
                     </div>
                   </div>
                   <p className="text-xs text-muted-foreground">{item.createdAt ? new Date(item.createdAt).toLocaleString() : item.timestamp}</p>
                 </div>
                 <div className="flex items-center gap-2">
                   <Badge variant={item.status === "Pending" ? "secondary" : "outline"}>
                     {item.status}
                   </Badge>
                   <Button variant="outline" size="sm" onClick={() => setSelectedContent(item)}>
                     Preview
                   </Button>
                 </div>
               </div>
             ))
           )}
         </CardContent>
       </Card>
 
       {/* Review Dialog */}
       <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle>Review Flagged Content</DialogTitle>
             <p className="text-sm text-muted-foreground">
               {selectedContent?.title} by {selectedContent?.author || selectedContent?.userId?.fullName}
             </p>
           </DialogHeader>
           {selectedContent && (
             <div className="space-y-4">
               <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                 <img
                   src={selectedContent.mediaUrl || selectedContent.image}
                   alt={selectedContent.title}
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                   <Play className="w-12 h-12 text-white" />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <p className="text-muted-foreground">Reason:</p>
                   <p className="font-medium">{selectedContent.reason}</p>
                 </div>
                 <div>
                   <p className="text-muted-foreground">Confidence Score:</p>
                   <p className="font-medium">{selectedContent.confidenceScore || selectedContent.confidence}%</p>
                 </div>
                 <div>
                   <p className="text-muted-foreground">Timestamp:</p>
                   <p className="font-medium">{selectedContent.createdAt ? new Date(selectedContent.createdAt).toLocaleString() : selectedContent.timestamp}</p>
                 </div>
                 <div>
                   <p className="text-muted-foreground">Status:</p>
                   <p className="font-medium">{selectedContent.status}</p>
                 </div>
               </div>
               <div className="flex gap-2 pt-4">
                 <Button 
                   variant="outline" 
                   className="flex-1"
                   disabled={isActionLoading}
                   onClick={() => handleModerationAction(selectedContent._id || selectedContent.id, 'Escalated')}
                 >
                   Escalate
                 </Button>
                 <Button 
                   variant="destructive" 
                   className="flex-1"
                   disabled={isActionLoading}
                   onClick={() => handleModerationAction(selectedContent._id || selectedContent.id, 'Rejected')}
                 >
                   Reject
                 </Button>
                 <Button 
                   className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                   disabled={isActionLoading}
                   onClick={() => handleModerationAction(selectedContent._id || selectedContent.id, 'Approved')}
                 >
                   Approve
                 </Button>
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>
     </div>
   );
 }