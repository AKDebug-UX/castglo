import React, { useEffect } from 'react';
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

declare global {
  interface Window {
    google?: any;
  }
}

interface SocialLoginProps {
  mode?: 'signin' | 'signup';
  disabled?: boolean;
}

export function SocialLogin({ mode = 'signin', disabled = false }: SocialLoginProps) {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "510800684128-placeholder.apps.googleusercontent.com",
          callback: handleCredentialResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { 
            theme: "outline", 
            size: "large", 
            width: "340",
            text: mode === 'signup' ? 'signup_with' : 'signin_with'
          }
        );
      }
    };
    initGoogleSignIn();
  }, [mode]);

  const handleCredentialResponse = async (response: any) => {
    const idToken = response.credential;
    try {
      const result = await signInWithGoogle(idToken);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      // Handle 2FA requirement from Google login
      if (result.requiresTwoFactor && result.tempToken) {
        navigate("/auth/2fa", {
          state: {
            tempToken: result.tempToken,
            returnTo: (location.state as any)?.from?.pathname,
          }
        });
        return;
      }

      toast.success("Welcome back!");
      if (result.role) {
        const roleRoutes: Record<string, string> = {
          talent: "/talent",
          casting_director: "/director",
          industry_professional: "/professional",
          admin: "/admin",
        };
        navigate(roleRoutes[result.role] || "/");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign in with Google.");
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <div id="google-signin-btn" className="w-full flex justify-center min-h-[44px]"></div>
      </div>

      <div className="relative flex items-center gap-4 my-6">
        <div className="flex-grow border-t border-border/60"></div>
        <span className="flex-shrink text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
          Or use your email
        </span>
        <div className="flex-grow border-t border-border/60"></div>
      </div>
    </div>
  );
}
