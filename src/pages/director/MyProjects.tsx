import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Grid3X3, 
  List, 
  Plus,
  Users,
  Clock,
  Eye,
  Pencil,
  Trash2,
  Loader2
} from "lucide-react";
import { castingCallAPI } from "@/lib/api";
import { toast } from "sonner";

export default function MyProjects() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await castingCallAPI.getMyListings();
      if (response.data.success && Array.isArray(response.data.data)) {
        setProjects(response.data.data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      toast.error("Failed to load projects");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this casting call?")) return;
    try {
      const response = await castingCallAPI.delete(id);
      if (response.data.success) {
        toast.success("Project deleted successfully");
        setProjects(prev => prev.filter(p => p._id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (activeTab === "all") return true;
    if (activeTab === "open") return project.status === "open";
    if (activeTab === "closed") return project.status === "closed";
    if (activeTab === "drafts") return project.status === "draft";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">Manage all your casting calls and projects</p>
        </div>
        <Button asChild>
          <Link to="/director/create">
            <Plus className="w-4 h-4 mr-2" />
            New Casting Call
          </Link>
        </Button>
      </div>

      {/* Tabs and View Toggle */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
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
          {filteredProjects.length > 0 ? filteredProjects.map((project) => (
            <Card key={project._id} className="card-elevated">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold truncate max-w-[150px]">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.category}</p>
                  </div>
                  <Badge 
                    className={
                      project.status === "open" ? "bg-success text-success-foreground" :
                      project.status === "draft" ? "bg-warning text-warning-foreground" :
                      "bg-muted text-muted-foreground"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>

                <div className="space-y-2 text-xs text-muted-foreground mb-4">
                  <div className="flex justify-between">
                    <span>Submissions:</span>
                    <span className="font-medium text-foreground">{project.applicationCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span className="font-medium text-foreground">{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium text-foreground">{project.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to={`/director/projects/${project._id}`}>
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to={`/director/projects/${project._id}/edit`}>
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(project._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
               No projects found in this category.
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredProjects.length > 0 ? filteredProjects.map((project) => (
            <Card key={project._id} className="card-elevated">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{project.title}</h3>
                      <Badge 
                        className={
                          project.status === "open" ? "bg-success text-success-foreground" :
                          project.status === "draft" ? "bg-warning text-warning-foreground" :
                          "bg-muted text-muted-foreground"
                        }
                      >
                        {project.status}
                      </Badge>
                      <Badge variant="secondary">{project.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.applicationCount || 0} submissions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Deadline: {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/director/projects/${project._id}`}>
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/director/projects/${project._id}/edit`}>
                        <Pencil className="w-3 h-3 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(project._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-12 text-muted-foreground">
               No projects found in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
