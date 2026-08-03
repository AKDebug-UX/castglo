import React, { useState, useEffect } from 'react';
import { collaboratorAPI } from '@/lib/api';
import { Collaborator } from '@/types/collaborator';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PendingInvitationsBanner: React.FC = () => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Collaborator[]>([]);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const checkPendingInvitations = async () => {
      try {
        const res = await collaboratorAPI.getMyInvitations();
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setInvitations(res.data.data);
        }
      } catch (err) {
        // Silent catch for background banner check
      }
    };

    checkPendingInvitations();
  }, []);

  if (!isVisible || invitations.length === 0) return null;

  const count = invitations.length;
  const firstInvite = invitations[0];
  const ownerName = firstInvite.ownerProfile?.fullName || 'A workspace owner';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-purple-600 p-4 text-white shadow-lg mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <span>Pending Workspace Collaboration Invite</span>
              {count > 1 && (
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold">
                  +{count - 1} more
                </span>
              )}
            </h4>
            <p className="text-xs text-white/90 mt-0.5">
              {ownerName} has invited you to access and manage projects in their workspace.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            size="sm"
            onClick={() => navigate('/collaborations')}
            className="bg-white text-slate-900 hover:bg-white/90 font-semibold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <span>Review Invite</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            className="w-8 h-8 text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
