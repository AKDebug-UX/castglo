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
      <AlertDialogContent className="bg-slate-950 border-slate-800 text-white max-w-md">
        <AlertDialogHeader>
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <AlertDialogTitle className="text-xl font-bold text-white">
            Revoke Collaborator Access?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300 text-sm mt-2">
            Are you sure you want to revoke access for{' '}
            <strong className="text-white">{collaborator.inviteEmail}</strong>?
            <br />
            <br />
            They will immediately lose access to all projects and applicant records in your workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
          <AlertDialogCancel
            onClick={onClose}
            className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRevoke}
            disabled={isSubmitting}
            className="bg-rose-600 hover:bg-rose-700 text-white font-medium flex items-center gap-2"
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
