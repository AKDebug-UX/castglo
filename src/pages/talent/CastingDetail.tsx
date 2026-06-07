import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign,
  Users,
  Clock,
  Loader2
} from "lucide-react";
import { castingCallAPI } from "@/lib/api";
import { toast } from "sonner";
import { formatLocation, formatBudget } from "@/lib/utils";
import SharedCastingDetail from "@/components/casting/SharedCastingDetail";

export default function CastingDetail() {
  const { id } = useParams();
  const [casting, setCasting] = useState(null);
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
      } catch (error) {
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

  const sidebarActions = (
    <Card>
      <CardHeader>
        <CardTitle>Ready to Apply?</CardTitle>
        <p className="text-sm text-muted-foreground">Submit your application for this casting call</p>
      </CardHeader>
      <CardContent>
        <Button className="w-full" size="lg" asChild disabled={casting.status !== 'open'}>
          <Link to={`/talent/browse-cast/${id}/submit`}>
            {casting.status === 'open' ? 'Apply Now' : 'Casting Closed'}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <SharedCastingDetail
      casting={casting}
      backLink={backLink}
      sidebarActions={sidebarActions}
      isInternal={false}
    />
  );
}
