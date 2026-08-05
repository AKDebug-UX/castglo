import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { collaboratorAPI } from '@/lib/api';
import { InvitationSummaryCard } from '@/components/collaborators/invitee/InvitationSummaryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, LogIn, UserPlus, AlertCircle, Film, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const rawToken = searchParams.get('token') || sessionStorage.getItem('collaboratorToken') || '';
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [statusState, setStatusState] = useState<'pending' | 'accepted' | 'declined' | 'expired' | 'mismatch' | 'invalid'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!rawToken) {
      setIsLoading(false);
      setStatusState('invalid');
      setErrorMessage('No invitation token found in link.');
      return;
    }

    // Preserve token in sessionStorage for registration/login redirect persistence
    sessionStorage.setItem('collaboratorToken', rawToken);

    // If user is authenticated, attempt auto-fetching invitation info or details
    const verifyToken = async () => {
      try {
        setIsLoading(true);
        // Check my invitations list or accept endpoint pre-validation
        const res = await collaboratorAPI.getMyInvitations();
        if (res.data?.success && Array.isArray(res.data?.data)) {
          const match = res.data.data.find((inv: any) => inv.inviteToken === rawToken || inv.id === rawToken);
          if (match) {
            setInvitationData(match);
            if (match.status === 'accepted') setStatusState('accepted');
            else if (match.status === 'declined') setStatusState('declined');
            else if (match.status === 'revoked') setStatusState('invalid');
          }
        }
      } catch (err: any) {
        // Silent catch, fallback to manual accept trigger
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, [rawToken, isAuthenticated]);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('collaboratorToken', rawToken);
      navigate(`/sign-in?redirect=${encodeURIComponent(`/collaborators/accept?token=${rawToken}`)}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await collaboratorAPI.accept({ token: rawToken });
      if (res.data?.success || res.status === 200) {
        sessionStorage.removeItem('collaboratorToken');
        toast.success('Invitation accepted successfully! Welcome to the workspace.');
        setStatusState('accepted');
        setTimeout(() => {
          navigate('/collaborations');
        }, 1500);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || 'Failed to accept invitation';

      if (status === 403 && err?.response?.data?.requiresAuth) {
        navigate(`/sign-in?redirect=${encodeURIComponent(`/collaborators/accept?token=${rawToken}`)}`);
      } else if (status === 403) {
        setStatusState('mismatch');
        setErrorMessage(msg || 'This invitation was sent to a different account email address.');
      } else if (status === 410) {
        setStatusState('expired');
        setErrorMessage('This invitation link has expired. Please ask the workspace owner to resend it.');
      } else if (status === 400 && msg?.toLowerCase().includes('already accepted')) {
        setStatusState('accepted');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!isAuthenticated) return;

    try {
      setIsSubmitting(true);
      const res = await collaboratorAPI.decline({ token: rawToken });
      if (res.data?.success || res.status === 200) {
        sessionStorage.removeItem('collaboratorToken');
        toast.info('Invitation declined.');
        setStatusState('declined');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to decline invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white shadow-lg">
            <Film className="w-6 h-6" />
          </div>
          <span>Castglo</span>
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto space-y-6">
        {isLoading ? (
          <Card className="bg-slate-900 border-slate-800 text-white p-8 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Verifying invitation token...</p>
          </Card>
        ) : statusState === 'accepted' ? (
          <Card className="bg-slate-900/90 border-emerald-500/30 text-white text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">You're All Set!</CardTitle>
            <CardDescription className="text-slate-300 text-sm">
              You have accepted this workspace collaboration. You now have access to shared workspace projects.
            </CardDescription>
            <Button
              onClick={() => navigate('/collaborations')}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium flex items-center justify-center gap-2 mt-4"
            >
              <span>Go to My Collaborations</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        ) : statusState === 'declined' ? (
          <Card className="bg-slate-900 border-slate-800 text-white text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-bold">Invitation Declined</CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              You have declined this workspace collaboration invitation.
            </CardDescription>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Back to Home
            </Button>
          </Card>
        ) : statusState === 'expired' || statusState === 'invalid' || statusState === 'mismatch' ? (
          <Card className="bg-slate-900 border-slate-800 text-white text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-bold">
              {statusState === 'expired'
                ? 'Invitation Expired'
                : statusState === 'mismatch'
                ? 'Account Email Mismatch'
                : 'Invalid Invitation Link'}
            </CardTitle>
            <CardDescription className="text-slate-300 text-sm">
              {errorMessage || 'This invitation link is invalid or no longer active.'}
            </CardDescription>

            {statusState === 'mismatch' && (
              <div className="pt-2">
                <Button
                  onClick={() => {
                    sessionStorage.setItem('collaboratorToken', rawToken);
                    navigate(`/sign-in?redirect=${encodeURIComponent(`/collaborators/accept?token=${rawToken}`)}`);
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Switch Account / Log In</span>
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <Card className="bg-slate-900/90 border-slate-800 text-white overflow-hidden shadow-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-white">
                Workspace Collaboration Invite
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                You've been invited to access and manage projects on Castglo.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
              <InvitationSummaryCard
                ownerName={invitationData?.ownerProfile?.fullName || 'Workspace Owner'}
                ownerEmail={invitationData?.ownerProfile?.email}
                ownerAvatar={invitationData?.ownerProfile?.avatarUrl}
                accessScope={invitationData?.accessScope || 'all_projects'}
                globalPermissions={invitationData?.globalPermissions}
                projectCount={invitationData?.projectGrants?.length || 0}
              />

              {!isAuthenticated ? (
                <div className="space-y-4 p-5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    You have been invited to collaborate on Castglo. Please log in or sign up to accept this invitation.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Button
                      onClick={() =>
                        navigate(`/sign-in?redirect=${encodeURIComponent(`/collaborators/accept?token=${rawToken}`)}`)
                      }
                      className="bg-primary hover:bg-primary/90 text-white font-medium text-xs flex items-center justify-center gap-1.5 py-2.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Log In</span>
                    </Button>

                    <Button
                      onClick={() => {
                        const emailParam = invitationData?.inviteEmail
                          ? `&email=${encodeURIComponent(invitationData.inviteEmail)}`
                          : '';
                        navigate(`/register?collaboratorToken=${encodeURIComponent(rawToken)}${emailParam}`);
                      }}
                      variant="outline"
                      className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs flex items-center justify-center gap-1.5 py-2.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Sign Up</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <Button
                    onClick={handleAccept}
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-base py-3 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Accepting Invitation...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Accept Invitation</span>
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleDecline}
                    disabled={isSubmitting}
                    variant="ghost"
                    className="w-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-sm"
                  >
                    Decline
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
