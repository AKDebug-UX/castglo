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
  Play
} from "lucide-react";
import { livestreamAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function LivestreamsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [streams, setStreams] = useState<any[]>([]);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await livestreamAPI.getAll();
        if (response.data.success && Array.isArray(response.data.data)) {
          setStreams(response.data.data);
        } else {
          setStreams([]);
        }
      } catch (error) {
        console.error("Failed to fetch streams:", error);
        toast.error("Failed to load active auditions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreams();
  }, []);

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

      {/* Stats/Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-primary/5 border-primary/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Now</p>
              <p className="text-xl font-bold">{streams.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/5 border-secondary/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scheduled Today</p>
              <p className="text-xl font-bold">4</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-success/5 border-success/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Participants</p>
              <p className="text-xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Streams Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            Live Auditions
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Scanning for active sessions...</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {streams.length > 0 ? streams.map((stream) => (
              <Card key={stream._id} className="overflow-hidden group card-elevated border-destructive/10">
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-40">
                    <Video className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <Badge className="bg-destructive border-none uppercase tracking-wider text-[10px] animate-pulse">Live</Badge>
                    <Badge variant="secondary" className="bg-black/40 backdrop-blur-md text-white border-none text-[10px]">
                      {stream.category || "Audition"}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-white/20">
                        <AvatarFallback className="text-[10px] bg-primary/20 text-primary">CD</AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] text-white font-medium drop-shadow-md">Sarah Mitchell</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-white/80">
                      <Users className="w-3 h-3" />
                      3 online
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">{stream.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 h-8 mb-4">
                    {stream.description || "Join this live session to perform your monologue and receive feedback."}
                  </p>
                  <Button className="w-full" size="sm" asChild>
                    <Link to={user?.role === "talent" ? `/dashboard/livestream/${stream._id}` : `/director/livestream/${stream._id}`}>
                      <Play className="w-3 h-3 mr-2" />
                      Join Session
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl bg-muted/20">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-muted-foreground">No sessions active</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                  There are currently no live virtual auditions. You can start your own session or wait for one to begin.
                </p>
                <Button variant="outline" className="mt-6" asChild>
                  <Link to={user?.role === "talent" ? "/dashboard/audition" : "/director/audition"}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Session
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
