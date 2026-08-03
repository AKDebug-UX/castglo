import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Permissions } from '@/types/collaborator';
import { Eye, ArrowRightLeft, FileText, Send, Edit, Shield, Users } from 'lucide-react';

interface PermissionTagProps {
  permissionKey: keyof Permissions;
  size?: 'sm' | 'md';
}

const PERMISSION_CONFIG: Record<
  keyof Permissions,
  { label: string; icon: React.ComponentType<{ className?: string }>; colorClass: string }
> = {
  viewApplicants: {
    label: 'View Applicants',
    icon: Eye,
    colorClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  moveApplicants: {
    label: 'Move Applicants',
    icon: ArrowRightLeft,
    colorClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  addNotes: {
    label: 'Add Notes',
    icon: FileText,
    colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  sendMessages: {
    label: 'Send Messages',
    icon: Send,
    colorClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  editProject: {
    label: 'Edit Project',
    icon: Edit,
    colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  editRoles: {
    label: 'Edit Roles',
    icon: Users,
    colorClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  manageCollaborators: {
    label: 'Manage Collaborators',
    icon: Shield,
    colorClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
};

export const PermissionTag: React.FC<PermissionTagProps> = ({ permissionKey, size = 'sm' }) => {
  const config = PERMISSION_CONFIG[permissionKey];
  if (!config) return null;

  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 font-medium transition-all ${config.colorClass} ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </Badge>
  );
};
