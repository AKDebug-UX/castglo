import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { castingCallAPI } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Eye, Loader2, MapPin, Pencil, Users } from "lucide-react";
import { formatBudget, formatLocation } from "@/lib/utils";

type CastingCall = any;

const toDateLabel = (value: any) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB");
};

const asStringArray = (value: any) => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

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
        const res = await castingCallAPI.getOne(id);
        if (res.data?.success) {
          const raw = res.data?.data;
          const data = raw?.castingCall || raw?.project || raw;
          setCasting(data);
        } else {
          setCasting(null);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load project details");
        setCasting(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCasting();
  }, [id]);

  const title = useMemo(() => {
    return (
      casting?.project_title ||
      casting?.projectName ||
      casting?.title ||
      casting?.name ||
      "Project"
    );
  }, [casting]);

  const status = useMemo(() => {
    return String(casting?.project_status || casting?.status || "").toLowerCase() || "draft";
  }, [casting]);

  const coverImage = useMemo(() => {
    return casting?.project_cover_image || casting?.image || casting?.coverImage || "";
  }, [casting]);

  const location = useMemo(() => {
    return casting?.preferred_talent_base || casting?.location || casting?.talent_location_scope || "";
  }, [casting]);

  const deadline = useMemo(() => {
    return casting?.application_deadline || casting?.deadline || "";
  }, [casting]);

  const description = useMemo(() => {
    return casting?.full_project_description || casting?.description || casting?.short_project_summary || "";
  }, [casting]);

  const requirements = useMemo(() => {
    let reqs = [];
    if (Array.isArray(casting?.requirements)) reqs = casting.requirements;
    else if (typeof casting?.requirements === "string" && casting.requirements.trim()) {
      reqs = casting.requirements.split("\n").map((x: string) => x.trim()).filter(Boolean);
    }
    return reqs.filter(r => !r.startsWith('__META__:'));
  }, [casting]);

  const metaData = useMemo(() => {
    let meta = null;
    const reqs = Array.isArray(casting?.requirements) ? casting.requirements : 
      (typeof casting?.requirements === "string" ? casting.requirements.split("\n") : []);
    reqs.forEach((r: any) => {
      if (typeof r === 'string' && r.startsWith('__META__:')) {
        try { meta = JSON.parse(r.substring(9)); } catch(e){}
      }
    });
    return meta;
  }, [casting]);

  const roles = useMemo(() => {
    const raw = Array.isArray(casting?.roles) ? casting.roles : [];
    const metaRolesMap = new Map();
    if (metaData?.roles && Array.isArray(metaData.roles)) {
      metaData.roles.forEach((r: any) => metaRolesMap.set(String(r.id), r));
    }

    return raw.map((r: any) => {
      const roleId = String(r?._id || r?.id || r?.role_id || Math.random());
      const metaRole = metaRolesMap.get(roleId) || metaRolesMap.get(String(r?.id)) || metaRolesMap.get(String(r?._id)) || {};

      return {
        id: roleId,
        name: r?.role_name || r?.title || r?.roleName || "Role",
        summary: r?.character_role_summary || r?.description || "",
        type: asStringArray(r?.role_type || r?.roleType),
        gender: asStringArray(r?.gender),
        ethnicity: asStringArray(r?.ethnicity),
        minAge: r?.minimum_age || r?.minAge || r?.min_age,
        maxAge: r?.maximum_age || r?.maxAge || r?.max_age,
        pay: r?.payment_amount || r?.payRate || r?.pay_rate || "",
        currency: r?.currency || "GBP",
        city: r?.role_city || r?.city || "",
        country: r?.role_country || r?.country || "",
        skills: metaRole.skills_required || [],
        union_status: metaRole.union_status_required || "",
        speaking_role: metaRole.speaking_role,
        intimacy_scene: metaRole.intimacy_scene,
        shoot_dates: metaRole.shoot_dates || "",
      };
    });
  }, [casting, metaData]);

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

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col gap-4">
        <Link
          to="/director/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Projects
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">{title}</h1>
              <Badge
                className={
                  status === "open"
                    ? "bg-success text-success-foreground"
                    : status === "pending"
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : status === "draft"
                        ? "bg-warning text-warning-foreground"
                        : "bg-muted text-muted-foreground"
                }
              >
                {status}
              </Badge>
            </div>
            <p className="text-muted-foreground">Preview how this project looks before editing or sharing</p>
          </div>

          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>

      {coverImage ? (
        <Card className="overflow-hidden">
          <div className="relative h-[220px] sm:h-[320px] w-full bg-muted">
            <img src={coverImage} alt={title} className="w-full h-full object-cover" />
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {description ? (
                <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{description}</div>
              ) : (
                <div className="text-sm text-muted-foreground">No description provided.</div>
              )}

              {requirements.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Requirements</div>
                  <ul className="space-y-2">
                    {requirements.map((req: string, idx: number) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {roles.length === 0 ? (
                <div className="text-sm text-muted-foreground">No roles added yet.</div>
              ) : (
                roles.map((r: any) => (
                  <div key={r.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{r.name}</div>
                        {r.summary ? <div className="text-sm text-muted-foreground line-clamp-2">{r.summary}</div> : null}
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {r.type.map((t: string) => (
                          <Badge key={t} variant="secondary">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      <div className="text-muted-foreground">
                        Age: <span className="text-foreground">{r.minAge || "—"} - {r.maxAge || "—"}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Location:{" "}
                        <span className="text-foreground">{[r.city, r.country].filter(Boolean).join(", ") || "—"}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Gender: <span className="text-foreground">{r.gender.join(", ") || "Any"}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Ethnicity: <span className="text-foreground">{r.ethnicity.join(", ") || "Any"}</span>
                      </div>
                      <div className="text-muted-foreground sm:col-span-2">
                        Pay:{" "}
                        <span className="text-foreground">
                          {formatBudget(r.pay ? `${r.currency} ${r.pay}` : "") || "—"}
                        </span>
                      </div>
                      
                      {r.skills && r.skills.length > 0 && (
                        <div className="text-muted-foreground sm:col-span-2 mt-1">
                          Skills Required: <span className="text-foreground">{r.skills.join(", ").replace(/_/g, ' ')}</span>
                        </div>
                      )}
                      {r.union_status && (
                        <div className="text-muted-foreground">
                          Union Status: <span className="text-foreground">{r.union_status}</span>
                        </div>
                      )}
                      {r.shoot_dates && (
                        <div className="text-muted-foreground">
                          Shoot Dates: <span className="text-foreground">{r.shoot_dates}</span>
                        </div>
                      )}
                      {(r.intimacy_scene || r.nudity_required || !r.speaking_role) && (
                        <div className="text-muted-foreground sm:col-span-2 flex flex-wrap gap-2 mt-1">
                          {!r.speaking_role && <Badge variant="outline">Non-Speaking</Badge>}
                          {r.intimacy_scene && <Badge variant="destructive">Intimacy Required</Badge>}
                          {r.nudity_required && <Badge variant="destructive">Nudity Required</Badge>}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {metaData && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {metaData.casting_company_name && (
                    <div>
                      <div className="text-muted-foreground">Casting Company</div>
                      <div className="font-medium">{metaData.casting_company_name}</div>
                    </div>
                  )}
                  {metaData.director_name && (
                    <div>
                      <div className="text-muted-foreground">Director</div>
                      <div className="font-medium">{metaData.director_name}</div>
                    </div>
                  )}
                  {metaData.producer_name && (
                    <div>
                      <div className="text-muted-foreground">Producer</div>
                      <div className="font-medium">{metaData.producer_name}</div>
                    </div>
                  )}
                  {metaData.industry_areas?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground">Industry Areas</div>
                      <div className="font-medium">{metaData.industry_areas.join(', ')}</div>
                    </div>
                  )}
                  {metaData.talent_types_needed?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground">Talent Types Needed</div>
                      <div className="font-medium">{metaData.talent_types_needed.join(', ').replace(/_/g, ' ')}</div>
                    </div>
                  )}
                  {metaData.audition_type && (
                    <div>
                      <div className="text-muted-foreground">Audition Type</div>
                      <div className="font-medium">{metaData.audition_type}</div>
                    </div>
                  )}
                  {metaData.media_required?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground">Media Required</div>
                      <div className="font-medium">{metaData.media_required.join(', ')}</div>
                    </div>
                  )}
                  {metaData.internal_project_reference && (
                    <div>
                      <div className="text-muted-foreground">Internal Reference</div>
                      <div className="font-medium">{metaData.internal_project_reference}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="text-muted-foreground">Location</div>
                  <div className="font-medium truncate">{formatLocation(location) || "—"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="text-muted-foreground">Deadline</div>
                  <div className="font-medium truncate">{deadline ? toDateLabel(deadline) : "—"}</div>
                </div>
              </div>

              <div className="pt-1">
                <Button variant="outline" asChild className="w-full gap-2">
                  <Link to={`/cast/${id}`}>
                    <Eye className="w-4 h-4" />
                    View Public Page
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

