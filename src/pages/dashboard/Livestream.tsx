import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteUser } from "agora-rtc-sdk-ng";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
  Plus,
  Globe,
  X,
  RotateCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { livestreamAPI } from "@/lib/api";
import { socketService } from "@/lib/socket";
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
const RemoteVideoPlayer = ({ user, isPaused }: { user: IRemoteUser, isPaused?: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && user.videoTrack && !isPaused) {
      user.videoTrack.play(containerRef.current);
    } else {
      user.videoTrack?.stop();
    }
    return () => {
      user.videoTrack?.stop();
    };
  }, [user.videoTrack, isPaused]);

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
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  // Set sidebar visibility based on screen size on mount
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    };
    
    // Initial check
    handleResize();

    // Optional: listen for resize events if you want it to be dynamic
    // window.addEventListener('resize', handleResize);
    // return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [isCopied, setIsCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localVideoRef, previewVideoRef] = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const [layoutMode, setLayoutMode] = useState<"grid" | "speaker" | "cinema">("grid");
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [reactions, setReactions] = useState<{ id: number, emoji: string, left: number }[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [remoteCameraStatus, setRemoteCameraStatus] = useState<Record<string, boolean>>({});

  // Agora State
  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IRemoteUser[]>([]);
  const joinHostIdRef = useRef<string | undefined>(undefined);

  const isOwner = Boolean(
    streamData && user && 
    (typeof streamData.hostId === 'object' 
      ? (streamData.hostId?._id === user.id || streamData.hostId?.id === user.id)
      : (streamData.hostId === user.id))
  );
  const isCoHost = Boolean(
    streamData &&
    user &&
    Array.isArray(streamData.coHosts) &&
    streamData.coHosts.some((coHost) =>
      (typeof coHost === "object" ? coHost?._id || coHost?.id : coHost) === user.id
    )
  );
  const isBroadcaster = isOwner || isCoHost;

  const inviteLink = `${window.location.origin}/livestream/${id}`;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Also leave if still in a channel
      if (agoraClientRef.current) {
        agoraClientRef.current.leave().catch(err => console.error("Error leaving on unmount:", err));
      }
    };
  }, []);

  // Initialize media only for host on mount or when joining
  useEffect(() => {
    const initMedia = async () => {
      if (!isBroadcaster) return; // Only broadcasters need media access
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
  }, [isBroadcaster, isJoined]);

  // Update local video element when joined or camera toggled
  useEffect(() => {
    if (isJoined && isCamOn && localVideoRef.current) {
      if (localVideoTrack) {
        localVideoTrack.play(localVideoRef.current);
      } else if (localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    }
  }, [isJoined, isCamOn, localStream, localVideoTrack]);

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
    // Broadcast camera status to other participants
    if (id && isBroadcaster) {
      socketService.emit('toggle_camera', { streamId: id, isCamOn });
    }
  }, [isCamOn, localStream, localVideoTrack, id, isBroadcaster]);

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
      const scrollTimeout = setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(scrollTimeout);
    }
  }, [chatMessages]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    toast.success("Invite link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    if (!streamData) return;
    
    const realParticipants = [];
    const currentUserId = user?.id;

    if (streamData.hostId) {
      const hostId = typeof streamData.hostId === 'object' ? (streamData.hostId?._id || streamData.hostId?.id) : streamData.hostId;
      if (hostId) {
        realParticipants.push({
          id: String(hostId),
          name: typeof streamData.hostId === 'object' ? streamData.hostId.fullName : "Host",
          role: "host",
          isSelf: String(currentUserId) === String(hostId),
          isMicOn: true,
          isCamOn: true
        });
      }
    }

    if (Array.isArray(streamData.coHosts)) {
      streamData.coHosts.forEach((coHost) => {
        const coHostId = typeof coHost === 'object' ? (coHost?._id || coHost?.id) : coHost;
        if (coHostId && !realParticipants.some(p => String(p.id) === String(coHostId))) {
          realParticipants.push({
            id: String(coHostId),
            name: typeof coHost === 'object' ? coHost.fullName : "Co-Host",
            role: "co-host",
            isSelf: String(currentUserId) === String(coHostId),
            isMicOn: true,
            isCamOn: true
          });
        }
      });
    }

    // Add viewers if they exist in streamData
    if (Array.isArray(streamData.viewers)) {
      streamData.viewers.forEach((viewer) => {
        const viewerId = typeof viewer === 'object' ? (viewer?._id || viewer?.id) : viewer;
        // Don't add if already in participants (host/cohost)
        if (viewerId && !realParticipants.some(p => String(p.id) === String(viewerId))) {
          realParticipants.push({
            id: String(viewerId),
            name: typeof viewer === 'object' ? (viewer.fullName || viewer.name) : "Viewer",
            role: "viewer",
            isSelf: String(currentUserId) === String(viewerId),
            isMicOn: false,
            isCamOn: false
          });
        }
      });
    }

    const isUserInList = realParticipants.some(p => String(p.id) === String(currentUserId));
    if (!isUserInList && user) {
      realParticipants.push({
        id: String(user.id || user._id),
        name: user.fullName || user.name,
        role: user.role,
        isSelf: true,
        isMicOn: !isBroadcaster ? false : isMicOn,
        isCamOn: !isBroadcaster ? false : isCamOn
      });
    }
    setParticipants(realParticipants);
  }, [streamData, user?.id, user?._id, isBroadcaster, isMicOn, isCamOn]);

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
          stream = myRes.data.data.find((s) => s._id === id);
        }
        if (!stream && publicRes.data?.success && Array.isArray(publicRes.data.data)) {
          stream = publicRes.data.data.find((s) => s._id === id);
        }

        if (stream) {
          setStreamData(stream);
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
    if (streamData?.status === 'ended') {
      toast.error("This session has already ended.");
      return;
    }
    setIsLoading(true);

    try {
      const existingClient = agoraClientRef.current;
      if (existingClient && existingClient.connectionState !== "DISCONNECTED") {
        await existingClient.leave();
      }

      // Step A: Fetch Connection Details
      // You must call the join endpoint (for viewers) or start endpoint (for hosts)
      let response;
      const hostId = typeof streamData?.hostId === 'object' ? streamData.hostId?._id : streamData?.hostId;
      joinHostIdRef.current = hostId ? String(hostId) : undefined;

      if (isBroadcaster) {
        response = await livestreamAPI.start(id);
      } else {
        response = await livestreamAPI.join(id, joinHostIdRef.current);
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to get connection details from server");
      }

      const { rtcToken, userId: resUserId, channelName: resChannelName, stream } = response.data.data;
      const agoraAppId = import.meta.env.VITE_AGORA_APP_ID;

      // Validate required details
      if (!agoraAppId) throw new Error("Agora App ID is not configured");
      if (!rtcToken) throw new Error("RTC Token is missing from the backend response");

      // Step C: Join with String User ID (Critical)
      // The Castglo backend generates Account Tokens tied to the MongoDB _id string.
      // You MUST pass this string as the uid.
      const userId = String(resUserId || response.data.data.uid || response.data.data._id || user?.id);
      const channelName = String(resChannelName || stream?.channelName || response.data.data.channel || id);

      console.log("Agora Connection Details:", { channelName, userId, hasToken: !!rtcToken });

      // Step B: Setup Agora Client
      // In Live mode, you MUST set the client role before joining.
      const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
      agoraClientRef.current = client;

      // Step 3.5: Connection State Management (Anti-Race Condition)
      // To avoid AgoraRTCError INVALID_OPERATION, always check the connection state.
      if (client.connectionState !== "DISCONNECTED") {
        await client.leave();
      }

      // Set role: 'host' for broadcasters, 'audience' for viewers
      const role = isBroadcaster ? "host" : "audience";
      await client.setClientRole(role);

      // Step 4: Handle Remote Users (Viewer Logic)
      // Subscribe to the Host when they publish their tracks
      client.on("user-published", async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        console.log(`Subscribed to remote user ${remoteUser.uid} ${mediaType}`);
        
        if (mediaType === "video") {
          setRemoteUsers(prev => {
            if (prev.find(u => u.uid === remoteUser.uid)) return prev;
            return [...prev, remoteUser];
          });
        }
        if (mediaType === "audio") {
          remoteUser.audioTrack?.play();
        }
      });

      client.on("user-unpublished", (remoteUser) => {
        console.log(`Remote user ${remoteUser.uid} unpublished`);
        setRemoteUsers(prev => prev.filter(u => u.uid !== remoteUser.uid));
      });

      client.on("user-left", (remoteUser) => {
        console.log(`Remote user ${remoteUser.uid} left`);
        const hostId = typeof streamData?.hostId === 'object' ? streamData.hostId?._id : streamData?.hostId;
        if (String(remoteUser.uid) === String(hostId)) {
          toast.info("The host has left the session.");
          // We don't necessarily end the session here because the host might be reconnecting
        }
        setRemoteUsers(prev => prev.filter(u => u.uid !== remoteUser.uid));
      });

      // 3.1 Token Expiration Management
      // Renew token before it expires to maintain connection
      client.on("token-privilege-will-expire", async () => {
        console.log("Agora Token will expire soon. Refreshing...");
        try {
          const refreshRes = isBroadcaster
            ? await livestreamAPI.start(id)
            : await livestreamAPI.join(id, joinHostIdRef.current);
          if (refreshRes.data.success && refreshRes.data.data.rtcToken) {
            await client.renewToken(refreshRes.data.data.rtcToken);
            console.log("Agora Token renewed");
          }
        } catch (error) {
          console.error("Token renewal failed:", error);
        }
      });

      // Step C: Join Call
      // Join using the string userId from the API. Do not use integer 0.
      await client.join(agoraAppId, channelName, rtcToken, userId);
      console.log("Successfully joined Agora channel");

      // Stop if unmounted during join
      if (!isMountedRef.current) {
        console.log("Component unmounted during Agora join");
        await client.leave();
        return;
      }

      // 5. Host-Specific Logic: Publish Local Tracks
      if (isBroadcaster) {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        
        // Final check before publishing to avoid DISCONNECTING state error
        if (isMountedRef.current && client.connectionState === "CONNECTED") {
          setLocalAudioTrack(audioTrack);
          setLocalVideoTrack(videoTrack);
          
          await client.publish([audioTrack, videoTrack]);
          console.log("Published local tracks as host");
          
          // Cleanup preview stream
          if (localStream) {
            localStream.getTracks().forEach(t => t.stop());
            setLocalStream(null);
          }
        } else {
          console.log("Skipping publish: unmounted or not connected", { 
            isMounted: isMountedRef.current, 
            state: client.connectionState 
          });
          audioTrack.close();
          videoTrack.close();
        }
      }

      setIsJoined(true);
      toast.success(isBroadcaster ? "Started the live audition" : "Joined the live audition");

    } catch (error) {
      console.error("Agora Implementation Error:", error);
      toast.error(error.message || "Failed to connect to the session");
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup tracks when they are closed or changed
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

  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
    }
    // We don't disconnect here as socket might be shared, 
    // but we can join/leave rooms in specific stream effects
  }, []);

  useEffect(() => {
    const pollRef = { active: true };
    let timeoutId: NodeJS.Timeout;
    const currentUserId = user?.id;

    const fetchMessagesAndStatus = async () => {
      if (!id || !pollRef.active) return;

      // If socket is connected, we only poll occasionally (every 45s) as a sanity check
      const socketConnected = socketService.isConnected();
      const interval = socketConnected ? 45000 : 15000;

      try {
        const [msgRes, myRes, publicRes, partRes] = await Promise.all([
          livestreamAPI.getMessages(id).catch(() => ({ data: [] })),
          livestreamAPI.getMyStreams().catch(() => ({ data: { success: false } })),
          livestreamAPI.getAll().catch(() => ({ data: { success: false } })),
          livestreamAPI.getParticipants(id).catch(() => ({ data: { success: false } }))
        ]);

        // Handle messages more robustly
        const rawMessages = msgRes.data?.data || (Array.isArray(msgRes.data) ? msgRes.data : []);
        if (Array.isArray(rawMessages)) {
          const formattedMessages = rawMessages.map((msg) => ({
            id: msg._id || msg.id,
            sender: msg.sender?.fullName || msg.senderName || (typeof msg.sender === 'string' ? msg.sender : "Unknown"),
            text: msg.message || msg.text,
            timestamp: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: (msg.sender?._id || msg.senderId || (typeof msg.sender === 'string' ? msg.sender : null)) === user?.id
          }));
          
          setChatMessages(prev => {
            if (formattedMessages.length === 0) return prev;
            // Only update if the last message ID has changed or length is different
            if (prev.length === formattedMessages.length && 
                prev[prev.length-1]?.id === formattedMessages[formattedMessages.length-1]?.id) {
              return prev;
            }
            return formattedMessages;
          });
        }

        let currentStream = null;
        if (myRes.data?.success && Array.isArray(myRes.data.data)) {
          currentStream = myRes.data.data.find((s) => s._id === id);
        }
        if (!currentStream && publicRes.data?.success && Array.isArray(publicRes.data.data)) {
          currentStream = publicRes.data.data.find((s) => s._id === id);
        }

        if (currentStream && currentStream.status === 'ended' && !isBroadcaster) {
          toast.info("The host has ended the livestream.");
          setTimeout(() => navigate(-1), 3000);
          pollRef.active = false;
          return;
        }

        if (currentStream) {
          setStreamData(currentStream);
          if (currentStream.layout && (currentStream.layout === "grid" || currentStream.layout === "speaker" || currentStream.layout === "cinema")) {
            setLayoutMode(currentStream.layout);
          }
          if (currentStream.likeCount !== undefined) {
            setLikeCount(currentStream.likeCount);
          }
        }

        if (partRes.data?.success && Array.isArray(partRes.data.data)) {
          const apiParticipants = partRes.data.data.map((p) => ({
            id: String(p._id || p.id),
            name: p.fullName || p.name || "Unknown",
            role: p.role || "viewer",
            isSelf: String(p._id || p.id) === String(user?.id),
            isMicOn: p.isMicOn ?? (p.role === 'host' || p.role === 'co-host'),
            isCamOn: p.isCamOn ?? (p.role === 'host' || p.role === 'co-host'),
            headline: p.headline,
            skills: p.skills
          }));
          
          setParticipants(prev => {
            if (JSON.stringify(apiParticipants) === JSON.stringify(prev)) return prev;
            return apiParticipants;
          });
        }
      } catch (error) {
        console.error("Polling error:", error);
      } finally {
        if (pollRef.active) {
          timeoutId = setTimeout(fetchMessagesAndStatus, interval);
        }
      }
    };

    fetchMessagesAndStatus();

    // Socket listeners for livestream
    if (id) {
      socketService.emit('join_livestream', id);

      const handleNewLivestreamMessage = (data) => {
        const msg = data.message || data; // Handle both wrapped and direct payloads
        if (!msg || (!msg.text && !msg.message)) return;
        
        setChatMessages(prev => {
          const msgId = msg._id || msg.id;
          if (msgId && prev.some(m => m.id === msgId)) return prev;
          
          return [...prev, {
            id: msgId || Date.now().toString(),
            sender: msg.sender?.fullName || msg.senderName || (typeof msg.sender === 'string' ? msg.sender : "Unknown"),
            text: msg.message || msg.text,
            timestamp: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: (msg.sender?._id || msg.senderId || (typeof msg.sender === 'string' ? msg.sender : null)) === user?.id
          }];
        });
      };

      socketService.on('livestream_message', handleNewLivestreamMessage);

      const handleParticipantJoined = (data) => {
        const newUser = data.participant;
        if (!newUser) return;
        setParticipants(prev => {
          if (prev.some(p => String(p.id) === String(newUser._id || newUser.id))) return prev;
          return [...prev, {
            id: String(newUser._id || newUser.id),
            name: newUser.fullName,
            role: newUser.role || "viewer",
            isSelf: String(user?.id) === String(newUser._id || newUser.id),
            isMicOn: false,
            isCamOn: false,
            headline: newUser.headline,
            skills: newUser.skills
          }];
        });
        toast.info(`${newUser.fullName} joined the live`);
      };

      const handleParticipantLeft = (data) => {
        const userId = data.userId;
        setParticipants(prev => prev.filter(p => String(p.id) !== String(userId)));
      };

      const handleCohostPromoted = async (data) => {
        const { streamId } = data;
        toast.success("You have been promoted to Co-Host!", { 
          duration: 5000,
          icon: "🎙️" 
        });
        // Re-call start to get publisher token and switch to publishing mode
        if (id) {
          try {
            const startRes = await livestreamAPI.start(id);
            if (startRes.data.success) {
              const { token, channelName } = startRes.data.data;
              // Leave current channel and join as publisher
              if (agoraClientRef.current) {
                const appId = import.meta.env.VITE_AGORA_APP_ID;
                await agoraClientRef.current.leave();
                await agoraClientRef.current.join(appId, channelName, token, String(user?.id));
                // Create and publish local tracks
                const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
                setLocalAudioTrack(audioTrack);
                setLocalVideoTrack(videoTrack);
                await agoraClientRef.current.publish([audioTrack, videoTrack]);
                setIsJoined(true);
                setIsBroadcaster(true);
                // Inform others we are now broadcasting
                socketService.emit('toggle_camera', { streamId: id, isCamOn: true });
              }
            }
          } catch (error) {
            console.error("Re-join as co-host error:", error);
            toast.error("Failed to switch to broadcasting mode");
          }
        }
      };

      const handleCohostAdded = (data) => {
        const { userId, stream } = data;
        setStreamData(stream);
        
        // Update local participants role
        setParticipants(prev => prev.map(p => 
          String(p.id) === String(userId) ? { ...p, role: "co-host" } : p
        ));

        const promotedUser = participants.find(p => String(p.id) === String(userId));
        if (promotedUser && String(userId) !== String(user?.id)) {
          toast.info(`${promotedUser.name} is now a Co-Host`);
        }
      };

      const handleCohostDemoted = async (data) => {
        toast.error("Your Co-Host permissions have been removed.", { 
          duration: 5000,
          icon: "🚫" 
        });
        // Disable local media tracks if they were on and stop publishing
        if (localVideoTrack) {
          localVideoTrack.stop();
          localVideoTrack.close();
        }
        if (localAudioTrack) {
          localAudioTrack.stop();
          localAudioTrack.close();
        }
        setLocalVideoTrack(null);
        setLocalAudioTrack(null);
        setIsMicOn(false);
        setIsCamOn(false);
        setIsBroadcaster(false);

        // Re-join as viewer (subscriber)
        if (id) {
          try {
            const joinRes = await livestreamAPI.join(id);
            if (joinRes.data.success) {
              const { token, channelName } = joinRes.data.data;
              if (agoraClientRef.current) {
                const appId = import.meta.env.VITE_AGORA_APP_ID;
                await agoraClientRef.current.leave();
                await agoraClientRef.current.join(appId, channelName, token, String(user?.id));
                setIsJoined(true);
              }
            }
          } catch (error) {
            console.error("Re-join as viewer error:", error);
          }
        }
      };

      socketService.on('participant_joined', handleParticipantJoined);
      socketService.on('participant_left', handleParticipantLeft);
      socketService.on('cohost_promoted', handleCohostPromoted);
      socketService.on('cohost_added', handleCohostAdded);
      socketService.on('cohost_demoted', handleCohostDemoted);

      const handleLayoutChanged = (data) => {
        const { layout } = data;
        if (layout && (layout === "grid" || layout === "speaker" || layout === "cinema")) {
          setLayoutMode(layout);
        }
      };

      socketService.on('layout_changed', handleLayoutChanged);

      const handleIncomingReaction = (data) => {
        const { emoji } = data;
        const id = Date.now() + Math.random();
        const left = Math.floor(Math.random() * 80) + 10; // Random position 10% to 90%
        
        setReactions(prev => [...prev, { id, emoji, left }]);
        
        // Remove reaction after animation finishes (3 seconds)
        setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== id));
        }, 3000);
      };

      socketService.on('livestream_reaction', handleIncomingReaction);

      const handleIncomingLike = (data) => {
        const { count } = data;
        if (count !== undefined) setLikeCount(count);
        
        // Trigger a floating heart reaction automatically
        const rid = Date.now() + Math.random();
        const left = Math.floor(Math.random() * 80) + 10;
        setReactions(prev => [...prev, { id: rid, emoji: "💖", left }]);
        setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== rid));
        }, 3000);
      };

      socketService.on('livestream_like', handleIncomingLike);

      const handleUserCameraToggled = (data) => {
        const { userId, isCamOn } = data;
        setRemoteCameraStatus(prev => ({ ...prev, [userId]: isCamOn }));
      };

      socketService.on('user_camera_toggled', handleUserCameraToggled);

      return () => {
        pollRef.active = false;
        if (timeoutId) clearTimeout(timeoutId);
        socketService.off('livestream_message', handleNewLivestreamMessage);
        socketService.off('participant_joined', handleParticipantJoined);
        socketService.off('participant_left', handleParticipantLeft);
        socketService.off('cohost_promoted', handleCohostPromoted);
        socketService.off('cohost_added', handleCohostAdded);
        socketService.off('cohost_demoted', handleCohostDemoted);
        socketService.off('layout_changed', handleLayoutChanged);
        socketService.off('livestream_reaction', handleIncomingReaction);
        socketService.off('livestream_like', handleIncomingLike);
        socketService.off('user_camera_toggled', handleUserCameraToggled);
        socketService.emit('leave_livestream', id);
      };
    }
  }, [id, user?.id, isBroadcaster]);

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
    } catch (error) {
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
      // 1. Official API call to persist the message
      const response = await livestreamAPI.postMessage(id, messageText);
      
      const success = response.data?.success || response.status === 201 || response.status === 200;
      const msg = response.data?.data || response.data;

      if (success && msg) {
        // 2. Broadcast the message via Socket.IO for real-time delivery
        socketService.emit('send_livestream_message', {
          streamId: id,
          message: {
            id: msg._id || msg.id || Date.now().toString(),
            sender: user?.fullName,
            senderId: user?.id,
            text: messageText,
            createdAt: new Date().toISOString()
          }
        });

        // 3. Update local UI (Optimistic/Immediate)
        setChatMessages(prev => {
          const msgId = msg._id || msg.id;
          if (msgId && prev.some(m => m.id === msgId)) return prev;
          return [...prev, {
            id: msgId || Date.now().toString(),
            sender: user?.fullName,
            text: messageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: true
          }];
        });
      }
    } catch (error) {
      toast.error("Failed to send message");
      setChatInput(messageText);
    }
  };

  const sendReaction = (emoji: string) => {
    if (!id) return;
    socketService.emit('send_reaction', { streamId: id, emoji });
    // Also show it locally
    const rid = Date.now() + Math.random();
    const left = Math.floor(Math.random() * 80) + 10;
    setReactions(prev => [...prev, { id: rid, emoji, left }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== rid));
    }, 3000);
  };

  const handleLike = () => {
    if (!id) return;
    socketService.emit('send_like', { streamId: id });
    // Optimistically update locally
    setLikeCount(prev => prev + 1);
    const rid = Date.now() + Math.random();
    const left = Math.floor(Math.random() * 80) + 10;
    setReactions(prev => [...prev, { id: rid, emoji: "💖", left }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== rid));
    }, 3000);
  };

  const togglePlayPause = () => {
    const newState = !isPaused;
    setIsPaused(newState);
    
    if (isBroadcaster) {
      if (newState) {
        localVideoTrack?.stop();
      } else {
        if (localVideoRef.current) localVideoTrack?.play(localVideoRef.current);
      }
    }
    
    remoteUsers.forEach(user => {
      if (newState) {
        user.videoTrack?.stop();
      } else {
        // We need to find the correct container to play into, 
        // which depends on the layout mode and user role. 
        // For simplicity, we can let the RemoteVideoPlayer's effect handle this 
        // if we just force a re-render or pass isPaused down.
      }
    });
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const loadDevices = async () => {
    try {
      const cameraList = await AgoraRTC.getCameras();
      const micList = await AgoraRTC.getMicrophones();
      setCameras(cameraList);
      setMics(micList);
      
      if (localVideoTrack) setSelectedCamera(localVideoTrack.getTrackLabel());
      if (localAudioTrack) setSelectedMic(localAudioTrack.getTrackLabel());
    } catch (err) {
      console.error("Error loading devices:", err);
    }
  };

  const handleDeviceChange = async (type: 'cam' | 'mic', deviceId: string) => {
    try {
      if (type === 'cam' && localVideoTrack) {
        await localVideoTrack.setDevice(deviceId);
        setSelectedCamera(deviceId);
      } else if (type === 'mic' && localAudioTrack) {
        await localAudioTrack.setDevice(deviceId);
        setSelectedMic(deviceId);
      }
      toast.success(`${type === 'cam' ? 'Camera' : 'Microphone'} updated`);
    } catch (err) {
      toast.error("Failed to switch device");
    }
  };

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

  const handleMakeCoHost = async (userId: string, userName: string) => {
    if (!id) return;
    if (window.confirm(`Promote ${userName} to Co-Host?`)) {
      try {
        // Optimistic UI/Socket emit
        socketService.emit('assign_cohost', { streamId: id, userId });
        
        // API Call
        const response = await livestreamAPI.promoteCohost(id, userId);
        if (response.data.success) {
          toast.success(`${userName} is now a Co-Host`);
          // Refresh stream data to get updated coHosts array
          const myRes = await livestreamAPI.getMyStreams();
          if (myRes.data.success) {
            const stream = myRes.data.data.find((s) => s._id === id);
            if (stream) setStreamData(stream);
          }
        }
      } catch (error) {
        console.error("Co-host promotion error:", error);
        toast.error(error.response?.data?.message || "Failed to assign co-host");
      }
    }
  };

  const handleRemoveCoHost = async (userId: string, userName: string) => {
    if (!id) return;
    if (window.confirm(`Remove ${userName} from Co-Hosts?`)) {
      try {
        const response = await livestreamAPI.removeCohost(id, userId);
        if (response.data.success) {
          toast.success(`${userName} removed from Co-Hosts`);
          // Emit socket event for real-time update
          socketService.emit('remove_cohost', { streamId: id, userId });
          
          // Refresh stream data
          const myRes = await livestreamAPI.getMyStreams();
          if (myRes.data.success) {
            const stream = myRes.data.data.find((s) => s._id === id);
            if (stream) setStreamData(stream);
          }
        }
      } catch (error) {
        console.error("Co-host removal error:", error);
        toast.error(error.response?.data?.message || "Failed to remove co-host");
      }
    }
  };

  const [isRefreshingParticipants, setIsRefreshingParticipants] = useState(false);

  const refreshParticipants = async () => {
    if (!id || isRefreshingParticipants) return;
    setIsRefreshingParticipants(true);
    try {
      const partRes = await livestreamAPI.getParticipants(id);
      if (partRes.data?.success && Array.isArray(partRes.data.data)) {
        const apiParticipants = partRes.data.data.map((p) => ({
          id: String(p._id || p.id),
          name: p.fullName || p.name || "Unknown",
          role: p.role || "viewer",
          isSelf: String(p._id || p.id) === String(user?.id),
          isMicOn: p.isMicOn ?? (p.role === 'host' || p.role === 'co-host'),
          isCamOn: p.isCamOn ?? (p.role === 'host' || p.role === 'co-host')
        }));
        setParticipants(apiParticipants);
        toast.success("Participant list updated");
      }
    } catch (error) {
      console.error("Failed to refresh participants:", error);
      toast.error("Failed to update participant list");
    } finally {
      setIsRefreshingParticipants(false);
    }
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
            {isBroadcaster ? (
              <>
                {isCamOn ? (
                  <video ref={previewVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Avatar className="w-32 h-32 border-4 border-white/5 bg-slate-800"><AvatarFallback className="text-4xl">{user?.fullName?.[0]}</AvatarFallback></Avatar>
                    {/* <p className="text-slate-400 font-medium uppercase text-xs tracking-widest">Camera Off</p> */}
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
                <div>
                  <p className="text-sm font-bold">
                    {participants.length} { participants.length === 1 ? 'person' : 'people' } in the room
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">
                    {isOwner ? "You are ready to start" : `Host: ${streamData?.hostId?.fullName || "Loading..."}`}
                  </p>
                </div>
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
    <div className="h-screen flex flex-col bg-[#0B0D11] text-white overflow-hidden font-sans">
      {/* Header with Glassmorphism */}
      <div className="h-16 border-b border-white/5 bg-[#12141A]/80 backdrop-blur-xl flex items-center justify-between px-6 z-50 shrink-0 shadow-sm">
        <div className="flex items-center gap-5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-base tracking-tight truncate max-w-[250px]">{streamData?.title}</h1>
              <Badge variant="secondary" className="bg-primary/10 text-[10px] text-primary border-none h-5 px-2 font-bold uppercase tracking-wider">
                {streamData?.category || "Audition"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Broadcast</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-5 px-5 py-2 bg-white/5 rounded-2xl border border-white/5 text-[12px] font-bold shadow-inner">
            <div className="flex items-center gap-2 group cursor-help">
              <Users className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-slate-300">
                {participants.length} 
                <span className="text-slate-500 text-[10px] ml-0.5 uppercase">participants</span>
              </span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2 group cursor-help">
              <Shield className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-slate-300 uppercase text-[10px]">Secure</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0B0D11] relative">
          <div className="flex-1 relative flex items-center justify-center p-4 lg:p-6 overflow-hidden">
            <div ref={videoContainerRef} className={cn(
              "w-full h-full max-w-6xl rounded-[2rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-white/5 relative group transition-all duration-500 p-4",
              layoutMode === "grid" && (isBroadcaster ? remoteUsers.length + 1 : remoteUsers.length) > 1 
                ? "grid grid-cols-1 md:grid-cols-2 gap-4" 
                : "relative"
            )}>
              {/* Local Broadcaster (Host/Co-Host) */}
              {isBroadcaster && (
                <div className={cn(
                  "relative w-full h-full rounded-2xl overflow-hidden bg-[#12141A]",
                  (layoutMode === "speaker" || layoutMode === "cinema") && isOwner && "absolute inset-0 z-10",
                  (layoutMode === "speaker" || layoutMode === "cinema") && !isOwner && "hidden" // Only owner is main in speaker/cinema
                )}>
                  {isCamOn ? (
                    <div className="w-full h-full bg-black">
                      <div ref={localVideoRef} className="w-full h-full object-cover scale-x-[-1]" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#1A1D24] to-[#0B0D11]">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                        <Avatar className="w-24 h-24 border-4 border-white/5 shadow-2xl relative z-10">
                          <AvatarFallback className="bg-[#252831] text-primary text-3xl font-black">
                            {user?.fullName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      {/* <div className="flex flex-col items-center gap-1.5 relative z-10">
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Camera Off</p>
                        <div className="h-1 w-8 bg-primary/30 rounded-full" />
                      </div> */}
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-bold z-20">
                    You {isOwner && "(Host)"} {!isMicOn && <MicOff className="inline-block ml-2 w-3 h-3 text-destructive" />}
                  </div>
                </div>
              )}

              {/* Remote Broadcasters (Host/Co-Hosts) */}
              {remoteUsers.map((remoteUser) => {
                const isHost = String(remoteUser.uid) === String(streamData?.hostId?._id || streamData?.hostId?.id || streamData?.hostId);
                const isCoHostRemote = Array.isArray(streamData?.coHosts) && streamData.coHosts.some((ch) => 
                  String(typeof ch === 'object' ? ch._id || ch.id : ch) === String(remoteUser.uid)
                );
                
                // Only show host and co-hosts in the main area
                if (!isHost && !isCoHostRemote) return null;

                return (
                  <div key={remoteUser.uid} className={cn(
                    "relative w-full h-full rounded-2xl overflow-hidden bg-[#12141A]",
                    // In speaker/cinema, host is always main
                    (layoutMode === "speaker" || layoutMode === "cinema") && isHost && "absolute inset-0 z-10",
                    // In speaker, co-hosts are floating
                    layoutMode === "speaker" && !isHost && "absolute top-6 right-6 w-56 aspect-video z-20 shadow-2xl border border-white/10",
                    // In cinema, co-hosts are at the bottom (this list will be handled below if needed, but let's keep them here for now)
                    layoutMode === "cinema" && !isHost && "hidden" 
                  )}>
                    {remoteCameraStatus[String(remoteUser.uid)] === false ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#1A1D24] to-[#0B0D11]">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                          <Avatar className="w-24 h-24 border-4 border-white/5 shadow-2xl relative z-10">
                            <AvatarFallback className="bg-[#252831] text-primary text-3xl font-black">
                              {participants.find(p => String(p.id) === String(remoteUser.uid))?.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        {/* <div className="flex flex-col items-center gap-1.5 relative z-10">
                          <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Camera Off</p>
                          <div className="h-1 w-8 bg-primary/30 rounded-full" />
                        </div> */}
                      </div>
                    ) : (
                      <RemoteVideoPlayer user={remoteUser} isPaused={isPaused} />
                    )}
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-bold z-20">
                      {isHost ? "Host" : "Co-Host"} {!remoteUser.hasAudio && <MicOff className="inline-block ml-2 w-3 h-3 text-destructive" />}
                    </div>
                  </div>
                );
              })}

              {/* Cinema Mode Co-Host Bar */}
              {layoutMode === "cinema" && (isBroadcaster ? remoteUsers.length + 1 : remoteUsers.length) > 1 && (
                <div className="absolute bottom-24 left-6 right-6 h-32 flex items-center gap-4 overflow-x-auto no-scrollbar z-20 pb-2">
                  {/* Local Co-Host in Cinema Bar */}
                  {isBroadcaster && !isOwner && (
                    <div className="h-full aspect-video rounded-xl overflow-hidden bg-[#12141A] shrink-0 border border-white/10 shadow-xl relative">
                      {isCamOn ? (
                        <div ref={localVideoRef} className="w-full h-full object-cover scale-x-[-1]" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <Avatar className="h-10 w-10"><AvatarFallback>{user?.fullName?.[0]}</AvatarFallback></Avatar>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-lg text-[8px] font-bold">You</div>
                    </div>
                  )}
                  {/* Remote Co-Hosts in Cinema Bar */}
                  {remoteUsers.filter(ru => {
                    const isHost = String(ru.uid) === String(streamData?.hostId?._id || streamData?.hostId?.id || streamData?.hostId);
                    const isCoHostRemote = Array.isArray(streamData?.coHosts) && streamData.coHosts.some((ch) => 
                      String(typeof ch === 'object' ? ch._id || ch.id : ch) === String(ru.uid)
                    );
                    return !isHost && isCoHostRemote;
                  }).map(ru => (
                    <div key={ru.uid} className="h-full aspect-video rounded-xl overflow-hidden bg-[#12141A] shrink-0 border border-white/10 shadow-xl relative">
                      {remoteCameraStatus[String(ru.uid)] === false ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-slate-800">
                          <Avatar className="h-10 w-10 border border-white/10 shadow-lg">
                            <AvatarFallback className="bg-[#252831] text-primary text-xs font-bold">
                              {participants.find(p => String(p.id) === String(ru.uid))?.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest">Off</p>
                        </div>
                      ) : (
                        <RemoteVideoPlayer user={ru} isPaused={isPaused} />
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-lg text-[8px] font-bold">Co-Host</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Placeholder for Viewers if no one is broadcasting */}
              {!isBroadcaster && remoteUsers.length === 0 && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-8 bg-gradient-to-br from-[#1A1D24] to-[#0B0D11] absolute inset-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                    <Avatar className="w-48 h-48 border-[12px] border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.4)] relative z-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-6xl font-black">
                        {streamData?.hostId?.fullName?.[0] || "H"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-slate-400 font-black uppercase text-[11px] tracking-[0.4em]">Waiting for host...</p>
                </div>
              )}

              {/* Video Overlay Controls - Modern Floating Bar */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-2xl z-30">
                {isOwner && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "h-12 w-12 rounded-2xl transition-all",
                        layoutMode !== "grid" ? "bg-primary/20 text-primary" : "text-white hover:bg-white/5"
                      )}
                      onClick={() => {
                        let nextLayout: "grid" | "speaker" | "cinema" = "grid";
                        if (layoutMode === "grid") nextLayout = "speaker";
                        else if (layoutMode === "speaker") nextLayout = "cinema";
                        else nextLayout = "grid";
                        
                        setLayoutMode(nextLayout);
                        // Sync layout with all participants via WebSocket
                        socketService.emit('change_layout', { streamId: id, layout: nextLayout });
                      }}
                      title={`Current: ${layoutMode}. Click to switch.`}
                    >
                      {layoutMode === "grid" && <Monitor className="w-5 h-5" />}
                      {layoutMode === "speaker" && <Maximize className="w-5 h-5" />}
                      {layoutMode === "cinema" && <Monitor className="w-5 h-5 opacity-50" />}
                    </Button>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                  </>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 rounded-2xl text-white hover:bg-white/5"
                  onClick={() => {
                    loadDevices();
                    setIsSettingsOpen(true);
                  }}
                >
                  <Settings className="w-5 h-5" />
                </Button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-12 w-12 rounded-2xl text-white hover:bg-white/5",
                    isFullscreen && "text-primary"
                  )}
                  onClick={toggleFullscreen}
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>

              {/* Status Tags */}
              <div className="absolute top-6 left-6 flex items-center gap-3 z-30">
                <Badge className="bg-destructive hover:bg-destructive text-white border-none px-4 py-1.5 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-destructive/20 rounded-full">
                  Live
                </Badge>
                <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2 text-[10px] font-bold text-white shadow-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  HD 1080P
                </div>
              </div>

              {/* Floating Reactions Area */}
              <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                {reactions.map(reaction => (
                  <div 
                    key={reaction.id}
                    className="absolute bottom-0 text-3xl animate-float-up"
                    style={{ 
                      left: `${reaction.left}%`,
                    }}
                  >
                    {reaction.emoji}
                  </div>
                ))}
              </div>

              {/* Other Viewers Small Grid (Not Host/Co-Host) */}
              <div className="absolute top-6 right-6 w-56 space-y-4 z-30 pointer-events-none">
                {remoteUsers.filter(ru => {
                  const isHost = String(ru.uid) === String(streamData?.hostId?._id || streamData?.hostId?.id || streamData?.hostId);
                  const isCoHostRemote = Array.isArray(streamData?.coHosts) && streamData.coHosts.some((ch) => 
                    String(typeof ch === 'object' ? ch._id || ch.id : ch) === String(ru.uid)
                  );
                  return !isHost && !isCoHostRemote;
                }).map((remoteUser) => (
                  <div key={remoteUser.uid} className="aspect-video bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden relative shadow-2xl group/mini pointer-events-auto transition-transform hover:scale-105 duration-300">
                    {remoteCameraStatus[String(remoteUser.uid)] === false ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-[#1A1D24]">
                        <Avatar className="h-8 w-8 border border-white/5 shadow-md">
                          <AvatarFallback className="bg-[#252831] text-primary text-[10px] font-bold">
                            {participants.find(p => String(p.id) === String(remoteUser.uid))?.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-[6px] text-slate-500 font-black uppercase tracking-tighter">Off</p>
                      </div>
                    ) : (
                      <RemoteVideoPlayer user={remoteUser} isPaused={isPaused} />
                    )}
                    <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xl px-2.5 py-1.5 rounded-xl flex items-center justify-between border border-white/5">
                      <span className="text-[9px] font-bold truncate pr-2 text-white/90 tracking-tight">Viewer {remoteUser.uid}</span>
                      {!remoteUser.hasAudio && <MicOff className="w-3 h-3 text-destructive" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="h-auto min-h-[6rem] py-4 lg:h-24 bg-[#12141A]/60 backdrop-blur-2xl border-t border-white/5 px-4 lg:px-8 flex flex-col lg:flex-row items-center justify-between shrink-0 relative z-30 gap-4 lg:gap-0">
            <div className="flex items-center gap-4 lg:gap-8 w-full lg:w-1/3">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all" />
                  <Avatar className="h-14 w-14 border-2 border-white/10 shadow-2xl transition-transform group-hover:scale-105">
                    <AvatarFallback className="bg-[#252831] text-primary text-lg font-bold">
                      {streamData?.hostId?.fullName?.[0] || "H"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 bg-emerald-500 border-4 border-[#12141A] rounded-full shadow-lg" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-white group-hover:text-primary transition-colors tracking-tight">
                      {streamData?.hostId?.fullName || "Host Name"}
                    </p>
                    {isOwner && <Shield className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Audition Director</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto justify-center">
              {isBroadcaster ? (
                <div className="flex items-center bg-white/5 p-1.5 rounded-[1.25rem] border border-white/5 shadow-inner">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-10 lg:h-12 w-10 lg:w-12 rounded-xl transition-all ${!isMicOn ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "text-slate-400 hover:text-white hover:bg-white/10"}`} 
                    onClick={() => setIsMicOn(!isMicOn)}
                  >
                    {isMicOn ? <Mic className="w-4 lg:w-5 h-4 lg:h-5" /> : <MicOff className="w-4 lg:w-5 h-4 lg:h-5" />}
                  </Button>
                  <div className="w-px h-6 lg:h-8 bg-white/10 mx-1 lg:mx-1.5" />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-10 lg:h-12 w-10 lg:w-12 rounded-xl transition-all ${!isCamOn ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "text-slate-400 hover:text-white hover:bg-white/10"}`} 
                    onClick={() => setIsCamOn(!isCamOn)}
                  >
                    {isCamOn ? <Video className="w-4 lg:w-5 h-4 lg:h-5" /> : <VideoOff className="w-4 lg:w-5 h-4 lg:h-5" />}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 px-4 lg:px-6 py-2 lg:py-3 bg-primary/5 border border-primary/10 rounded-2xl shadow-inner">
                  <div className="w-2 lg:w-2.5 h-2 lg:h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(var(--primary),0.5)]" />
                  <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] lg:tracking-[0.25em] text-primary">Live Viewing</span>
                </div>
              )}
              <Button 
                variant="destructive" 
                className="h-12 lg:h-14 px-6 lg:px-8 rounded-2xl font-black uppercase text-[10px] lg:text-xs tracking-widest gap-2 lg:gap-3 shadow-2xl shadow-destructive/20 hover:scale-[1.02] active:scale-[0.98] transition-all" 
                onClick={handleLeave}
              >
                <PhoneOff className="w-4 h-4" />
                <span className="hidden sm:inline">{isOwner ? "End Audition" : "Leave Session"}</span>
                <span className="sm:hidden">{isOwner ? "End" : "Leave"}</span>
              </Button>
            </div>

            <div className="flex items-center justify-end gap-3 lg:gap-4 w-full lg:w-1/3">
              <div 
                className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-primary transition-colors group cursor-pointer active:scale-95"
                onClick={handleLike}
              >
                <Heart className="w-3.5 lg:w-4 h-3.5 lg:h-4 group-hover:scale-110 group-hover:fill-current transition-all" />
                <span className="text-[10px] lg:text-xs font-bold tracking-tight">{formatCount(likeCount)}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-12 lg:h-14 w-12 lg:w-14 rounded-2xl transition-all ${showSidebar ? "bg-primary/10 text-primary border border-primary/20 shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"}`} 
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <MessageSquare className="w-5 lg:w-6 h-5 lg:h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar - Polished Chat & Stats */}
        <div className={cn(
          "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-l border-white/5 bg-[#12141A] flex flex-col shadow-2xl z-40 lg:relative absolute right-0 top-0 bottom-0",
          showSidebar ? "w-full md:w-[380px] translate-x-0" : "w-0 translate-x-full overflow-hidden border-none"
        )}>
          <div className="flex flex-col h-full min-w-[320px] md:min-w-[380px]">
            <div className="h-20 px-6 border-b border-white/5 flex items-center justify-between bg-[#12141A]/50 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Stream Activity</h2>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
                {[
                  { id: "chat", icon: MessageSquare, label: "Chat" },
                  { id: "people", icon: Users, label: "People" },
                  { id: "info", icon: Info, label: "Info" }
                ].filter(tab => tab.id !== "people" || isBroadcaster).map((tab) => (
                  <Button 
                    key={tab.id}
                    variant="ghost" 
                    size="icon" 
                    className={`h-9 w-9 rounded-lg transition-all ${activeTab === tab.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`} 
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="w-4.5 h-4.5" />
                  </Button>
                ))}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-lg text-slate-500 hover:text-white lg:hidden" 
                  onClick={() => setShowSidebar(false)}
                >
                  <X className="w-4.5 h-4.5" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              {activeTab === "chat" && (
                <div className="absolute inset-0 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/5 hover:scrollbar-thumb-white/10 transition-all">
                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 text-[11px] text-slate-400 leading-relaxed text-center italic shadow-inner">
                      Welcome to the live audition room! Keep conversations professional and focused on the talent.
                    </div>
                    {chatMessages.map((msg, index) => {
                      const isLastFromSameSender = index > 0 && chatMessages[index - 1].sender === msg.sender;
                      return (
                        <div 
                          key={msg.id} 
                          className={cn(
                            "flex w-full animate-in fade-in slide-in-from-bottom-3 duration-500",
                            msg.isSelf ? "justify-end" : "justify-start",
                            isLastFromSameSender ? "mt-1" : "mt-6"
                          )}
                        >
                          <div className={cn(
                            "max-w-[85%] space-y-1.5",
                            msg.isSelf ? "items-end" : "items-start"
                          )}>
                            {!isLastFromSameSender && (
                              <div className={cn(
                                "flex items-center gap-2 mb-1.5 px-1",
                                msg.isSelf ? "flex-row-reverse" : "flex-row"
                              )}>
                                <Avatar className="h-6 w-6 border border-white/10 shadow-sm">
                                  <AvatarFallback className={cn(
                                    "text-[9px] font-bold",
                                    msg.isSelf ? "bg-primary/20 text-primary" : "bg-white/5 text-slate-400"
                                  )}>
                                    {msg.sender?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest",
                                  msg.isSelf ? "text-primary" : "text-slate-400"
                                )}>
                                  {msg.sender}
                                </span>
                              </div>
                            )}
                            <div className={cn(
                              "px-4 py-3 rounded-2xl text-[12px] shadow-sm transition-all hover:shadow-md",
                              msg.isSelf 
                                ? "bg-primary text-white rounded-tr-none" 
                                : "bg-white/5 text-slate-300 rounded-tl-none border border-white/5"
                            )}>
                              <p className="leading-relaxed break-words tracking-tight">{msg.text}</p>
                            </div>
                            {!isLastFromSameSender && (
                              <p className={cn(
                                "text-[8px] text-slate-600 px-2 font-black uppercase tracking-tighter",
                                msg.isSelf ? "text-right" : "text-left"
                              )}>
                                {msg.timestamp}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} className="h-2" />
                  </div>
                  
                  {/* Modern Chat Input Area */}
                  <div className="p-6 bg-[#12141A] border-t border-white/5 space-y-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                      {["👏", "💖", "🔥", "💯", "🎭", "✨", "🙌"].map(emoji => (
                        <button 
                          key={emoji} 
                          className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 hover:scale-110 active:scale-90 transition-all text-base border border-white/5" 
                          onClick={() => sendReaction(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <div className="relative group">
                      <Input 
                        placeholder="Type a message..." 
                        className="bg-[#0B0D11] border-white/10 focus:border-primary/50 rounded-2xl h-14 text-sm pl-5 pr-14 transition-all shadow-inner focus-visible:ring-0" 
                        value={chatInput} 
                        onChange={(e) => setChatInput(e.target.value)} 
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} 
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "absolute right-2 top-2 h-10 w-10 rounded-xl transition-all",
                          chatInput.trim() ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-600"
                        )} 
                        onClick={handleSendMessage} 
                        disabled={!chatInput.trim()}
                      >
                        <Play className="w-4 h-4 fill-current rotate-0" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "people" && (
                <div className="absolute inset-0 flex flex-col p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em]">Participants</h3>
                        <Badge className="bg-primary/10 text-primary rounded-lg text-[10px] h-5 border-none px-2 font-bold">
                          {participants.length}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "h-7 w-7 rounded-lg hover:bg-white/5 text-slate-500 transition-all",
                          isRefreshingParticipants && "animate-spin text-primary"
                        )}
                        onClick={refreshParticipants}
                        disabled={isRefreshingParticipants}
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    {isOwner && (
                      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 hover:bg-primary/20 gap-2 transition-all">
                            <UserPlus className="w-3.5 h-3.5" /> Invite
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#12141A] border-white/10 text-white sm:max-w-md rounded-[2rem]">
                          <DialogHeader className="space-y-4">
                            <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
                              <UserPlus className="w-8 h-8 text-primary" />
                            </div>
                            <div className="text-center space-y-2">
                              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Expand the Crew</DialogTitle>
                              <DialogDescription className="text-slate-400 text-sm">
                                Send direct invitations to talents and collaborators. They'll receive a secure access link.
                              </DialogDescription>
                            </div>
                          </DialogHeader>
                          <div className="space-y-4 py-6">
                            <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] px-1">Email Addresses</label>
                              <Textarea 
                                placeholder="talent@example.com, producer@example.com..." 
                                className="bg-[#0B0D11] border-white/10 min-h-[140px] text-sm focus:border-primary/50 rounded-2xl resize-none p-5 transition-all focus-visible:ring-0"
                                value={inviteEmails}
                                onChange={(e) => setInviteEmails(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                              onClick={handleSendInvite}
                              disabled={isInviting || !inviteEmails.trim()}
                            >
                              {isInviting ? (
                                <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Sending...</>
                              ) : (
                                "Dispatch Invites"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  <div className="space-y-2 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-white/5">
                    {participants.map((p) => (
                      <div key={p.id} className="group/user flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-10 w-10 border border-white/10 shadow-md">
                              <AvatarFallback className="bg-[#252831] text-[11px] font-bold text-slate-400">
                                {p.name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            {p.role === "host" && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center border-2 border-[#12141A] shadow-sm">
                                <Shield className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-200 truncate max-w-[140px] tracking-tight">{p.name}</p>
                              {p.isSelf && <Badge variant="outline" className="text-[8px] h-4 px-1 border-white/20 text-slate-500 uppercase font-black">You</Badge>}
                            </div>
                            <div className="flex flex-col mt-0.5">
                              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{p.role || "Viewer"}</p>
                              {p.headline && (
                                <p className="text-[10px] text-slate-400 truncate mt-1 italic font-medium leading-tight">{p.headline}</p>
                              )}
                              {p.skills && p.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {p.skills.slice(0, 3).map((skill: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="bg-white/5 text-slate-500 text-[8px] px-1.5 py-0 border-none font-bold uppercase tracking-wider h-4">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {p.skills.length > 3 && (
                                    <span className="text-[8px] text-slate-600 font-bold">+{p.skills.length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 opacity-0 group-hover/user:opacity-100 transition-all duration-300">
                            {isOwner && !p.isSelf && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10"><MoreVertical className="w-4 h-4 text-slate-500" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 bg-[#12141A] border-white/10 text-white rounded-2xl p-2 shadow-2xl">
                                  <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-3 py-2">Moderation Tools</DropdownMenuLabel>
                                  <DropdownMenuItem className="text-xs gap-3 py-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleMuteUser(p.id, p.name)}>
                                    {p.isMicOn ? <MicOff className="w-4 h-4 text-slate-400" /> : <Mic className="w-4 h-4 text-emerald-500" />}
                                    <span className="font-bold">{p.isMicOn ? "Mute Talent" : "Unmute Talent"}</span>
                                  </DropdownMenuItem>
                                  {p.role !== "co-host" && p.role !== "host" && (
                                    <DropdownMenuItem className="text-xs gap-3 py-3 rounded-xl cursor-pointer hover:bg-primary/10 text-primary transition-colors" onClick={() => handleMakeCoHost(p.id, p.name)}>
                                      <Shield className="w-4 h-4" />
                                      <span className="font-bold">Make Co-Host</span>
                                    </DropdownMenuItem>
                                  )}
                                  {p.role === "co-host" && (
                                    <DropdownMenuItem className="text-xs gap-3 py-3 rounded-xl cursor-pointer hover:bg-destructive/10 text-destructive transition-colors" onClick={() => handleRemoveCoHost(p.id, p.name)}>
                                      <Shield className="w-4 h-4" />
                                      <span className="font-bold">Remove Co-Host</span>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator className="bg-white/5 mx-2 my-1" />
                                  <DropdownMenuItem className="text-xs gap-3 py-3 rounded-xl text-destructive cursor-pointer hover:bg-destructive/10 transition-colors" onClick={() => handleKickUser(p.id, p.name)}>
                                    <UserX className="w-4 h-4" />
                                    <span className="font-bold">Remove from Session</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          {!p.isMicOn && p.role !== "viewer" && <MicOff className="w-3.5 h-3.5 text-destructive/80" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "info" && (
                <div className="absolute inset-0 p-8 space-y-10 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5">
                  <div className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] px-1">Session Protocol</h3>
                    <div className="bg-[#0B0D11] border border-white/5 rounded-[1.5rem] p-6 space-y-6 shadow-inner relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                      <div className="space-y-2.5 relative z-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Audition Identity</p>
                        <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-xl border border-white/5 group">
                          <p className="text-xs font-mono text-primary font-bold truncate pr-4">{id}</p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-white transition-all group-hover:scale-110" 
                            onClick={handleCopyLink}
                          >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2.5 relative z-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Visibility</p>
                        <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/5">
                          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-emerald-500" />
                          </div>
                          <p className="text-xs font-black text-slate-200 uppercase tracking-[0.1em]">{streamData?.visibility || "Public Session"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] px-1">Director's Brief</h3>
                    <div className="text-sm text-slate-400 leading-relaxed bg-[#0B0D11] p-6 rounded-[1.5rem] border border-white/5 shadow-inner relative overflow-hidden group">
                      <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mb-12 -mr-12 group-hover:bg-primary/10 transition-all" />
                      <p className="relative z-10">{streamData?.description || "No specific instructions or description provided for this audition session."}</p>
                    </div>
                  </div>

                  <div className="space-y-5 pb-8">
                    <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] px-1">Engagement</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-auto py-5 px-6 rounded-2xl flex-col items-center gap-3 border-white/5 bg-[#0B0D11] hover:bg-white/5 hover:border-white/10 transition-all group shadow-sm">
                        <div className="h-10 w-10 rounded-xl bg-slate-500/10 flex items-center justify-center group-hover:scale-110 transition-all">
                          <Flag className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300">File Report</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-5 px-6 rounded-2xl flex-col items-center gap-3 border-white/5 bg-[#0B0D11] hover:bg-white/5 hover:border-white/10 transition-all group shadow-sm">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-all">
                          <Smile className="w-5 h-5 text-primary group-hover:text-primary/80" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary">Send Love</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-[#12141A] border-white/10 text-white sm:max-w-md rounded-[2rem]">
          <DialogHeader className="space-y-4">
            <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
              <Settings className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Media Settings</DialogTitle>
              <DialogDescription className="text-slate-400 text-sm">
                Select your preferred camera and microphone for this session.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] px-1">Camera</label>
              <select 
                className="w-full bg-[#0B0D11] border border-white/10 rounded-2xl h-14 px-5 text-sm outline-none focus:border-primary/50 transition-all text-white"
                value={selectedCamera}
                onChange={(e) => handleDeviceChange('cam', e.target.value)}
              >
                {cameras.map(cam => (
                  <option key={cam.deviceId} value={cam.deviceId}>{cam.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] px-1">Microphone</label>
              <select 
                className="w-full bg-[#0B0D11] border border-white/10 rounded-2xl h-14 px-5 text-sm outline-none focus:border-primary/50 transition-all text-white"
                value={selectedMic}
                onChange={(e) => handleDeviceChange('mic', e.target.value)}
              >
                {mics.map(mic => (
                  <option key={mic.deviceId} value={mic.deviceId}>{mic.label}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em]"
              onClick={() => setIsSettingsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
