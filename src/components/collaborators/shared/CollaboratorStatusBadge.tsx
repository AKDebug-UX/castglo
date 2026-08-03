import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CollaboratorStatus } from '@/types/collaborator';
import { Clock, CheckCircle2, XCircle, UserX } from 'lucide-react';

interface CollaboratorStatusBadgeProps {
  status: CollaboratorStatus;
}

export const CollaboratorStatusBadge: React.FC<CollaboratorStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'accepted':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Active</span>
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 text-xs">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending</span>
        </Badge>
      );
    case 'declined':
      return (
        <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 text-xs">
          <XCircle className="w-3.5 h-3.5" />
          <span>Declined</span>
        </Badge>
      );
    case 'revoked':
      return (
        <Badge className="bg-slate-500/15 text-slate-400 border border-slate-500/30 flex items-center gap-1 text-xs">
          <UserX className="w-3.5 h-3.5" />
          <span>Revoked</span>
        </Badge>
      );
    default:
      return null;
  }
};
