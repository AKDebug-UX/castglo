import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Grid3X3, 
  List, 
  Play,
  MapPin,
  CheckCircle,
  XCircle,
  Award,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { applicationAPI, castingCallAPI } from "@/lib/api";
import { toast } from "sonner";

export default function DirectorSubmissions() {
  const { id } = useParams(); // castingCallId
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [castingCall, setCastingCall] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [subsRes, castingRes] = await Promise.all([
        applicationAPI.getByCastingCall(id),
        castingCallAPI.getOne(id)
      ]);

      if (subsRes.data.success && Array.isArray(subsRes.data.data)) {
        setSubmissions(subsRes.data.data);
      } else {
        setSubmissions([]);
      }
      if (castingRes.data.success) {
        setCastingCall(castingRes.data.data);
      }
    } catch (error: any) {
      toast.error("Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAction = async (appId: string, action: 'shortlist' | 'accept' | 'reject') => {
    setActionLoading(appId);
    try {
      let response;
      if (action === 'shortlist') response = await applicationAPI.shortlist(appId);
      else if (action === 'accept') response = await applicationAPI.accept(appId);
      else response = await applicationAPI.reject(appId);

      if (response.data.success) {
        toast.success(`Application ${action}ed`);
        setSubmissions(prev => prev.map(s => s._id === appId ? { ...s, status: action === 'shortlist' ? 'shortlisted' : action === 'accept' ? 'accepted' : 'rejected' } : s));
      }
    } catch (error: any) {
      toast.error(`Failed to ${action} application`);
    } finally {
      setActionLoading(null);
    }
  };

  const statusColors: Record<string, string> = {
    applied: "bg-warning text-warning-foreground",
    shortlisted: "bg-primary text-primary-foreground",
    accepted: "bg-success text-success-foreground",
    rejected: "bg-destructive text-destructive-foreground",
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return sub.status === "applied";
    if (activeTab === "shortlisted") return sub.status === "shortlisted";
    if (activeTab === "accepted") return sub.status === "accepted";
    if (activeTab === "rejected") return sub.status === "rejected";
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link 
        to="/director/projects" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Projects
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{castingCall?.title || "Project Submissions"}</h1>
          <p className="text-muted-foreground">Review and manage talent applications</p>
        </div>
      </div>

      {/* Tabs and View Toggle */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === "grid" ? "secondary" : "ghost"} 
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === "list" ? "secondary" : "ghost"} 
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubmissions.length > 0 ? filteredSubmissions.map((submission) => (
            <Card key={submission._id} className="card-elevated overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {submission.talent?.fullName?.[0] || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{submission.talent?.fullName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {submission.talent?.location || "Remote"}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColors[submission.status] || "bg-muted"}>
                    {submission.status}
                  </Badge>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-muted-foreground">Submitted: {new Date(submission.createdAt).toLocaleDateString()}</p>
                </div>

                {/* Video Preview */}
                <div className="relative aspect-video rounded-lg bg-muted mb-3 flex items-center justify-center group cursor-pointer overflow-hidden">
                  {submission.auditionVideo ? (
                    <video src={submission.auditionVideo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-center justify-center">
                       <Play className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 text-xs text-white/80 flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    Review Audition
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 italic">
                  "{submission.notes || "No notes provided"}"
                </p>

                <div className="flex flex-wrap gap-2">
                  {submission.status === "applied" && (
                    <>
                      <Button 
                        size="sm" 
                        className="flex-1" 
                        onClick={() => handleAction(submission._id, 'shortlist')}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === submission._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Star className="w-3 h-3 mr-1" />}
                        Shortlist
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleAction(submission._id, 'reject')}
                        disabled={!!actionLoading}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {submission.status === "shortlisted" && (
                    <Button 
                      size="sm" 
                      className="w-full bg-success hover:bg-success/90"
                      onClick={() => handleAction(submission._id, 'accept')}
                      disabled={!!actionLoading}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Accept Talent
                    </Button>
                  )}
                  {submission.status === "accepted" && (
                    <Badge variant="outline" className="w-full justify-center py-1">
                       <Award className="w-3 h-3 mr-1 text-success" />
                       Role Awarded
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
               No submissions found in this category.
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredSubmissions.length > 0 ? filteredSubmissions.map((submission) => (
            <Card key={submission._id} className="card-elevated">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {submission.talent?.fullName?.[0] || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{submission.talent?.fullName}</p>
                        <Badge className={statusColors[submission.status] || "bg-muted"}>
                          {submission.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Submitted: {new Date(submission.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                       <Link to={`/director/submissions/${submission._id}`}>Review</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-12 text-muted-foreground">
               No submissions found in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
