import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollaboratorEmptyStateProps {
  onInviteClick?: () => void;
  title?: string;
  description?: string;
  showButton?: boolean;
}

export const CollaboratorEmptyState: React.FC<CollaboratorEmptyStateProps> = ({
  onInviteClick,
  title = "No collaborations yet",
  description = "When casting directors or team owners invite you to collaborate on their projects, your shared workspaces will appear here.",
  showButton = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-sm shadow-sm my-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary">
        <Users className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 max-w-md text-sm mb-6">{description}</p>
      {showButton && onInviteClick && (
        <Button onClick={onInviteClick} className="bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-sm">
          <UserPlus className="w-4 h-4" />
          <span>Invite Collaborator</span>
        </Button>
      )}
    </div>
  );
};
