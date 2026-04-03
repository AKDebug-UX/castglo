import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, Search, Filter, ArrowRight, 
  Clapperboard, Sparkles, MoreHorizontal,
  Loader2, Plus, Calendar, Tag
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { castingCallAPI } from "@/lib/api";
import { toast } from "sonner";

interface RoleItem {
  id: string;
  projectId: string;
  projectName: string;
  roleName: string;
  roleType: string;
  status: "open" | "filled" | "closed";
  applicantCount: number;
  deadline: string;
}

export default function DirectorRoles() {
  const [roles, setRoles]       = useState<RoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await castingCallAPI.getMyListings();
        if (res.data.success) {
          const listings = Array.isArray(res.data.data) ? res.data.data : res.data.data?.castingCalls || [];
          const flattenedRoles: RoleItem[] = listings.flatMap((p: any) => 
            (p.roles || []).map((r: any) => ({
              id: r.id || r._id,
              projectId: p._id,
              projectName: p.projectName || p.title,
              roleName: r.role_name || r.title,
              roleType: r.role_type || r.type || "Lead",
              status: p.status || "open",
              applicantCount: r.applicationCount || 0,
              deadline: p.deadline
            }))
          );
          setRoles(flattenedRoles);
        }
      } catch {
        toast.error("Failed to load roles.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

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
        <Button asChild className="gap-2">
          <Link to="/director/create"><Plus className="w-4 h-4" /> Add Role</Link>
        </Button>
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
                    role.status === "open" ? "bg-green-500" : "bg-slate-300"
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
                       <p className="text-xs font-bold capitalize">{role.roleType.replace("_", " ")}</p>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Role Type</p>
                    </div>

                    <div className="hidden lg:block space-y-1">
                       <p className="text-xs font-bold">
                         {new Date(role.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                       </p>
                       <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Deadline</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild className="hidden sm:flex gap-1.5 h-8 text-xs font-bold">
                         <Link to="/director/matched">
                           <Sparkles className="w-3 h-3" /> Match
                         </Link>
                      </Button>
                      <Button size="sm" asChild className="h-8 text-xs font-bold gap-1.5">
                         <Link to="/director/applicants">
                           Review <ArrowRight className="w-3 h-3" />
                         </Link>
                      </Button>
                      
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
                          <DropdownMenuItem>Duplicate Role</DropdownMenuItem>
                          <div className="h-px bg-muted my-1" />
                          <DropdownMenuItem className="text-destructive">Remove Role</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
