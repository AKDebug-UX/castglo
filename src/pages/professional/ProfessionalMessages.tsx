import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { applicationAPI, profileAPI } from "@/lib/api";
import { toast } from "sonner";

export default function ProfessionalMessages() {
  const [searchParams] = useSearchParams();
  const talentId = searchParams.get("talentId");

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const fetchConversations = async () => {
    try {
      // For professionals, messages might be tied to applications or direct leads
      // Simplified: showing applications where professional is the poster/interacted
      // In this specific system, we'll fetch apps tied to the professional's listings or interactions
      const response = await applicationAPI.getMe(); // Simplified: using same endpoint as talent for now
      if (response.data.success) {
        setConversations(response.data.data);
        if (response.data.data.length > 0 && !selectedApp) {
          setSelectedApp(response.data.data[0]);
        }
      }
    } catch (error: any) {
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSendMessage = async () => {
    if (!selectedApp || !newMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await applicationAPI.addCommunication(selectedApp._id, newMessage);
      if (response.data.success) {
        setNewMessage("");
        const updated = await applicationAPI.getDetails(selectedApp._id);
        if (updated.data.success) {
          setSelectedApp(updated.data.data);
          setConversations(prev => prev.map(a => a._id === selectedApp._id ? updated.data.data : a));
        }
      }
    } catch (error: any) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
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
    <div className="h-[calc(100vh-8rem)] animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Connect with talent and clients</p>
        </div>
      </div>

      <Card className="h-[calc(100%-4rem)]">
        <div className="flex h-full">
          {/* Contacts List */}
          <div className="w-80 border-r border-border flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-2">
                {conversations.length > 0 ? conversations.map((app) => (
                  <button
                    key={app._id}
                    onClick={() => setSelectedApp(app)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                      selectedApp?._id === app._id 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={app.talent?.profilePicture} />
                      <AvatarFallback>{app.talent?.fullName?.[0] || 'T'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{app.talent?.fullName}</p>
                      <p className={cn(
                        "text-xs truncate",
                        selectedApp?._id === app._id ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {app.castingCall?.title}
                      </p>
                    </div>
                  </button>
                )) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No active conversations.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedApp ? (
              <>
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedApp.talent?.profilePicture} />
                      <AvatarFallback>{selectedApp.talent?.fullName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedApp.talent?.fullName}</p>
                      <p className="text-xs text-muted-foreground">{selectedApp.castingCall?.title}</p>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedApp.communications?.map((msg: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "flex",
                          msg.senderModel === "User" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "max-w-[70%] rounded-lg p-3",
                          msg.senderModel === "User" ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          <p className="text-sm">{msg.message}</p>
                          <p className={cn(
                            "text-xs mt-1",
                            msg.senderModel === "User" ? "text-primary-foreground/60" : "text-muted-foreground"
                          )}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-border">
                  <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                    <Input 
                      placeholder="Type your message..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                      disabled={isSending}
                    />
                    <Button size="icon" type="submit" disabled={isSending || !newMessage.trim()}>
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
