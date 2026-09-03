import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
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
import { cn, getApiErrorMessage } from "@/lib/utils";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

// Component to handle Agora remote tracks
const RemoteVideoPlayer = ({ user, isPaused }: { user: IAgoraRTCRemoteUser, isPaused?: boolean }) => {
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
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const triggerConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

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
  const localVideoRef = useRef<HTMLDivElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
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
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const joinHostIdRef = useRef<string | undefined>(undefined);
  const resolvedAppIdRef = useRef<string>("");

  const [isBroadcasterOverride, setIsBroadcasterOverride] = useState<boolean | null>(null);

  const isOwner = Boolean(
    streamData && user && (() => {
      const hostId = typeof streamData.hostId === 'object' ? (streamData.hostId?._id || streamData.hostId?.id) : streamData.hostId;
      const userId = user.id || user._id;
      return hostId && userId && String(hostId) === String(userId);
    })()
  );
  const isCoHost = Boolean(
    streamData && user && Array.isArray(streamData.coHosts) && (() => {
      const userId = user.id || user._id;
      return streamData.coHosts.some((coHost) => {
        const coHostId = typeof coHost === "object" ? coHost?._id || coHost?.id : coHost;
        return coHostId && userId && String(coHostId) === String(userId);
      });
    })()
  );
  const isBroadcaster = isBroadcasterOverride !== null ? isBroadcasterOverride : (isOwner || isCoHost);
  const setIsBroadcaster = (val: boolean) => setIsBroadcasterOverride(val);

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
      if (!navigator.mediaDevices?.getUserMedia) {
        setIsCamOn(false);
        setIsMicOn(false);
        return;
      }
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
        console.warn("Could not access both camera & microphone:", error);
        // Try fallback to audio only or video only if user allowed one device
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setLocalStream(audioStream);
          setIsCamOn(false);
          toast.info("Camera access denied or unavailable. Audio enabled.");
          return;
        } catch (audioErr) {}

        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setLocalStream(videoStream);
          if (previewVideoRef.current) {
            previewVideoRef.current.srcObject = videoStream;
          }
          setIsMicOn(false);
          toast.info("Microphone access denied or unavailable. Video enabled.");
          return;
        } catch (videoErr) {}

        setIsCamOn(false);
        setIsMicOn(false);
        toast.warning("Camera and Microphone permissions are blocked in your browser settings.");
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
    if (isJoined && isCamOn && localVideoRef.current && localVideoTrack) {
      localVideoTrack.play(localVideoRef.current);
    }
  }, [isJoined, isCamOn, localVideoTrack]);

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
    const currentUserId = user?.id || user?._id;

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
        name: user.fullName || (user as any).name || "",
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
      if (!id || id === 'undefined') {
        setIsLoading(false);
        navigate(-1);
        return;
      }
      try {
        let stream = null;
        try {
          const directRes = await livestreamAPI.getOne(id);
          if (directRes.data?.success && directRes.data.data) {
            stream = directRes.data.data;
          }
        } catch (err) {
          console.warn("Direct stream fetch failed, falling back to list scan:", err);
        }

        if (!stream) {
          const [myRes, publicRes] = await Promise.all([
            livestreamAPI.getMyStreams().catch(() => ({ data: { success: false } })),
            livestreamAPI.getAll().catch(() => ({ data: { success: false } }))
          ]);

          if (myRes.data?.success && Array.isArray(myRes.data.data)) {
            stream = myRes.data.data.find((s) => s._id === id || s.id === id);
          }
          if (!stream && publicRes.data?.success && Array.isArray(publicRes.data.data)) {
            stream = publicRes.data.data.find((s) => s._id === id || s.id === id);
          }
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

  const handleJoin = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
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
      const rawHostId = typeof streamData?.hostId === 'object' ? (streamData.hostId?._id || streamData.hostId?.id) : streamData?.hostId;
      const cleanHostId = (rawHostId && String(rawHostId) !== 'undefined' && String(rawHostId) !== 'null') ? String(rawHostId) : undefined;
      joinHostIdRef.current = cleanHostId;

      if (isBroadcaster) {
        response = await livestreamAPI.start(id);
      } else {
        response = await livestreamAPI.join(id, cleanHostId);
      }

      if (!response.data.success) {
        const serverErr = response.data.error || response.data.message || "Failed to get connection details from server";
        throw new Error(serverErr);
      }

      const rawData = response.data.data;
      const { rtcToken, userId: resUserId, channelName: resChannelName, stream } = rawData;
      const agoraAppId = rawData.appId || rawData.agoraAppId || response.data.appId || response.data.agoraAppId || import.meta.env.VITE_AGORA_APP_ID;
      resolvedAppIdRef.current = agoraAppId;

      // Validate required details
      if (!agoraAppId) throw new Error("Agora App ID is not configured");
      if (!rtcToken) throw new Error("RTC Token is missing from the backend response");

      // Step C: Join with String User ID (Critical)
      // The Castglo backend generates Account Tokens tied to the MongoDB _id string.
      // You MUST pass this string as the uid.
      const userId = String(resUserId || response.data.data.uid || response.data.data._id || user?.id || user?._id);
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
        const hostId = typeof streamData?.hostId === 'object' ? (streamData.hostId?._id || streamData.hostId?.id) : streamData?.hostId;
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
        let audioTrack: IMicrophoneAudioTrack | null = null;
        let videoTrack: ICameraVideoTrack | null = null;

        try {
          if (isMicOn) {
            audioTrack = await AgoraRTC.createMicrophoneAudioTrack().catch((err) => {
              console.warn("Microphone track creation failed or permission denied:", err);
              return null;
            });
          }
          if (isCamOn) {
            videoTrack = await AgoraRTC.createCameraVideoTrack().catch((err) => {
              console.warn("Camera track creation failed or permission denied:", err);
              return null;
            });
          }
        } catch (mediaErr) {
          console.warn("Media track initialization error:", mediaErr);
        }
        
        // Final check before publishing to avoid DISCONNECTING state error
        if (isMountedRef.current && client.connectionState === "CONNECTED") {
          const tracksToPublish = [audioTrack, videoTrack].filter(Boolean) as (IMicrophoneAudioTrack | ICameraVideoTrack)[];

          if (audioTrack) setLocalAudioTrack(audioTrack);
          if (videoTrack) setLocalVideoTrack(videoTrack);
          
          if (tracksToPublish.length > 0) {
            await client.publish(tracksToPublish);
            console.log("Published local tracks as host:", tracksToPublish.length);
          } else {
            toast.warning("Camera and Microphone permissions were denied in browser settings. You joined the session as a viewer.", {
              duration: 5000
            });
          }
          
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
          audioTrack?.close();
          videoTrack?.close();
        }
      }

      setIsJoined(true);
      toast.success(isBroadcaster ? "Started the live audition" : "Joined the live audition");

    } catch (error: any) {
      console.error("Agora Implementation Error:", error);
      const errMsg = getApiErrorMessage(error, "Failed to connect to the session");
      toast.error(errMsg);
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

  const handleLeave = async (bypassConfirm = false) => {
    if (!bypassConfirm) {
      const confirmMsg = isOwner ? "End the audition for everyone?" : "Leave the audition?";
      triggerConfirm(
        isOwner ? "End Audition" : "Leave Audition",
        confirmMsg,
        () => handleLeave(true)
      );
      return;
    }

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
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  // 1. Fetch initial chat history and participants ONCE when entering stream
  useEffect(() => {
    if (!id || id === 'undefined') return;

    let isMounted = true;

    const loadInitialHistory = async () => {
      try {
        const [msgRes, partRes] = await Promise.all([
          livestreamAPI.getMessages(id).catch(() => ({ data: [] })),
          livestreamAPI.getParticipants(id).catch(() => ({ data: { success: false } }))
        ]);

        if (!isMounted) return;

        // Process message history
        const rawMessages = msgRes.data?.data || (Array.isArray(msgRes.data) ? msgRes.data : []);
        if (Array.isArray(rawMessages)) {
          const currentUserId = user?.id || user?._id;
          const currentUserName = user?.fullName;
          const formattedMessages = rawMessages
            .map((msg: any) => {
              const senderId = msg.senderId || msg.sender?._id || msg.sender?.id || (typeof msg.sender === 'string' && msg.sender.length === 24 ? msg.sender : null);
              const senderName = msg.senderName || msg.sender?.fullName || (typeof msg.sender === 'string' && msg.sender.length !== 24 ? msg.sender : null);
              const isSelf = Boolean(
                (currentUserId && senderId && String(currentUserId) === String(senderId)) ||
                (currentUserName && senderName && String(currentUserName).toLowerCase() === String(senderName).toLowerCase())
              );
              
              let displayName = "Unknown";
              if (isSelf) {
                displayName = user?.fullName || "Me";
              } else if (senderName) {
                displayName = senderName;
              } else if (typeof msg.sender === 'object' && msg.sender?.fullName) {
                displayName = msg.sender.fullName;
              } else if (typeof msg.sender === 'string') {
                displayName = msg.sender.length === 24 ? "Participant" : msg.sender;
              }

              return {
                id: msg._id || msg.id,
                sender: displayName,
                text: msg.message || msg.text,
                createdAt: msg.createdAt || new Date().toISOString(),
                timestamp: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSelf
              };
            })
            .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          
          setChatMessages(formattedMessages);
        }

        // Process initial participants list
        if (partRes.data?.success && Array.isArray(partRes.data.data)) {
          const currentUserId = user?.id || user?._id;
          const apiParticipants = partRes.data.data.map((p: any) => ({
            id: String(p._id || p.id),
            name: p.fullName || p.name || "Unknown",
            role: p.role || "viewer",
            isSelf: String(p._id || p.id) === String(currentUserId),
            isMicOn: p.isMicOn ?? (p.role === 'host' || p.role === 'co-host'),
            isCamOn: p.isCamOn ?? (p.role === 'host' || p.role === 'co-host'),
            headline: p.headline,
            skills: p.skills
          }));
          setParticipants(apiParticipants);
        }
      } catch (err) {
        console.error("Failed to load initial livestream data:", err);
      }
    };

    loadInitialHistory();

    return () => {
      isMounted = false;
    };
  }, [id, user?.id, user?._id]);

  // 2. Real-time WebSocket connection and events for live chat, participants, and stream state
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !id || id === 'undefined') return;

    // Ensure socket is connected with user auth token
    socketService.connect(token);

    const handleConnect = () => {
      console.log("Socket connected/reconnected, joining livestream room:", id);
      socketService.emit('join_livestream', id);
    };

    if (socketService.isConnected()) {
      handleConnect();
    }

    socketService.on('connect', handleConnect);

    // Unified live chat message listener
    const handleIncomingMessage = (data: any) => {
      const msg = data.message || data;
      if (!msg || (!msg.text && !msg.message)) return;

      // Filter by streamId if present in payload
      const msgStreamId = msg.streamId || msg.livestreamId;
      if (msgStreamId && String(msgStreamId) !== String(id)) return;

      setChatMessages((prev: any[]) => {
        const msgId = msg._id || msg.id;
        const currentUserId = user?.id || user?._id;
        const currentUserName = user?.fullName;

        const senderId = msg.senderId || msg.sender?._id || msg.sender?.id || (typeof msg.sender === 'string' && msg.sender.length === 24 ? msg.sender : null);
        const senderName = msg.senderName || msg.sender?.fullName || (typeof msg.sender === 'string' && msg.sender.length !== 24 ? msg.sender : null);

        const isSelf = Boolean(
          (currentUserId && senderId && String(currentUserId) === String(senderId)) ||
          (currentUserName && senderName && String(currentUserName).toLowerCase() === String(senderName).toLowerCase())
        );

        // Deduplicate messages by ID or text for sender
        if (msgId && prev.some(m => m.id === msgId)) return prev;
        if (isSelf && prev.some(m => m.isSelf && (m.text === (msg.message || msg.text) || m.id === msgId))) return prev;

        let displayName = "Unknown";
        if (isSelf) {
          displayName = user?.fullName || "Me";
        } else if (senderName) {
          displayName = senderName;
        } else if (typeof msg.sender === 'object' && msg.sender?.fullName) {
          displayName = msg.sender.fullName;
        } else if (typeof msg.sender === 'string') {
          displayName = msg.sender.length === 24 ? "Participant" : msg.sender;
        }

        return [
          ...prev,
          {
            id: msgId || `socket-${Date.now()}-${Math.random()}`,
            sender: displayName,
            text: msg.message || msg.text,
            createdAt: msg.createdAt || new Date().toISOString(),
            timestamp: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf
          }
        ];
      });
    };

    socketService.on('livestream_message', handleIncomingMessage);
    socketService.on('new_livestream_message', handleIncomingMessage);

    // Stream ended event
    const handleStreamEnded = (data: any) => {
      const endedStreamId = data?.streamId || data?.livestreamId || data?.id;
      if (!endedStreamId || String(endedStreamId) === String(id)) {
        if (!isBroadcaster) {
          toast.info("The host has ended the livestream.");
          setTimeout(() => navigate(-1), 3000);
        }
      }
    };
    socketService.on('livestream_ended', handleStreamEnded);

    // Participant joined
    const handleParticipantJoined = (data: any) => {
      const newUser = data.participant || data.user || data;
      if (!newUser || !newUser.fullName) return;
      const newUserId = String(newUser._id || newUser.id);

      setParticipants((prev: any[]) => {
        if (prev.some(p => String(p.id) === newUserId)) return prev;
        return [
          ...prev,
          {
            id: newUserId,
            name: newUser.fullName || newUser.name || "Participant",
            role: newUser.role || "viewer",
            isSelf: String(user?.id || user?._id) === newUserId,
            isMicOn: false,
            isCamOn: false,
            headline: newUser.headline,
            skills: newUser.skills
          }
        ];
      });
      toast.info(`${newUser.fullName} joined the live`);
    };
    socketService.on('participant_joined', handleParticipantJoined);

    // Participant left
    const handleParticipantLeft = (data: any) => {
      const leftUserId = String(data.userId || data._id || data.id || "");
      if (leftUserId) {
        setParticipants((prev: any[]) => prev.filter(p => String(p.id) !== leftUserId));
      }
    };
    socketService.on('participant_left', handleParticipantLeft);

    // Co-host promoted
    const handleCohostPromoted = async (data: any) => {
      toast.success("You have been promoted to Co-Host!", { 
        duration: 5000,
        icon: "🎙️" 
      });
      if (id) {
        try {
          const startRes = await livestreamAPI.start(id);
          if (startRes.data.success) {
            const { token, channelName } = startRes.data.data;
            if (agoraClientRef.current) {
              const appId = startRes.data.data?.appId || startRes.data.data?.agoraAppId || resolvedAppIdRef.current || import.meta.env.VITE_AGORA_APP_ID;
              await agoraClientRef.current.leave();
              await agoraClientRef.current.join(appId, channelName, token, String(user?.id || user?._id));
              const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
              setLocalAudioTrack(audioTrack);
              setLocalVideoTrack(videoTrack);
              await agoraClientRef.current.publish([audioTrack, videoTrack]);
              setIsJoined(true);
              setIsBroadcaster(true);
              socketService.emit('toggle_camera', { streamId: id, isCamOn: true });
            }
          }
        } catch (error) {
          console.error("Re-join as co-host error:", error);
          toast.error("Failed to switch to broadcasting mode");
        }
      }
    };
    socketService.on('cohost_promoted', handleCohostPromoted);

    // Co-host added
    const handleCohostAdded = (data: any) => {
      const { userId, stream } = data;
      if (stream) setStreamData(stream);
      
      setParticipants((prev: any[]) => prev.map(p => 
        String(p.id) === String(userId) ? { ...p, role: "co-host" } : p
      ));

      const promotedUser = participants.find((p: any) => String(p.id) === String(userId));
      if (promotedUser && String(userId) !== String(user?.id)) {
        toast.info(`${promotedUser.name} is now a Co-Host`);
      }
    };
    socketService.on('cohost_added', handleCohostAdded);

    // Co-host demoted
    const handleCohostDemoted = async () => {
      toast.error("Your Co-Host permissions have been removed.", { 
        duration: 5000,
        icon: "🚫" 
      });
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

      if (id) {
        try {
          const joinRes = await livestreamAPI.join(id);
          if (joinRes.data.success) {
            const { token, channelName } = joinRes.data.data;
            if (agoraClientRef.current) {
              const appId = joinRes.data.data?.appId || joinRes.data.data?.agoraAppId || resolvedAppIdRef.current || import.meta.env.VITE_AGORA_APP_ID;
              await agoraClientRef.current.leave();
              await agoraClientRef.current.join(appId, channelName, token, String(user?.id || user?._id));
              setIsJoined(true);
            }
          }
        } catch (error) {
          console.error("Re-join as viewer error:", error);
        }
      }
    };
    socketService.on('cohost_demoted', handleCohostDemoted);

    // Layout changed
    const handleLayoutChanged = (data: any) => {
      const { layout } = data;
      if (layout && (layout === "grid" || layout === "speaker" || layout === "cinema")) {
        setLayoutMode(layout);
      }
    };
    socketService.on('layout_changed', handleLayoutChanged);

    // Reactions
    const handleIncomingReaction = (data: any) => {
      const { emoji } = data;
      const rid = Date.now() + Math.random();
      const left = Math.floor(Math.random() * 80) + 10;
      
      setReactions(prev => [...prev, { id: rid, emoji, left }]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== rid));
      }, 3000);
    };
    socketService.on('livestream_reaction', handleIncomingReaction);

    // Likes
    const handleIncomingLike = (data: any) => {
      const { count } = data;
      if (count !== undefined) setLikeCount(count);
      
      const rid = Date.now() + Math.random();
      const left = Math.floor(Math.random() * 80) + 10;
      setReactions(prev => [...prev, { id: rid, emoji: "💖", left }]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== rid));
      }, 3000);
    };
    socketService.on('livestream_like', handleIncomingLike);

    // User camera toggle
    const handleUserCameraToggled = (data: any) => {
      const { userId, isCamOn } = data;
      setRemoteCameraStatus(prev => ({ ...prev, [userId]: isCamOn }));
    };
    socketService.on('user_camera_toggled', handleUserCameraToggled);

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('livestream_message', handleIncomingMessage);
      socketService.off('new_livestream_message', handleIncomingMessage);
      socketService.off('livestream_ended', handleStreamEnded);
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
  }, [id, user?.id, user?._id, isBroadcaster, navigate]);

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

    const tempId = `temp-${Date.now()}`;
    const senderId = user?.id || user?._id;

    // 1. Update local UI immediately (Optimistic UI)
    const optimisticMessage = {
      id: tempId,
      sender: user?.fullName || "Me",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };
    setChatMessages(prev => [...prev, optimisticMessage]);

    // 2. Broadcast the message via Socket.IO immediately for real-time delivery
    socketService.emit('send_livestream_message', {
      streamId: id,
      message: {
        id: tempId,
        sender: user?.fullName,
        senderId: senderId,
        text: messageText,
        createdAt: new Date().toISOString()
      }
    });

    // 3. Persist the message in the background (asynchronous)
    try {
      const response = await livestreamAPI.postMessage(id, messageText);
      const success = response.data?.success || response.status === 201 || response.status === 200;
      const msg = response.data?.data || response.data;

      if (success && msg) {
        const realId = msg._id || msg.id;
        // Swap tempId with the real database ID
        setChatMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: realId } : m));
      }
    } catch (error) {
      console.error("Failed to persist livestream message to DB:", error);
      toast.error("Message broadcasted, but could not be saved to history.");
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

  const handleKickUser = (userId: string, userName: string, bypassConfirm = false) => {
    if (!bypassConfirm) {
      triggerConfirm(
        "Remove Participant",
        `Are you sure you want to remove ${userName}?`,
        () => handleKickUser(userId, userName, true)
      );
      return;
    }
    setParticipants(prev => prev.filter(p => p.id !== userId));
    toast.success(`${userName} removed`);
  };

  const handleMuteUser = (userId: string, userName: string) => {
    setParticipants(prev => prev.map(p => p.id === userId ? { ...p, isMicOn: !p.isMicOn } : p));
    toast.success(`Toggled mute for ${userName}`);
  };

  const handleMakeCoHost = async (userId: string, userName: string, bypassConfirm = false) => {
    if (!id) return;
    if (!bypassConfirm) {
      triggerConfirm(
        "Promote to Co-Host",
        `Are you sure you want to promote ${userName} to Co-Host?`,
        () => handleMakeCoHost(userId, userName, true)
      );
      return;
    }
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
          const stream = myRes.data.data.find((s) => s._id === id || s.id === id);
          if (stream) setStreamData(stream);
        }
      }
    } catch (error) {
      console.error("Co-host promotion error:", error);
      toast.error(error.response?.data?.message || "Failed to assign co-host");
    }
  };

  const handleRemoveCoHost = async (userId: string, userName: string, bypassConfirm = false) => {
    if (!id) return;
    if (!bypassConfirm) {
      triggerConfirm(
        "Remove Co-Host",
        `Are you sure you want to remove ${userName} from Co-Hosts?`,
        () => handleRemoveCoHost(userId, userName, true)
      );
      return;
    }
    try {
      const response = await livestreamAPI.removeCohost(id, userId);
      if (response.data.success) {
        toast.success(`${userName} removed from Co-Hosts`);
        // Emit socket event for real-time update
        socketService.emit('remove_cohost', { streamId: id, userId });
        
        // Refresh stream data
        const myRes = await livestreamAPI.getMyStreams();
        if (myRes.data.success) {
          const stream = myRes.data.data.find((s) => s._id === id || s.id === id);
          if (stream) setStreamData(stream);
        }
      }
    } catch (error) {
      console.error("Co-host removal error:", error);
      toast.error(error.response?.data?.message || "Failed to remove co-host");
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
          isSelf: String(p._id || p.id) === String(user?.id || user?._id),
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
      <div className="flex flex-col items-center justify-center h-screen gap-3 bg-slate-950 text-slate-100 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-slate-400 text-xs font-medium">Connecting to broadcast studio...</p>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-5xl w-full grid gap-10 lg:grid-cols-[1fr,380px] items-center">
          <div className="aspect-video bg-slate-900 rounded-2xl relative overflow-hidden border border-slate-800 shadow-2xl">
            {isBroadcaster ? (
              <>
                {isCamOn ? (
                  <video ref={previewVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 bg-slate-900">
                    <Avatar className="w-24 h-24 border-2 border-slate-800 bg-slate-800"><AvatarFallback className="text-2xl font-semibold text-slate-300">{user?.fullName?.[0]}</AvatarFallback></Avatar>
                    <p className="text-slate-400 font-medium text-xs">Camera is off</p>
                  </div>
                )}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 z-10">
                  <Button variant="ghost" size="icon" className={`rounded-lg h-9 w-9 transition-all ${!isMicOn ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`} onClick={() => setIsMicOn(!isMicOn)}>
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className={`rounded-lg h-9 w-9 transition-all ${!isCamOn ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`} onClick={() => setIsCamOn(!isCamOn)}>
                    {isCamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-5 bg-slate-900">
                <Avatar className="w-28 h-28 border-4 border-slate-800 shadow-xl">
                  <AvatarFallback className="bg-primary/10 text-teal-400 text-3xl font-bold">{streamData?.hostId?.fullName?.[0] || "H"}</AvatarFallback>
                </Avatar>
                <div className="text-center space-y-1">
                  <p className="text-slate-400 font-medium text-xs">Waiting for the host to start...</p>
                  <p className="text-[11px] text-slate-500">You will be joining as a viewer</p>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">{isOwner ? "Ready to start broadcast?" : "Ready to join audition?"}</h1>
              <p className="text-slate-400 text-sm font-normal line-clamp-2">{streamData?.title}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-teal-400"><Users className="w-4 h-4" /></div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    {participants.length} { participants.length === 1 ? 'participant' : 'participants' } in room
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {isOwner ? "Host workspace" : `Host: ${streamData?.hostId?.fullName || "Loading..."}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <Button type="button" size="lg" className="h-11 rounded-xl text-sm font-semibold bg-primary hover:bg-primary text-white shadow-sm transition-all" onClick={(e) => { e.preventDefault(); handleJoin(e); }}>{isOwner ? "Start Live Stream" : streamData?.status === 'live' ? "Join Now" : "Join Waiting Room"}</Button>
              <Button type="button" variant="ghost" size="lg" className="h-11 rounded-xl text-slate-400 text-xs font-medium hover:text-white hover:bg-slate-900" onClick={(e) => { e.preventDefault(); navigate(-1); }}>Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Header Bar */}
      <div className="h-14 border-b border-slate-800/80 bg-slate-950 flex items-center justify-between px-6 z-50 shrink-0 shadow-xs">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-white hover:bg-slate-900 h-8 w-8 rounded-lg transition-all" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-sm text-slate-100 tracking-tight truncate max-w-[280px]">{streamData?.title}</h1>
            <Badge variant="secondary" className="bg-slate-900 text-slate-300 text-[10px] border border-slate-800 h-5 px-2 font-medium">
              {streamData?.category || "Audition"}
            </Badge>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-medium">
              <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300 font-medium">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{participants.length}</span>
            <span className="text-slate-500 text-[10px]">in room</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all"
            onClick={handleCopyLink}
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isCopied ? "Copied" : "Share Link"}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
          <div className="flex-1 relative flex items-center justify-center p-4 lg:p-6 overflow-hidden">
            <div ref={videoContainerRef} className={cn(
              "w-full h-full max-w-6xl rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 relative group transition-all p-3",
              layoutMode === "grid" && (isBroadcaster ? remoteUsers.length + 1 : remoteUsers.length) > 1 
                ? "grid grid-cols-1 md:grid-cols-2 gap-3" 
                : "relative"
            )}>
              {/* Local Broadcaster (Host/Co-Host) */}
              {isBroadcaster && (
                <div className={cn(
                  "relative w-full h-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800",
                  (layoutMode === "speaker" || layoutMode === "cinema") && isOwner && "absolute inset-0 z-10",
                  (layoutMode === "speaker" || layoutMode === "cinema") && !isOwner && "hidden"
                )}>
                  {isCamOn ? (
                    <div className="w-full h-full bg-slate-950">
                      <div ref={localVideoRef} className="w-full h-full object-cover scale-x-[-1]" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-slate-900">
                      <Avatar className="w-20 h-20 border border-slate-800 shadow-lg">
                        <AvatarFallback className="bg-slate-800 text-teal-400 text-2xl font-bold">
                          {user?.fullName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-slate-400 font-medium text-xs">Camera is off</p>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-medium text-slate-200 z-20 flex items-center gap-1.5">
                    <span>You {isOwner && "(Host)"}</span>
                    {!isMicOn && <MicOff className="w-3 h-3 text-rose-500" />}
                  </div>
                </div>
              )}

              {/* Remote Broadcasters (Host/Co-Hosts) */}
              {remoteUsers.map((remoteUser) => {
                const isHost = String(remoteUser.uid) === String(streamData?.hostId?._id || streamData?.hostId?.id || streamData?.hostId);
                const isCoHostRemote = Array.isArray(streamData?.coHosts) && streamData.coHosts.some((ch) => 
                  String(typeof ch === 'object' ? ch._id || ch.id : ch) === String(remoteUser.uid)
                );
                
                if (!isHost && !isCoHostRemote) return null;

                return (
                  <div key={remoteUser.uid} className={cn(
                    "relative w-full h-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800",
                    (layoutMode === "speaker" || layoutMode === "cinema") && isHost && "absolute inset-0 z-10",
                    layoutMode === "speaker" && !isHost && "absolute top-4 right-4 w-52 aspect-video z-20 shadow-xl border border-slate-800",
                    layoutMode === "cinema" && !isHost && "hidden" 
                  )}>
                    {remoteCameraStatus[String(remoteUser.uid)] === false ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-slate-900">
                        <Avatar className="w-20 h-20 border border-slate-800 shadow-lg">
                          <AvatarFallback className="bg-slate-800 text-teal-400 text-2xl font-bold">
                            {participants.find(p => String(p.id) === String(remoteUser.uid))?.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-slate-400 font-medium text-xs">Camera is off</p>
                      </div>
                    ) : (
                      <RemoteVideoPlayer user={remoteUser} isPaused={isPaused} />
                    )}
                    <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-medium text-slate-200 z-20 flex items-center gap-1.5">
                      <span>{isHost ? "Host" : "Co-Host"}</span>
                      {!remoteUser.hasAudio && <MicOff className="w-3 h-3 text-rose-500" />}
                    </div>
                  </div>
                );
              })}

              {/* Cinema Mode Co-Host Bar */}
              {layoutMode === "cinema" && (isBroadcaster ? remoteUsers.length + 1 : remoteUsers.length) > 1 && (
                <div className="absolute bottom-20 left-4 right-4 h-28 flex items-center gap-3 overflow-x-auto no-scrollbar z-20 pb-1">
                  {/* Local Co-Host in Cinema Bar */}
                  {isBroadcaster && !isOwner && (
                    <div className="h-full aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800 shadow-lg relative">
                      {isCamOn ? (
                        <div ref={localVideoRef} className="w-full h-full object-cover scale-x-[-1]" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900">
                          <Avatar className="h-9 w-9"><AvatarFallback>{user?.fullName?.[0]}</AvatarFallback></Avatar>
                        </div>
                      )}
                      <div className="absolute bottom-1.5 left-1.5 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-medium">You</div>
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
                    <div key={ru.uid} className="h-full aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800 shadow-lg relative">
                      {remoteCameraStatus[String(ru.uid)] === false ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-slate-900">
                          <Avatar className="h-8 w-8 border border-slate-800">
                            <AvatarFallback className="bg-slate-800 text-teal-400 text-xs font-bold">
                              {participants.find(p => String(p.id) === String(ru.uid))?.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      ) : (
                        <RemoteVideoPlayer user={ru} isPaused={isPaused} />
                      )}
                      <div className="absolute bottom-1.5 left-1.5 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-medium">Co-Host</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Placeholder for Viewers if no one is broadcasting */}
              {!isBroadcaster && remoteUsers.length === 0 && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-5 bg-slate-900 absolute inset-0">
                  <Avatar className="w-32 h-32 border-4 border-slate-800 shadow-2xl">
                    <AvatarFallback className="bg-slate-800 text-teal-400 text-4xl font-bold">
                      {streamData?.hostId?.fullName?.[0] || "H"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-slate-400 font-medium text-xs">Waiting for the host to start the broadcast...</p>
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
              <div className="absolute top-4 left-4 flex items-center gap-2 z-30">
                <div className="bg-rose-600 text-white border-none px-2.5 py-0.5 font-semibold text-[11px] rounded-md shadow-md flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </div>
                <div className="px-2.5 py-0.5 bg-slate-950/80 backdrop-blur-md rounded-md border border-slate-800 text-[11px] font-medium text-slate-300">
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
              <div className="absolute top-4 right-4 w-52 space-y-3 z-30 pointer-events-none">
                {remoteUsers.filter(ru => {
                  const isHost = String(ru.uid) === String(streamData?.hostId?._id || streamData?.hostId?.id || streamData?.hostId);
                  const isCoHostRemote = Array.isArray(streamData?.coHosts) && streamData.coHosts.some((ch) => 
                    String(typeof ch === 'object' ? ch._id || ch.id : ch) === String(ru.uid)
                  );
                  return !isHost && !isCoHostRemote;
                }).map((remoteUser) => (
                  <div key={remoteUser.uid} className="aspect-video bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative shadow-lg group/mini pointer-events-auto transition-transform hover:scale-105 duration-300">
                    {remoteCameraStatus[String(remoteUser.uid)] === false ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-slate-900">
                        <Avatar className="h-7 w-7 border border-slate-800">
                          <AvatarFallback className="bg-slate-800 text-slate-300 text-[10px] font-medium">
                            {participants.find(p => String(p.id) === String(remoteUser.uid))?.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-[9px] text-slate-500 font-medium">Off</p>
                      </div>
                    ) : (
                      <RemoteVideoPlayer user={remoteUser} isPaused={isPaused} />
                    )}
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-md flex items-center justify-between border border-slate-800">
                      <span className="text-[10px] font-medium truncate pr-2 text-slate-200">Viewer {remoteUser.uid}</span>
                      {!remoteUser.hasAudio && <MicOff className="w-3 h-3 text-rose-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="h-16 bg-slate-950 border-t border-slate-800/80 px-6 flex items-center justify-between shrink-0 relative z-30">
            <div className="flex items-center gap-3 w-1/3">
              <Avatar className="h-9 w-9 border border-slate-800">
                <AvatarFallback className="bg-slate-800 text-slate-200 text-xs font-medium">
                  {streamData?.hostId?.fullName?.[0] || "H"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <p className="text-xs font-semibold text-slate-100 truncate">
                  {streamData?.hostId?.fullName || "Host Name"}
                </p>
                <p className="text-[10px] text-slate-400 font-normal">Audition Host</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 justify-center">
              {isBroadcaster ? (
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-xs">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-9 w-9 rounded-lg transition-all ${!isMicOn ? "bg-rose-600 text-white" : "text-slate-300 hover:bg-slate-800"}`} 
                    onClick={() => setIsMicOn(!isMicOn)}
                    title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                  <div className="w-px h-5 bg-slate-800 mx-1" />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-9 w-9 rounded-lg transition-all ${!isCamOn ? "bg-rose-600 text-white" : "text-slate-300 hover:bg-slate-800"}`} 
                    onClick={() => setIsCamOn(!isCamOn)}
                    title={isCamOn ? "Turn Off Camera" : "Turn On Camera"}
                  >
                    {isCamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-xs font-medium text-slate-300">Live Viewing Mode</span>
                </div>
              )}
              <Button 
                variant="destructive" 
                className="h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-xs" 
                onClick={() => handleLeave()}
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>{isOwner ? "End Audition" : "Leave Session"}</span>
              </Button>
            </div>

            <div className="flex items-center justify-end gap-3 w-1/3">
              <div 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:text-rose-400 transition-colors cursor-pointer text-xs font-medium active:scale-95"
                onClick={handleLike}
              >
                <Heart className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400" />
                <span>{formatCount(likeCount)}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-9 w-9 rounded-lg transition-all ${showSidebar ? "bg-slate-800 text-white border border-slate-700" : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800"}`} 
                onClick={() => setShowSidebar(!showSidebar)}
                title="Toggle Sidebar"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar - Clean Activity & Chat */}
        <div className={cn(
          "transition-all duration-300 border-l border-slate-800/80 bg-slate-950 flex flex-col shadow-xl z-40 lg:relative absolute right-0 top-0 bottom-0",
          showSidebar ? "w-full md:w-[360px] translate-x-0" : "w-0 translate-x-full overflow-hidden border-none"
        )}>
          <div className="flex flex-col h-full min-w-[320px] md:min-w-[360px]">
            <div className="h-14 px-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Room Activity</h2>
              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
                {[
                  { id: "chat", icon: MessageSquare, label: "Chat" },
                  { id: "people", icon: Users, label: "People" },
                  { id: "info", icon: Info, label: "Info" }
                ].filter(tab => tab.id !== "people" || isBroadcaster).map((tab) => (
                  <Button 
                    key={tab.id}
                    variant="ghost" 
                    size="icon" 
                    className={`h-7 w-7 rounded-md text-xs transition-all ${activeTab === tab.id ? "bg-slate-800 text-slate-100 shadow-xs" : "text-slate-400 hover:text-slate-200"}`} 
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                  </Button>
                ))}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-md text-slate-400 hover:text-white lg:hidden" 
                  onClick={() => setShowSidebar(false)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              {activeTab === "chat" && (
                <div className="absolute inset-0 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/5 hover:scrollbar-thumb-white/10 transition-all">
                    <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 text-xs text-slate-400 leading-relaxed text-center font-normal">
                      Welcome to the live audition room. Keep messages professional.
                    </div>
                    {chatMessages.map((msg, index) => {
                      const isLastFromSameSender = index > 0 && chatMessages[index - 1].sender === msg.sender;
                      return (
                        <div 
                          key={msg.id} 
                          className={cn(
                            "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                            msg.isSelf ? "justify-end" : "justify-start",
                            isLastFromSameSender ? "mt-1" : "mt-4"
                          )}
                        >
                          <div className={cn(
                            "max-w-[85%] space-y-1",
                            msg.isSelf ? "items-end" : "items-start"
                          )}>
                            {!isLastFromSameSender && (
                              <div className={cn(
                                "flex items-center gap-1.5 mb-1 px-0.5",
                                msg.isSelf ? "flex-row-reverse" : "flex-row"
                              )}>
                                <Avatar className="h-5 w-5 border border-slate-800">
                                  <AvatarFallback className={cn(
                                    "text-[9px] font-medium",
                                    msg.isSelf ? "bg-primary/20 text-teal-300" : "bg-slate-800 text-slate-400"
                                  )}>
                                    {msg.sender?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className={cn(
                                  "text-[11px] font-medium",
                                  msg.isSelf ? "text-teal-400" : "text-slate-400"
                                )}>
                                  {msg.sender}
                                </span>
                              </div>
                            )}
                            <div className={cn(
                              "px-3.5 py-2.5 rounded-xl text-xs transition-all",
                              msg.isSelf 
                                ? "bg-primary text-white rounded-tr-xs" 
                                : "bg-slate-900 text-slate-200 rounded-tl-xs border border-slate-800"
                            )}>
                              <p className="leading-relaxed break-words">{msg.text}</p>
                            </div>
                            {!isLastFromSameSender && (
                              <p className={cn(
                                "text-[9px] text-slate-500 px-1 font-normal",
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
                  
                  {/* Clean Studio Chat Input Area */}
                  <div className="p-4 bg-slate-950 border-t border-slate-800/80 space-y-3">
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                      {["👏", "💖", "🔥", "💯", "🎭", "✨", "🙌"].map(emoji => (
                        <button 
                          key={emoji} 
                          className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-xs border border-slate-800 transition-all cursor-pointer" 
                          onClick={() => sendReaction(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <div className="relative group">
                      <Input 
                        placeholder="Type a message..." 
                        className="bg-slate-900 border-slate-800 focus:border-slate-700 rounded-xl h-10 text-xs pl-3 pr-10 text-slate-200 placeholder:text-slate-500 focus-visible:ring-0" 
                        value={chatInput} 
                        onChange={(e) => setChatInput(e.target.value)} 
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} 
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "absolute right-1.5 top-1.5 h-7 w-7 rounded-lg transition-all",
                          chatInput.trim() ? "bg-primary text-white hover:bg-primary" : "text-slate-600"
                        )} 
                        onClick={handleSendMessage} 
                        disabled={!chatInput.trim()}
                      >
                        <Play className="w-3.5 h-3.5 fill-current rotate-0" />
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
                                    {p.isMicOn ? <MicOff className="w-4 h-4 text-slate-400" /> : <Mic className="w-4 h-4 text-primary" />}
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
                            {isCopied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2.5 relative z-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Visibility</p>
                        <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/5">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-primary" />
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

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent className="bg-[#12141A] border-white/10 text-white rounded-[2rem] sm:max-w-md shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase tracking-tight text-white">{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 text-sm">
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-0 mt-4">
            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white rounded-2xl h-12 font-bold px-6">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDialog.onConfirm}
              className="bg-destructive hover:bg-destructive/80 text-white rounded-2xl h-12 font-bold px-6 border-none"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
