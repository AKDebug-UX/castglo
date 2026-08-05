import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collaboratorAPI, projectAPI, castingCallAPI, applicationAPI, api } from '@/lib/api';
import { Collaborator } from '@/types/collaborator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, FolderKanban, ChevronRight, Eye, Film, AlertCircle } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';

export default function CollaboratorProjects() {
  const { collaboratorId } = useParams<{ collaboratorId: string }>();
  const navigate = useNavigate();
  const { switchWorkspace } = useWorkspace();

  const [collaboration, setCollaboration] = useState<Collaborator | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSharedProjects = async () => {
      if (!collaboratorId) return;

      try {
        setIsLoading(true);
        let data: Collaborator | null = null;

        // Try getMyCollaborations first (invitee endpoint)
        try {
          const myCollabsRes = await collaboratorAPI.getMyCollaborations();
          const list: Collaborator[] = myCollabsRes.data?.data || myCollabsRes.data || [];
          data = list.find((c) => c.id === collaboratorId || c.ownerId === collaboratorId) || null;
        } catch {
          // Silent fallback to getOne
        }

        // Fallback to getOne (owner endpoint)
        if (!data) {
          try {
            const res = await collaboratorAPI.getOne(collaboratorId);
            data = res.data?.data || res.data;
          } catch {
            // Ignored
          }
        }

        if (!data) {
          setIsLoading(false);
          return;
        }

        setCollaboration(data);

        // Derive projects: if selected_projects scope, map projectGrants
        let sharedProjects: any[] = [];
        if (data.projectGrants && data.projectGrants.length > 0) {
          sharedProjects = data.projectGrants.map((g: any) => {
            const projObj = g.project || (typeof g.projectId === 'object' ? g.projectId : null);
            const pId = typeof g.projectId === 'object' ? (g.projectId._id || g.projectId.id) : (g.projectId || g.id);
            return projObj || {
              id: pId,
              _id: pId,
              title: projObj?.title || projObj?.projectName || (pId ? `Project ${String(pId).slice(0, 8)}` : 'Project'),
              status: projObj?.status || 'Active',
              rolesCount: projObj?.rolesCount || (Array.isArray(projObj?.roles) ? projObj.roles.length : 0),
              applicantsCount: projObj?.applicantsCount || projObj?.applicationCount || (Array.isArray(projObj?.applicants) ? projObj.applicants.length : 0),
            };
          });
        }

        // If all_projects scope or grants empty, try workspace projects endpoint
        if (sharedProjects.length === 0 && data.ownerId) {
          try {
            const projRes = await api.get(`/workspaces/${data.ownerId}/projects`);
            const fetched = projRes.data?.data?.projects || projRes.data?.data || projRes.data || [];
            if (Array.isArray(fetched) && fetched.length > 0) {
              sharedProjects = fetched;
            }
          } catch {
            // Ignore workspace fetch error if no projects found
          }
        }

        // Enrich projects with real titles, roles count, and applicants count
        const enrichedProjects = await Promise.all(
          sharedProjects.map(async (proj: any) => {
            const pId = proj._id || proj.id || proj.projectId;
            if (!pId) return proj;

            let title = proj.title || proj.projectName || proj.name;
            let status = proj.status || proj.project_status || 'Active';
            let rolesCount = proj.rolesCount || (Array.isArray(proj.roles) ? proj.roles.length : 0);
            let applicantsCount = proj.applicantsCount || proj.applicationCount || (Array.isArray(proj.applicants) ? proj.applicants.length : 0);

            // Fetch actual project details
            try {
              const res = await projectAPI.getOne(pId).catch(() => null) || await castingCallAPI.getOne(pId).catch(() => null);
              const fetchedData = res?.data?.data?.castingCall || res?.data?.data?.project || res?.data?.data;
              if (fetchedData) {
                if (fetchedData.projectName || fetchedData.title) {
                  title = fetchedData.projectName || fetchedData.title;
                }
                if (fetchedData.status || fetchedData.project_status) {
                  status = fetchedData.status || fetchedData.project_status;
                }
                if (Array.isArray(fetchedData.roles)) {
                  rolesCount = fetchedData.roles.length;
                } else if (typeof fetchedData.rolesCount === 'number') {
                  rolesCount = fetchedData.rolesCount;
                }
                if (typeof fetchedData.applicationCount === 'number') {
                  applicantsCount = fetchedData.applicationCount;
                } else if (typeof fetchedData.applicantsCount === 'number') {
                  applicantsCount = fetchedData.applicantsCount;
                } else if (Array.isArray(fetchedData.applicants)) {
                  applicantsCount = fetchedData.applicants.length;
                }
              }
            } catch {
              // Ignore fetch error
            }

            // Always fetch exact applicant count for the casting call
            try {
              const appRes = await applicationAPI.getByCastingCall(pId).catch(() => null);
              if (appRes?.data?.success || appRes?.data) {
                const payload = appRes.data?.data || appRes.data;
                const list = Array.isArray(payload) ? payload : (payload?.applicants || payload?.applications || []);
                if (Array.isArray(list)) {
                  applicantsCount = list.length;
                }
              }
            } catch {
              // Ignore fetch error
            }

            // Fallback title formatting
            if (!title || (title.startsWith('Project ') && title.length > 15)) {
              title = `Project ${String(pId).slice(-6).toUpperCase()}`;
            }

            return {
              ...proj,
              id: pId,
              _id: pId,
              title,
              status,
              rolesCount,
              applicantsCount,
            };
          })
        );

        setProjects(enrichedProjects);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load workspace projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedProjects();
  }, [collaboratorId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16 text-slate-500 bg-white/60 rounded-2xl border border-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
        <span className="font-medium text-slate-700">Loading shared workspace projects...</span>
      </div>
    );
  }

  if (!collaboration) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center space-y-4 text-slate-900">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Workspace Not Found</h2>
        <p className="text-slate-600 text-sm">The requested collaboration record is missing or inactive.</p>
        <Button onClick={() => navigate('/collaborations')} variant="outline" className="border-slate-300">
          Back to My Collaborations
        </Button>
      </div>
    );
  }

  const ownerName = collaboration.ownerProfile?.fullName || 'Workspace Owner';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <Button
        variant="ghost"
        onClick={() => navigate('/collaborations')}
        className="text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Collaborations</span>
      </Button>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <FolderKanban className="w-6 h-6" />
          </div>
          <span>Projects shared by {ownerName}</span>
        </h1>
        <p className="text-slate-600 text-sm mt-2">
          Select a project to review applicants, add internal notes, or manage casting roles according to your permissions.
        </p>
      </div>

      {projects.length === 0 ? (
        <Card className="bg-white border-slate-200 text-center p-8 shadow-sm">
          <Film className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <CardTitle className="text-lg font-bold text-slate-900 mb-1">No shared projects found</CardTitle>
          <CardDescription className="text-slate-500 text-xs">
            There are currently no accessible projects under your granted scope for this workspace.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <Card
              key={proj.id}
              className="bg-white border-slate-200/90 text-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between rounded-2xl overflow-hidden"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center justify-between">
                  <span>{proj.title}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {proj.status || 'Active'}
                  </span>
                </CardTitle>
                {proj.description && (
                  <CardDescription className="text-slate-600 text-xs line-clamp-2 mt-1">
                    {proj.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
                  <span>{proj.rolesCount || 0} Roles</span>
                  <span>{proj.applicantsCount || 0} Applicants</span>
                </div>

                <Button
                  onClick={() => {
                    if (collaboration?.id || collaboration?.ownerId) {
                      switchWorkspace(collaboration.id || collaboration.ownerId);
                    }
                    navigate(`/director/projects/${proj.id}`);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium flex items-center justify-center gap-2 text-xs py-2.5 rounded-xl shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Project Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
