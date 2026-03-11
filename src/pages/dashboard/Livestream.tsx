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
  Monitor
} from "lucide-react";
import { livestreamAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function LivestreamPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [streamData, setStreamData] = useState<any>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    const fetchStream = async () => {
      if (!id) return;
      try {
        const response = await livestreamAPI.getActive(); // Simplified for now
        if (response.data.success && Array.isArray(response.data.data)) {
          const stream = response.data.data.find((s: any) => s._id === id);
          if (stream) {
            setStreamData(stream);
            setParticipants([
              { id: user?._id, name: user?.fullName, role: user?.role, isSelf: true },
              { id: "mock-1", name: "Casting Director Sarah", role: "casting_director" }
            ]);
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
    setIsJoined(true);
    toast.success("Joined the virtual audition");
  };

  const handleLeave = () => {
    if (window.confirm("Are you sure you want to leave the audition?")) {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Connecting to virtual audition...</p>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
        <Button variant="ghost" className="mb-8" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <div>
              <Badge className="mb-2 bg-primary/10 text-primary border-none">Ready to Join?</Badge>
              <h1 className="text-3xl font-bold">{streamData?.title || "Virtual Audition"}</h1>
              <p className="text-muted-foreground mt-2">
                {streamData?.description || "Join the live virtual audition session with industry professionals."}
              </p>
            </div>

            <Card className="bg-muted/30 border-none">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-success" />
                  <span>Secure, encrypted connection</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  <span>2 participants currently in room</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1" onClick={handleJoin}>
                Join Now
              </Button>
              <Button variant="outline" size="lg" className="flex-1" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </div>

          <div className="aspect-video bg-black rounded-2xl relative overflow-hidden flex items-center justify-center">
            {isCamOn ? (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                 <Video className="w-12 h-12 text-muted-foreground" />
                 <p className="absolute bottom-4 text-xs text-white/60">Camera Preview (Mocked)</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Avatar className="w-20 h-20 border-4 border-white/10">
                  <AvatarFallback className="text-2xl">{user?.fullName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <p className="text-sm text-white/60">Camera is off</p>
              </div>
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full h-10 w-10 ${!isMicOn ? "bg-destructive text-white hover:bg-destructive/90" : "text-white hover:bg-white/10"}`}
                onClick={() => setIsMicOn(!isMicOn)}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full h-10 w-10 ${!isCamOn ? "bg-destructive text-white hover:bg-destructive/90" : "text-white hover:bg-white/10"}`}
                onClick={() => setIsCamOn(!isCamOn)}
              >
                {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-white overflow-hidden -m-4 lg:-m-6">
      {/* Stream Header */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-destructive border-destructive animate-pulse bg-destructive/5 uppercase tracking-wider text-[10px]">
            Live
          </Badge>
          <h2 className="font-medium text-sm truncate max-w-[200px]">{streamData?.title}</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4 px-3 py-1 bg-white/5 rounded-full text-xs text-white/60">
            <Users className="w-3.5 h-3.5" />
            {participants.length} Participants
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/5">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
          {/* Main Remote Participant (Casting Director) */}
          <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-white/5 group shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
               <Avatar className="w-24 h-24 border-4 border-white/5 shadow-2xl">
                 <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" />
                 <AvatarFallback className="bg-primary/20 text-primary text-3xl">CD</AvatarFallback>
               </Avatar>
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
               <Badge className="bg-black/40 backdrop-blur-md border-none px-2 py-1 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                 Sarah Mitchell (Casting Director)
               </Badge>
            </div>
          </div>

          {/* Self View */}
          <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-white/5 group shadow-2xl">
             <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 backdrop-blur-3xl">
               {isCamOn ? (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800">
                   <Video className="w-12 h-12 text-white/20" />
                   <p className="mt-2 text-[10px] text-white/20 uppercase tracking-widest">Self View Mocked</p>
                 </div>
               ) : (
                 <Avatar className="w-24 h-24 border-4 border-white/5 shadow-2xl">
                   <AvatarFallback className="bg-secondary/20 text-secondary text-3xl">{user?.fullName?.[0] || "U"}</AvatarFallback>
                 </Avatar>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             <div className="absolute bottom-4 left-4 flex items-center gap-2">
               <Badge className="bg-black/40 backdrop-blur-md border-none px-2 py-1 flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${isMicOn ? "bg-success" : "bg-destructive"}`} />
                 {user?.fullName} (You)
               </Badge>
            </div>
          </div>
        </div>

        {/* Sidebar - Chat/Participants (Hidden on mobile) */}
        <div className="w-80 border-l border-white/5 bg-slate-900/30 hidden lg:flex flex-col">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Live Chat
            </h3>
          </div>
          <div className="flex-1 p-4 overflow-auto space-y-4">
            <div className="text-xs text-center text-white/40 italic py-8">
               Chat is enabled. Messages are visible to all participants.
            </div>
            {/* Mock messages */}
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-primary">System</p>
              <p className="text-[12px] text-white/80 bg-white/5 p-2 rounded-lg rounded-tl-none">
                Virtual audition started. Please ensure your camera and microphone are ready.
              </p>
            </div>
          </div>
          <div className="p-4 bg-slate-900/50">
             <div className="flex gap-2">
               <input 
                 type="text" 
                 placeholder="Type a message..." 
                 className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50"
               />
               <Button size="icon" className="h-8 w-8 rounded-lg">
                 <MessageSquare className="w-4 h-4" />
               </Button>
             </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="h-20 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-between px-8">
        <div className="flex items-center gap-2 w-1/4">
          <div className="hidden sm:block">
            <p className="text-xs font-semibold truncate">{streamData?.title}</p>
            <p className="text-[10px] text-white/40">ID: {id?.slice(0, 8)}...</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full h-12 w-12 transition-all ${!isMicOn ? "bg-destructive text-white hover:bg-destructive/90" : "bg-white/10 text-white hover:bg-white/20"}`}
            onClick={() => setIsMicOn(!isMicOn)}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`rounded-full h-12 w-12 transition-all ${!isCamOn ? "bg-destructive text-white hover:bg-destructive/90" : "bg-white/10 text-white hover:bg-white/20"}`}
            onClick={() => setIsCamOn(!isCamOn)}
          >
            {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-12 w-12 bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <Monitor className="w-5 h-5" />
          </Button>
          <Button 
            variant="destructive" 
            size="icon" 
            className="rounded-full h-12 w-12 shadow-lg shadow-destructive/20"
            onClick={handleLeave}
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center justify-end gap-2 w-1/4">
           <Button variant="ghost" size="icon" className="h-10 w-10 text-white/60 hover:text-white hover:bg-white/5 lg:hidden">
             <MessageSquare className="w-5 h-5" />
           </Button>
           <Button variant="ghost" size="icon" className="h-10 w-10 text-white/60 hover:text-white hover:bg-white/5">
             <MoreVertical className="w-5 h-5" />
           </Button>
        </div>
      </div>
    </div>
  );
}
