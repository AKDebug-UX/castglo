import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SharedCastingDetail from "@/components/casting/SharedCastingDetail";
import { useProjectWithRoles } from "@/hooks/useProjectWithRoles";
import { isOpenStatus } from "@/lib/project.utils";

export default function CastingDetail() {
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
      <div className="text-center py-12">
        <p className="text-muted-foreground">Casting call not found.</p>
        <Button variant="link" asChild>
          <Link to="/talent/browse-cast">Back to browse</Link>
        </Button>
      </div>
    );
  }

  const backLink = (
    <Link
      to="/talent/browse-cast"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to browse
    </Link>
  );

  const canApply = isOpenStatus(project.status);

  const sidebarActions = (
    <Card>
      <CardHeader>
        <CardTitle>Ready to Apply?</CardTitle>
        <p className="text-sm text-muted-foreground">
          Submit your application for this casting call
        </p>
      </CardHeader>
      <CardContent>
        <Button className="w-full" size="lg" asChild disabled={!canApply}>
          <Link to={`/talent/browse-cast/${id}/submit`}>
            {canApply ? "Apply Now" : "Casting Closed"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <SharedCastingDetail
      casting={project}
      backLink={backLink}
      sidebarActions={sidebarActions}
      isInternal={false}
    />
  );
}
