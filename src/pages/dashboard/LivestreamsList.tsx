import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Video, 
  Plus, 
  Search, 
  Users, 
  Calendar,
  Loader2,
  Play,
  Lock
} from "lucide-react";
import { livestreamAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LivestreamsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [myStreams, setMyStreams] = useState([]);
  const [publicStreams, setPublicStreams] = useState([]);
  const [activeTab, setActiveTab] = useState("discovery");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [myRes, publicRes] = await Promise.all([
          livestreamAPI.getMyStreams().catch(() => ({ data: { success: false } })),
          livestreamAPI.getAll().catch(() => ({ data: { success: false } }))
        ]);

        if (myRes.data?.success && Array.isArray(myRes.data.data)) {
          setMyStreams(myRes.data.data);
        }

        if (publicRes.data?.success && Array.isArray(publicRes.data.data)) {
          // Filter out private streams and the user's own streams (already in myStreams)
          const discovered = publicRes.data.data.filter((s) => 
            s.isPublic !== false && 
            (typeof s.hostId === 'object' ? s.hostId._id : s.hostId) !== user?.id
          );
          setPublicStreams(discovered);
        }
      } catch (error) {
        console.error("Failed to fetch livestreams:", error);
        toast.error("Failed to load virtual auditions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const renderStreamGrid = (streams: any[], emptyTitle: string, emptyDesc: string) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {streams.length > 0 ? streams.map((stream) => (
        <Card key={stream._id} className="overflow-hidden group card-elevated border-destructive/10">
          <div className="relative aspect-video bg-slate-900 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <Video className="w-12 h-12 text-white" />
            </div>
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <Badge className="bg-destructive border-none uppercase tracking-wider text-[10px] animate-pulse">Live</Badge>
              {stream.isPublic === false && (
                <Badge variant="secondary" className="bg-blue-500/80 text-white border-none text-[10px] gap-1">
                  <Lock className="w-2 h-2" /> Private
                </Badge>
              )}
              <Badge variant="secondary" className="bg-black/40 backdrop-blur-md text-white border-none text-[10px]">
                {stream.category || "Audition"}
              </Badge>
            </div>
            {/* ... overlay and host info ... */}
          </div>
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">{stream.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 h-8 mb-4">
              {stream.description || "Join this live session to perform your monologue and receive feedback."}
            </p>
            <Button className="w-full" size="sm" asChild>
              <Link to={user?.role === "talent" ? `/livestream/${stream._id}` : `/livestream/${stream._id}`}>
                <Play className="w-3 h-3 mr-2" />
                {(typeof stream.hostId === 'object' ? stream.hostId._id : stream.hostId) === user?.id ? "Start Session" : "Join Session"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )) : (
        <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl bg-muted/20">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Video className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-muted-foreground">{emptyTitle}</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">{emptyDesc}</p>
          <Button variant="outline" className="mt-6" asChild>
            <Link to={user?.role === "talent" ? "/dashboard/audition" : "/director/audition"}>
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Link>
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Virtual Auditions & Livestreams</h1>
          <p className="text-muted-foreground">Join active sessions or schedule a new virtual audition</p>
        </div>
        {user?.role !== "admin" && (
          <Button asChild>
            <Link to={user?.role === "talent" ? "/dashboard/audition" : "/director/audition"}>
              <Plus className="w-4 h-4 mr-2" />
              New Audition
            </Link>
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-xl h-auto">
          <TabsTrigger value="discovery" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Discover Auditions
          </TabsTrigger>
          <TabsTrigger value="my-sessions" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            My Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discovery" className="mt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Scanning for public sessions...</p>
            </div>
          ) : renderStreamGrid(
            publicStreams, 
            "No public sessions", 
            "There are currently no active public auditions. Check back later or create your own."
          )}
        </TabsContent>

        <TabsContent value="my-sessions" className="mt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Loading your sessions...</p>
            </div>
          ) : renderStreamGrid(
            myStreams, 
            "No sessions found", 
            "You haven't created any virtual auditions yet. Start your first session to discover talent or showcase your skills."
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
