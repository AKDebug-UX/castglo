import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { applicationAPI } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ApplicationDetailsModalProps {
  applicationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationDetailsModal({ applicationId, isOpen, onClose }: ApplicationDetailsModalProps) {
  const { user } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchApplicationDetails();
    } else {
      setApplication(null);
    }
  }, [isOpen, applicationId]);

  const fetchApplicationDetails = async () => {
    setIsLoading(true);
    try {
      const res = await applicationAPI.getDetails(applicationId as string);
      if (res.data?.success) {
        setApplication(res.data.data);
      } else {
        toast.error("Failed to load application details");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred loading application details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !applicationId) return;
    
    setIsSending(true);
    try {
      const res = await applicationAPI.addCommunication(applicationId, newMessage.trim());
      if (res.data?.success) {
        toast.success("Message sent successfully");
        setNewMessage("");
        fetchApplicationDetails(); // Reload to see the new message
      } else {
        toast.error(res.data?.message || "Failed to send message");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while sending your message");
    } finally {
      setIsSending(false);
    }
  };

  const statusColors: Record<string, string> = {
    "submitted": "bg-slate-500 text-white",
    "viewed": "bg-blue-400 text-white",
    "shortlisted": "bg-amber-500 text-white",
    "rejected": "bg-rose-500 text-white",
    "accepted": "bg-emerald-500 text-white",
    "withdrawn": "bg-slate-300 text-slate-700",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Application Details
            {application && (
              <Badge className={statusColors[application.status] || "bg-muted"}>
                {application.status}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            View application details and communication history
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !application ? (
          <div className="flex-1 py-8 text-center text-muted-foreground">
            Could not load application details.
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col gap-6">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 pb-6">
                
                {/* Details Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Casting Call</p>
                      <p className="font-medium">{application.project?.title || application.project?.projectName || application.castingCall?.title || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Applicant</p>
                      <p className="font-medium">{application.talentUser?.fullName || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date Submitted</p>
                      <p className="font-medium">{new Date(application.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Role</p>
                      <p className="font-medium">{application.role?.role_name || application.role?.name || application.role?.title || application.castingCall?.category || "Unknown"}</p>
                    </div>
                  </div>

                  {application.metaData && Object.keys(application.metaData).length > 0 && (
                    <div className="mt-4 space-y-3">
                      <p className="font-medium text-sm text-muted-foreground">Application Metadata</p>
                      <div className="bg-muted p-4 rounded-md text-sm space-y-2">
                        {Object.entries(application.metaData).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.notes && application.notes.indexOf('__META__:') === -1 && (
                    <div className="mt-4">
                      <p className="font-medium text-sm text-muted-foreground">Additional Notes</p>
                      <p className="text-sm mt-1">{application.notes}</p>
                    </div>
                  )}
                </div>

                {/* Communication Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Communication Log
                  </h3>
                  
                  {(!application.communications || application.communications.length === 0) ? (
                    <p className="text-sm text-muted-foreground italic">No communication history yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {application.communications.map((comm: any, idx: number) => {
                        const isMe = comm.sender?._id === user?._id || comm.sender?.id === user?._id;
                        return (
                          <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div 
                              className={`max-w-[80%] rounded-lg p-3 text-sm ${
                                isMe 
                                  ? 'bg-primary text-primary-foreground rounded-br-none' 
                                  : 'bg-muted rounded-bl-none'
                              }`}
                            >
                              <p className="font-semibold text-xs mb-1 opacity-70">
                                {isMe ? 'You' : comm.sender?.fullName || 'User'}
                              </p>
                              <p>{comm.message}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1">
                              {new Date(comm.createdAt).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </ScrollArea>

            {/* Message Input - Only if not withdrawn */}
            {application.status !== "withdrawn" && (
              <div className="flex items-end gap-2 pt-4 border-t mt-auto">
                <Textarea 
                  placeholder="Type a message..."
                  className="min-h-[40px] resize-none"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim() || isSending}
                  size="icon"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
