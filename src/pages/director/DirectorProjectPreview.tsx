import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Pencil, Users, Eye } from "lucide-react";
import SharedCastingDetail from "@/components/casting/SharedCastingDetail";
import { useProjectWithRoles } from "@/hooks/useProjectWithRoles";
import { toast } from "sonner";
import { useEffect } from "react";

export default function DirectorProjectPreview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { project, isLoading, error } = useProjectWithRoles(id);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 px-0">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Card>
          <CardContent className="p-6 text-muted-foreground">Project not found.</CardContent>
        </Card>
      </div>
    );
  }

  const backLink = (
    <Link
      to="/director/projects"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to My Projects
    </Link>
  );

  const headerActions = (
    <>
      <Button variant="outline" asChild className="gap-2">
        <Link to={`/director/projects/${id}/edit`}>
          <Pencil className="w-4 h-4" />
          Edit
        </Link>
      </Button>
      <Button variant="outline" asChild className="gap-2">
        <Link to={`/director/applicants/?project=${id}`}>
          <Users className="w-4 h-4" />
          Applicants
        </Link>
      </Button>
    </>
  );

  const sidebarActions = (
    <div className="pt-1">
      <Button variant="outline" asChild className="w-full gap-2">
        <Link to={`/cast/${id}`}>
          <Eye className="w-4 h-4" />
          View Public Page
        </Link>
      </Button>
    </div>
  );

  return (
    <SharedCastingDetail
      casting={project}
      backLink={backLink}
      headerActions={headerActions}
      sidebarActions={sidebarActions}
      isInternal
    />
  );
}
