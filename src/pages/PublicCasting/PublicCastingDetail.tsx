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
                        casting.status?.toLowerCase() === 'open' ? 'bg-emerald-500 text-white' :
                        casting.status?.toLowerCase() === 'pending' ? 'bg-blue-500 text-white' :
                        'bg-slate-500 text-white'
                      }`}>
                        {casting.status}
                      </Badge>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight tracking-tight">
                      {casting.title}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 font-medium">
                      {metaData?.casting_company_name || metaData?.production_company_name || casting.postedBy?.fullName || "Casting Agency"}
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

                {metaData && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Additional Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {metaData.director_name && (
                        <div>
                          <div className="text-slate-500 text-sm font-medium mb-1">Director</div>
                          <div className="text-slate-900 font-semibold">{metaData.director_name}</div>
                        </div>
                      )}
                      {metaData.producer_name && (
                        <div>
                          <div className="text-slate-500 text-sm font-medium mb-1">Producer</div>
                          <div className="text-slate-900 font-semibold">{metaData.producer_name}</div>
                        </div>
                      )}
                      {metaData.industry_areas?.length > 0 && (
                        <div>
                          <div className="text-slate-500 text-sm font-medium mb-1">Industry Areas</div>
                          <div className="text-slate-900 font-semibold">{metaData.industry_areas.join(', ')}</div>
                        </div>
                      )}
                      {metaData.talent_types_needed?.length > 0 && (
                        <div>
                          <div className="text-slate-500 text-sm font-medium mb-1">Talent Types Needed</div>
                          <div className="text-slate-900 font-semibold">{metaData.talent_types_needed.join(', ').replace(/_/g, ' ')}</div>
                        </div>
                      )}
                      {metaData.audition_type && (
                        <div>
                          <div className="text-slate-500 text-sm font-medium mb-1">Audition Type</div>
                          <div className="text-slate-900 font-semibold">{metaData.audition_type}</div>
                        </div>
                      )}
                      {metaData.media_required?.length > 0 && (
                        <div>
                          <div className="text-slate-500 text-sm font-medium mb-1">Media Required</div>
                          <div className="text-slate-900 font-semibold">{metaData.media_required.join(', ')}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                )}

                {casting.roles && casting.roles.length > 0 && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Roles</h2>
                    <div className="space-y-6">
                      {casting.roles.map((r: any) => {
                        const roleId = String(r?._id || r?.id || r?.role_id || Math.random());
                        const metaRole = (metaData?.roles || []).find((mr: any) => String(mr.id) === roleId) || {};
                        const type = Array.isArray(r.role_type || r.roleType) ? (r.role_type || r.roleType).join(', ') : (r.role_type || r.roleType || 'Role');
                        const skills = metaRole.skills_required || [];
                        const union = metaRole.union_status_required || "";
                        
                        return (
                          <div key={roleId} className="border border-slate-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-slate-900">{r.role_name || r.title || r.roleName}</h3>
                                <div className="text-slate-500 font-medium mt-1">{type}</div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {metaRole.intimacy_scene && <Badge className="bg-red-50 text-red-600 border-red-200">Intimacy Required</Badge>}
                                {metaRole.nudity_required && <Badge className="bg-red-50 text-red-600 border-red-200">Nudity Required</Badge>}
                                {metaRole.speaking_role === false && <Badge variant="secondary" className="bg-slate-100 text-slate-600">Non-Speaking</Badge>}
                              </div>
                            </div>
                            
                            {(r.character_role_summary || r.description) && (
                              <p className="text-slate-600 mb-6 leading-relaxed">
                                {r.character_role_summary || r.description}
                              </p>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="block text-slate-400 font-medium mb-1">Age Range</span>
                                <span className="font-semibold text-slate-700">{(r.minimum_age || r.minAge || "Any")} - {(r.maximum_age || r.maxAge || "Any")}</span>
                              </div>
                              <div>
                                <span className="block text-slate-400 font-medium mb-1">Gender</span>
                                <span className="font-semibold text-slate-700">{Array.isArray(r.gender) ? r.gender.join(', ') : (r.gender || "Any")}</span>
                              </div>
                              <div>
                                <span className="block text-slate-400 font-medium mb-1">Ethnicity</span>
                                <span className="font-semibold text-slate-700">{Array.isArray(r.ethnicity) ? r.ethnicity.join(', ') : (r.ethnicity || "Any")}</span>
                              </div>
                              <div>
                                <span className="block text-slate-400 font-medium mb-1">Pay</span>
                                <span className="font-semibold text-slate-700">{formatBudget(r.payment_amount || r.payRate || r.pay_rate ? `${r.currency || 'GBP'} ${r.payment_amount || r.payRate || r.pay_rate}` : "") || "—"}</span>
                              </div>
                            </div>
                            
                            {(skills.length > 0 || union || metaRole.shoot_dates) && (
                              <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {skills.length > 0 && (
                                  <div>
                                    <span className="block text-slate-400 font-medium mb-1">Skills Required</span>
                                    <span className="font-semibold text-slate-700">{skills.join(', ').replace(/_/g, ' ')}</span>
                                  </div>
                                )}
                                {union && (
                                  <div>
                                    <span className="block text-slate-400 font-medium mb-1">Union Status</span>
                                    <span className="font-semibold text-slate-700">{union}</span>
                                  </div>
                                )}
                                {metaRole.shoot_dates && (
                                  <div className="md:col-span-2">
                                    <span className="block text-slate-400 font-medium mb-1">Shoot Dates</span>
                                    <span className="font-semibold text-slate-700">{metaRole.shoot_dates}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
                      <span className="text-slate-600 font-medium">{formatLocation(casting.location)}</span>
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
                      <span className="text-slate-600 font-medium">{formatBudget(casting.payRate || casting.budget)}</span>
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
