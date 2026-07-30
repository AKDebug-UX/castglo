import React, { useState } from 'react';
import { DiditSdk } from '@didit-protocol/sdk-web';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { verificationAPI } from '@/lib/api';

interface VerifyProfileButtonProps {
  onSuccess?: () => void;
  onError?: (errMessage: string) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function VerifyProfileButton({
  onSuccess,
  onError: onErrorProp,
  className = '',
  variant = 'default',
  size = 'default',
  children,
}: VerifyProfileButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '';

      // 1. Ask the backend to generate the session URL
      try {
        const response = await verificationAPI.createDiditSession();
        if (response.data?.success && response.data?.data?.url) {
          url = response.data.data.url;
        } else if (response.data?.url) {
          url = response.data.url;
        } else if (response.data?.data) {
          url = typeof response.data.data === 'string' ? response.data.data : response.data.data.url;
        }
      } catch (apiErr) {
        // Fallback to fetch /api/v1/verification/didit/session
        const token = localStorage.getItem('token');
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://castglo-qupm.onrender.com/api/v1';
        const fetchUrl = `${apiBase.replace(/\/$/, '')}/verification/didit/session`;

        const response = await fetch(fetchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`,
          },
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || result.message || 'Failed to start verification session');
        }
        url = result.data?.url || result.url;
      }

      if (!url) {
        throw new Error('Verification session URL was not returned by the server.');
      }

      // 2. Launch the Didit verification UI flow
      if (DiditSdk && typeof DiditSdk.openSelfie === 'function') {
        DiditSdk.openSelfie({
          url: url,
          onComplete: () => {
            toast.success('Verification flow completed! It is currently being processed.');
            if (onSuccess) onSuccess();
          },
          onError: (err: any) => {
            const errMsg = err?.message || 'An error occurred during verification.';
            setError(errMsg);
            toast.error(errMsg);
            if (onErrorProp) onErrorProp(errMsg);
          },
        });
      } else {
        // Direct launch fallback if SDK popup is prevented or uninitialized
        window.open(url, '_blank');
        toast.info('Opened verification portal in a new tab.');
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to connect to verification services.';
      setError(errMsg);
      toast.error(errMsg);
      if (onErrorProp) onErrorProp(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container inline-flex flex-col items-start gap-2">
      <Button
        onClick={startVerification}
        disabled={loading}
        variant={variant}
        size={size}
        className={`verify-btn font-medium transition-all ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Starting Verification...
          </>
        ) : children ? (
          children
        ) : (
          <>
            <ShieldCheck className="w-4 h-4 mr-2" />
            Verify My Identity
          </>
        )}
      </Button>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive mt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="error-message">{error}</span>
        </div>
      )}
    </div>
  );
}

export default VerifyProfileButton;
