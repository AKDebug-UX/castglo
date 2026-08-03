import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PermissionsPanel } from './PermissionsPanel';
import { ProjectGrantSelector, ProjectGrantItem } from './ProjectGrantSelector';
import { AccessScope, Permissions, InviteCollaboratorDto } from '@/types/collaborator';
import { collaboratorAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Mail, Globe, FolderKanban, Send, AlertCircle } from 'lucide-react';

interface InviteCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InviteCollaboratorModal: React.FC<InviteCollaboratorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [accessScope, setAccessScope] = useState<AccessScope>('all_projects');

  // Global permissions state for all_projects scope
  const [globalPermissions, setGlobalPermissions] = useState<Permissions>({
    viewApplicants: true,
    moveApplicants: true,
    addNotes: true,
    sendMessages: false,
    editProject: false,
    editRoles: false,
    manageCollaborators: false,
  });

  // Project grants state for selected_projects scope
  const [projectGrants, setProjectGrants] = useState<ProjectGrantItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setStep(1);
    setInviteEmail('');
    setAccessScope('all_projects');
    setGlobalPermissions({
      viewApplicants: true,
      moveApplicants: true,
      addNotes: true,
      sendMessages: false,
      editProject: false,
      editRoles: false,
      manageCollaborators: false,
    });
    setProjectGrants([]);
    setFormError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateStep1 = (): boolean => {
    setFormError(null);
    if (!inviteEmail.trim()) {
      setFormError('Please enter an email address');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      setFormError('Please enter a valid email address');
      return false;
    }
    if (user?.email && user.email.toLowerCase() === inviteEmail.trim().toLowerCase()) {
      setFormError('You cannot invite yourself as a collaborator');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setFormError(null);

    // Validation
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

    const payload: InviteCollaboratorDto = {
      inviteEmail: inviteEmail.trim().toLowerCase(),
      accessScope,
      ...(accessScope === 'all_projects'
        ? { globalPermissions }
        : { projectGrants }),
    };

    try {
      setIsSubmitting(true);
      const res = await collaboratorAPI.invite(payload);
      if (res.data?.success || res.status === 201) {
        toast.success(`Invitation sent to ${inviteEmail}`);
        onSuccess();
        handleClose();
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        (err?.response?.status === 409
          ? 'An active invitation already exists for this email address'
          : err?.response?.status === 403
          ? 'You do not have permission to invite collaborators'
          : 'Failed to send invitation');
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-xl bg-slate-950 border-slate-800 text-white p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <span>Invite Workspace Collaborator</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            {step === 1
              ? 'Enter team member details and select their access scope.'
              : `Configure permission access level for ${inviteEmail}`}
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm my-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 py-3">
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-sm font-medium text-slate-200">
                Team Member Email <span className="text-rose-400">*</span>
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-200">Access Scope</Label>
              <RadioGroup
                value={accessScope}
                onValueChange={(val) => setAccessScope(val as AccessScope)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div
                  onClick={() => setAccessScope('all_projects')}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    accessScope === 'all_projects'
                      ? 'bg-primary/10 border-primary/40 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <RadioGroupItem value="all_projects" id="scope-all" className="mt-1" />
                  <div>
                    <div className="flex items-center gap-1.5 font-medium text-sm text-slate-100">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>All Projects</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Grant permissions across all existing and future projects in your workspace.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setAccessScope('selected_projects')}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    accessScope === 'selected_projects'
                      ? 'bg-primary/10 border-primary/40 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <RadioGroupItem value="selected_projects" id="scope-selected" className="mt-1" />
                  <div>
                    <div className="flex items-center gap-1.5 font-medium text-sm text-slate-100">
                      <FolderKanban className="w-4 h-4 text-purple-400" />
                      <span>Selected Projects</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Limit access to specific projects with granular per-project permissions.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-2">
            {accessScope === 'all_projects' ? (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Global Workspace Permissions
                </p>
                <PermissionsPanel
                  permissions={globalPermissions}
                  onChange={setGlobalPermissions}
                />
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Select Projects & Assign Permissions
                </p>
                <ProjectGrantSelector
                  grants={projectGrants}
                  onChange={setProjectGrants}
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
          {step === 2 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </Button>
          )}

          {step === 1 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className="bg-primary hover:bg-primary/90 text-white font-medium"
            >
              Continue to Permissions
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-white font-medium flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Invite...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Invitation</span>
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
