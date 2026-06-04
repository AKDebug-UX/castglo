import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, DollarSign, Clock } from "lucide-react";
import { formatBudget, formatLocation } from "@/lib/utils";

interface SharedCastingDetailProps {
  casting: any;
  backLink?: React.ReactNode;
  headerActions?: React.ReactNode;
  sidebarActions?: React.ReactNode;
  isInternal?: boolean;
}

export default function SharedCastingDetail({
  casting,
  backLink,
  headerActions,
  sidebarActions,
  isInternal = false,
}: SharedCastingDetailProps) {
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
    return reqs.filter((r: string) => !r.startsWith('__META__:'));
  }, [casting]);

  const metaData = useMemo(() => {
    let meta: any = null;
    const reqs = Array.isArray(casting?.requirements) ? casting.requirements : 
      (typeof casting?.requirements === "string" ? casting.requirements.split("\n") : []);
    reqs.forEach((r: any) => {
      if (typeof r === 'string' && r.startsWith('__META__:')) {
        try { meta = JSON.parse(r.substring(9)); } catch(e){}
      }
    });
    return meta;
  }, [casting]);

  const hasAdditionalInfo = metaData && (
    metaData.casting_company_name ||
    metaData.director_name ||
    metaData.producer_name ||
    (metaData.industry_areas && metaData.industry_areas.length > 0) ||
    (metaData.talent_types_needed && metaData.talent_types_needed.length > 0) ||
    metaData.audition_type ||
    (metaData.media_required && metaData.media_required.length > 0) ||
    (isInternal && metaData.internal_project_reference)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col gap-4">
        {backLink && <div>{backLink}</div>}

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
            {isInternal && (
              <p className="text-muted-foreground mt-1">Preview how this project looks before editing or sharing</p>
            )}
          </div>

          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        {/* Main Content */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-none shadow-sm bg-muted/30">
            <div className="relative h-[220px] sm:h-[360px] w-full bg-slate-100">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <span className="text-sm font-medium">No cover image</span>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {casting.roles && casting.roles.length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">Roles</h2>
              <div className="space-y-6">
                {casting.roles.map((r: any) => {
                  const roleId = String(r?._id || r?.id || r?.role_id || Math.random());
                  const metaRole = (metaData?.roles || []).find((mr: any) => String(mr.id) === roleId) || {};
                  const type = Array.isArray(r.role_type || r.roleType) ? (r.role_type || r.roleType).join(', ') : (r.role_type || r.roleType || 'Role');
                  const skills = metaRole.skills_required || [];
                  const union = metaRole.union_status_required || "";

                  return (
                    <div key={roleId} className="border border-slate-100 rounded-xl p-5 sm:p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900">{r.role_name || r.title || r.roleName}</h3>
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
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <span>{formatLocation(location) || "Any"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span>Deadline: {deadline ? new Date(deadline).toLocaleDateString() : "—"}</span>
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
              {casting.category && <Badge variant="secondary" className="mt-2">{casting.category}</Badge>}
            </CardContent>
          </Card>

          {hasAdditionalInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  {metaData.casting_company_name && (
                    <div>
                      <div className="text-muted-foreground">Casting Company</div>
                      <div className="font-medium text-foreground">{metaData.casting_company_name}</div>
                    </div>
                  )}
                  {metaData.director_name && (
                    <div>
                      <div className="text-muted-foreground">Director</div>
                      <div className="font-medium text-foreground">{metaData.director_name}</div>
                    </div>
                  )}
                  {metaData.producer_name && (
                    <div>
                      <div className="text-muted-foreground">Producer</div>
                      <div className="font-medium text-foreground">{metaData.producer_name}</div>
                    </div>
                  )}
                  {metaData.industry_areas?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground">Industry Areas</div>
                      <div className="font-medium text-foreground">{metaData.industry_areas.join(', ')}</div>
                    </div>
                  )}
                  {metaData.talent_types_needed?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground">Talent Types Needed</div>
                      <div className="font-medium text-foreground">{metaData.talent_types_needed.join(', ').replace(/_/g, ' ')}</div>
                    </div>
                  )}
                  {metaData.audition_type && (
                    <div>
                      <div className="text-muted-foreground">Audition Type</div>
                      <div className="font-medium text-foreground">{metaData.audition_type}</div>
                    </div>
                  )}
                  {metaData.media_required?.length > 0 && (
                    <div>
                      <div className="text-muted-foreground">Media Required</div>
                      <div className="font-medium text-foreground">{metaData.media_required.join(', ')}</div>
                    </div>
                  )}
                  {isInternal && metaData.internal_project_reference && (
                    <div>
                      <div className="text-muted-foreground">Internal Reference</div>
                      <div className="font-medium text-foreground">{metaData.internal_project_reference}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Casting Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Posted By</p>
                <p className="font-medium">
                  {casting.postedBy?.fullName || metaData?.casting_company_name || "Casting Team"}
                </p>
              </div>
            </CardContent>
          </Card>

          {sidebarActions && (
            <div>
              {sidebarActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
