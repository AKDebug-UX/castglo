import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  Users, 
  Settings,
  MoreVertical,
  Loader2,
  ArrowLeft,
  Shield,
  Monitor,
  Hand,
  Smile,
  Layout,
  Maximize,
  UserPlus,
  Info,
  X,
  Play
} from "lucide-react";
import { livestreamAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LivestreamPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [streamData, setStreamData] = useState<any>(null);
  const [tokens, setTokens] = useState<{ rtcToken: string, rtmToken: string } | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [layout, setLayout] = useState<"grid" | "spotlight" | "sidebar">("grid");
  const [participants, setParticipants] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const fetchStream = async () => {
      if (!id) return;
      try {
        const response = await livestreamAPI.getAll();
        if (response.data.success && Array.isArray(response.data.data)) {
          const stream = response.data.data.find((s: any) => s._id === id);
          if (stream) {
            setStreamData(stream);
            
            // Build real participants list from stream data
            const realParticipants = [];
            
            // Add host
            if (stream.hostId) {
              realParticipants.push({
                id: stream.hostId._id,
                name: stream.hostId.fullName,
                role: "host",
                isSelf: user?._id === stream.hostId._id,
                isMicOn: true,
                isCamOn: true
              });
            }

            // Add co-hosts
            if (Array.isArray(stream.coHosts)) {
              stream.coHosts.forEach((coHost: any) => {
                realParticipants.push({
                  id: coHost._id,
                  name: coHost.fullName,
                  role: "co-host",
                  isSelf: user?._id === coHost._id,
                  isMicOn: true,
                  isCamOn: true
                });
              });
            }

            // If user is not host or co-host, add them as participant
            const isUserInList = realParticipants.some(p => p.id === user?._id);
            if (!isUserInList && user) {
              realParticipants.push({
                id: user._id,
                name: user.fullName,
                role: user.role,
                isSelf: true,
                isMicOn: true,
                isCamOn: true
              });
            }

            setParticipants(realParticipants);
          } else {
            toast.error("Stream not found or ended");
            navigate(-1);
          }
        }
      } catch (error) {
        console.error("Failed to fetch stream:", error);
        toast.error("Failed to load stream details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStream();
  }, [id, user]);

  const handleJoin = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const isHost = user?._id === streamData?.hostId?._id;
      let response;
      
      if (isHost) {
        response = await livestreamAPI.start(id);
      } else {
        response = await livestreamAPI.join(id);
      }

      if (response.data.success) {
        setTokens({
          rtcToken: response.data.rtcToken,
          rtmToken: response.data.rtmToken
        });
        setIsJoined(true);
        toast.success(isHost ? "Started the audition session" : "Joined the virtual audition");
      }
    } catch (error: any) {
      console.error("Failed to join stream:", error);
      toast.error(error.response?.data?.message || "Failed to connect to the session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = async () => {
    const isHost = user?._id === streamData?.hostId?._id;
    const confirmMsg = isHost 
      ? "Do you want to end the audition for everyone or just leave?" 
      : "Are you sure you want to leave the audition?";
    
    if (window.confirm(confirmMsg)) {
      if (id) {
        try {
          if (isHost) {
            await livestreamAPI.end(id);
            toast.success("Audition session ended");
          } else {
            await livestreamAPI.leave(id);
          }
        } catch (error) {
          console.error("Failed to leave/end stream properly:", error);
        }
      }
      navigate(-1);
    }
  };

  const [chatInput, setChatInput] = useState("");

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: user?.fullName,
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setChatInput("");
  };

  const sendReaction = (emoji: string) => {
    toast(`Sent ${emoji} reaction`, { duration: 1000 });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4 bg-slate-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Connecting to virtual audition...</p>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-5xl w-full grid gap-12 lg:grid-cols-[1fr,400px] items-center">
          <div className="space-y-8">
            <div className="aspect-video bg-slate-900 rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl group">
              {isCamOn ? (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                   <Video className="w-16 h-16 text-slate-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                   <div className="absolute bottom-6 left-6 flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white/20">
                        <AvatarFallback>{user?.fullName?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-lg drop-shadow-md">{user?.fullName}</span>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Avatar className="w-32 h-32 border-4 border-white/5 bg-slate-800">
                    <AvatarFallback className="text-4xl">{user?.fullName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <p className="text-slate-400 font-medium">Camera is off</p>
                </div>
              )}
              
              <div className="absolute bottom-6 right-6 flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full h-12 w-12 backdrop-blur-md transition-all ${!isMicOn ? "bg-destructive text-white hover:bg-destructive/90" : "bg-white/10 text-white hover:bg-white/20"}`}
                  onClick={() => setIsMicOn(!isMicOn)}
                >
                  {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full h-12 w-12 backdrop-blur-md transition-all ${!isCamOn ? "bg-destructive text-white hover:bg-destructive/90" : "bg-white/10 text-white hover:bg-white/20"}`}
                  onClick={() => setIsCamOn(!isCamOn)}
                >
                  {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-white/10 text-white backdrop-blur-md hover:bg-white/20">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="text-center lg:text-left space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">Ready to join?</h1>
              <p className="text-slate-400 text-lg">{streamData?.title || "Virtual Audition Session"}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4 text-sm text-slate-300">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">{participants.length} people in this call</p>
                  <p className="text-xs text-slate-500">
                    {streamData?.hostId?.fullName ? `Host: ${streamData.hostId.fullName}` : "Loading host..."}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between text-slate-400 hover:text-white hover:bg-white/5 h-12 rounded-xl border border-white/5">
                    <span className="flex items-center gap-2">
                      <Layout className="w-4 h-4" />
                      Check your audio and video
                    </span>
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-slate-900 border-white/10 text-white">
                  <DropdownMenuLabel>Devices</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">Default Microphone</DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">Integrated Camera</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-3">
              <Button size="lg" className="h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20" onClick={handleJoin}>
                Join now
              </Button>
              <Button variant="ghost" size="lg" className="h-14 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden -m-4 lg:-m-6">
      {/* Stream Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Video Area */}
        <div className={`flex-1 transition-all duration-500 p-4 ${showSidebar ? "mr-0" : ""}`}>
          <div className={`h-full grid gap-4 ${
            layout === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2" 
              : layout === "spotlight" 
                ? "grid-cols-1" 
                : "grid-cols-[1fr,300px]"
          }`}>
            {/* Participants rendering logic would go here - Mocking for now */}
            {participants.map((p, idx) => (
              <div key={p.id} className={`relative bg-slate-900 rounded-3xl overflow-hidden border border-white/5 group shadow-2xl transition-all duration-500 ${
                layout === "spotlight" && !p.isSelf ? "hidden" : ""
              }`}>
                {p.isCamOn ? (
                  <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                    <Video className="w-16 h-16 text-white/5" />
                    {/* Mock video content */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <Avatar className="w-24 h-24 border-4 border-white/5 shadow-2xl">
                      <AvatarFallback className="bg-primary/20 text-primary text-3xl">{p.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
                
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
                    {!p.isMicOn && <MicOff className="w-3.5 h-3.5 text-destructive" />}
                    <span className="text-xs font-medium">{p.name} {p.isSelf ? "(You)" : ""}</span>
                    {p.role === "casting_director" && <Shield className="w-3 h-3 text-primary fill-primary/20" />}
                  </div>
                </div>

                {/* Speaker indicator (Mock) */}
                {idx === 1 && (
                  <div className="absolute inset-0 border-2 border-primary rounded-3xl pointer-events-none animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Unified Sidebar (Chat & Participants) */}
        <div className={`transition-all duration-500 ease-in-out border-l border-white/10 bg-slate-900/50 backdrop-blur-3xl flex flex-col ${
          showSidebar ? "w-96 translate-x-0" : "w-0 translate-x-full overflow-hidden border-none"
        }`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="p-2 border-b border-white/5">
              <TabsList className="w-full bg-transparent p-1">
                <TabsTrigger value="chat" className="flex-1 rounded-lg data-[state=active]:bg-white/10">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="people" className="flex-1 rounded-lg data-[state=active]:bg-white/10">
                  <Users className="w-4 h-4 mr-2" />
                  People
                </TabsTrigger>
                <TabsTrigger value="info" className="flex-1 rounded-lg data-[state=active]:bg-white/10">
                  <Info className="w-4 h-4 mr-2" />
                  Details
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="chat" className="m-0 h-full flex flex-col p-4">
                  <div className="flex-1 space-y-4">
                    <div className="text-center py-8 px-4">
                      <div className="bg-white/5 rounded-2xl p-4 inline-block mb-3">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-xs text-slate-400">Messages are secure and only visible to participants in this call.</p>
                    </div>
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`space-y-1 ${msg.isSelf ? "text-right" : ""}`}>
                        <p className={`text-[11px] font-bold ${msg.isSelf ? "text-primary" : "text-slate-400"}`}>
                          {msg.sender}
                        </p>
                        <p className={`text-sm text-slate-300 p-3 rounded-2xl ${
                          msg.isSelf ? "bg-primary/20 rounded-tr-none" : "bg-white/5 rounded-tl-none"
                        }`}>
                          {msg.text}
                        </p>
                        <p className="text-[10px] text-slate-500">{msg.timestamp}</p>
                      </div>
                    ))}
                    {chatMessages.length === 0 && (
                      <div className="text-center py-12 text-slate-500 text-sm italic">
                        No messages yet. Start the conversation!
                      </div>
                    )}
                  </div>
                <div className="mt-4 flex gap-2">
                  <Input 
                    placeholder="Send a message" 
                    className="bg-white/5 border-white/10 rounded-xl h-11 focus-visible:ring-primary"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button 
                    size="icon" 
                    className="h-11 w-11 rounded-xl shrink-0"
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="people" className="m-0 p-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10 h-12 rounded-xl mb-4">
                  <UserPlus className="w-4 h-4 mr-3" />
                  Add people
                </Button>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2 mb-2">In Call</p>
                {participants.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-white/10 text-xs">{p.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{p.name} {p.isSelf ? "(You)" : ""}</p>
                        <p className="text-[10px] text-slate-500 capitalize">{p.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        {!p.isMicOn ? <MicOff className="w-3.5 h-3.5 text-destructive" /> : <Mic className="w-3.5 h-3.5 text-slate-400" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Modern Control Bar (Meet Style) */}
      <div className="h-24 bg-slate-900/80 backdrop-blur-3xl border-t border-white/10 flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-4 w-1/4">
          <div className="hidden md:block">
            <p className="text-sm font-bold truncate max-w-[200px]">{streamData?.title}</p>
            <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{id?.slice(0, 4)}-{id?.slice(4, 8)}-{id?.slice(8, 12)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/5">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full h-12 w-12 transition-all duration-300 ${!isMicOn ? "bg-destructive text-white hover:bg-destructive/90" : "hover:bg-white/10 text-white"}`}
              onClick={() => setIsMicOn(!isMicOn)}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full h-12 w-12 transition-all duration-300 ${!isCamOn ? "bg-destructive text-white hover:bg-destructive/90" : "hover:bg-white/10 text-white"}`}
              onClick={() => setIsCamOn(!isCamOn)}
            >
              {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full h-12 w-12 transition-all ${isHandRaised ? "bg-yellow-500 text-white" : "bg-white/5 text-white hover:bg-white/10"}`}
                  onClick={() => setIsHandRaised(!isHandRaised)}
                >
                  <Hand className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-white/10 text-white">
                <DropdownMenuItem onClick={() => sendReaction("👋")}>Raise Hand</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <div className="flex p-2 gap-2">
                  {["👏", "💖", "😂", "😮", "😢"].map(emoji => (
                    <Button key={emoji} variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => sendReaction(emoji)}>
                      {emoji}
                    </Button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full h-12 w-12 transition-all ${isScreenSharing ? "bg-success text-white" : "bg-white/5 text-white hover:bg-white/10"}`}
              onClick={() => setIsScreenSharing(!isScreenSharing)}
            >
              <Monitor className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-white/5 text-white hover:bg-white/10">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white w-56">
                <DropdownMenuLabel>Layout</DropdownMenuLabel>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setLayout("grid")}>
                  <Layout className="w-4 h-4 mr-2" /> Grid view
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setLayout("spotlight")}>
                  <Maximize className="w-4 h-4 mr-2" /> Spotlight
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button 
            variant="destructive" 
            size="icon" 
            className="rounded-full h-12 w-14 shadow-2xl shadow-destructive/20 hover:scale-105 active:scale-95 transition-all"
            onClick={handleLeave}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex items-center justify-end gap-2 w-1/4">
           <Button 
             variant="ghost" 
             size="icon" 
             className={`h-12 w-12 rounded-full transition-all ${activeTab === "info" && showSidebar ? "bg-primary/20 text-primary" : "text-slate-400 hover:text-white"}`}
             onClick={() => { setShowSidebar(true); setActiveTab("info"); }}
           >
             <Info className="w-5 h-5" />
           </Button>
           <Button 
             variant="ghost" 
             size="icon" 
             className={`h-12 w-12 rounded-full transition-all ${activeTab === "people" && showSidebar ? "bg-primary/20 text-primary" : "text-slate-400 hover:text-white"}`}
             onClick={() => { setShowSidebar(true); setActiveTab("people"); }}
           >
             <Users className="w-5 h-5" />
           </Button>
           <Button 
             variant="ghost" 
             size="icon" 
             className={`h-12 w-12 rounded-full transition-all ${activeTab === "chat" && showSidebar ? "bg-primary/20 text-primary" : "text-slate-400 hover:text-white"}`}
             onClick={() => { setShowSidebar(true); setActiveTab("chat"); }}
           >
             <div className="relative">
               <MessageSquare className="w-5 h-5" />
               <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
             </div>
           </Button>
           {showSidebar && (
             <Button 
               variant="ghost" 
               size="icon" 
               className="h-12 w-12 rounded-full text-slate-400 hover:text-white ml-2"
               onClick={() => setShowSidebar(false)}
             >
               <X className="w-5 h-5" />
             </Button>
           )}
        </div>
      </div>
    </div>
  );
}

