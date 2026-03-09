import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Send, Loader2, MessageSquare, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { messagingAPI, profileAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfessionalMessages() {
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
  const [talentSearch, setTalentSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchConversations = async () => {
    try {
      const response = await messagingAPI.getMyConversations();
      if (response.data.success && Array.isArray(response.data.data)) {
        setConversations(response.data.data);
        if (response.data.data.length > 0 && !selectedConversation) {
          setSelectedConversation(response.data.data[0]);
        }
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
        setMessages([]);
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

  const handleSearchTalent = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setTalentSearch(e.target.value);
    setHasSearched(true);
    if (e.target.value.length < 2) {
      setSearchResult([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await profileAPI.search({ query: e.target.value, profileType: 'talent', limit: 10 });
      if (response.data.success && Array.isArray(response.data.data)) {
        setSearchResult(response.data.data);
      }
    } catch (error) {
      console.error("Talent search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartConversation = async (talentId: string) => {
    try {
      const response = await messagingAPI.createConversation({ recipientId: talentId });
      if (response.data.success) {
        const newConversation = response.data.data;
        setConversations([newConversation, ...conversations]);
        setSelectedConversation(newConversation);
        setIsModalOpen(false);
        setTalentSearch("");
        setSearchResult([]);
        toast.success("Conversation started!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start conversation");
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
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a new conversation</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for talent by name..."
                className="pl-10"
                value={talentSearch}
                onChange={handleSearchTalent}
              />
            </div>
            <ScrollArea className="h-[300px] mt-4">
              <div className="space-y-2">
                {isSearching ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin" /></div>
                ) : searchResult.length > 0 ? (
                  searchResult.map(talent => (
                    <div
                      key={talent._id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => handleStartConversation(talent.user._id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={talent.user.profilePicture} />
                          <AvatarFallback>{talent.user.fullName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{talent.user.fullName}</p>
                          <p className="text-sm text-muted-foreground">{talent.headline || 'Talent'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : hasSearched ? (
                  <div className="text-center text-sm text-muted-foreground py-4">No talent found.</div>
                ) : null}
              </div>
            </ScrollArea>
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
                        <AvatarFallback>{otherParticipant?.fullName?.[0] || "T"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{otherParticipant?.fullName || "Talent"}</p>
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
                    No active conversations.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
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
                          <p className="font-medium">{otherParticipant?.fullName}</p>
                          <p className="text-xs text-muted-foreground">Direct Message</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <ScrollArea className="flex-1 p-4 bg-muted/20">
                  <div className="space-y-4">
                    {messages.map((msg, idx: number) => (
                      <div
                        key={idx}
                        ref={idx === messages.length - 1 ? scrollRef : null}
                        className={cn("flex", msg.sender === user?.id ? "justify-end" : "justify-start")}
                      >
                        <div className={cn(
                          "max-w-[70%] rounded-lg p-3",
                          msg.sender === user?.id ? "bg-primary text-primary-foreground" : "bg-card border"
                        )}>
                          <p className="text-sm">{msg.text}</p>
                          <p className={cn(
                            "text-xs mt-1",
                            msg.sender === user?.id ? "text-primary-foreground/60" : "text-muted-foreground"
                          )}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center py-12 text-sm text-muted-foreground">Send a message to start the conversation.</div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-border bg-card">
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
              <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/20">
                <div className="text-center space-y-2">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted/30" />
                  <p>Select a conversation or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
