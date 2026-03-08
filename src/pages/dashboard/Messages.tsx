import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Send, MoreVertical, Loader2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { messagingAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const response = await messagingAPI.getMyConversations();
      if (response.data.success && Array.isArray(response.data.data)) {
        setConversations(response.data.data);
        if (response.data.data.length > 0 && !selectedConversation) {
          setSelectedConversation(response.data.data[0]);
        }
      } else {
        setConversations([]);
      }
    } catch (error: any) {
      toast.error("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;
      try {
        const response = await messagingAPI.getMessages(selectedConversation._id, { limit: 50 });
        if (response.data.success && Array.isArray(response.data.data)) {
          setMessages(response.data.data.reverse());
        } else {
          setMessages([]);
        }
      } catch (error: any) {
        console.error("Failed to fetch messages:", error);
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await messagingAPI.sendMessage({
        conversationId: selectedConversation._id,
        text: newMessage,
      });

      if (response.data.success) {
        setMessages([...messages, response.data.data]);
        setNewMessage("");
        
        // Update last message in conversation list
        setConversations(conversations.map(c => 
          c._id === selectedConversation._id ? { ...c, lastMessage: response.data.data } : c
        ));
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
          <p className="text-muted-foreground">Connect with casting directors regarding your applications</p>
        </div>
      </div>

      <Card className="h-[calc(100%-4rem)]">
        <div className="flex h-full">
          {/* Contacts List (Conversations) */}
          <div className="w-80 border-r border-border flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-2">
                {conversations.length > 0 ? conversations.map((conv) => {
                  const otherParticipant = conv.participants?.find((p: any) => p._id !== user?.id);
                  return (
                    <button
                      key={conv._id}
                      onClick={() => setSelectedConversation(conv)}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                        selectedConversation?._id === conv._id 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      )}
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={otherParticipant?.profilePicture} />
                        <AvatarFallback>{otherParticipant?.fullName?.[0] || "C"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{otherParticipant?.fullName || "Casting Director"}</p>
                        </div>
                        <p className={cn(
                          "text-xs truncate",
                          selectedConversation?._id === conv._id 
                            ? "text-primary-foreground/80" 
                            : "text-muted-foreground"
                        )}>
                          {conv.lastMessage?.text || "No messages yet"}
                        </p>
                      </div>
                    </button>
                  );
                }) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No conversations found. Apply to casting calls to start messaging.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b border-border flex items-center justify-between">
                  {(() => {
                    const otherParticipant = selectedConversation.participants?.find((p: any) => p._id !== user?.id);
                    return (
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={otherParticipant?.profilePicture} />
                          <AvatarFallback>{otherParticipant?.fullName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{otherParticipant?.fullName || "Casting Team"}</p>
                          <p className="text-xs text-muted-foreground">{selectedConversation.castingCall?.title || "Direct Message"}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "flex",
                          msg.sender === user?.id ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "max-w-[70%] rounded-lg p-3",
                          msg.sender === user?.id 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        )}>
                          <p className="text-sm">{msg.text}</p>
                          <p className={cn(
                            "text-xs mt-1",
                            msg.sender === user?.id 
                              ? "text-primary-foreground/60" 
                              : "text-muted-foreground"
                          )}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div ref={scrollRef} />
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center py-12 text-sm text-muted-foreground">
                        Start the conversation by sending a message.
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <form 
                    className="flex gap-2" 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  >
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
                <div className="text-center space-y-2">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted/30" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
