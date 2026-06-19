import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users, Search, Filter, ChevronDown, MoreHorizontal,
  MessageSquare, Star, ThumbsDown, UserCheck, Video,
  FileText, Loader2, SlidersHorizontal, CheckSquare,
  FolderOpen, ArrowRight, ExternalLink, X, ListFilter,
  CheckCircle, Clock, Send, Mic, Award, Sparkles
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { castingCallAPI, applicationAPI, projectAPI } from "@/lib/api";
import { toast } from "sonner";
import { ApplicationDetailsModal } from "@/components/applications/ApplicationDetailsModal";

// ── Types ────────────────────────────────────────────────────────────────────
type PipelineStage =
  | "review"
  | "shortlist"
  | "contacting"
  | "audition_requested"
  | "self_tape_requested"
  | "invite"
  | "offer"
  | "hired"
  | "declined"
  | "matched";

interface Applicant {
  _id: string;
  talent?: { 
    _id: string; 
    fullName?: string; 
    profilePicture?: string;
    years_of_experience?: string;
    experience_level?: string;
  };
  status: PipelineStage;
  folder_name?: string;
  createdAt: string;
  coverLetter?: string;
  castingCall?: { _id: string; title?: string; };
  roleName?: string;
  note?: string;
}

interface Project {
  _id: string;
  title: string;
  projectName?: string;
  roles?: { id: string; title: string }[];
  applicationCount?: number;
}

// ── Pipeline Config ──────────────────────────────────────────────────────────
const STAGES: { key: PipelineStage; label: string; color: string; bgLight: string; icon: React.ReactNode }[] = [
  { key: "matched",            label: "Matched",           color: "text-indigo-600",  bgLight: "bg-indigo-50 border-indigo-200",     icon: <Sparkles className="w-3.5 h-3.5" /> },
  { key: "review",             label: "Under Review",      color: "text-slate-600",   bgLight: "bg-slate-50 border-slate-200",       icon: <Clock className="w-3.5 h-3.5" /> },
  { key: "shortlist",          label: "Shortlisted",       color: "text-blue-600",    bgLight: "bg-blue-50 border-blue-200",         icon: <CheckCircle className="w-3.5 h-3.5" /> },
  { key: "contacting",         label: "Contacting",        color: "text-purple-600",  bgLight: "bg-purple-50 border-purple-200",     icon: <Send className="w-3.5 h-3.5" /> },
  { key: "hired",              label: "Hired",             color: "text-green-700",   bgLight: "bg-green-50 border-green-200",       icon: <Award className="w-3.5 h-3.5" /> },
  { key: "declined",           label: "Declined",          color: "text-red-600",     bgLight: "bg-red-50 border-red-200",           icon: <ThumbsDown className="w-3.5 h-3.5" /> },
];

const STAGE_MAP = Object.fromEntries(STAGES.map(s => [s.key, s]));

const MOVE_TO_OPTIONS: { label: string; value: PipelineStage }[] = [
  { label: "Shortlist",          value: "shortlist" },
  { label: "Contacting",         value: "contacting" },
  { label: "Hire",               value: "hired" },
  { label: "Decline",            value: "declined" },
];

// ── Helper ────────────────────────────────────────────────────────────────────
const getInitials = (name?: string) =>
  name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";

