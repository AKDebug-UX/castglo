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

  return (
    <div className="space-y-6 animate-fade-in">
      <Link 
        to="/talent/browse-cast" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to browse
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Hero Image */}
          <div className="relative rounded-xl overflow-hidden">
            <img 
              src={casting.image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800"} 
              alt={casting.title}
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <Badge className="mb-2 bg-success">{casting.status}</Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{casting.title}</h1>
              <p className="text-white/80">{casting.postedBy?.fullName || "Casting Team"}</p>
            </div>
          </div>

          {/* Project Description */}
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {casting.description}
              </p>
            </CardContent>
          </Card>

          {/* Requirements */}
          {casting.requirements && casting.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {casting.requirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Role Responsibilities */}
          {casting.responsibilities && casting.responsibilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Role Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {casting.responsibilities.map((resp: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{resp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span>{formatLocation(casting.location)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span>Deadline: {new Date(casting.deadline).toLocaleDateString()}</span>
              </div>
              {casting.productionDates && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span>{casting.productionDates}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <span>{formatBudget(casting.budget)}</span>
              </div>
              {casting.ageRange && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span>Age Range: {casting.ageRange}</span>
                </div>
              )}
              <Badge variant="secondary" className="mt-2">{casting.category}</Badge>
            </CardContent>
          </Card>

          {/* Casting Team */}
          <Card>
            <CardHeader>
              <CardTitle>Casting Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Posted By</p>
                <p className="font-medium">{casting.postedBy?.fullName}</p>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card>
            <CardHeader>
              <CardTitle>Ready to Apply?</CardTitle>
              <p className="text-sm text-muted-foreground">Submit your audition for this role</p>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg" asChild disabled={casting.status !== 'open'}>
                <Link to={`/talent/browse-cast/${id}/submit`}>
                  {casting.status === 'open' ? 'Submit Audition' : 'Casting Closed'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
