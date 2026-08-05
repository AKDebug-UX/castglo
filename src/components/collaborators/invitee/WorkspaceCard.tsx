import React from 'react';
import { Collaborator, Permissions } from '@/types/collaborator';
import { PermissionTag } from '../shared/PermissionTag';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, FolderKanban, ArrowRight, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface WorkspaceCardProps {
  collaboration: Collaborator;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ collaboration }) => {
  const navigate = useNavigate();
  const { switchWorkspace } = useWorkspace();
  const ownerName =
    collaboration.ownerProfile?.fullName || collaboration.ownerProfile?.email || 'Workspace Owner';
  const companyName = collaboration.ownerProfile?.companyName;
  const avatarUrl = collaboration.ownerProfile?.avatarUrl;
  const initials = ownerName.slice(0, 2).toUpperCase();

  // Active permissions
  let permissionsToShow: Array<keyof Permissions> = [];
  if (collaboration.accessScope === 'all_projects' && collaboration.globalPermissions) {
    permissionsToShow = (Object.keys(collaboration.globalPermissions) as Array<keyof Permissions>).filter(
      (k) => collaboration.globalPermissions?.[k]
    );
  } else if (collaboration.accessScope === 'selected_projects' && collaboration.projectGrants) {
    const permSet = new Set<keyof Permissions>();
    collaboration.projectGrants.forEach((grant) => {
      if (grant.permissions) {
        (Object.keys(grant.permissions) as Array<keyof Permissions>).forEach((k) => {
          if (grant.permissions[k]) permSet.add(k);
        });
      }
    });
    permissionsToShow = Array.from(permSet);
  }

  const projectCount = collaboration.projectGrants?.length || 0;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-4">
        {/* Workspace Owner Header */}
        <div className="flex items-center gap-3.5">
          <Avatar className="w-12 h-12 border-2 border-primary/20 bg-primary/10">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <h4 className="font-bold text-slate-900 text-base leading-tight">{ownerName}</h4>
            {companyName ? (
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 font-medium">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{companyName}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Workspace Owner</p>
            )}
          </div>
        </div>

        {/* Scope Pill */}
        <div className="flex items-center gap-2">
          {collaboration.accessScope === 'all_projects' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              All Workspace Projects
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <FolderKanban className="w-3.5 h-3.5 text-purple-600" />
              {projectCount} Shared Project{projectCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Permissions Tags */}
        {permissionsToShow.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Granted Privileges:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {permissionsToShow.map((permKey) => (
                <PermissionTag key={permKey} permissionKey={permKey} size="sm" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="pt-3 border-t border-slate-100">
        <Button
          onClick={() => {
            switchWorkspace(collaboration.id || collaboration.ownerId);
            navigate(`/collaborations/${collaboration.id}/projects`);
          }}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium flex items-center justify-center gap-2 text-xs py-2.5 rounded-xl shadow-sm"
        >
          <span>View Workspace Projects</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
