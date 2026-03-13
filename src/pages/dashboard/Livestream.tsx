import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteUser } from "agora-rtc-sdk-ng";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Maximize,
  UserPlus,
  Info,
  Play,
  Share2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Flag,
  UserX,
  Heart,
  Plus
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Component to handle Agora remote tracks
const RemoteVideoPlayer = ({ user }: { user: IRemoteUser }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && user.videoTrack) {
      user.videoTrack.play(containerRef.current);
    }
    return () => {
      user.videoTrack?.stop();
    };
  }, [user.videoTrack]);

  return <div ref={containerRef} className="w-full h-full object-cover" />;
};

export default function LivestreamPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [streamData, setStreamData] = useState<any>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [participants, setParticipants] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  // Agora State
  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IRemoteUser[]>([]);

  const isOwner = Boolean(
    streamData && user && 
    (typeof streamData.hostId === 'object' 
      ? (streamData.hostId?._id === user.id || streamData.hostId?.id === user.id)
      : (streamData.hostId === user.id))
  );

  const inviteLink = `${window.location.origin}/livestream/${id}`;

  // Initialize media only for host on mount or when joining
  useEffect(() => {
    const initMedia = async () => {
      if (!isOwner) return; // Only host needs media access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        if (previewVideoRef.current) {
          previewVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast.error("Could not access camera or microphone");
        setIsCamOn(false);
        setIsMicOn(false);
      }
    };

    if (!isJoined) {
      initMedia();
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isJoined, isOwner]);

  // Update local video element when joined
  useEffect(() => {
    if (isJoined && localVideoRef.current) {
      if (localVideoTrack) {
        localVideoTrack.play(localVideoRef.current);
      } else if (localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  }, [isJoined, localStream, localVideoTrack]);

  // Handle Remote Video Playback
  useEffect(() => {
    remoteUsers.forEach(remoteUser => {
      // Find the host in remote users to play in main area if viewer
      // For now, we'll just play the first remote user in the main area if we are audience
      if (!isOwner && remoteUser.videoTrack) {
        // We'll use a specific ref for remote host video
      }
    });
  }, [remoteUsers, isOwner]);

  // Handle Cam Toggle (Local MediaStream)
  useEffect(() => {
    if (localStream && !localVideoTrack) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isCamOn;
      });
    }
    if (localVideoTrack) {
      localVideoTrack.setEnabled(isCamOn);
    }
  }, [isCamOn, localStream, localVideoTrack]);

  // Handle Mic Toggle (Local MediaStream)
  useEffect(() => {
    if (localStream && !localAudioTrack) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMicOn;
      });
    }
    if (localAudioTrack) {
      localAudioTrack.setEnabled(isMicOn);
    }
  }, [isMicOn, localStream, localAudioTrack]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    const fetchStream = async () => {
      if (!id) return;
      try {
        const [myRes, publicRes] = await Promise.all([
          livestreamAPI.getMyStreams().catch(() => ({ data: { success: false } })),
          livestreamAPI.getAll().catch(() => ({ data: { success: false } }))
        ]);

        let stream = null;
        if (myRes.data?.success && Array.isArray(myRes.data.data)) {
          stream = myRes.data.data.find((s: any) => s._id === id);
        }
        if (!stream && publicRes.data?.success && Array.isArray(publicRes.data.data)) {
          stream = publicRes.data.data.find((s: any) => s._id === id);
        }

        if (stream) {
          setStreamData(stream);
          const realParticipants = [];
          const currentUserId = user?.id;

          if (stream.hostId) {
            const hostId = typeof stream.hostId === 'object' ? stream.hostId._id : stream.hostId;
            realParticipants.push({
              id: hostId,
              name: typeof stream.hostId === 'object' ? stream.hostId.fullName : "Host",
              role: "host",
              isSelf: currentUserId === hostId,
              isMicOn: true,
              isCamOn: true
            });
          }

          if (Array.isArray(stream.coHosts)) {
            stream.coHosts.forEach((coHost: any) => {
              const coHostId = typeof coHost === 'object' ? coHost._id : coHost;
              realParticipants.push({
                id: coHostId,
                name: typeof coHost === 'object' ? coHost.fullName : "Co-Host",
                role: "co-host",
                isSelf: currentUserId === coHostId,
                isMicOn: true,
                isCamOn: true
              });
            });
          }

          const isUserInList = realParticipants.some(p => p.id === currentUserId);
          if (!isUserInList && user) {
            realParticipants.push({
              id: user.id,
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
      } catch (error) {
        console.error("Failed to fetch stream:", error);
        toast.error("Failed to load stream details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStream();
  }, [id, user?.id]); // Stabilized dependency by using user?.id instead of user object

  const handleJoin = async () => {
    if (!id) return;
    if (streamData?.status === 'ended' && !isOwner) {
      toast.error("This session has already ended.");
      return;
    }
    setIsLoading(true);
    try {
      let response;
      if (isOwner) {
        response = await livestreamAPI.start(id);
      } else {
        const hostId = typeof streamData?.hostId === 'object' ? streamData.hostId?._id : streamData?.hostId;
        response = await livestreamAPI.join(id, hostId);
      }

      if (response.data.success) {
        const { rtcToken, userId: resUserId, channelName: resChannelName } = response.data.data;
        const agoraAppId = import.meta.env.VITE_AGORA_APP_ID;

        // Determine final userId and channelName
        const userId = resUserId || response.data.data.uid || response.data.data._id || user?.id;
        const channelName = resChannelName || response.data.data.channel || id;

        console.log("Agora Join Params:", { agoraAppId, channelName, rtcToken, userId });

        if (!agoraAppId) {
          throw new Error("Agora App ID is not configured");
        }

        if (!userId) {
          throw new Error("User identity missing for connection");
        }

        // 1. Initialize Agora Client
        const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
        agoraClientRef.current = client;

        // 2. Set Client Role
        const role = isOwner ? "host" : "audience";
        await client.setClientRole(role);

        // 3. Handle Agora Events
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "video") {
            setRemoteUsers(prev => {
              if (prev.find(u => u.uid === user.uid)) return prev;
              return [...prev, user];
            });
          }
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        });

        client.on("user-unpublished", (user) => {
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        });

        // 4. Join the Channel
        // Ensure the token is not being sent as an empty string or null
        if (!rtcToken) {
          throw new Error("RTC Token is missing from the backend response");
        }
        
        console.log("Attempting to join Agora channel...");
        await client.join(agoraAppId, String(channelName), rtcToken, String(userId));
        console.log("Joined Agora channel successfully!");

        // 5. If Host, create and publish tracks
        if (isOwner) {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          const videoTrack = await AgoraRTC.createCameraVideoTrack();
          
          setLocalAudioTrack(audioTrack);
          setLocalVideoTrack(videoTrack);
          
          await client.publish([audioTrack, videoTrack]);
          
          // Stop the preview localStream if it exists
          if (localStream) {
            localStream.getTracks().forEach(t => t.stop());
            setLocalStream(null);
          }
        }

        setIsJoined(true);
        toast.success(isOwner ? "Started the live audition" : "Joined the live audition");
      }
    } catch (error: any) {
      console.error("Agora Error:", error);
      toast.error(error.message || "Failed to connect to the session");
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
      }
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
      }
      if (agoraClientRef.current) {
        agoraClientRef.current.leave();
      }
    };
  }, [localVideoTrack, localAudioTrack]);

  const handleLeave = async () => {
    const confirmMsg = isOwner ? "End the audition for everyone?" : "Leave the audition?";
    if (window.confirm(confirmMsg)) {
      // Cleanup Agora
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
      }
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
      }
      if (agoraClientRef.current) {
        await agoraClientRef.current.leave();
      }

      if (id) {
        try {
          if (isOwner) await livestreamAPI.end(id);
          else await livestreamAPI.leave(id);
        } catch (error) {
          console.error("Leave error:", error);
        }
      }
      navigate(-1);
    }
  };

  useEffect(() => {
    const pollRef = { active: true };
    let timeoutId: NodeJS.Timeout;
    const currentUserId = user?.id;

    const fetchMessages = async () => {
      if (!id || !isJoined || !pollRef.active) return;
      try {
        const response = await livestreamAPI.getMessages(id);
        if (response.data.success && Array.isArray(response.data.data)) {
          const formattedMessages = response.data.data.map((msg: any) => ({
            id: msg._id || msg.id,
            sender: msg.sender?.fullName || msg.senderName || "Unknown",
            text: msg.message || msg.text,
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: (msg.sender?._id || msg.senderId) === currentUserId
          }));
          
          setChatMessages(prev => {
            if (JSON.stringify(prev) === JSON.stringify(formattedMessages)) return prev;
            return formattedMessages;
          });
        }
      } catch (error) {
        console.error("Messages error:", error);
      } finally {
        if (isJoined && pollRef.active) {
          timeoutId = setTimeout(fetchMessages, 5000);
        }
      }
    };

    if (isJoined) {
      fetchMessages();
    }

    return () => {
      pollRef.active = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [id, isJoined, user?.id]);

  const [chatInput, setChatInput] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const handleSendInvite = async () => {
    if (!id || !inviteEmails.trim()) return;
    
    const emailList = inviteEmails
      .split(/[\n,]/)
      .map(email => email.trim())
      .filter(email => email.length > 0 && email.includes("@"));

    if (emailList.length === 0) {
      toast.error("Please enter at least one valid email address");
      return;
    }

    setIsInviting(true);
    try {
      const response = await livestreamAPI.invite(id, emailList);
      if (response.data.success) {
        toast.success(`Successfully sent ${emailList.length} invitation(s)`);
        setInviteEmails("");
        setIsInviteDialogOpen(false);
      }
    } catch (error: any) {
      console.error("Invite error:", error);
      toast.error(error.response?.data?.message || "Failed to send invitations");
    } finally {
      setIsInviting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !id) return;
    const messageText = chatInput;
    setChatInput("");
    try {
      const response = await livestreamAPI.postMessage(id, messageText);
      if (response.data.success) {
        const msg = response.data.data;
        setChatMessages(prev => [...prev, {
          id: msg._id || msg.id || Date.now().toString(),
          sender: user?.fullName,
          text: messageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSelf: true
        }]);
      }
    } catch (error) {
      toast.error("Failed to send message");
      setChatInput(messageText);
    }
  };

  const sendReaction = (emoji: string) => toast(`Sent ${emoji} reaction`, { duration: 1000 });

  const handleKickUser = (userId: string, userName: string) => {
    if (window.confirm(`Remove ${userName}?`)) {
      setParticipants(prev => prev.filter(p => p.id !== userId));
      toast.success(`${userName} removed`);
    }
  };

  const handleMuteUser = (userId: string, userName: string) => {
    setParticipants(prev => prev.map(p => p.id === userId ? { ...p, isMicOn: !p.isMicOn } : p));
    toast.success(`Toggled mute for ${userName}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[#0F1115] text-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-400 animate-pulse font-medium">Connecting to broadcast...</p>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-[#0F1115] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-5xl w-full grid gap-12 lg:grid-cols-[1fr,400px] items-center">
          <div className="aspect-video bg-[#181A20] rounded-3xl relative overflow-hidden border border-white/5 shadow-2xl">
            {isOwner ? (
              <>
                {isCamOn ? (
                  <video ref={previewVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Avatar className="w-32 h-32 border-4 border-white/5 bg-slate-800"><AvatarFallback className="text-4xl">{user?.fullName?.[0]}</AvatarFallback></Avatar>
                    <p className="text-slate-400 font-medium uppercase text-xs tracking-widest">Camera Off</p>
                  </div>
                )}
                <div className="absolute bottom-6 right-6 flex items-center gap-3">
                  <Button variant="ghost" size="icon" className={`rounded-full h-12 w-12 backdrop-blur-md ${!isMicOn ? "bg-destructive text-white" : "bg-white/10 text-white"}`} onClick={() => setIsMicOn(!isMicOn)}>
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className={`rounded-full h-12 w-12 backdrop-blur-md ${!isCamOn ? "bg-destructive text-white" : "bg-white/10 text-white"}`} onClick={() => setIsCamOn(!isCamOn)}>
                    {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-6 bg-gradient-to-br from-[#181A20] to-[#0F1115]">
                <div className="relative">
                  <Avatar className="w-40 h-40 border-8 border-white/5 shadow-2xl">
                    <AvatarFallback className="bg-primary/10 text-primary text-5xl font-black">{streamData?.hostId?.fullName?.[0] || "H"}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-primary rounded-full border-4 border-[#181A20]" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] animate-pulse">Waiting for host to start...</p>
                  <p className="text-xs text-slate-500">You will be joining as a viewer</p>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-8">
            <div className="text-center lg:text-left space-y-2">
              <h1 className="text-4xl font-black tracking-tight uppercase">{isOwner ? "Ready to start?" : "Ready to join?"}</h1>
              <p className="text-slate-500 text-lg font-medium">{streamData?.title}</p>
            </div>
            <div className="bg-[#181A20] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><Users className="w-5 h-5" /></div>
                <div><p className="text-sm font-bold">{participants.length} in call</p><p className="text-[10px] text-slate-500 font-bold uppercase">{isOwner ? "You are the host" : `Host: ${streamData?.hostId?.fullName || "Loading..."}`}</p></div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button size="lg" className="h-14 rounded-2xl text-lg font-black uppercase shadow-xl shadow-primary/20" onClick={handleJoin}>{isOwner ? "Start session" : streamData?.status === 'live' ? "Join now" : "Join waiting room"}</Button>
              <Button variant="ghost" size="lg" className="h-14 rounded-2xl text-slate-500 font-bold uppercase hover:text-white" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0F1115] text-white overflow-hidden">
      <div className="h-14 border-b border-white/5 bg-[#181A20] flex items-center justify-between px-4 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            <h1 className="font-bold text-sm tracking-tight truncate max-w-[200px]">{streamData?.title}</h1>
            <Badge variant="secondary" className="bg-white/5 text-[10px] text-slate-400 border-none h-5">{streamData?.category || "Audition"}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 px-4 py-1.5 bg-white/5 rounded-full border border-white/5 text-[11px] font-bold">
            <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary" />{participants.length}</div>
            <div className="w-px h-3 bg-white/10" /><div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-success" />Encrypted</div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-slate-400 hover:text-white"><Share2 className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 bg-black relative">
          <div className="flex-1 relative flex items-center justify-center p-4">
            <div className="w-full h-full max-w-6xl aspect-video bg-[#181A20] rounded-xl overflow-hidden shadow-2xl border border-white/5 relative group">
              <div className="absolute inset-0">
                {isOwner ? (
                  isCamOn ? (
                    <div className="w-full h-full">
                      <div ref={localVideoRef} className="w-full h-full object-cover scale-x-[-1]" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#181A20] to-[#0F1115]">
                      <Avatar className="w-32 h-32 border-4 border-white/5 shadow-2xl"><AvatarFallback className="bg-primary/20 text-primary text-4xl">{user?.fullName?.[0]}</AvatarFallback></Avatar>
                      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Your camera is off</p>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full relative">
                    {remoteUsers.length > 0 ? (
                      <RemoteVideoPlayer user={remoteUsers[0]} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#181A20] to-[#0F1115]">
                        <div className="relative">
                          <Avatar className="w-40 h-40 border-8 border-white/5 shadow-3xl">
                            <AvatarFallback className="bg-primary/10 text-primary text-5xl font-black">{streamData?.hostId?.fullName?.[0] || "H"}</AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-2 right-2 h-6 w-6 bg-primary rounded-full border-4 border-[#181A20]" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] animate-pulse">Waiting for broadcast feed...</p>
                          <p className="text-xs text-slate-500">The session is moderated. Enjoy the audition!</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white/20"><Play className="w-5 h-5 fill-current" /></Button>
                    <div className="flex items-center gap-2 group/volume">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white" onClick={() => setIsMuted(!isMuted)}>{isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-destructive" /> : <Volume2 className="w-5 h-5" />}</Button>
                      <div className="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-300"><input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(parseInt(e.target.value))} className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary" /></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-destructive/90 text-white border-none px-3 py-1 font-bold uppercase text-[10px] tracking-widest">Live</Badge>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white"><Settings className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-white"><Maximize className="w-5 h-5" /></Button>
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4 w-48 space-y-3">
                {remoteUsers.slice(1).map((remoteUser) => (
                  <div key={remoteUser.uid} className="aspect-video bg-black/60 backdrop-blur-xl rounded-lg border border-white/10 overflow-hidden relative shadow-xl group/mini">
                    <RemoteVideoPlayer user={remoteUser} />
                    <div className="absolute bottom-1 left-1 right-1 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center justify-between">
                      <span className="text-[8px] font-bold truncate pr-1">User {remoteUser.uid}</span>
                      {!remoteUser.hasAudio && <MicOff className="w-2 h-2 text-destructive" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-20 bg-[#181A20] border-t border-white/5 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6 w-1/3">
              <div className="flex items-center gap-3">
                <div className="relative"><Avatar className="h-12 w-12 border-2 border-primary/20 shadow-lg"><AvatarFallback className="bg-[#2A2E35] text-primary">{streamData?.hostId?.fullName?.[0] || "H"}</AvatarFallback></Avatar><div className="absolute -bottom-1 -right-1 h-4 w-4 bg-success border-2 border-[#181A20] rounded-full" /></div>
                <div><div className="flex items-center gap-2"><p className="text-sm font-bold text-white hover:text-primary cursor-pointer">{streamData?.hostId?.fullName || "Host Name"}</p>{isOwner && <Shield className="w-3 h-3 text-primary" />}</div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Audition Host</p></div>
              </div>
              {/* <Button variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 h-9 rounded-lg text-xs font-bold gap-2"><Plus className="w-3.5 h-3.5" /> Follow</Button> */}
            </div>
            <div className="flex items-center gap-2">
              {isOwner ? (
                <div className="flex items-center bg-[#0F1115] p-1 rounded-xl border border-white/5">
                  <Button variant="ghost" size="icon" className={`h-11 w-11 rounded-lg ${!isMicOn ? "text-destructive" : "text-slate-400"}`} onClick={() => setIsMicOn(!isMicOn)}>{isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}</Button>
                  <Button variant="ghost" size="icon" className={`h-11 w-11 rounded-lg ${!isCamOn ? "text-destructive" : "text-slate-400"}`} onClick={() => setIsCamOn(!isCamOn)}>{isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}</Button>
                  <div className="w-px h-6 bg-white/5 mx-1" />
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Viewing Mode</span>
                </div>
              )}
              <Button variant="destructive" className="h-11 px-6 rounded-xl font-black uppercase text-xs gap-2 shadow-lg shadow-destructive/20" onClick={handleLeave}><PhoneOff className="w-4 h-4" />{isOwner ? "End Session" : "Leave"}</Button>
            </div>
            <div className="flex items-center justify-end gap-3 w-1/3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F1115] border border-white/5 rounded-lg text-slate-400"><Heart className="w-3.5 h-3.5" /><span className="text-[11px] font-bold">4.2k</span></div>
              <Button variant="ghost" size="icon" className={`h-11 w-11 rounded-lg ${showSidebar ? "bg-primary/10 text-primary" : "text-slate-400"}`} onClick={() => setShowSidebar(!showSidebar)}><MessageSquare className="w-5 h-5" /></Button>
            </div>
          </div>
        </div>

        <div className={`transition-all duration-300 ease-in-out border-l border-white/5 bg-[#181A20] flex flex-col ${showSidebar ? "w-[340px] translate-x-0" : "w-0 translate-x-full overflow-hidden border-none"}`}>
          <div className="flex flex-col h-full min-w-[340px]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stream Chat</h2>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500" onClick={() => setActiveTab("chat")}><MessageSquare className={`w-3.5 h-3.5 ${activeTab === "chat" ? "text-primary" : ""}`} /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500" onClick={() => setActiveTab("people")}><Users className={`w-3.5 h-3.5 ${activeTab === "people" ? "text-primary" : ""}`} /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500" onClick={() => setActiveTab("info")}><Info className={`w-3.5 h-3.5 ${activeTab === "info" ? "text-primary" : ""}`} /></Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden relative">
              {activeTab === "chat" && (
                <div className="absolute inset-0 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 text-[10px] text-slate-400 leading-relaxed">Welcome to the audition! Keep it professional and respectful.</div>
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="group/msg flex gap-2">
                        <Avatar className="h-6 w-6 mt-1 shrink-0"><AvatarFallback className="text-[8px] bg-white/5 text-slate-400">{msg.sender?.[0]}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0"><div className="flex items-baseline gap-2"><span className={`text-[11px] font-black ${msg.isSelf ? "text-primary" : "text-slate-300"}`}>{msg.sender}</span><span className="text-[9px] text-slate-600 opacity-0 group-hover/msg:opacity-100">{msg.timestamp}</span></div><p className="text-xs text-slate-400 leading-relaxed break-words">{msg.text}</p></div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-4 bg-[#181A20] border-t border-white/5 space-y-3">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">{["👏", "💖", "🔥", "💯", "🎭"].map(emoji => (<button key={emoji} className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-sm" onClick={() => sendReaction(emoji)}>{emoji}</button>))}</div>
                    <div className="relative"><Input placeholder="Send a message" className="bg-[#0F1115] border-white/5 rounded-lg h-10 text-xs pr-10" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} /><Button variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8 text-primary" onClick={handleSendMessage} disabled={!chatInput.trim()}><Play className="w-3.5 h-3.5 fill-current" /></Button></div>
                  </div>
                </div>
              )}
              {activeTab === "people" && (
                <div className="absolute inset-0 flex flex-col p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Participants ({participants.length})</h3>
                    {isOwner && (
                      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-primary gap-1.5">
                            <UserPlus className="w-3 h-3" /> Invite
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#181A20] border-white/5 text-white sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight">Invite Talents</DialogTitle>
                            <DialogDescription className="text-slate-400 text-xs">
                              Enter email addresses separated by commas or new lines. We'll send them a secure link to join this session.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Email Addresses</label>
                              <Textarea 
                                placeholder="talent1@example.com, talent2@example.com..." 
                                className="bg-[#0F1115] border-white/5 min-h-[120px] text-sm focus-visible:ring-primary/20"
                                value={inviteEmails}
                                onChange={(e) => setInviteEmails(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              className="w-full h-12 rounded-xl font-black uppercase tracking-tight shadow-lg shadow-primary/20"
                              onClick={handleSendInvite}
                              disabled={isInviting || !inviteEmails.trim()}
                            >
                              {isInviting ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Invitations...</>
                              ) : (
                                "Send Invitations"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  <div className="space-y-1 overflow-y-auto flex-1">
                    {participants.map((p) => (
                      <div key={p.id} className="group/user flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-[#2A2E35] text-[10px] text-slate-400">{p.name?.[0]}</AvatarFallback></Avatar><div className="min-w-0"><div className="flex items-center gap-1.5"><p className="text-xs font-bold text-slate-300 truncate max-w-[120px]">{p.name}</p>{p.role === "host" && <Shield className="w-2.5 h-2.5 text-primary" />}</div><p className="text-[9px] text-slate-500 font-bold uppercase">{p.role || "Viewer"}</p></div></div>
                        <div className="flex items-center gap-1 opacity-0 group-hover/user:opacity-100 transition-opacity">
                          {isOwner && !p.isSelf && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-3.5 h-3.5 text-slate-500" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-[#181A20] border-white/5 text-white">
                                <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-500">Moderation</DropdownMenuLabel>
                                <DropdownMenuItem className="text-xs gap-2 py-2 cursor-pointer" onClick={() => handleMuteUser(p.id, p.name)}>{p.isMicOn ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-success" />}{p.isMicOn ? "Mute" : "Unmute"}</DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/5" /><DropdownMenuItem className="text-xs gap-2 py-2 text-destructive cursor-pointer" onClick={() => handleKickUser(p.id, p.name)}><UserX className="w-3.5 h-3.5" /> Kick</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          {!p.isMicOn && <MicOff className="w-3 h-3 text-destructive" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "info" && (
                <div className="absolute inset-0 p-6 space-y-8 overflow-y-auto">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Joining info</h3>
                    <div className="bg-[#0F1115] border border-white/5 rounded-xl p-4 space-y-4">
                      <div className="space-y-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Session ID</p><div className="flex items-center justify-between"><p className="text-xs font-mono text-primary truncate pr-4">{id}</p><Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500" onClick={handleCopyLink}>{isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}</Button></div></div>
                      <div className="space-y-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Visibility</p><div className="flex items-center gap-2"><Globe className="w-3 h-3 text-success" /><p className="text-xs font-bold text-slate-300 uppercase tracking-tighter">{streamData?.visibility || "Public"}</p></div></div>
                    </div>
                  </div>
                  <div className="space-y-3"><h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Description</h3><p className="text-xs text-slate-400 leading-relaxed bg-[#0F1115] p-4 rounded-xl border border-white/5">{streamData?.description || "No description provided."}</p></div>
                  <div className="space-y-3"><h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Quick Actions</h3><div className="grid grid-cols-2 gap-3"><Button variant="outline" className="h-auto py-3 px-4 rounded-xl flex-col items-center gap-2 border-white/5 bg-[#0F1115] hover:bg-white/5"><Flag className="w-4 h-4 text-slate-500" /><span className="text-[10px] font-black uppercase">Report</span></Button><Button variant="outline" className="h-auto py-3 px-4 rounded-xl flex-col items-center gap-2 border-white/5 bg-[#0F1115] hover:bg-white/5"><Smile className="w-4 h-4 text-slate-500" /><span className="text-[10px] font-black uppercase">React</span></Button></div></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
