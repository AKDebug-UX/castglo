import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, Search, Filter, ArrowRight, 
  Clapperboard, Sparkles, MoreHorizontal,
  Loader2, Plus, Calendar, Tag, Copy, Trash2
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { projectAPI } from "@/lib/api";
import { toast } from "sonner";
import { getProjectDeadline } from "@/lib/project.utils";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface RoleItem {
  id: string;
  projectId: string;
  projectName: string;
  roleName: string;
  roleType: string;
  status: "open" | "filled" | "closed" | string;
  applicantCount: number;
  deadline: string;
  /** Full raw role payload — used when duplicating */
  _raw?: any;
}

export default function DirectorRoles() {
  const [roles, setRoles]         = useState<RoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const { activeWorkspace, getPermissionsForProject } = useWorkspace();

  const load = async () => {
    setIsLoading(true);
    try {
      const isPersonal = activeWorkspace === "Personal";
      let listings: any[] = [];
      try {
        const ownerId = !isPersonal ? (
          activeWorkspace.owner?._id || 
          activeWorkspace.owner || 
          activeWorkspace.inviter?._id || 
          activeWorkspace.inviter
        ) : null;

        if (!isPersonal && !ownerId) {
          throw new Error("Owner ID is undefined");
        }

        const res = isPersonal 
          ? await projectAPI.getMe() 
          : await projectAPI.getWorkspaceProjects(ownerId as string);
          
        if (res.data?.success) {
          listings = Array.isArray(res.data.data)
            ? res.data.data
            : res.data.data?.projects || res.data.data?.castingCalls || [];
        }
      } catch (apiError) {
        if (!isPersonal) {
          console.warn("Failed to fetch workspace projects from API, falling back to local data:", apiError);
          let extractedProjects: any[] = [];
          
          if (activeWorkspace.projectGrants && activeWorkspace.projectGrants.length > 0) {
            const promises = activeWorkspace.projectGrants.map(async (grant: any) => {
              const p = grant.projectId;
              if (p && typeof p === 'object' && p._id) return p;
              if (typeof p === 'string') {
                const res = await projectAPI.getOne(p).catch(() => null);
                return res?.data?.data;
              }
              return null;
            });
            const results = await Promise.all(promises);
            extractedProjects = results.filter(Boolean);
          }
          
          if (extractedProjects.length === 0) {
            let singleProject = activeWorkspace.project || activeWorkspace.castingCall;
            if (singleProject && typeof singleProject === 'string') {
              const res = await projectAPI.getOne(singleProject).catch(() => null);
              singleProject = res?.data?.data;
            }
            if (singleProject && typeof singleProject === 'object' && (singleProject._id || singleProject.id)) {
              extractedProjects = [singleProject];
            }
          }
            
          if (extractedProjects.length > 0) {
            listings = extractedProjects;
          } else {
            console.warn("No populated projects found in grants or collaboration. Defaulting to empty list.");
            listings = [];
          }
        } else {
          throw apiError;
        }
      }

      // Fan-out: fetch live roles for each project in parallel
      const roleResults = await Promise.all(
        listings.map(p =>
          projectAPI.getRoles(p._id)
            .then(r => ({ projectId: p._id, project: p, roles: r.data?.data || r.data?.data?.roles || [] }))
            .catch(() => ({ projectId: p._id, project: p, roles: [] }))
        )
      );

      const flattenedRoles: RoleItem[] = roleResults.flatMap(({ project, roles: pRoles }) =>
        (Array.isArray(pRoles) ? pRoles : []).map((r: any) => ({
          id: r.id || r._id,
          projectId: project._id,
          projectName: project.projectName || project.title || "Untitled",
          roleName: r.role_name || r.name || r.title || "Unnamed Role",
          roleType: r.roleType || r.role_type || r.type || "Other",
          status: (project.status || "open").toLowerCase(),
          applicantCount: r.applicationCount || r.applicantCount || 0,
          deadline: getProjectDeadline(project),
          _raw: r,
        }))
      );

      setRoles(flattenedRoles);
    } catch {
      toast.error("Failed to load roles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [activeWorkspace]);

  const handleDeleteRole = async (role: RoleItem) => {
    if (!confirm(`Delete role "${role.roleName}"? This will also remove all its applicants.`)) return;
    setDeletingId(role.id);
    try {
      await projectAPI.deleteRole(role.projectId, role.id);
      setRoles(prev => prev.filter(r => r.id !== role.id));
      toast.success("Role deleted.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete role.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicateRole = async (role: RoleItem) => {
    setDuplicatingId(role.id);
    try {
      const raw = role._raw || {};
      const payload = {
        name: `${role.roleName} (Copy)`,
        roleType: raw.roleType || role.roleType || "Other",
        status: "active",
        roleDescription: raw.roleDescription || raw.description || "",
        ageRange: raw.ageRange || { min: 18, max: 35 },
        gender: raw.gender || "any",
        ethnicity: raw.ethnicity || "any",
        skillsRequired: raw.skillsRequired || [],
        nudityRequired: raw.nudityRequired ?? false,
        mediaRequiredFromApplicants: raw.mediaRequiredFromApplicants || [],
        locationRequirements: raw.locationRequirements || "any",
        accentRequirements: raw.accentRequirements || "any",
        languageRequirements: raw.languageRequirements || "English",
        unionStatusRequirement: raw.unionStatusRequirement || "any",
        availabilityRequirement: raw.availabilityRequirement || "flexible",
        preAudition: raw.preAudition || {},
      };
      await projectAPI.createRole(role.projectId, payload);
      toast.success("Role duplicated.");
      load(); // refresh
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to duplicate role.");
    } finally {
      setDuplicatingId(null);
    }
  };

  const filteredRoles = roles.filter(r =>
    r.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary" /> Collective Roles
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of all character roles across your active and past projects.
          </p>
        </div>
        {activeWorkspace === "Personal" && (
          <Button asChild className="gap-2">
            <Link to="/director/create"><Plus className="w-4 h-4" /> Add Role</Link>
          </Button>
        )}
      </header>

      {/* Filters */}
      <Card className="p-4 bg-muted/20 border-none shadow-none">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by role or project..." 
              className="pl-9 bg-background" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Roles Grid */}
      {filteredRoles.length === 0 ? (
        <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed">
          <Clapperboard className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <h3 className="font-bold text-lg">No roles found</h3>
          <p className="text-muted-foreground text-sm mt-1">Start by creating a new project with roles.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="group hover:shadow-md transition-all shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center">
                  {/* Status Strip */}
                  <div className={`w-full md:w-1.5 h-1.5 md:h-auto shrink-0 ${
                    role.status === "open" || role.status === "active" ? "bg-green-500" : "bg-slate-300"
                  }`} />
                  
                  <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 items-center">
                    {/* Role Info */}
                    <div className="md:col-span-2 space-y-1">
                      <h3 className="font-bold text-base group-hover:text-primary transition-colors">{role.roleName}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clapperboard className="w-3 h-3" />
                        <span className="font-medium">{role.projectName}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                         <Users className="w-4 h-4 text-blue-600" />
                       </div>
                       <div>
                         <p className="text-xs font-bold">{role.applicantCount}</p>
                         <p className="text-[10px] text-muted-foreground uppercase">Applicants</p>
                       </div>
                    </div>

                    {/* Meta */}
                    <div className="hidden lg:block space-y-1">
                       <p className="text-xs font-bold capitalize">{String(role.roleType).replace("_", " ")}</p>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Role Type</p>
                    </div>

                    <div className="hidden lg:block space-y-1">
                       <p className="text-xs font-bold">
                         {role.deadline || "—"}
                       </p>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Deadline</p>
                    </div>

                    {/* Actions — pass project+role context as URL params */}
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild className="hidden sm:flex gap-1.5 h-8 text-xs font-bold">
                         <Link to={`/director/matched?project=${role.projectId}&role=${role.id}`}>
                           <Sparkles className="w-3 h-3" /> Match
                         </Link>
                      </Button>
                      <Button size="sm" asChild className="h-8 text-xs font-bold gap-1.5">
                         <Link to={`/director/applicants?project=${role.projectId}&role=${role.id}`}>
                           Review <ArrowRight className="w-3 h-3" />
                         </Link>
                      </Button>
                      
                      {getPermissionsForProject(role.projectId).editRoles && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/director/projects/${role.projectId}/edit`}>Edit Role</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicateRole(role)}
                              disabled={duplicatingId === role.id}
                            >
                              {duplicatingId === role.id
                                ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                : <Copy className="w-4 h-4 mr-2" />}
                              Duplicate Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteRole(role)}
                              disabled={deletingId === role.id}
                            >
                              {deletingId === role.id
                                ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                : <Trash2 className="w-4 h-4 mr-2" />}
                              Remove Role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
