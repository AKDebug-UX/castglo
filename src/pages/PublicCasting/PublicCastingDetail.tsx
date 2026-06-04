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
import { useNavigate } from "react-router-dom";
import { formatLocation, formatBudget } from "@/lib/utils";
import SharedCastingDetail from "@/components/casting/SharedCastingDetail";

export default function PublicCastingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [casting, setCasting] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [metaData, setMetaData] = useState<any>(null);

  useEffect(() => {
    const fetchCasting = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const response = await castingCallAPI.getOne(id);
        if (response.data.success) {
          const data = response.data.data;
          
          let parsedMeta = null;
          if (data.requirements && Array.isArray(data.requirements)) {
            const cleanReqs = [];
            data.requirements.forEach((r: string) => {
              if (typeof r === 'string' && r.startsWith('__META__:')) {
                try { parsedMeta = JSON.parse(r.substring(9)); } catch(e){}
              } else {
                cleanReqs.push(r);
              }
            });
            data.requirements = cleanReqs;
          }

          setCasting(data);
          setMetaData(parsedMeta);
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

  const backLink = (
    <Link 
      onClick={(e) => { e.preventDefault(); navigate(-1); }}
      to="#" 
      className="inline-flex items-center gap-2 text-sm text-[#009698] hover:text-[#007A7C] transition-colors mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Castings
    </Link>
  );

  const sidebarActions = (
    <Card className="rounded-2xl border-none shadow-lg overflow-hidden bg-white mt-6">
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
  );

  return (
    <div className="bg-[#F5FBFC] min-h-screen">
      <Header />
      <main className="py-10">
        <SharedCastingDetail
          casting={casting}
          backLink={backLink}
          sidebarActions={sidebarActions}
          isInternal={false}
        />
      </main>
      <Footer />
    </div>
  );
}
