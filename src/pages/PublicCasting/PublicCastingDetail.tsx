import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign,
  Loader2
} from "lucide-react";
import { castingCallAPI } from "@/lib/api";
import { toast } from "sonner";
import { MOCK_CASTINGS } from "@/lib/data";
import { useNavigate } from "react-router-dom";

export default function PublicCastingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [casting, setCasting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCasting = async () => {
      if (!id) return;
      setIsLoading(true);

      if (id.startsWith('mock-')) {
        const mockCasting = MOCK_CASTINGS.find(c => c._id === id);
        if (mockCasting) {
          setCasting({
            ...mockCasting,
            status: "Open",
            description: "This is a mock casting call for demonstration purposes. It includes all the necessary details to showcase how a real casting call would look on the platform.",
            requirements: ["Professional attitude", "Available for travel", "Previous experience preferred"],
            payRate: "$500 - $1,000 per day",
            postedBy: { fullName: "Mock Casting Agency" },
            deadline: "2026-12-31"
          });
          setIsLoading(false);
          return;
        }
      }

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
      <div className="flex items-center justify-center h-screen bg-[#F5FBFC]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!casting) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Casting call not found.</p>
        <Button variant="link" asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#F5FBFC] min-h-screen">
      <Header />
      <main className="py-10">
        <div className="container max-w-5xl">
          <div className="space-y-6 animate-in fade-in duration-500">
            <Link 
            onClick={() => navigate(-1)}
              to="#" 
              className="inline-flex items-center gap-2 text-sm text-[#009698] hover:text-[#007A7C] transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Castings
            </Link>

            <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
              {/* Main Content */}
              <div className="space-y-8">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px] md:h-[500px]">
                  <img 
                    src={casting.image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1200"} 
                    alt={casting.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
                    <div className="mb-4">
                      <Badge className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider ${
                        casting.status?.toLowerCase() === 'open' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                      }`}>
                        {casting.status}
                      </Badge>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight tracking-tight">
                      {casting.title}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 font-medium">
                      {casting.postedBy?.fullName || "Mock Casting Agency"}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Project Description</h2>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    {casting.description}
                  </p>
                </div>

                {casting.requirements && casting.requirements.length > 0 && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Requirements</h2>
                    <ul className="space-y-4">
                      {casting.requirements.map((req: string, index: number) => (
                        <li key={index} className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-[#009698] flex-shrink-0" />
                          <span className="text-slate-600 text-lg font-medium">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-slate-900">Quick Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-2">
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#009698]/10 group-hover:text-[#009698] transition-colors">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="text-slate-600 font-medium">{casting.location}</span>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#009698]/10 group-hover:text-[#009698] transition-colors">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="text-slate-600 font-medium">Deadline: {new Date(casting.deadline).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#009698]/10 group-hover:text-[#009698] transition-colors">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <span className="text-slate-600 font-medium">{casting.payRate || casting.budget || "$"}</span>
                    </div>
                    <div className="pt-2">
                      <Badge variant="secondary" className="bg-[#D98EB3]/10 text-[#D98EB3] hover:bg-[#D98EB3]/20 border-none px-4 py-1.5 rounded-full font-bold">
                        {casting.category || "Theater"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-none shadow-lg overflow-hidden bg-white">
                  <CardHeader className="pb-6">
                    <CardTitle className="text-xl font-bold text-slate-900">Ready to Apply?</CardTitle>
                    <p className="text-sm text-slate-500 font-medium">Create an account to submit your audition</p>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <Button 
                      className="w-full h-14 rounded-2xl font-bold text-lg bg-[#009698] hover:bg-[#007A7C] transition-all shadow-lg shadow-[#009698]/20" 
                      size="lg" 
                      asChild
                    >
                      <Link to="/join">Sign Up to Apply</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
