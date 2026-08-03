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
  const isAccepted = collaborator.status === 'accepted';
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
    // Combine unique true permissions across project grants
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

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm hover:border-slate-700 transition-all space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-11 h-11 border border-slate-700 bg-slate-800">
            <AvatarImage src={collaborator.collaboratorUser?.avatarUrl} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-white text-base">{userDisplayName}</h4>
              <CollaboratorStatusBadge status={collaborator.status} />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <Mail className="w-3 h-3 text-slate-500" />
              <span>{collaborator.inviteEmail}</span>
              <span className="text-slate-600">•</span>
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>
                Invited {collaborator.createdAt ? format(new Date(collaborator.createdAt), 'MMM d, yyyy') : 'Recently'}
              </span>
            </div>
          </div>
        </div>

        {/* Scope pill */}
        <div className="flex items-center gap-2">
          {collaborator.accessScope === 'all_projects' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Globe className="w-3.5 h-3.5" />
              All Projects Scope
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FolderKanban className="w-3.5 h-3.5" />
              {collaborator.projectGrants?.length || 0} Selected Project
              {(collaborator.projectGrants?.length || 0) !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Permissions summary */}
      {permissionsToShow.length > 0 && (
        <div className="pt-2 border-t border-slate-800/60">
          <p className="text-xs text-slate-400 mb-2 font-medium">Granted Permissions:</p>
          <div className="flex flex-wrap gap-1.5">
            {permissionsToShow.map((permKey) => (
              <PermissionTag key={permKey} permissionKey={permKey} size="sm" />
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
        {isPending && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResend(collaborator)}
            disabled={isResending}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-1.5 text-xs"
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
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-1.5 text-xs"
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
            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50 flex items-center gap-1.5 text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Revoke</span>
          </Button>
        )}
      </div>
    </div>
  );
};