// ── Main Component ─────────────────────────────────────────────────────────
export default function ApplicantsManagement() {
  const [projects, setProjects]         = useState<Project[]>([]);
  const [applicants, setApplicants]     = useState<Applicant[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchQuery, setSearchQuery]   = useState("");
  const [selectedIds, setSelectedIds]   = useState<Set<string>>(new Set());
  const [viewMode, setViewMode]         = useState<"kanban" | "list">("kanban");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [folders, setFolders]           = useState<string[]>(["Shortlist", "Backup", "Rejected", "Finalists"]);

  // Note / Detail panel
  const [noteOpen, setNoteOpen]         = useState(false);
  const [activeApplicant, setActiveApplicant] = useState<Applicant | null>(null);
  const [noteText, setNoteText]         = useState("");
  const [noteLoading, setNoteLoading]   = useState(false);
  
  // Application Details Modal State
  const [detailsModalAppId, setDetailsModalAppId] = useState<string | null>(null);

  // ── URL params (deep-link from DirectorRoles) ─────────────────────────────
  const [searchParams] = useSearchParams();

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const listingsRes = await projectAPI.getMe();
        const myProjects: Project[] = listingsRes.data?.success
          ? (Array.isArray(listingsRes.data.data) ? listingsRes.data.data : listingsRes.data.data?.projects || listingsRes.data.data?.castingCalls || [])
          : [];
        setProjects(myProjects);

        if (myProjects.length > 0) {
          const roleQueries: { projId: string; roleId: string; projTitle: string; roleName: string }[] = [];
          myProjects.forEach(p => {
             const roles = p.roles || [];
             roles.forEach(r => {
                roleQueries.push({ 
                   projId: p._id, 
                   roleId: r.id || r._id, 
                   projTitle: p.projectName || p.title, 
                   roleName: r.role_name || r.name || r.title 
                });
             });
          });

          const results = await Promise.all(
            roleQueries.map(q => projectAPI.getApplicants(q.projId, q.roleId).catch(() => null))
          );
          
          const allApps: Applicant[] = results.flatMap((res, i) => {
            if (!res || !res.data?.success) return [];
            const payload = res.data.data;
            const list = Array.isArray(payload) ? payload : (payload?.applicants || payload?.applications || []);
            return list.map((a: any) => {
              const userObj = (typeof a.userId === "object" ? a.userId : null) || 
                              (typeof a.talentId === "object" ? a.talentId : null) || 
                              (typeof a.talentUserId === "object" ? a.talentUserId : null) ||
                              a.talentUser || a.talent || a.user;
                              
              const talentData = {
                _id: userObj?._id || userObj?.id || (typeof a.userId === "string" ? a.userId : (typeof a.talentUserId === "string" ? a.talentUserId : a.talentId)),
                fullName: userObj?.fullName || a.fullName || a.displayName || a.display_name,
                profilePicture: userObj?.profilePicture || a.profilePicture,
                email: userObj?.email || a.email || a.talentEmail || a.userId?.email || a.talentId?.email || "",
              };

              return {
                ...a, 
                talent: talentData,
                roleId: roleQueries[i].roleId,
                roleName: roleQueries[i].roleName,
                castingCall: { ...a.castingCall, _id: roleQueries[i].projId, title: roleQueries[i].projTitle } 
              };
            });
          });
          setApplicants(allApps);
        }
      } catch {
        toast.error("Failed to load applicants.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Pre-populate filters from URL params on first load
  useEffect(() => {
    const projectParam = searchParams.get("project");
    const roleParam    = searchParams.get("role");
    if (projectParam) setSelectedProject(projectParam);
    if (roleParam)    setSelectedRole(roleParam);
  }, [searchParams]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const currentProject = projects.find(p => p._id === selectedProject);
  const filteredApplicants = useMemo(() => {
    return applicants.filter(a => {
      if (selectedProject !== "all" && a.castingCall?._id !== selectedProject) return false;
      if (selectedRole !== "all" && a.roleName !== selectedRole) return false;
      if (selectedFolder !== "all" && a.folder_name !== selectedFolder) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!a.talent?.fullName?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [applicants, selectedProject, selectedRole, searchQuery, selectedFolder]);

  // ── Kanban grouping ────────────────────────────────────────────────────────
  const kanbanColumns = useMemo(() => {
    const map: Record<string, Applicant[]> = {};
    STAGES.forEach(s => { map[s.key] = []; });
    filteredApplicants.forEach(a => {
      const stage = a.status || "review";
      if (map[stage]) map[stage].push(a); else map["review"].push(a);
    });
    return map;
  }, [filteredApplicants]);

  // ── Status mutation ───────────────────────────────────────────────────────
  const updateStatus = async (appId: string, toStatus: PipelineStage) => {
    try {
      // Use the role-level pipeline endpoint when project context is known
      const app = applicants.find(a => a._id === appId);
      const projId = selectedProject !== "all" ? selectedProject : app?.castingCall?._id;
      const roleId  = app?.roleId as string | undefined;

      if (projId && roleId) {
        // Prefer the authoritative project-scoped endpoint
        await projectAPI.updateApplicantStatus(projId, roleId, appId, { status: toStatus });
      } else if (toStatus === "shortlist") {
        await applicationAPI.shortlist(appId);
      } else if (toStatus === "declined") {
        await applicationAPI.reject(appId);
      } else if (toStatus === "hired") {
        await applicationAPI.accept(appId);
      } else {
        // Generic fallback (cross-project view, no roleId available)
        await applicationAPI.update(appId, { status: toStatus });
      }

      setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status: toStatus } : a));
      toast.success("Applicant moved.");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  // ── Bulk actions ──────────────────────────────────────────────────────────
  const bulkMove = async (toStatus: PipelineStage) => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    // If a single project + role is in scope, use the dedicated bulk endpoint
    if (selectedProject !== "all" && selectedRole !== "all") {
      try {
        await projectAPI.bulkAction(selectedProject, selectedRole, {
          applicantIds: ids,
          action: toStatus,
        });
        setApplicants(prev => prev.map(a => ids.includes(a._id) ? { ...a, status: toStatus } : a));
        setSelectedIds(new Set());
        toast.success(`${ids.length} applicants moved.`);
      } catch {
        toast.error("Bulk action failed.");
      }
      return;
    }

    // Fallback: individual updates (cross-project view)
    await Promise.all(ids.map(id => updateStatus(id, toStatus)));
    setSelectedIds(new Set());
  };

  const bulkMoveToFolder = async (folderName: string) => {
    try {
      await Promise.all([...selectedIds].map(id => applicationAPI.update(id, { folder_name: folderName })));
      setApplicants(prev => prev.map(a => selectedIds.has(a._id) ? { ...a, folder_name: folderName } : a));
      setSelectedIds(new Set());
      toast.success(`Moved to ${folderName}`);
    } catch {
      toast.error("Failed to move to folder.");
    }
  };

  // ── Checkbox helpers ──────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const isSelected = (id: string) => selectedIds.has(id);

  // ── Note dialog ────────────────────────────────────────────────────────────
  const openNote = (app: Applicant) => {
    setActiveApplicant(app);
    setNoteText(app.note || "");
    setNoteOpen(true);
  };
  const saveNote = async () => {
    if (!activeApplicant) return;
    setNoteLoading(true);
    try {
      await applicationAPI.update(activeApplicant._id, { note: noteText });
      setApplicants(prev => prev.map(a => a._id === activeApplicant._id ? { ...a, note: noteText } : a));
      toast.success("Note saved.");
      setNoteOpen(false);
    } catch {
      toast.error("Could not save note.");
    } finally {
      setNoteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Applicant card (reused in both kanban + list) ─────────────────────────
  const ApplicantCard = ({ app, compact = false }: { app: Applicant; compact?: boolean }) => {
    const stage = STAGE_MAP[app.status] || STAGE_MAP["applied"];
    return (
      <div
        className={`group relative bg-background border rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 ${
          isSelected(app._id) ? "ring-2 ring-primary border-primary" : "border-border"
        }`}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected(app._id)}
            onCheckedChange={() => toggleSelect(app._id)}
            className="mt-0.5 shrink-0"
          />
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={app.talent?.profilePicture} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {getInitials(app.talent?.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{app.talent?.fullName || "Unknown Talent"}</p>
            {app.roleName && (
              <p className="text-[11px] text-muted-foreground truncate">↳ {app.roleName}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              {new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link to={`/talent/${app.talent?._id}`} target="_blank" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openNote(app)}>
                <FileText className="w-4 h-4 mr-2" /> Add / View Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDetailsModalAppId(app._id)}>
                <MessageSquare className="w-4 h-4 mr-2" /> Details & Comm
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {app.status === "contacting" && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to={`/director/audition?email=${encodeURIComponent(app.talent?.email || "")}`} className="flex items-center gap-2 text-primary font-semibold">
                      <Video className="w-4 h-4 text-primary" /> Create Audition
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <p className="text-[11px] text-muted-foreground px-2 py-1 font-semibold uppercase tracking-wider">Move to</p>
              {MOVE_TO_OPTIONS.filter(o => o.value !== app.status).map(opt => (
                <DropdownMenuItem key={opt.value} onClick={() => updateStatus(app._id, opt.value)}>
                  <ArrowRight className="w-4 h-4 mr-2" /> {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Badge */}
        <div className="mt-2 flex items-center gap-1">
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${stage.bgLight} ${stage.color}`}>
            {stage.icon} {stage.label}
          </span>
          {app.note && <span className="text-[10px] text-muted-foreground ml-auto">📝 Note</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Applicants</h1>
          <p className="text-muted-foreground text-sm">
            {filteredApplicants.length} applicant{filteredApplicants.length !== 1 ? "s" : ""}
            {selectedProject !== "all" && currentProject ? ` on "${currentProject.projectName || currentProject.title}"` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("kanban")}
          >
            Pipeline
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Project filter */}
          <Select value={selectedProject} onValueChange={v => { setSelectedProject(v); setSelectedRole("all"); }}>
            <SelectTrigger>
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(p => (
                <SelectItem key={p._id} value={p._id}>{p.projectName || p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Role filter */}
          <Select
            value={selectedRole}
            onValueChange={setSelectedRole}
            disabled={selectedProject === "all" || !currentProject?.roles?.length}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {(currentProject?.roles || []).map(r => (
                <SelectItem key={r.id} value={r.title}>{r.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Folder filter */}
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger>
              <SelectValue placeholder="All Folders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Folders</SelectItem>
              {folders.map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Create new casting call shortcut */}
          <Button asChild variant="outline" className="w-full gap-2">
            <Link to="/director/create">
              <FolderOpen className="w-4 h-4" /> New Project
            </Link>
          </Button>
        </div>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-primary text-primary-foreground rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckSquare className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {[
              { label: "Shortlist",   value: "shortlist" as PipelineStage },
              { label: "Decline",     value: "declined" as PipelineStage },
            ].map(opt => (
              <Button key={opt.value} variant="secondary" size="sm" onClick={() => bulkMove(opt.value)}>
                {opt.label}
              </Button>
            ))}
            <div className="h-6 w-px bg-primary-foreground/30 mx-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2">
                  <FolderOpen className="w-4 h-4" /> Move to Folder
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {folders.map(f => (
                  <DropdownMenuItem key={f} onClick={() => bulkMoveToFolder(f)}>
                    {f}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  const name = prompt("Enter new folder name:");
                  if (name) {
                    setFolders(prev => [...prev, name]);
                    bulkMoveToFolder(name);
                  }
                }}>
                  + Create New Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setSelectedIds(new Set())}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── KANBAN VIEW ────────────────────────────────────────────────────── */}
      {viewMode === "kanban" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map(stage => {
              const cards = kanbanColumns[stage.key] || [];
              return (
                <div key={stage.key} className="w-72 shrink-0">
                  {/* Column header */}
                  <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl border-b-2 mb-3 ${stage.bgLight}`}>
                    <div className="flex items-center gap-2">
                      <span className={stage.color}>{stage.icon}</span>
                      <span className={`text-sm font-bold ${stage.color}`}>{stage.label}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 ${stage.color}`}>
                      {cards.length}
                    </span>
                  </div>
                  {/* Cards */}
                  <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                    {cards.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground text-xs border-2 border-dashed rounded-xl">
                        No applicants
                      </div>
                    ) : (
                      cards.map(app => <ApplicantCard key={app._id} app={app} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LIST VIEW ──────────────────────────────────────────────────────── */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            {filteredApplicants.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No applicants found.</p>
                <p className="text-sm mt-1">Try adjusting your filters or post a new casting call.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {/* Table header */}
                <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-4 py-2 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider rounded-t-xl">
                  <span className="w-4" />
                  <span>Talent</span>
                  <span>Project / Role</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>
                {filteredApplicants.map(app => {
                  const stage = STAGE_MAP[app.status] || STAGE_MAP["applied"];
                  return (
                    <div key={app._id} className={`grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors ${isSelected(app._id) ? "bg-primary/5" : ""}`}>
                      <Checkbox checked={isSelected(app._id)} onCheckedChange={() => toggleSelect(app._id)} />
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {getInitials(app.talent?.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{app.talent?.fullName || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{app.castingCall?.title || "—"}</p>
                        {app.roleName && <p className="text-xs text-muted-foreground truncate">{app.roleName}</p>}
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${stage.bgLight} ${stage.color}`}>
                          {stage.icon} {stage.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openNote(app)}>
                          <FileText className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem asChild>
                              <Link to={`/talent/${app.talent?._id}`} target="_blank">
                                <ExternalLink className="w-4 h-4 mr-2" /> View Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDetailsModalAppId(app._id)}>
                              <MessageSquare className="w-4 h-4 mr-2" /> Details & Comm
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {app.status === "contacting" && (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link to={`/director/audition?email=${encodeURIComponent(app.talent?.email || "")}`} className="flex items-center gap-2 text-primary font-semibold">
                                    <Video className="w-4 h-4 text-primary" /> Create Audition
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <p className="text-[11px] text-muted-foreground px-2 py-1 font-semibold uppercase tracking-wider">Move to</p>
                            {MOVE_TO_OPTIONS.filter(o => o.value !== app.status).map(opt => (
                              <DropdownMenuItem key={opt.value} onClick={() => updateStatus(app._id, opt.value)}>
                                <ArrowRight className="w-4 h-4 mr-2" /> {opt.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── NOTE DIALOG ────────────────────────────────────────────────────── */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Private Note</DialogTitle>
            <DialogDescription>
              Notes are private and only visible to you and your collaborators.
              <strong className="block mt-1">{activeApplicant?.talent?.fullName}</strong>
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            rows={5}
            placeholder="Write a note about this applicant..."
            className="resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button onClick={saveNote} disabled={noteLoading}>
              {noteLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Note
            </Button>
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
