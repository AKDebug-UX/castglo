import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Send, MoreVertical, Loader2, MessageSquare, Search } from "lucide-react";
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

interface MessageViewProps {
  title?: string;
  subtitle?: string;
}

export default function MessageView({ title = "Messages", subtitle }: MessageViewProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // New Message Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResult, setSearchResult] = useState<any[]>([]);
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
        } else if (response.data.success && Array.isArray(response.data.data)) {
          // Fallback for different API response structures
          setSearchResult(response.data.data.filter((u: any) => u._id !== user?.id));
        }
      } catch (error) {
        console.error("User search failed:", error);
      } finally {
        setIsSearching(false);
      }
    };
    fetchUsers();
  }, [isModalOpen, userSearch, user?.id]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipientId || !formMessage.trim()) {
      toast.error("Please select a recipient and enter a message");
      return;
    }

    setIsSending(true);
    try {
      const convRes = await messagingAPI.getOrCreateConversation(selectedRecipientId);
      if (convRes.data.success) {
        const conversation = convRes.data.data;
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
    <div className="flex flex-col h-screen gap-4">
      {subtitle && (
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
      )}
      <div className="grid grid-cols-[320px_1fr] flex-1 min-h-0 animate-fade-in border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        {/* Sidebar: Conversations List */}
        <div className="flex flex-col border-r border-slate-200 bg-white">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="rounded-full hover:bg-slate-100">
                  <Plus className="w-5 h-5 text-slate-600" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-[#F1FBFB] border-none">
                <div className="p-6 space-y-6">
                  <div className="space-y-1">
                    <DialogTitle className="text-xl font-bold">Start New Conversation</DialogTitle>
                    <DialogDescription className="text-sm text-slate-600">
                      Send a message to a industry professional
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
                                    <AvatarFallback className="text-[10px]">{u.fullName?.[0]}</AvatarFallback>
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
                        className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6"
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
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {conversations.length > 0 ? conversations.map((conv) => {
                const otherParticipant = conv.participants?.find((p: any) => p._id !== user?.id);
                const isSelected = selectedConversation?._id === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => setSelectedConversation(conv)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                      isSelected 
                        ? "bg-[#F0F7FF] shadow-sm" 
                        : "hover:bg-slate-50"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={otherParticipant?.profilePicture} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                          {otherParticipant?.fullName?.[0] || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={cn("font-bold truncate text-sm", isSelected ? "text-blue-600" : "text-slate-800")}>
                          {otherParticipant?.fullName || "Casting Team"}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                          {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ""}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate leading-relaxed">
                        {conv.lastMessage?.text || "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              }) : (
                <div className="p-8 text-center">
                  <MessageSquare className="w-10 h-10 mx-auto text-slate-200 mb-3" />
                  <p className="text-sm text-slate-400">No conversations yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content: Message View */}
        <div className="flex flex-col bg-[#E6F7FF]">
          {selectedConversation ? (
            <>
              {/* Message Header */}
              <div className="h-[72px] flex items-center justify-between px-6 border-b border-slate-200 bg-white shadow-sm z-10">
                {(() => {
                  const otherParticipant = selectedConversation.participants?.find((p: any) => p._id !== user?.id);
                  return (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-slate-100">
                        <AvatarImage src={otherParticipant?.profilePicture} />
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                          {otherParticipant?.fullName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-none mb-1">{otherParticipant?.fullName || "Casting Team"}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{otherParticipant?.role?.replace('_', ' ') || "Producer"}</p>
                      </div>
                    </div>
                  );
                })()}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-slate-600">
                    <Search className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  {messages.map((msg, idx: number) => {
                    const senderId = msg.senderId._id;
                    const isSelf = senderId === user?.id;
                    console.log("isSelf:", senderId);
                    return (
                      <div 
                        key={idx} 
                        className={cn(
                          "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                          isSelf ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "max-w-[75%] space-y-1",
                          isSelf ? "items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "px-4 py-3 rounded-2xl text-sm shadow-sm",
                            isSelf 
                              ? "bg-primary text-white rounded-br-none" 
                              : "bg-white text-slate-800 rounded-bl-none border border-slate-100"
                          )}>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          </div>
                          <p className={cn(
                            "text-[10px] font-medium px-1",
                            isSelf ? "text-slate-500 text-right" : "text-slate-400 text-left"
                          )}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 opacity-60">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                        <MessageSquare className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-medium">Start the conversation</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-slate-200">
                <div className="max-w-4xl mx-auto relative flex items-center gap-2">
                  <div className="relative flex-1 group">
                    <Input 
                      placeholder="Type your message..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                      className="h-12 rounded-2xl bg-slate-50 border-slate-200 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:border-blue-400 transition-all pr-12 text-sm"
                      disabled={isSending}
                    />
                    <Button 
                      size="icon" 
                      onClick={handleSendMessage}
                      disabled={isSending || !newMessage.trim()}
                      className={cn(
                        "absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl transition-all duration-300",
                        newMessage.trim() 
                          ? "bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20" 
                          : "bg-slate-100 text-slate-300"
                      )}
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white/50 backdrop-blur-sm">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-100 border border-white">
                <MessageSquare className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Select a conversation</h2>
              <p className="text-slate-500 max-w-xs mx-auto leading-relaxed">
                Choose from your existing chats on the left or start a new conversation to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
