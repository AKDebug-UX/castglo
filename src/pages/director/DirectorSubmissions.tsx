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
  File,
  FileText,
  Loader2,
  ArrowLeft,
  Star,
  Search,
  MessageSquare,
  MoreVertical,
  CheckSquare,
  Square,
  UserCheck,
  UserX,
  CalendarDays,
  ExternalLink,
  Pencil,
  Eye,
  Link as LinkIcon
} from "lucide-react";
import { applicationAPI, castingCallAPI, projectAPI } from "@/lib/api";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { toast } from "sonner";
import { formatLocation } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ApplicationDetailsModal } from "@/components/applications/ApplicationDetailsModal";

export default function DirectorSubmissions() {
  const { id } = useParams(); // castingCallId
  const { activeWorkspace } = useWorkspace();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [submissions, setSubmissions] = useState([]);
  const [castingCall, setCastingCall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Review Modal State
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewScore, setReviewScore] = useState(0);
  const [isReviewSaving, setIsReviewSaving] = useState(false);
  
  // Application Details Modal State
  const [detailsModalAppId, setDetailsModalAppId] = useState<string | null>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const mapSubmissionItem = (app: any, fallbackTitle?: string) => {
    const appId = app._id || app.id || app.applicationId;
    const talentObj = typeof app.talent === 'object' && app.talent ? app.talent : (
      typeof app.talentUser === 'object' && app.talentUser ? app.talentUser : (
        typeof app.user === 'object' && app.user ? app.user : null
      )
    );

    const talentName =
      talentObj?.fullName ||
      app.talentName ||
      app.fullName ||
      (typeof app.talentId === 'string' ? `Talent #${app.talentId.substring(0, 8)}` : null) ||
      (typeof app.talent === 'string' ? `Talent #${app.talent.substring(0, 8)}` : "Talent Applicant");

    const castingTitle =
      app.castingCall?.title ||
      app.castingCallId?.project_title ||
      app.project?.projectName ||
      app.castingCall?.project_title ||
      app.project?.title ||
      app.title ||
      fallbackTitle ||
      (typeof app.castingCallId === 'string' ? `Casting Call #${app.castingCallId.substring(0, 8)}` : "Casting Project");

    let cleanNotes = "";
    if (app.cover_message) {
      cleanNotes = app.cover_message;
    } else if (app.additional_notes) {
      cleanNotes = app.additional_notes;
    } else if (app.notes) {
      const metaIdx = app.notes.indexOf("\n__META__:");
      cleanNotes = metaIdx !== -1 ? app.notes.substring(0, metaIdx).trim() : app.notes.trim();
    } else if (app.why_suitable) {
      cleanNotes = app.why_suitable;
    }

    const primaryMedia =
      app.auditionVideo ||
      app.auditionVideoUrl ||
      app.mediaUrl ||
      app.fileUrl ||
      app.showreel_url ||
      (Array.isArray(app.mediaUrls) && app.mediaUrls[0]) ||
      (Array.isArray(app.attachments) && app.attachments[0]) ||
      app.headshotUrl ||
      "";

    return {
      ...app,
      _id: appId,
      id: appId,
      displayTalentName: talentName,
      displayCastingTitle: castingTitle,
      displayNotes: cleanNotes || "No notes provided",
      displayMediaUrl: primaryMedia,
      talent: talentObj ? { ...talentObj, fullName: talentName } : { fullName: talentName, _id: app.talentId || app.talent }
    };
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (id) {
        // Fetch submissions for a specific casting call
        const [subsRes, castingRes] = await Promise.all([
          applicationAPI.getByCastingCall(id).catch(() => null),
          projectAPI.getOne(id).catch(() => null)
        ]);

        let currentCastingTitle = "";
        if (castingRes && castingRes.data.success) {
          setCastingCall(castingRes.data.data);
          currentCastingTitle = castingRes.data.data?.title || castingRes.data.data?.project_title || "";
        }

        if (subsRes && subsRes.data.success) {
          const payload = subsRes.data.data;
          const apps = Array.isArray(payload) ? payload : (payload?.applications || []);
          const mappedApps = apps.map((app: any) => mapSubmissionItem(app, currentCastingTitle));
          setSubmissions(mappedApps);
        } else {
          setSubmissions([]);
        }
      } else {
        // Fetch all submissions for all director's projects
        const isPersonal = activeWorkspace === "Personal";
        const ownerId = !isPersonal ? (
          (activeWorkspace as any)?.owner?._id || 
          (activeWorkspace as any)?.owner?.id ||
          (typeof (activeWorkspace as any)?.owner === "string" ? (activeWorkspace as any)?.owner : null) || 
          (activeWorkspace as any)?.inviter?._id || 
          (activeWorkspace as any)?.inviter?.id ||
          (typeof (activeWorkspace as any)?.inviter === "string" ? (activeWorkspace as any)?.inviter : null)
        ) : null;

        const listingsRes = isPersonal 
          ? await projectAPI.getMe() 
          : (ownerId ? await projectAPI.getWorkspaceProjects(ownerId) : await projectAPI.getMe());

        if (listingsRes.data?.success) {
          const myCastings = Array.isArray(listingsRes.data.data)
            ? listingsRes.data.data
            : listingsRes.data.data?.projects || listingsRes.data.data?.castingCalls || [];
          
          if (myCastings.length > 0) {
            const allAppsPromises = myCastings.map((c) => {
              if (c.applicationCount === 0 || c.applicantCount === 0) {
                return Promise.resolve({ data: { success: true, data: [] } } as any);
              }
              return applicationAPI.getByCastingCall(c._id || c.id).catch(() => null);
            });
            const appsResults = await Promise.all(allAppsPromises);
            const allApps = appsResults.flatMap(res => {
              if (!res || !res.data.success) return [];
              const payload = res.data.data;
              return Array.isArray(payload) ? payload : (payload?.applications || []);
            });
            
            const mappedApps = allApps.map((app: any) => mapSubmissionItem(app));
            
            // Sort by most recent
            setSubmissions(mappedApps.sort((a: any, b: any) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ));
          } else {
            setSubmissions([]);
          }
        } else {
          setSubmissions([]);
        }
        setCastingCall(null); // Reset casting call context
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, activeWorkspace]);

  const handleAction = async (appId: string, action: 'shortlist' | 'accept' | 'reject') => {
    if (!appId || appId === "undefined") {
      toast.error(`Invalid application ID`);
      return;
    }
    setActionLoading(appId);
    try {
      let response;
      if (action === 'shortlist') response = await applicationAPI.shortlist(appId);
      else if (action === 'accept') response = await applicationAPI.accept(appId);
      else response = await applicationAPI.reject(appId);

      if (response.data.success) {
        toast.success(`Application ${action}ed`);
        setSubmissions(prev => prev.map(s => (s._id || s.id) === appId ? { ...s, status: action === 'shortlist' ? 'shortlisted' : action === 'accept' ? 'accepted' : 'rejected' } : s));
      }
    } catch (error) {
      toast.error(`Failed to ${action} application`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action: 'shortlist' | 'reject') => {
    if (selectedIds.length === 0) return;
    
    setActionLoading("bulk");
    try {
      await Promise.all(selectedIds.map(appId => 
        action === 'shortlist' ? applicationAPI.shortlist(appId) : applicationAPI.reject(appId)
      ));
      
      toast.success(`${selectedIds.length} applications ${action}ed successfully`);
      fetchData();
      setSelectedIds([]);
    } catch (error) {
      toast.error(`Failed to perform bulk ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveReview = async () => {
    const targetId = selectedSubmission?._id || selectedSubmission?.id;
    if (!targetId) {
      toast.error("Invalid submission ID");
      return;
    }
    
    setIsReviewSaving(true);
    try {
      const response = await applicationAPI.update(targetId, {
        directorNotes: reviewNotes,
        directorScore: reviewScore
      });
      
      if (response.data.success) {
        toast.success("Review saved successfully");
        setSubmissions(prev => prev.map(s => (s._id || s.id) === targetId ? { ...s, directorNotes: reviewNotes, directorScore: reviewScore } : s));
        setSelectedSubmission(null);
      }
    } catch (error) {
      toast.error("Failed to save review");
    } finally {
      setIsReviewSaving(false);
    }
  };

  const toggleSelect = (appId: string) => {
    setSelectedIds(prev => 
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSubmissions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSubmissions.map(s => s._id));
    }
  };

  const statusColors: Record<string, string> = {
    applied: "bg-warning text-warning-foreground",
    shortlisted: "bg-primary text-primary-foreground",
    accepted: "bg-success text-success-foreground",
    rejected: "bg-destructive text-destructive-foreground",
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = searchQuery === "" || 
      sub.talent?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.castingCall?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.project?.projectName?.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (!matchesSearch) return false;

    const statusStr = String(sub.status || "").toLowerCase();

    if (activeTab === "all") return true;
    if (activeTab === "pending") return ["pending", "submitted", "applied", "viewed", "in_review"].includes(statusStr);
    if (activeTab === "shortlisted" || activeTab === "short") return ["shortlisted", "short"].includes(statusStr);
    if (activeTab === "accepted") return ["accepted", "approved", "hired"].includes(statusStr);
    if (activeTab === "rejected") return ["rejected", "declined", "withdrawn"].includes(statusStr);
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{castingCall?.title || "Project Deliverables"}</h1>
          <p className="text-muted-foreground">Review and manage talent work done</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search talent or project..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs and View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-5 h-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="shortlisted">Short</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 mr-2 animate-in fade-in slide-in-from-right-2">
              <span className="text-xs font-bold text-muted-foreground">{selectedIds.length} selected</span>
              <Button size="sm" variant="outline" className="h-8" onClick={() => handleBulkAction('shortlist')}>
                Shortlist
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-destructive" onClick={() => handleBulkAction('reject')}>
                Reject
              </Button>
            </div>
          )}
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
            <Card key={submission._id} className={`card-elevated overflow-hidden transition-all ${selectedIds.includes(submission._id) ? 'ring-2 ring-primary bg-primary/5 shadow-lg' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <Checkbox 
                        checked={selectedIds.includes(submission._id)}
                        onCheckedChange={() => toggleSelect(submission._id)}
                        className="absolute -top-1 -left-1 z-10 opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100 transition-opacity"
                      />
                      <Avatar className="cursor-pointer" onClick={() => toggleSelect(submission._id)}>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {submission.talent?.fullName?.[0] || 'T'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="font-semibold">{submission.displayTalentName || submission.talent?.fullName || "Talent Applicant"}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {formatLocation(submission.talent?.location || submission.location_override)}
                      </p>
                      {submission.talent?.role === "industry_professional" && (
                        <Badge variant="outline" className="text-[10px] py-0 px-2 mt-1 bg-teal-50/50 text-teal-700 border-teal-200 font-semibold">
                          Industry Professional
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge className={statusColors[submission.status] || "bg-muted"}>
                    {submission.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground">Submitted: {new Date(submission.createdAt).toLocaleDateString()}</p>
                  {submission.directorScore > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="text-xs font-bold">{submission.directorScore}</span>
                    </div>
                  )}
                </div>

                {/* Video / Media Preview */}
                <div 
                  className="relative aspect-video rounded-lg bg-slate-900 mb-3 flex items-center justify-center group cursor-pointer overflow-hidden border border-slate-800"
                  onClick={() => {
                    setSelectedSubmission(submission);
                    setReviewNotes(submission.directorNotes || "");
                    setReviewScore(submission.directorScore || 0);
                  }}
                >
                  {(() => {
                    const media = submission.displayMediaUrl || submission.auditionVideo || submission.mediaUrl;
                    const isVideo = media && (media.endsWith('.mp4') || media.endsWith('.webm') || media.endsWith('.mov') || media.includes('video/upload'));
                    const isImg = media && (media.endsWith('.png') || media.endsWith('.jpg') || media.endsWith('.jpeg') || media.endsWith('.webp') || media.includes('image/upload') || media.includes('ui-avatars'));

                    if (isVideo) {
                      return <video src={media} className="w-full h-full object-cover" />;
                    }
                    if (isImg) {
                      return <img src={media} className="w-full h-full object-cover" alt="Submission Preview" />;
                    }
                    if (media && (media.endsWith('.pdf') || media.endsWith('.docx') || media.endsWith('.doc'))) {
                      return (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-4 bg-slate-100">
                          <File className="w-8 h-8 text-[#009698] mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Document Deliverable</span>
                        </div>
                      );
                    }
                    return (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-slate-900 rounded-lg flex items-center justify-center">
                        <Play className="w-8 h-8 text-white/80" />
                      </div>
                    );
                  })()}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      Review Deliverable
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 italic">
                  "{submission.displayNotes || submission.notes || "No notes provided"}"
                </p>

                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setReviewNotes(submission.directorNotes || "");
                      setReviewScore(submission.directorScore || 0);
                    }}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Review
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setDetailsModalAppId(submission._id || submission.id)}>
                        <MessageSquare className="w-4 h-4 mr-2" /> Details & Comm
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction(submission._id || submission.id, 'shortlist')}>
                        <Star className="w-4 h-4 mr-2" /> Shortlist
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction(submission._id || submission.id, 'accept')}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Accept
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction(submission._id || submission.id, 'reject')} className="text-destructive">
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
               No deliverables found.
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredSubmissions.length > 0 ? (
            <div className="border rounded-xl overflow-hidden bg-white">
              <div className="bg-muted/50 p-3 flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <div className="w-6">
                  <Checkbox 
                    checked={selectedIds.length === filteredSubmissions.length && filteredSubmissions.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </div>
                <div className="flex-1">Talent</div>
                <div className="w-32">Status</div>
                <div className="w-32">Date</div>
                <div className="w-24 text-center">Score</div>
                <div className="w-24">Actions</div>
              </div>
              {filteredSubmissions.map((submission) => {
                const subId = submission._id || submission.id;
                return (
                <div 
                  key={subId} 
                  className={`flex items-center gap-4 p-3 border-t hover:bg-muted/30 transition-colors ${selectedIds.includes(subId) ? 'bg-primary/5' : ''}`}
                >
                  <div className="w-6">
                    <Checkbox 
                      checked={selectedIds.includes(subId)}
                      onCheckedChange={() => toggleSelect(subId)}
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        {(submission.displayTalentName || submission.talent?.fullName || 'T')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <p className="font-medium text-sm truncate">{submission.displayTalentName || submission.talent?.fullName || "Talent Applicant"}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{submission.displayCastingTitle || submission.castingCall?.title || "Casting Project"}</p>
                    </div>
                  </div>
                  <div className="w-32">
                    <Badge className={`${statusColors[submission.status] || "bg-muted"} text-[10px] h-5`}>
                      {submission.status}
                    </Badge>
                  </div>
                  <div className="w-32 text-[10px] text-muted-foreground">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </div>
                  <div className="w-24 text-center">
                    {submission.directorScore > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 fill-primary text-primary" />
                        <span className="text-xs font-bold">{submission.directorScore}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </div>
                  <div className="w-24 flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedSubmission(submission)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetailsModalAppId(submission._id || submission.id)}>
                          <MessageSquare className="w-4 h-4 mr-2" /> Details & Comm
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(submission._id || submission.id, 'shortlist')}>
                          <Star className="w-4 h-4 mr-2" /> Shortlist
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(submission._id || submission.id, 'accept')}>
                          <CheckCircle className="w-4 h-4 mr-2" /> Accept
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction(submission._id || submission.id, 'reject')} className="text-destructive">
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
               No deliverables found.
            </div>
          )}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              Reviewing Application: {selectedSubmission?.displayTalentName || selectedSubmission?.talent?.fullName || "Talent Applicant"}
              <Badge className={statusColors[selectedSubmission?.status] || "bg-muted"}>
                {selectedSubmission?.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Project: {selectedSubmission?.displayCastingTitle || selectedSubmission?.castingCall?.title || castingCall?.title || "Casting Project"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-[1fr,320px] gap-6 mt-4">
            {/* Left Column: Media & Notes */}
            <div className="space-y-6">
              <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-2xl relative group flex items-center justify-center border border-slate-800">
                {(() => {
                  const media = selectedSubmission?.displayMediaUrl || selectedSubmission?.auditionVideo || selectedSubmission?.mediaUrl;
                  const isVideo = media && (media.endsWith('.mp4') || media.endsWith('.webm') || media.endsWith('.mov') || media.includes('video/upload'));
                  const isImg = media && (media.endsWith('.png') || media.endsWith('.jpg') || media.endsWith('.jpeg') || media.endsWith('.webp') || media.includes('image/upload') || media.includes('ui-avatars'));
                  const isDoc = media && (media.endsWith('.pdf') || media.endsWith('.docx') || media.endsWith('.doc'));

                  if (isVideo) {
                    return (
                      <video 
                        src={media} 
                        controls 
                        className="w-full h-full object-contain"
                        autoPlay
                      />
                    );
                  }

                  if (isImg) {
                    return (
                      <img 
                        src={media} 
                        className="w-full h-full object-contain" 
                        alt="Deliverable / Portfolio Media" 
                      />
                    );
                  }

                  if (isDoc) {
                    return (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4 p-6 bg-slate-900/90">
                        <File className="w-16 h-16 text-[#009698]" />
                        <p className="text-lg font-medium opacity-90">Document Deliverable Submitted</p>
                        <Button variant="outline" className="border-teal-400 text-teal-400 hover:bg-teal-400/10" asChild>
                          <a href={media} target="_blank" rel="noopener noreferrer">
                            Open PDF / Document
                          </a>
                        </Button>
                      </div>
                    );
                  }

                  if (media) {
                    return (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white gap-3 p-6 bg-slate-900">
                        <LinkIcon className="w-12 h-12 text-[#009698]" />
                        <p className="text-xs font-bold text-slate-300 truncate max-w-md">{media}</p>
                        <Button variant="outline" size="sm" className="text-teal-400 border-teal-400/40 hover:bg-teal-400/10" asChild>
                          <a href={media} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Deliverable Link
                          </a>
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white gap-2 p-6 text-center bg-slate-900">
                      <FileText className="w-12 h-12 text-slate-500 mb-1" />
                      <p className="text-sm font-bold text-slate-300">No Direct Media File Attached</p>
                      {selectedSubmission?.showreel_url && (
                        <Button variant="outline" size="sm" className="mt-2 text-teal-400 border-teal-400/40 hover:bg-teal-400/10" asChild>
                          <a href={selectedSubmission.showreel_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Showreel Link
                          </a>
                        </Button>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="bg-muted/30 p-4 rounded-2xl space-y-2">
                <h4 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  Talent's Notes & Application Message
                </h4>
                <p className="text-sm italic text-slate-800">
                  "{selectedSubmission?.displayNotes || selectedSubmission?.notes || "No notes provided by the talent."}"
                </p>
                {selectedSubmission?.portfolio_links && (
                  <p className="text-xs font-semibold text-[#009698] pt-1">
                    Portfolio Link: <a href={selectedSubmission.portfolio_links} target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-700">{selectedSubmission.portfolio_links}</a>
                  </p>
                )}
                {selectedSubmission?.previous_work_links && (
                  <p className="text-xs font-semibold text-[#009698]">
                    Previous Work: <a href={selectedSubmission.previous_work_links} target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-700">{selectedSubmission.previous_work_links}</a>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <Button variant="outline" className="flex-1 rounded-xl" asChild>
                  <Link to={`/talent/${selectedSubmission?.talent?._id || selectedSubmission?.talentId || selectedSubmission?.talent?.id}`}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Full Profile
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl" asChild>
                  <Link to={`/director/messages?talentId=${selectedSubmission?.talent?._id || selectedSubmission?.talentId || selectedSubmission?.talent?.id}`}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Talent
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column: Director Review */}
            <div className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-slate-500">
                  <Star className="w-4 h-4" />
                  Audition Score
                </h4>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewScore(star)}
                      className={`transition-all ${reviewScore >= star ? 'scale-110' : 'scale-100 hover:scale-105'}`}
                    >
                      <Star 
                        className={`w-8 h-8 ${reviewScore >= star ? 'fill-primary text-primary' : 'text-slate-300'}`} 
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-black text-xl text-primary">{reviewScore}/5</span>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              <div className="space-y-3">
                <h4 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-slate-500">
                  <Pencil className="w-4 h-4" />
                  Internal Notes
                </h4>
                <Textarea 
                  placeholder="Private notes for your casting team..." 
                  className="rounded-xl min-h-[150px] bg-white border-slate-200"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
                <p className="text-[10px] text-slate-400">These notes are only visible to you and your team.</p>
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  className="w-full h-12 rounded-2xl font-bold bg-[#009698] hover:bg-[#009698]/90 shadow-lg shadow-[#009698]/20"
                  onClick={handleSaveReview}
                  disabled={isReviewSaving}
                >
                  {isReviewSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Review
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="rounded-xl font-bold border-slate-200 h-10"
                    onClick={() => handleAction(selectedSubmission._id || selectedSubmission.id, 'shortlist')}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === (selectedSubmission?._id || selectedSubmission?.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : "Shortlist"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-xl font-bold border-red-100 text-red-500 hover:bg-red-50 h-10"
                    onClick={() => handleAction(selectedSubmission._id || selectedSubmission.id, 'reject')}
                    disabled={!!actionLoading}
                  >
                    Reject
                  </Button>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  className="w-full h-12 rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                  onClick={() => handleAction(selectedSubmission._id || selectedSubmission.id, 'accept')}
                  disabled={!!actionLoading}
                >
                  <Award className="w-5 h-5 mr-2" />
                  Accept Talent
                </Button>
              </div>
              
              <div className="flex justify-center pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground flex items-center gap-1"
                  asChild
                >
                  <Link to={`/director/audition?talentId=${selectedSubmission?.talent?._id || selectedSubmission?.talent?.id}`}>
                    <CalendarDays className="w-3.5 h-3.5" />
                    Schedule Interview
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ApplicationDetailsModal 
        applicationId={detailsModalAppId} 
        isOpen={!!detailsModalAppId} 
        onClose={() => setDetailsModalAppId(null)} 
      />
    </div>
  );
}
