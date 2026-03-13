import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Send, MoreVertical, Loader2, MessageSquare, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { messagingAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // New Message Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState("");

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
    } catch (error) {
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
      } catch (error) {
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
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isModalOpen) return;
      setIsSearching(true);
      try {
        const response = await userAPI.search({ query: userSearch, limit: 20 });
        if (response.data.success && Array.isArray(response.data.data?.users)) {
          const users = response.data.data.users
            .map((item: any) => item.user)
            .filter((u: any) => u && u._id !== user?.id);
          setSearchResult(users);
        }
      } catch (error) {
        console.error("User search failed:", error);
      } finally {
        setIsSearching(false);
      }
    };
    fetchUsers();
  }, [isModalOpen, userSearch, user?.id]);

  const handleStartConversation = async (recipientId: string) => {
    try {
      const response = await messagingAPI.getOrCreateConversation(recipientId);
      if (response.data.success) {
        const newConversation = response.data.data;
        // Check if conversation already exists in our list
        if (!conversations.some(c => c._id === newConversation._id)) {
          setConversations([newConversation, ...conversations]);
        }
        setSelectedConversation(newConversation);
        setIsModalOpen(false);
        setUserSearch("");
        setSearchResult([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start conversation");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipientId || !formMessage.trim()) {
      toast.error("Please select a recipient and enter a message");
      return;
    }

    setIsSending(true);
    try {
      // 1. Get or create conversation
      const convRes = await messagingAPI.getOrCreateConversation(selectedRecipientId);
      if (convRes.data.success) {
        const conversation = convRes.data.data;
        
        // 2. Send the message (with subject if supported, but usually it's just text)
        const messageText = formSubject ? `Subject: ${formSubject}\n\n${formMessage}` : formMessage;
        const msgRes = await messagingAPI.sendMessage({
          conversationId: conversation._id,
          text: messageText,
        });

        if (msgRes.data.success) {
          if (!conversations.some(c => c._id === conversation._id)) {
            setConversations([conversation, ...conversations]);
          }
          setSelectedConversation(conversation);
          setMessages(prev => [...prev, msgRes.data.data]);
          setIsModalOpen(false);
          setFormSubject("");
          setFormMessage("");
          setSelectedRecipientId("");
          toast.success("Message sent successfully!");
        }
      }
    } catch (error) {
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
          <p className="text-muted-foreground">Connect with casting directors and industry professionals</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black hover:bg-black/90 text-white rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-[#F1FBFB] border-none">
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-bold">Start New Conversation</DialogTitle>
                <DialogDescription className="text-sm text-slate-600">
                  Send a message to a casting director or industry professional
                </DialogDescription>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient" className="text-sm font-semibold">Recipient</Label>
                  <Select value={selectedRecipientId} onValueChange={setSelectedRecipientId}>
                    <SelectTrigger id="recipient" className="w-full bg-white border-slate-300 rounded-lg h-11">
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <Input 
                            placeholder="Search users..." 
                            className="h-8 pl-8 text-xs bg-slate-50 border-none"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      {isSearching ? (
                        <div className="p-4 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" /></div>
                      ) : searchResult.length > 0 ? (
                        searchResult.map((u) => (
                          <SelectItem key={u._id} value={u._id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={u.profilePicture} />
                                <AvatarFallback className="text-[10px]">{u.fullName[0]}</AvatarFallback>
                              </Avatar>
                              <span>{u.fullName}</span>
                              <span className="text-[10px] text-slate-400 uppercase">({u.role?.replace('_', ' ')})</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-500">No users found</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-semibold">Subject</Label>
                  <Input 
                    id="subject"
                    placeholder="Enter Subject" 
                    className="bg-white border-slate-300 rounded-lg h-11"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-semibold">Message</Label>
                  <Textarea 
                    id="message"
                    placeholder="Type your message" 
                    className="bg-white border-slate-300 rounded-xl min-h-[120px] resize-none"
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg px-6"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#5D45D6] hover:bg-[#4A36B1] text-white rounded-lg px-6"
                    disabled={isSending}
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="h-[calc(100%-4rem)]">
        <div className="flex h-full">
          {/* Contacts List (Conversations) */}
          <div className="w-80 border-r border-border flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-2">
                {conversations.length > 0 ? conversations.map((conv) => {
                  const otherParticipant = conv.participants?.find((p) => p._id !== user?.id);
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
                    const otherParticipant = selectedConversation.participants?.find((p) => p._id !== user?.id);
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
                    {messages.map((msg, idx: number) => (
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
