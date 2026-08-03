import React from 'react';
import { Collaborator, Permissions } from '@/types/collaborator';
import { CollaboratorStatusBadge } from '../shared/CollaboratorStatusBadge';
import { PermissionTag } from '../shared/PermissionTag';
import { Button } from '@/components/ui/button';
import { Mail, Edit3, Trash2, RotateCw, Globe, FolderKanban, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface CollaboratorCardProps {
  collaborator: Collaborator;
  onEdit: (collaborator: Collaborator) => void;
  onRevoke: (collaborator: Collaborator) => void;
  onResend: (collaborator: Collaborator) => void;
  isResending?: boolean;
}

export const CollaboratorCard: React.FC<CollaboratorCardProps> = ({
  collaborator,
  onEdit,
  onRevoke,
  onResend,
  isResending = false,
}) => {
  const isPending = collaborator.status === 'pending';
  const isRevoked = collaborator.status === 'revoked';

  const userDisplayName =
    collaborator.collaboratorUser?.fullName || collaborator.inviteEmail;
  const userInitials = userDisplayName.slice(0, 2).toUpperCase();

  // Extract active permission keys to show tags
  let permissionsToShow: Array<keyof Permissions> = [];
  if (collaborator.accessScope === 'all_projects' && collaborator.globalPermissions) {
    permissionsToShow = (Object.keys(collaborator.globalPermissions) as Array<keyof Permissions>).filter(
      (k) => collaborator.globalPermissions?.[k]
    );
  } else if (collaborator.accessScope === 'selected_projects' && collaborator.projectGrants) {
    const permSet = new Set<keyof Permissions>();
    collaborator.projectGrants.forEach((grant) => {
      if (grant.permissions) {
        (Object.keys(grant.permissions) as Array<keyof Permissions>).forEach((k) => {
          if (grant.permissions[k]) permSet.add(k);
        });
      }
    });
    permissionsToShow = Array.from(permSet);
  }

  const projectCount = collaborator.projectGrants?.length || 0;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all space-y-4 text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Avatar className="w-12 h-12 border-2 border-primary/20 bg-primary/10">
            <AvatarImage src={collaborator.collaboratorUser?.avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-slate-900 text-base">{userDisplayName}</h4>
              <CollaboratorStatusBadge status={collaborator.status} />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {collaborator.inviteEmail}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Invited {collaborator.createdAt ? format(new Date(collaborator.createdAt), 'MMM d, yyyy') : 'Recently'}
              </span>
            </div>
          </div>
        </div>

        {/* Scope pill */}
        <div className="flex items-center gap-2">
          {collaborator.accessScope === 'all_projects' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              All Projects Scope
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <FolderKanban className="w-3.5 h-3.5 text-purple-600" />
              {projectCount} Selected Project{projectCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Permissions summary */}
      {permissionsToShow.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Granted Permissions:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {permissionsToShow.map((permKey) => (
              <PermissionTag key={permKey} permissionKey={permKey} size="sm" />
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
        {isPending && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResend(collaborator)}
            disabled={isResending}
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium flex items-center gap-1.5 text-xs shadow-sm rounded-xl"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>Resend Invite</span>
          </Button>
        )}

        {!isRevoked && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(collaborator)}
            className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium flex items-center gap-1.5 text-xs shadow-sm rounded-xl"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Access</span>
          </Button>
        )}

        {!isRevoked && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRevoke(collaborator)}
            className="border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-medium flex items-center gap-1.5 text-xs shadow-sm rounded-xl"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Revoke</span>
          </Button>
        )}
      </div>
    </div>
  );
};
