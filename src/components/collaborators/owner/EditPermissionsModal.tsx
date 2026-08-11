import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PermissionsPanel } from './PermissionsPanel';
import { ProjectGrantSelector, ProjectGrantItem } from './ProjectGrantSelector';
import { Collaborator, AccessScope, Permissions, UpdateCollaboratorDto } from '@/types/collaborator';
import { collaboratorAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Edit3, Globe, FolderKanban, Save, AlertCircle } from 'lucide-react';

interface EditPermissionsModalProps {
  collaborator: Collaborator | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditPermissionsModal: React.FC<EditPermissionsModalProps> = ({
  collaborator,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [accessScope, setAccessScope] = useState<AccessScope>('all_projects');
  const [globalPermissions, setGlobalPermissions] = useState<Permissions>({
    viewApplicants: true,
    moveApplicants: true,
    addNotes: true,
    sendMessages: true,
    editProject: false,
    editRoles: false,
    manageCollaborators: false,
  });
  const [projectGrants, setProjectGrants] = useState<ProjectGrantItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (collaborator) {
      setAccessScope(collaborator.accessScope);
      if (collaborator.globalPermissions) {
        setGlobalPermissions({ ...collaborator.globalPermissions });
      }
      if (collaborator.projectGrants) {
        setProjectGrants(
          collaborator.projectGrants.map((g) => ({
            projectId: g.projectId,
            permissions: { ...g.permissions },
          }))
        );
      }
      setFormError(null);
    }
  }, [collaborator]);

  if (!collaborator) return null;

  const handleSubmit = async () => {
    setFormError(null);

    if (accessScope === 'all_projects') {
      const hasAnyPerm = Object.values(globalPermissions).some(Boolean);
      if (!hasAnyPerm) {
        setFormError('Please select at least one permission to grant');
        return;
      }
    } else {
      if (projectGrants.length === 0) {
        setFormError('Please select at least one project');
        return;
      }
      const hasAnyGrantPerm = projectGrants.some((g) =>
        Object.values(g.permissions).some(Boolean)
      );
      if (!hasAnyGrantPerm) {
        setFormError('Please ensure each selected project has at least one permission granted');
        return;
      }
    }

    const payload: UpdateCollaboratorDto = {
      accessScope,
      ...(accessScope === 'all_projects'
        ? { globalPermissions }
        : { projectGrants }),
    };

    try {
      setIsSubmitting(true);
      const res = await collaboratorAPI.update(collaborator.id, payload);
      if (res.data?.success || res.status === 200) {
        toast.success(`Permissions updated for ${collaborator.inviteEmail}`);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message || 'Failed to update collaborator permissions'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            <span>Edit Collaborator Permissions</span>
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
            Updating permissions for{' '}
            <span className="text-slate-700 dark:text-slate-200 font-semibold">{collaborator.inviteEmail}</span>
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm my-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="space-y-5 py-2">
          {/* Access Scope selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Access Scope
            </label>
            <RadioGroup
              value={accessScope}
              onValueChange={(val) => setAccessScope(val as AccessScope)}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <div
                onClick={() => setAccessScope('all_projects')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  accessScope === 'all_projects'
                    ? 'bg-primary/10 border-primary/40'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <RadioGroupItem value="all_projects" id="edit-scope-all" className="mt-1" />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-800 dark:text-slate-100">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    <span>All Projects</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Workspace-wide permissions</p>
                </div>
              </div>

              <div
                onClick={() => setAccessScope('selected_projects')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  accessScope === 'selected_projects'
                    ? 'bg-primary/10 border-primary/40'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <RadioGroupItem value="selected_projects" id="edit-scope-selected" className="mt-1" />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-800 dark:text-slate-100">
                    <FolderKanban className="w-4 h-4 text-purple-500" />
                    <span>Selected Projects</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Specific project grants</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Permissions Configuration */}
          {accessScope === 'all_projects' ? (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Global Workspace Permissions
              </p>
              <PermissionsPanel
                permissions={globalPermissions}
                onChange={setGlobalPermissions}
              />
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Project Grants & Permissions
              </p>
              <ProjectGrantSelector
                grants={projectGrants}
                onChange={setProjectGrants}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl h-10 font-semibold px-5"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl h-10 font-semibold px-5 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Permissions</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
