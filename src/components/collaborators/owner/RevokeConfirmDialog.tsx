import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Collaborator } from '@/types/collaborator';
import { collaboratorAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';

interface RevokeConfirmDialogProps {
  collaborator: Collaborator | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RevokeConfirmDialog: React.FC<RevokeConfirmDialogProps> = ({
  collaborator,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!collaborator) return null;

  const handleRevoke = async () => {
    try {
      setIsSubmitting(true);
      await collaboratorAPI.revoke(collaborator.id);
      toast.success(`Revoked access for ${collaborator.inviteEmail}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to revoke collaborator access');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="rounded-2xl shadow-2xl sm:max-w-md">
        <AlertDialogHeader>
          <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <AlertDialogTitle className="text-xl font-bold">
            Revoke Collaborator Access?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Are you sure you want to revoke access for{' '}
            <strong className="text-slate-800 dark:text-slate-200">{collaborator.inviteEmail}</strong>?
            <br />
            <br />
            They will immediately lose access to all projects and applicant records in your workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-3">
          <AlertDialogCancel
            onClick={onClose}
            className="rounded-xl h-10 font-semibold px-5"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRevoke}
            disabled={isSubmitting}
            className="bg-destructive hover:bg-destructive/80 text-white rounded-xl h-10 font-semibold px-5 border-none flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Revoking...</span>
              </>
            ) : (
              <span>Revoke Access</span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
