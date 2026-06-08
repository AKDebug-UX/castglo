import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign, Clock, FileText, Mic2, Music, Theater, Globe, Users, ChevronDown, ChevronUp } from "lucide-react";
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
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // ── Title ──────────────────────────────────────────────────────
  const title = useMemo(() =>
    casting?.project_title || casting?.projectName || casting?.title || casting?.name || "Project"
  , [casting]);

  // ── Status ─────────────────────────────────────────────────────
  const status = useMemo(() =>
    String(casting?.project_status || casting?.status || "").toLowerCase() || "draft"
  , [casting]);

  // ── Cover Image ────────────────────────────────────────────────
  const coverImage = useMemo(() =>
    casting?.project_cover_image || casting?.image || casting?.coverImage || ""
  , [casting]);

  // ── Location ───────────────────────────────────────────────────
  const location = useMemo(() =>
    casting?.preferred_talent_base || casting?.location || casting?.talent_location_scope || ""
  , [casting]);

  // ── Deadline ───────────────────────────────────────────────────
  const deadline = useMemo(() =>
    casting?.application_deadline || casting?.deadline || ""
  , [casting]);

  // ── Description ────────────────────────────────────────────────
  const description = useMemo(() =>
    casting?.full_project_description || casting?.description || casting?.short_project_summary || ""
  , [casting]);

  // ── Extract the __META__ block from requirements ───────────────
  // The form embeds the full formData as a JSON string inside the requirements array.
  // We use it to restore fields that the backend schema doesn't have native columns for.
  const metaData = useMemo(() => {
    let meta: any = null;
    const reqs = Array.isArray(casting?.requirements)
      ? casting.requirements
      : typeof casting?.requirements === "string"
        ? casting.requirements.split("\n")
        : [];
    for (const r of reqs) {
      if (typeof r === "string" && r.startsWith("__META__:")) {
        try { meta = JSON.parse(r.substring(9)); } catch (e) {}
        break;
      }
    }
    return meta;
  }, [casting]);

  // ── Visible requirements (strip the hidden __META__ line) ───────
  const requirements = useMemo(() => {
    const reqs = Array.isArray(casting?.requirements)
      ? casting.requirements
      : typeof casting?.requirements === "string"
        ? casting.requirements.split("\n").map((x: string) => x.trim()).filter(Boolean)
        : [];
    return reqs.filter((r: string) => typeof r === "string" && !r.startsWith("__META__:"));
  }, [casting]);

  // ── Normalise roles ─────────────────────────────────────────────
  // All role data is stored directly on casting.roles (both native backend fields
  // AND the fields we re-merged from __META__.roles during edit-mode load).
  // We do NOT need to cross-reference metaData.roles anymore.
  const roles = useMemo(() => {
    const rawRoles: any[] = Array.isArray(casting?.roles) ? casting.roles : [];
    // If the __META__ blob has roles with extra fields, merge them
    const metaRoles: any[] = Array.isArray(metaData?.roles) ? metaData.roles : [];

    return rawRoles.map((r: any) => {
      const roleId = String(r?._id || r?.id || r?.role_id || "");
      // Try to find the matching meta role by ID
      const metaRole = metaRoles.find((mr: any) =>
        String(mr.id) === roleId || String(mr._id) === roleId
      ) || {};
      // Merge: native fields first, then fill gaps from metaRole
      return { ...metaRole, ...r };
    });
  }, [casting, metaData]);

  // ── Additional sidebar info ─────────────────────────────────────
  // Prefer live fields on the casting object, fall back to __META__
  const info = useMemo(() => {
    const m = metaData || {};
    return {
      casting_company_name: casting?.casting_company_name || m.casting_company_name || "",
      director_name: casting?.director_name || m.director_name || "",
      producer_name: casting?.producer_name || m.producer_name || "",
      industry_areas: (casting?.industry_areas?.length ? casting.industry_areas : m.industry_areas) || [],
      talent_types_needed: (casting?.talent_types_needed?.length ? casting.talent_types_needed : m.talent_types_needed) || [],
      audition_type: casting?.audition_type || m.audition_type || "",
      media_required: (casting?.media_required?.length ? casting.media_required : m.media_required) || [],
      internal_project_reference: casting?.internal_project_reference || m.internal_project_reference || "",
      project_type: casting?.project_type || m.project_type || "",
      genre: (casting?.genre?.length ? casting.genre : m.genre) || [],
      audition_instructions: casting?.audition_instructions || m.audition_instructions || "",
      application_deadline: casting?.application_deadline || m.application_deadline || "",
      self_tape_accepted: casting?.self_tape_accepted ?? m.self_tape_accepted,
      audition_date: casting?.audition_date || m.audition_date || "",
      callback_date: casting?.callback_date || m.callback_date || "",
    };
  }, [casting, metaData]);

  const hasAdditionalInfo =
    info.casting_company_name || info.director_name || info.producer_name ||
    info.industry_areas.length > 0 || info.talent_types_needed.length > 0 ||
    info.audition_type || info.media_required.length > 0 ||
    (isInternal && info.internal_project_reference);

  // ── Status badge color ──────────────────────────────────────────
  const statusClass =
    status === "open" || status === "open_for_applications" ? "bg-success text-success-foreground" :
    status === "pending" ? "bg-blue-500 hover:bg-blue-600 text-white" :
    status === "draft" ? "bg-warning text-warning-foreground" :
    "bg-muted text-muted-foreground";

  const displayStatus = status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

  const toLocalDate = (v: any) => {
    if (!v) return "—";
    try { return new Date(v).toLocaleDateString(); } catch { return String(v); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4">
        {backLink && <div>{backLink}</div>}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">{title}</h1>
              <Badge className={statusClass}>{displayStatus}</Badge>
              {info.project_type && (
                <Badge variant="outline" className="text-xs">{info.project_type}</Badge>
              )}
            </div>
            {isInternal && (
              <p className="text-muted-foreground mt-1 text-sm">
                Preview how this project looks before editing or sharing
              </p>
            )}
            {info.genre.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {info.genre.map((g: string) => (
                  <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
                ))}
              </div>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2 flex-shrink-0">{headerActions}</div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        {/* ── Main Content ── */}
        <div className="space-y-6">

          {/* Cover Image */}
          <Card className="overflow-hidden border-none shadow-sm bg-muted/30">
            <div className="relative h-[220px] sm:h-[360px] w-full bg-slate-100">
              {coverImage ? (
                <img src={coverImage} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <span className="text-sm font-medium">No cover image</span>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
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

          {/* Requirements */}
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

          {/* ── Roles ── */}
          {roles.length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Roles ({roles.length})</h2>

              {roles.map((r: any, idx: number) => {
                const roleId = String(r?._id || r?.id || r?.role_id || idx);

                // Role type — might be an array or a single string from legacy
                const roleTypes: string[] = Array.isArray(r.role_type)
                  ? r.role_type
                  : Array.isArray(r.roleType)
                    ? r.roleType
                    : r.role_type || r.roleType
                      ? [String(r.role_type || r.roleType)]
                      : [];

                // Gender — might be an array or a single string
                const genders: string[] = Array.isArray(r.gender)
                  ? r.gender
                  : r.gender ? [String(r.gender)] : [];

                // Ethnicity — might be an array or single string
                const ethnicities: string[] = Array.isArray(r.ethnicity)
                  ? r.ethnicity
                  : r.ethnicity ? [String(r.ethnicity)] : [];

                // Skills — directly on role
                const skills: string[] = Array.isArray(r.skills_required)
                  ? r.skills_required
                  : [];

                // Pay
                const payAmt = r.payment_amount || r.payRate || r.pay_rate || "";
                const currency = r.currency || "GBP";
                const payLabel = payAmt ? `${currency} ${payAmt}` : "";

                // Dates
                const shootDates = r.shoot_dates || r.shootDates || "";
                const rehearsalDates = r.rehearsal_dates || r.rehearsalDates || "";

                // Boolean flags (stored directly on role)
                const intimacy = r.intimacy_scene ?? false;
                const nudity = r.nudity_required ?? false;
                const speaking = r.speaking_role ?? true;
                const singing = r.singing_required ?? false;
                const dancing = r.dancing_required ?? false;
                const stunts = r.stunts_required ?? false;
                const travelReq = r.travel_required ?? false;
                const isPaid = r.is_paid_role ?? true;

                const roleName = r.role_name || r.title || r.roleName || `Role ${idx + 1}`;
                const summary = r.character_role_summary || r.description || "";
                const fullDesc = r.full_role_description || "";
                const union = r.union_status_required || r.unionStatus || "";
                const location = r.role_shoot_performance_location || [r.role_city, r.role_country].filter(Boolean).join(", ") || "";
                
                const isExpanded = expandedRole === roleId;

                return (
                  <div key={roleId} className="group border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors shadow-sm overflow-hidden">
                    {/* Role header (always visible, clickable to toggle) */}
                    <div 
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 cursor-pointer select-none"
                      onClick={() => setExpandedRole(isExpanded ? null : roleId)}
                    >
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{roleName}</h3>
                        {roleTypes.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-2">
                            {roleTypes.map((t) => (
                              <Badge key={t} variant="outline" className="text-xs bg-slate-50">{t}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex flex-wrap gap-2 justify-end">
                          {r.featured_role && <Badge className="bg-amber-500 text-white">Featured</Badge>}
                          {!speaking && <Badge variant="secondary" className="bg-slate-100 text-slate-600">Non-Speaking</Badge>}
                          {isExpanded && intimacy && <Badge className="bg-red-50 text-red-600 border-red-200">Intimacy</Badge>}
                          {isExpanded && nudity && <Badge className="bg-red-50 text-red-600 border-red-200">Nudity</Badge>}
                        </div>
                        <div className="p-2 rounded-full bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-primary transition-colors flex-shrink-0">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-6 mt-2">
                        {/* Summary & Full Description */}
                        {(summary || fullDesc) && (
                          <div className="space-y-3 pt-4">
                            {summary && (
                              <p className="text-slate-700 leading-relaxed font-medium">{summary}</p>
                            )}
                            {fullDesc && fullDesc !== summary && (
                              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{fullDesc}</p>
                            )}
                          </div>
                        )}

                        {/* Demographics grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                          <div>
                            <span className="block text-slate-400 font-semibold mb-1.5 text-xs uppercase tracking-wider">Age Range</span>
                            <span className="font-semibold text-slate-800">
                              {r.minimum_age || r.minAge || "Any"} – {r.maximum_age || r.maxAge || "Any"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-slate-400 font-semibold mb-1.5 text-xs uppercase tracking-wider">Gender</span>
                            <span className="font-semibold text-slate-800">
                              {genders.length > 0 ? genders.join(", ") : "Any"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-slate-400 font-semibold mb-1.5 text-xs uppercase tracking-wider">Ethnicity</span>
                            <span className="font-semibold text-slate-800">
                              {r.open_to_all_ethnicities ? "Open to All" : (ethnicities.length > 0 ? ethnicities.join(", ").replace(/_/g, " ") : "Any")}
                            </span>
                          </div>
                          <div>
                            <span className="block text-slate-400 font-semibold mb-1.5 text-xs uppercase tracking-wider">Pay</span>
                            <span className="font-semibold text-slate-800">
                              {isPaid ? (payLabel ? formatBudget(payLabel) : "Paid — TBC") : "Unpaid / Expenses"}
                            </span>
                          </div>
                        </div>

                        {/* Extra role fields */}
                        {(skills.length > 0 || union || shootDates || rehearsalDates || location || travelReq) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                            {skills.length > 0 && (
                              <div>
                                <span className="block text-slate-400 font-semibold mb-1 text-xs uppercase tracking-wider">Skills Required</span>
                                <span className="font-medium text-slate-700">{skills.join(", ").replace(/_/g, " ")}</span>
                              </div>
                            )}
                            {union && (
                              <div>
                                <span className="block text-slate-400 font-semibold mb-1 text-xs uppercase tracking-wider">Union Status</span>
                                <span className="font-medium text-slate-700">{union}</span>
                              </div>
                            )}
                            {shootDates && (
                              <div>
                                <span className="block text-slate-400 font-semibold mb-1 text-xs uppercase tracking-wider">Shoot Dates</span>
                                <span className="font-medium text-slate-700">{shootDates}</span>
                              </div>
                            )}
                            {rehearsalDates && (
                              <div>
                                <span className="block text-slate-400 font-semibold mb-1 text-xs uppercase tracking-wider">Rehearsal Dates</span>
                                <span className="font-medium text-slate-700">{rehearsalDates}</span>
                              </div>
                            )}
                            {location && (
                              <div>
                                <span className="block text-slate-400 font-semibold mb-1 text-xs uppercase tracking-wider">Location</span>
                                <span className="font-medium text-slate-700">{location}</span>
                              </div>
                            )}
                            {travelReq && (
                              <div>
                                <span className="block text-slate-400 font-semibold mb-1 text-xs uppercase tracking-wider">Travel</span>
                                <span className="font-medium text-slate-700">Travel Required</span>
                              </div>
                            )}
                            {r.height_range && (
                              <div>
                                <span className="block text-slate-400 font-semibold mb-1 text-xs uppercase tracking-wider">Height Range</span>
                                <span className="font-medium text-slate-700">{r.height_range}</span>
                              </div>
                            )}
                            {r.languages_required?.length > 0 && (
                              <div>
                                <span className="block text-slate-400 font-semibold mb-1 text-xs uppercase tracking-wider">Languages</span>
                                <span className="font-medium text-slate-700">{r.languages_required.join(", ")}</span>
                              </div>
                            )}
                            {r.accents_required?.length > 0 && (
                              <div>
                                <span className="block text-slate-400 font-semibold mb-1 text-xs uppercase tracking-wider">Accents</span>
                                <span className="font-medium text-slate-700">{r.accents_required.join(", ")}</span>
                              </div>
                            )}
                            {r.payment_type && r.payment_type !== "Fixed Fee" && (
                              <div>
                                <span className="block text-slate-400 font-semibold mb-1 text-xs uppercase tracking-wider">Pay Type</span>
                                <span className="font-medium text-slate-700">{r.payment_type}</span>
                              </div>
                            )}
                            {r.compensation_notes && (
                              <div className="sm:col-span-2">
                                <span className="block text-slate-400 font-semibold mb-1 text-xs uppercase tracking-wider">Compensation Notes</span>
                                <span className="font-medium text-slate-700">{r.compensation_notes}</span>
                              </div>
                            )}
                            {r.availability_requirement && (
                              <div className="sm:col-span-2">
                                <span className="block text-slate-400 font-semibold mb-1 text-xs uppercase tracking-wider">Availability</span>
                                <span className="font-medium text-slate-700">{r.availability_requirement}</span>
                              </div>
                            )}
                            
                            {/* Rare flags inside expand */}
                            {(singing || dancing || stunts) && (
                              <div className="sm:col-span-2 flex flex-wrap gap-2 mt-2">
                                {singing && <Badge variant="secondary" className="bg-purple-50 text-purple-700">Singing</Badge>}
                                {dancing && <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">Dancing</Badge>}
                                {stunts && <Badge variant="secondary" className="bg-orange-50 text-orange-700">Stunts</Badge>}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Audition Info */}
          {(info.audition_type || info.audition_instructions || info.audition_date) && (
            <Card>
              <CardHeader>
                <CardTitle>Audition Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {info.audition_type && (
                  <div>
                    <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-1">Type</div>
                    <div className="font-medium">{info.audition_type}</div>
                  </div>
                )}
                {info.audition_date && (
                  <div>
                    <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-1">Audition Date</div>
                    <div className="font-medium">{toLocalDate(info.audition_date)}</div>
                  </div>
                )}
                {info.callback_date && (
                  <div>
                    <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-1">Callback Date</div>
                    <div className="font-medium">{toLocalDate(info.callback_date)}</div>
                  </div>
                )}
                {info.audition_instructions && (
                  <div>
                    <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-1">Instructions</div>
                    <div className="font-medium whitespace-pre-wrap">{info.audition_instructions}</div>
                  </div>
                )}
                {info.media_required.length > 0 && (
                  <div>
                    <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-1">Media Required</div>
                    <div className="flex flex-wrap gap-1">
                      {info.media_required.map((m: string) => (
                        <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{formatLocation(location) || "Any"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>Deadline: {toLocalDate(deadline)}</span>
              </div>
              {info.application_deadline && info.application_deadline !== deadline && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>Apply by: {toLocalDate(info.application_deadline)}</span>
                </div>
              )}
              {casting.budget && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{formatBudget(casting.budget)}</span>
                </div>
              )}
              {info.talent_types_needed.length > 0 && (
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span>{info.talent_types_needed.join(", ").replace(/_/g, " ")}</span>
                </div>
              )}
              {casting.category && (
                <Badge variant="secondary" className="mt-1">{casting.category}</Badge>
              )}
            </CardContent>
          </Card>

          {hasAdditionalInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Production Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {info.casting_company_name && (
                  <div>
                    <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-0.5">Casting Company</div>
                    <div className="font-medium">{info.casting_company_name}</div>
                  </div>
                )}
                {info.director_name && (
                  <div>
                    <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-0.5">Director</div>
                    <div className="font-medium">{info.director_name}</div>
                  </div>
                )}
                {info.producer_name && (
                  <div>
                    <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-0.5">Producer</div>
                    <div className="font-medium">{info.producer_name}</div>
                  </div>
                )}
                {info.industry_areas.length > 0 && (
                  <div>
                    <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-0.5">Industry Areas</div>
                    <div className="font-medium">{info.industry_areas.join(", ")}</div>
                  </div>
                )}
                {isInternal && info.internal_project_reference && (
                  <div>
                    <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-0.5">Internal Reference</div>
                    <div className="font-medium font-mono text-xs">{info.internal_project_reference}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Casting Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-0.5">Posted By</p>
                <p className="font-medium">
                  {casting.postedBy?.fullName || info.casting_company_name || "Casting Team"}
                </p>
              </div>
            </CardContent>
          </Card>

          {sidebarActions && <div>{sidebarActions}</div>}
        </div>
      </div>
    </div>
  );
}
