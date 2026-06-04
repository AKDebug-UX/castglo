import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { castingCallAPI } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Pencil, Users, Eye } from "lucide-react";
import SharedCastingDetail from "@/components/casting/SharedCastingDetail";

type CastingCall = any;

export default function DirectorProjectPreview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [casting, setCasting] = useState<CastingCall | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCasting = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await castingCallAPI.getOne(id);
        if (response.data.success) {
          setCasting(response.data.data);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load casting details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCasting();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!casting) {
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
        <Link to={`/director/submissions/${id}`}>
          <Users className="w-4 h-4" />
          Submissions
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
      casting={casting} 
      backLink={backLink}
      headerActions={headerActions}
      sidebarActions={sidebarActions}
      isInternal={true}
    />
  );
}

