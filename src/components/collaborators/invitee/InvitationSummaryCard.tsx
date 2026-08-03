import React from 'react';
import { PermissionTag } from '../shared/PermissionTag';
import { Permissions } from '@/types/collaborator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, FolderKanban, CheckCircle, ShieldCheck } from 'lucide-react';

interface InvitationSummaryCardProps {
  ownerName: string;
  ownerEmail?: string;
  ownerAvatar?: string;
  accessScope: 'all_projects' | 'selected_projects';
  globalPermissions?: Permissions | null;
  projectCount?: number;
  permissionsList?: Array<keyof Permissions>;
}

export const InvitationSummaryCard: React.FC<InvitationSummaryCardProps> = ({
  ownerName,
  ownerEmail,
  ownerAvatar,
  accessScope,
  globalPermissions,
  projectCount = 0,
  permissionsList = [],
}) => {
  const initials = ownerName.slice(0, 2).toUpperCase();

  // Derive permissions if not directly provided as array
  const activePermissions =
    permissionsList.length > 0
      ? permissionsList
      : globalPermissions
      ? (Object.keys(globalPermissions) as Array<keyof Permissions>).filter(
          (k) => globalPermissions[k]
        )
      : [];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-2xl space-y-6 text-left">
      {/* Inviter Info */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
        <Avatar className="w-14 h-14 border border-slate-700">
          <AvatarImage src={ownerAvatar} />
          <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div>
          <h3 className="text-lg font-bold text-white">{ownerName}</h3>
          {ownerEmail && <p className="text-xs text-slate-400">{ownerEmail}</p>}
          <div className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium mt-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Workspace Owner
          </div>
        </div>
      </div>

      {/* Scope Overview */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Access Granted
        </p>
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {accessScope === 'all_projects' ? (
              <Globe className="w-5 h-5 text-emerald-400" />
            ) : (
              <FolderKanban className="w-5 h-5 text-purple-400" />
            )}
            <div>
              <p className="font-semibold text-sm text-slate-100">
                {accessScope === 'all_projects'
                  ? 'All Workspace Projects'
                  : `${projectCount} Selected Project${projectCount !== 1 ? 's' : ''}`}
              </p>
              <p className="text-xs text-slate-400">
                {accessScope === 'all_projects'
                  ? 'Full collaborator access across all current and future projects.'
                  : 'Access restricted strictly to the specified projects.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Granted Permissions List */}
      {activePermissions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Permission Privileges
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {activePermissions.map((permKey) => (
              <PermissionTag key={permKey} permissionKey={permKey} size="md" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
