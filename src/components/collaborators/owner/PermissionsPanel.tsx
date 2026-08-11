import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Permissions } from '@/types/collaborator';
import { AlertTriangle, Eye, ArrowRightLeft, FileText, Send, Edit, Users, Shield } from 'lucide-react';

interface PermissionsPanelProps {
  permissions: Permissions;
  onChange: (updatedPermissions: Permissions) => void;
  disabled?: boolean;
}

const PERMISSION_ITEMS: Array<{
  key: keyof Permissions;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isCritical?: boolean;
}> = [
  {
    key: 'viewApplicants',
    title: 'View Applicants',
    description: 'See applicants and their full profiles on your projects',
    icon: Eye,
  },
  {
    key: 'moveApplicants',
    title: 'Move Applicants',
    description: 'Shortlist, accept, reject, or update applicant statuses',
    icon: ArrowRightLeft,
  },
  {
    key: 'addNotes',
    title: 'Add Private Notes',
    description: 'Create private internal notes on applicant records',
    icon: FileText,
  },
  {
    key: 'sendMessages',
    title: 'Send Messages',
    description: 'Communicate directly with applicants on behalf of workspace',
    icon: Send,
  },
  {
    key: 'editProject',
    title: 'Edit Project Details',
    description: 'Modify project title, description, casting dates, and settings',
    icon: Edit,
  },
  {
    key: 'editRoles',
    title: 'Edit Project Roles',
    description: 'Create, update, or remove roles within a project',
    icon: Users,
  },
  {
    key: 'manageCollaborators',
    title: 'Manage Collaborators',
    description: 'Invite other team members and manage existing collaborator access',
    icon: Shield,
    isCritical: true,
  },
];

export const PermissionsPanel: React.FC<PermissionsPanelProps> = ({
  permissions,
  onChange,
  disabled = false,
}) => {
  const handleToggle = (key: keyof Permissions, checked: boolean) => {
    onChange({
      ...permissions,
      [key]: checked,
    });
  };

  return (
    <div className="space-y-2.5">
      {PERMISSION_ITEMS.map(({ key, title, description, icon: Icon, isCritical }) => {
        const isChecked = !!permissions[key];
        return (
          <div
            key={key}
            onClick={() => !disabled && handleToggle(key, !isChecked)}
            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
              isChecked
                ? 'bg-primary/8 border-primary/30 dark:bg-primary/10'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Checkbox
              id={`perm-${key}`}
              checked={isChecked}
              onCheckedChange={(checked) => handleToggle(key, !!checked)}
              disabled={disabled}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isChecked ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`} />
                <label
                  htmlFor={`perm-${key}`}
                  className="font-semibold text-sm text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  {title}
                </label>
                {isCritical && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                    <AlertTriangle className="w-3 h-3" /> Can invite others
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
