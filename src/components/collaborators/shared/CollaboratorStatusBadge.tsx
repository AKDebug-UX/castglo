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
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold inline-flex items-center gap-1 text-xs px-2.5 py-0.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active</span>
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-semibold inline-flex items-center gap-1 text-xs px-2.5 py-0.5">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Pending</span>
        </Badge>
      );
    case 'declined':
      return (
        <Badge className="bg-rose-50 text-rose-700 border border-rose-200 font-semibold inline-flex items-center gap-1 text-xs px-2.5 py-0.5">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Declined</span>
        </Badge>
      );
    case 'revoked':
      return (
        <Badge className="bg-slate-100 text-slate-700 border border-slate-200 font-semibold inline-flex items-center gap-1 text-xs px-2.5 py-0.5">
          <UserX className="w-3.5 h-3.5 text-slate-500" />
          <span>Revoked</span>
        </Badge>
      );
    default:
      return null;
  }
};
