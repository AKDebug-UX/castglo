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
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200 font-medium',
  },
  moveApplicants: {
    label: 'Move Applicants',
    icon: ArrowRightLeft,
    colorClass: 'bg-purple-50 text-purple-700 border-purple-200 font-medium',
  },
  addNotes: {
    label: 'Add Notes',
    icon: FileText,
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
  },
  sendMessages: {
    label: 'Send Messages',
    icon: Send,
    colorClass: 'bg-cyan-50 text-cyan-700 border-cyan-200 font-medium',
  },
  editProject: {
    label: 'Edit Project',
    icon: Edit,
    colorClass: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
  },
  editRoles: {
    label: 'Edit Roles',
    icon: Users,
    colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium',
  },
  manageCollaborators: {
    label: 'Manage Collaborators',
    icon: Shield,
    colorClass: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
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
