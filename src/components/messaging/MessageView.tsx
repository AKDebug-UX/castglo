import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Send, Loader2, MessageSquare, Search, ChevronLeft, ChevronDown, Smile, Paperclip, Phone, Video, MoreHorizontal, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { messagingAPI, userAPI } from "@/lib/api";
import { socketService } from "@/lib/socket";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Helper to extract an ID from any conversation/user object
const getId = (obj: any): string | undefined => obj?._id || obj?.id;

// ─── Sidebar ────────────────────────────────────────────────────────────────

const Sidebar = ({ conversations, selectedConversation, onSelectConversation, user, isMobileView, onNewMessage }) => {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter(conv => {
    const other = conv.participants?.find(p => p._id !== user?.id && p.id !== user?.id);
    return (other?.fullName || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className={cn(
      "flex flex-col bg-white border-r border-slate-100",
      isMobileView && selectedConversation && "hidden"
    )}>
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">Messages</h2>
          <button
            onClick={onNewMessage}
            className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder="Search conversations…"
            className="h-9 pl-9 bg-slate-50 border-none rounded-xl text-xs focus-visible:ring-1 focus-visible:ring-primary/30"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {filtered.length > 0 ? filtered.map(conv => {
            const other = conv.participants?.find(p => p._id !== user?.id && p.id !== user?.id);
            const isSelected = getId(selectedConversation) === getId(conv);
            const convId = getId(conv);
            return (
              <button
                key={convId}
                onClick={() => onSelectConversation(conv)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 relative group",
                  isSelected ? "bg-primary/5 border-r-2 border-primary" : "hover:bg-slate-50"
                )}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm">
                    <AvatarImage src={other?.profilePicture} />
                    <AvatarFallback className={cn(
                      "text-sm font-bold",
                      isSelected ? "bg-primary/10 text-primary" : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600"
                    )}>
                      {other?.fullName?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={cn(
                      "text-sm truncate",
                      isSelected ? "font-bold text-primary" : "font-semibold text-slate-800"
                    )}>
                      {other?.fullName || "Casting Team"}
                    </p>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-slate-400 ml-2 flex-shrink-0">
                        {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate leading-relaxed">
                    {conv.lastMessage?.text || <span className="text-slate-400 italic">No messages yet</span>}
                  </p>
                </div>
              </button>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">No conversations</p>
              <p className="text-xs text-slate-400 mt-1">Start by tapping "New"</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// ─── Chat View ───────────────────────────────────────────────────────────────

const ChatView = ({ selectedConversation, messages, user, isMobileView, onDeselectConversation, isSending, newMessage, onNewMessageChange, onSendMessage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const other = selectedConversation?.participants?.find(p => p._id !== user?.id && p.id !== user?.id);

  return (
    <div className={cn(
      "flex flex-col bg-[#F7F9FC] h-full overflow-hidden",
      isMobileView && !selectedConversation && "hidden"
    )}>
      {selectedConversation ? (
        <>
          {/* Chat Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3">
              {isMobileView && (
                <button onClick={onDeselectConversation} className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
              )}
              <div className="relative">
                <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                  <AvatarImage src={other?.profilePicture} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-bold text-sm">
                    {other?.fullName?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm leading-none mb-0.5">{other?.fullName || "Casting Team"}</p>
                <p className="text-[11px] text-emerald-500 font-medium">Active now</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
                <Video className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="px-4 py-6 space-y-1">
              {messages.map((msg, idx) => {
                const senderId = msg.senderId?._id || msg.senderId;
                const isSelf = senderId === user?.id;
                const prevMsg = messages[idx - 1];
                const prevSenderId = prevMsg?.senderId?._id || prevMsg?.senderId;
                const isGrouped = prevMsg && prevSenderId === senderId;
                const isLast = idx === messages.length - 1 || (messages[idx + 1]?.senderId?._id || messages[idx + 1]?.senderId) !== senderId;

                return (
                  <div
                    key={msg._id || idx}
                    className={cn(
                      "flex items-end gap-2",
                      isSelf ? "justify-end" : "justify-start",
                      !isGrouped && "mt-4"
                    )}
                  >
                    {/* Avatar for other user */}
                    {!isSelf && (
                      <div className="flex-shrink-0 w-7">
                        {isLast ? (
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={other?.profilePicture} />
                            <AvatarFallback className="text-[10px] bg-slate-200 text-slate-600 font-bold">
                              {other?.fullName?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                        ) : null}
                      </div>
                    )}

                    <div className={cn("flex flex-col max-w-[72%] md:max-w-[60%]", isSelf ? "items-end" : "items-start")}>
                      <div className={cn(
                        "px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words",
                        isSelf
                          ? cn(
                              "bg-primary text-white shadow-sm shadow-primary/20",
                              !isGrouped ? "rounded-2xl rounded-br-sm" : isLast ? "rounded-2xl rounded-br-sm" : "rounded-2xl"
                            )
                          : cn(
                              "bg-white text-slate-800 border border-slate-100 shadow-sm",
                              !isGrouped ? "rounded-2xl rounded-bl-sm" : isLast ? "rounded-2xl rounded-bl-sm" : "rounded-2xl"
                            )
                      )}>
                        {msg.text}
                      </div>
                      {isLast && (
                        <div className={cn("flex items-center gap-1 mt-1 px-1", isSelf ? "flex-row-reverse" : "flex-row")}>
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isSelf && <CheckCheck className="w-3 h-3 text-primary/60" />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Empty state */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center mb-4 shadow-sm">
                    <MessageSquare className="w-7 h-7 text-primary/40" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Start the conversation</p>
                  <p className="text-xs text-slate-400">Send your first message below</p>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-slate-100">
            <div className="flex items-end gap-2">
              <button className="flex-shrink-0 p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 mb-0.5">
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  placeholder="Type a message…"
                  value={newMessage}
                  onChange={e => onNewMessageChange(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), onSendMessage())}
                  disabled={isSending}
                  className="h-11 rounded-2xl bg-slate-50 border-slate-200 pr-10 text-sm focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 transition-all"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={onSendMessage}
                disabled={isSending || !newMessage.trim()}
                className={cn(
                  "flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 mb-0",
                  newMessage.trim()
                    ? "bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/30 scale-100"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                )}
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Empty state when no conversation selected */
        <div className="hidden md:flex flex-col items-center justify-center h-full text-center px-8">
          <div className="w-24 h-24 bg-white rounded-3xl border border-slate-100 flex items-center justify-center mb-6 shadow-lg shadow-slate-100">
            <MessageSquare className="w-11 h-11 text-primary/50" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Your messages</h3>
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
            Select a conversation from the sidebar to start chatting, or compose a new message.
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

interface MessageViewProps {
  title?: string;
  subtitle?: string;
}

export default function MessageView({ title = "Messages", subtitle }: MessageViewProps) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const talentId = searchParams.get("talentId");

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);

  // New message modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [preselectedUser, setPreselectedUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getConvId = (conv: any) => getId(conv);

  // ── Responsive ────────────────────────────────────────────────────────────

  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Click outside dropdown ──────────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Reset modal on close ────────────────────────────────────────────────

  useEffect(() => {
    if (!isModalOpen) {
      setUserSearch("");
      setSearchResult([]);
      setSelectedRecipientId("");
      setSelectedRecipient(null);
      setPreselectedUser(null);
      setFormSubject("");
      setFormMessage("");
      setIsDropdownOpen(false);
    }
  }, [isModalOpen]);

  // ── Fetch conversations ─────────────────────────────────────────────────

  const fetchConversations = async () => {
    try {
      const response = await messagingAPI.getMyConversations();
      if (response.data.success && Array.isArray(response.data.data)) {
        const convs = response.data.data;
        setConversations(convs);

        if (talentId) {
          const existingConv = convs.find(c =>
            c.participants?.some(p => getId(p) === talentId)
          );
          if (existingConv) {
            setSelectedConversation(existingConv);
          } else {
            setSelectedRecipientId(talentId);
            setIsModalOpen(true);
            try {
              const userRes = await userAPI.getOne(talentId);
              if (userRes.data?.success) {
                setPreselectedUser(userRes.data.data);
                setSelectedRecipient(userRes.data.data);
              }
            } catch (err) {
              console.error("Failed to fetch preselected user:", err);
            }
          }
          const newParams = new URLSearchParams(searchParams);
          newParams.delete("talentId");
          setSearchParams(newParams, { replace: true });
        } else if (convs.length > 0 && !selectedConversation && !isMobileView) {
          setSelectedConversation(convs[0]);
        }
      } else {
        setConversations([]);
      }
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchConversations(); }, []);

  // ── Socket ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) socketService.connect(token);

    // new_message: fired on the RECIPIENT's socket when someone else sends a message
    const handleNewMessage = (data: any) => {
      const message = data.message ?? data;
      if (!message) return;
      if (getConvId(selectedConversation) === message.conversationId) {
        setMessages(prev => {
          if (prev.some((m: any) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
      setConversations(prev =>
        prev.map((conv: any) =>
          getConvId(conv) === message.conversationId ? { ...conv, lastMessage: message } : conv
        )
      );
    };

    // message_sent: fired on the SENDER's socket as a delivery confirmation
    const handleMessageSent = (data: any) => {
      const message = data.message ?? data;
      if (!message) return;
      // Add to the message list if not already present (deduplication)
      if (getConvId(selectedConversation) === message.conversationId) {
        setMessages(prev => {
          if (prev.some((m: any) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
      // Always update the conversation's lastMessage for the sender too
      setConversations(prev =>
        prev.map((conv: any) =>
          getConvId(conv) === message.conversationId ? { ...conv, lastMessage: message } : conv
        )
      );
    };

    socketService.on("new_message", handleNewMessage);
    socketService.on("message_sent", handleMessageSent);
    return () => {
      socketService.off("new_message", handleNewMessage);
      socketService.off("message_sent", handleMessageSent);
    };
  }, [selectedConversation]);

  // ── Message polling ────────────────────────────────────────────────────

  useEffect(() => {
    const convId = getConvId(selectedConversation);
    if (!convId) return;

    let active = true;
    let timeoutId: NodeJS.Timeout;
    let requesting = false;

    const poll = async () => {
      if (!active || requesting) return;
      requesting = true;
      try {
        const response = await messagingAPI.getMessages(convId, { limit: 50 });
        if (response.data.success && Array.isArray(response.data.data)) {
          const msgs = response.data.data.reverse();
          setMessages(prev => {
            if (
              prev.length === msgs.length &&
              (prev as any[])[prev.length - 1]?._id === msgs[msgs.length - 1]?._id
            ) return prev;
            return msgs;
          });
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        requesting = false;
        if (active) {
          const interval = socketService.isConnected() ? 60000 : 20000;
          timeoutId = setTimeout(poll, interval);
        }
      }
    };

    poll();
    return () => {
      active = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [selectedConversation]);

  // ── Send message (existing conversation) ──────────────────────────────

  const handleSendMessage = async () => {
    const convId = getConvId(selectedConversation);
    if (!convId || !newMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await messagingAPI.sendMessage({ conversationId: convId, text: newMessage });
      if (response.data.success) {
        setMessages(prev => {
          if (prev.some((m: any) => m._id === response.data.data._id)) return prev;
          return [...prev, response.data.data];
        });
        setNewMessage("");
        setConversations((prev: any[]) =>
          prev.map(c => getConvId(c) === convId ? { ...c, lastMessage: response.data.data } : c)
        );
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error("You can only message casting directors if your application is shortlisted or accepted.");
      } else {
        toast.error("Failed to send message");
      }
    } finally {
      setIsSending(false);
    }
  };

  // ── User search for new message modal ─────────────────────────────────

  useEffect(() => {
    if (!isModalOpen) return;
    setIsSearching(true);
    const id = setTimeout(async () => {
      try {
        const response = await userAPI.search({ query: userSearch, limit: 20 });
        if (response.data.success && Array.isArray(response.data.data?.users)) {
          setSearchResult(
            response.data.data.users
              .map((item: any) => item.user)
              .filter((u: any) => u && getId(u) !== user?.id)
          );
        } else if (response.data.success && Array.isArray(response.data.data)) {
          setSearchResult(response.data.data.filter((u: any) => getId(u) !== user?.id));
        }
      } catch {
        console.error("User search failed");
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [isModalOpen, userSearch, user?.id]);

  // ── Send first message (new conversation via modal) ────────────────────

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipientId || !formMessage.trim()) {
      toast.error("Please select a recipient and enter a message");
      return;
    }

    setIsSending(true);
    try {
      const convRes = await messagingAPI.getOrCreateConversation(selectedRecipientId);
      console.log("[MessageView] getOrCreateConversation response:", JSON.stringify(convRes.data, null, 2));

      if (convRes.data.success) {
        const raw = convRes.data.data;

        // Walk every known response shape to resolve conversation & its ID
        const conversation =
          (raw?.conversation?._id || raw?.conversation?.id ? raw.conversation : null) ??
          (raw?._id || raw?.id ? raw : null) ??
          null;

        const conversationId =
          getId(conversation) ??
          raw?.conversationId ??
          getId(raw) ??
          null;

        console.log("[MessageView] resolved conversationId:", conversationId);

        if (!conversationId) {
          console.error("[MessageView] Could not extract conversation ID from:", raw);
          toast.error("Could not identify conversation. Please try again.");
          return;
        }

        const messageText = formSubject ? `Subject: ${formSubject}\n\n${formMessage}` : formMessage;
        const msgRes = await messagingAPI.sendMessage({ conversationId, text: messageText });

        if (msgRes.data.success) {
          const resolvedConversation = conversation ?? { _id: conversationId };
          if (!conversations.some((c: any) => getConvId(c) === conversationId)) {
            setConversations((prev: any[]) => [resolvedConversation, ...prev]);
          }
          setSelectedConversation(resolvedConversation);
          setMessages(prev => [...prev, msgRes.data.data]);
          setIsModalOpen(false);
          setFormSubject("");
          setFormMessage("");
          setSelectedRecipientId("");
          setSelectedRecipient(null);
          toast.success("Message sent successfully!");
        }
      }
    } catch (error) {
      console.error("[MessageView] handleFormSubmit error:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full md:h-screen">
      {/* New Message Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger className="hidden" />
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-2xl">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="text-lg font-bold text-slate-900">New Message</DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-0.5">
              Start a conversation with an industry professional
            </DialogDescription>
          </div>
          <div className="p-6 space-y-4 bg-white">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Recipient picker */}
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">To</Label>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl h-11 px-3.5 text-sm text-left hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  {selectedRecipient ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedRecipient.profilePicture} />
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                          {selectedRecipient.fullName?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-slate-800">{selectedRecipient.fullName}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full capitalize">
                        {selectedRecipient.role?.replace("_", " ")}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400">Select recipient…</span>
                  )}
                  <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-[100] mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                          placeholder="Search users…"
                          className="h-8 pl-8 text-xs bg-slate-50 border-none rounded-lg focus-visible:ring-0"
                          value={userSearch}
                          onChange={e => setUserSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto p-1">
                      {isSearching ? (
                        <div className="p-4 text-center">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" />
                        </div>
                      ) : (
                        <>
                          {preselectedUser && !searchResult.some((u: any) => getId(u) === getId(preselectedUser)) && (
                            <RecipientOption
                              user={preselectedUser}
                              onClick={() => {
                                setSelectedRecipientId(getId(preselectedUser));
                                setSelectedRecipient(preselectedUser);
                                setIsDropdownOpen(false);
                              }}
                            />
                          )}
                          {searchResult.length > 0 ? (
                            searchResult.map((u: any) => (
                              <RecipientOption
                                key={getId(u)}
                                user={u}
                                onClick={() => {
                                  setSelectedRecipientId(getId(u));
                                  setSelectedRecipient(u);
                                  setIsDropdownOpen(false);
                                }}
                              />
                            ))
                          ) : !preselectedUser ? (
                            <p className="text-center text-xs text-slate-400 py-4">No users found</p>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Subject</Label>
                <Input
                  placeholder="e.g. Regarding your casting call…"
                  className="h-11 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40"
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Message</Label>
                <Textarea
                  placeholder="Write your message…"
                  className="bg-slate-50 border-slate-200 rounded-xl min-h-[110px] resize-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40"
                  value={formMessage}
                  onChange={e => setFormMessage(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 h-11 rounded-xl text-slate-600 hover:bg-slate-100"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-md shadow-primary/20"
                  disabled={isSending}
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Send
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main layout */}
      <div className="flex-1 grid md:grid-cols-[300px_1fr] overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white animate-fade-in">
        <Sidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          user={user}
          isMobileView={isMobileView}
          onNewMessage={() => setIsModalOpen(true)}
        />
        <ChatView
          selectedConversation={selectedConversation}
          messages={messages}
          user={user}
          isMobileView={isMobileView}
          onDeselectConversation={() => setSelectedConversation(null)}
          isSending={isSending}
          newMessage={newMessage}
          onNewMessageChange={setNewMessage}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

// ─── Recipient Option (small reusable piece) ─────────────────────────────────

function RecipientOption({ user, onClick }: { user: any; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-slate-50 rounded-lg transition-colors"
    >
      <Avatar className="h-7 w-7 flex-shrink-0">
        <AvatarImage src={user.profilePicture} />
        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
          {user.fullName?.[0] || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-semibold text-slate-800 truncate text-sm">{user.fullName}</p>
        <p className="text-[10px] text-slate-400 capitalize">{user.role?.replace("_", " ")}</p>
      </div>
    </button>
  );
}
