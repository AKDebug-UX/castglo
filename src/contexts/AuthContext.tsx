import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI, userAPI, twoFactorAuthAPI } from "@/lib/api";

export type UserRole = "talent" | "casting_director" | "industry_professional" | "admin";

interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  isVerified?: boolean;
  preferredCurrency?: string;
  twoFactorEnabled?: boolean;
}

export interface PendingTwoFactor {
  tempToken: string;
  email?: string;
  returnTo?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  pendingTwoFactor: PendingTwoFactor | null;
  setPendingTwoFactor: (v: PendingTwoFactor | null) => void;
  signIn: (email: string, password: string) => Promise<{ error?: string; role?: UserRole; requiresTwoFactor?: boolean; tempToken?: string }>;
  signInWithGoogle: (idToken: string, role?: UserRole) => Promise<{ error?: string; role?: UserRole; requiresTwoFactor?: boolean; tempToken?: string }>;
  signUp: (data: { email: string, password: string, role: UserRole, fullName: string, phoneNumber?: string, collaboratorToken?: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error?: string }>;
  resetPassword: (data: { token: string, newPassword: string, confirmPassword: string }) => Promise<{ error?: string }>;
  verifyEmail: (token: string) => Promise<{ error?: string }>;
  resendVerification: (email: string) => Promise<{ error?: string }>;
  refreshUser: () => Promise<void>;
  updatePreferredCurrency: (currency: string) => Promise<{ error?: string }>;
  formatPrice: (amount: number | string) => string;
  // 2FA — login verification
  verifyTwoFactor: (code: string, tempToken?: string) => Promise<{ error?: string; role?: UserRole }>;
  resendTwoFactorCode: (email?: string) => Promise<{ error?: string }>;
  // 2FA — authenticated TOTP management
  enrolTwoFactor: () => Promise<{ error?: string; qrCode?: string; secret?: string }>;
  confirmTwoFactor: (token: string) => Promise<{ error?: string; backupCodes?: string[] }>;
  disableTwoFactor: (password: string) => Promise<{ error?: string }>;
  regenerateBackupCodes: () => Promise<{ error?: string; backupCodes?: string[] }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const buildUserObj = (userData: any): User => {
  const tp = userData.talentProfile || {};
  const cp = userData.castingDirectorProfile || userData.castingProfile || {};
  const pp = userData.professionalProfile || userData.professional || {};

  const resolvedFullName = cp.fullName || tp.fullName || pp.fullName || userData.fullName || "";

  return {
    id: userData._id || userData.id,
    email: userData.email,
    role: (userData.role || (userData.roles && userData.roles[0])) as UserRole,
    fullName: resolvedFullName,
    profilePicture: userData.profilePicture,
    isEmailVerified: userData.emailVerified || userData.isEmailVerified || false,
    isVerified: userData.isVerified || (userData.emailVerified || userData.isEmailVerified) || false,
    preferredCurrency: userData.preferredCurrency || "GBP",
    twoFactorEnabled: userData.twoFactorEnabled || userData.isTwoFactorEnabled || userData.is2FAEnabled || userData.twoFactorAuthEnabled || false,
  };
};

const getErrorMessage = (data: any, fallback: string): string => {
  if (!data) return fallback;
  if (data.data && typeof data.data === "object") {
    const values = Object.values(data.data);
    if (values.length > 0 && typeof values[0] === "string") {
      return values.join(", ");
    }
  }
  return data.error || data.message || fallback;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('userData');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTwoFactor, setPendingTwoFactor] = useState<PendingTwoFactor | null>(null);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          if (response.data.success) {
            const userObj = buildUserObj(response.data.data);
            setUser(userObj);
            localStorage.setItem('userData', JSON.stringify(userObj));
          }
        } catch (error) {
          console.error("Session verification failed:", error);
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          setUser(null);
        }
      } else {
        localStorage.removeItem('userData');
        setUser(null);
      }
      setIsLoading(false);
    };
    verifyUser();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string; role?: UserRole; requiresTwoFactor?: boolean; tempToken?: string }> => {
    try {
      const response = await authAPI.login({ email, password });
      if (response.data.success) {
        const data = response.data.data;
        if (data.requiresTwoFactor) {
          setPendingTwoFactor({ tempToken: data.tempToken, email });
          return { requiresTwoFactor: true, tempToken: data.tempToken };
        }
        const { token, user: userData } = data;
        localStorage.setItem('token', token);
        const userObj = buildUserObj(userData);
        setUser(userObj);
        localStorage.setItem('userData', JSON.stringify(userObj));
        return { role: userObj.role };
      }
      return { error: getErrorMessage(response.data, "Sign in failed") };
    } catch (error: any) {
      return { error: getErrorMessage(error.response?.data, "An error occurred during sign in") };
    }
  };

  const signInWithGoogle = async (idToken: string, role?: UserRole): Promise<{ error?: string; role?: UserRole; requiresTwoFactor?: boolean; tempToken?: string }> => {
    try {
      const response = await authAPI.google({ idToken, role });
      if (response.data.success) {
        const data = response.data.data;
        if (data.requiresTwoFactor) {
          setPendingTwoFactor({ tempToken: data.tempToken });
          return { requiresTwoFactor: true, tempToken: data.tempToken };
        }
        const { token, user: userData } = data;
        localStorage.setItem('token', token);
        const userObj = buildUserObj(userData);
        setUser(userObj);
        localStorage.setItem('userData', JSON.stringify(userObj));
        return { role: userObj.role };
      }
      return { error: getErrorMessage(response.data, "Google authentication failed") };
    } catch (error: any) {
      return { error: getErrorMessage(error.response?.data, "An error occurred during Google sign in") };
    }
  };

  const signUp = async (data: { email: string, password: string, role: UserRole, fullName: string, phoneNumber?: string, collaboratorToken?: string }): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.register(data);
      if (response.data.success) return {};
      return { error: getErrorMessage(response.data, "Registration failed") };
    } catch (error: any) {
      return { error: getErrorMessage(error.response?.data, "An error occurred during registration") };
    }
  };

  const signOut = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setPendingTwoFactor(null);
      setUser(null);
    }
  };

  const forgotPassword = async (email: string): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.forgotPassword(email);
      if (response.data.success) return {};
      return { error: getErrorMessage(response.data, "An error occurred") };
    } catch (error: any) {
      return { error: getErrorMessage(error.response?.data, "An error occurred") };
    }
  };

  const resetPassword = async (data: { token: string, newPassword: string, confirmPassword: string }): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.resetPassword(data);
      if (response.data.success) return {};
      return { error: getErrorMessage(response.data, "An error occurred") };
    } catch (error: any) {
      return { error: getErrorMessage(error.response?.data, "An error occurred") };
    }
  };

  const verifyEmail = async (token: string): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.verifyEmail({ token });
      if (response.data.success) {
        if (user) {
          const updatedUser = { ...user, isEmailVerified: true, isVerified: true };
          setUser(updatedUser);
          localStorage.setItem('userData', JSON.stringify(updatedUser));
        }
        return {};
      }
      return { error: getErrorMessage(response.data, "An error occurred") };
    } catch (error: any) {
      return { error: getErrorMessage(error.response?.data, "An error occurred") };
    }
  };

  const resendVerification = async (email: string): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.resendVerification(email);
      if (response.data.success) return {};
      return { error: getErrorMessage(response.data, "An error occurred") };
    } catch (error: any) {
      return { error: getErrorMessage(error.response?.data, "An error occurred") };
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getMe();
        if (response.data.success) {
          const userObj = buildUserObj(response.data.data);
          setUser(userObj);
          localStorage.setItem('userData', JSON.stringify(userObj));
        }
      } catch (error) {
        console.error("User refresh failed:", error);
      }
    }
  };

  // ---- Login 2FA verification (uses tempToken, no full bearer auth) ----
  const verifyTwoFactor = async (code: string, tempToken?: string): Promise<{ error?: string; role?: UserRole }> => {
    const resolvedToken = tempToken || pendingTwoFactor?.tempToken;
    if (!resolvedToken) {
      return { error: "No pending two-factor session. Please sign in again." };
    }
    try {
      const response = await twoFactorAuthAPI.verifyLogin(resolvedToken, code.trim().toUpperCase());
      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('token', token);
        const userObj = buildUserObj(userData);
        setUser(userObj);
        localStorage.setItem('userData', JSON.stringify(userObj));
        setPendingTwoFactor(null);
        return { role: userObj.role };
      }
      return { error: getErrorMessage(response.data, "Two-factor verification failed") };
    } catch (error: any) {
      const msg: string = getErrorMessage(error.response?.data, "An error occurred while verifying two-factor code");
      // Expired temp token detection
      if (
        error?.response?.status === 401 ||
        msg.toLowerCase().includes("expired") ||
        msg.toLowerCase().includes("invalid token")
      ) {
        setPendingTwoFactor(null);
        return { error: "__EXPIRED__" };
      }
      return { error: msg };
    }
  };

  const resendTwoFactorCode = async (email?: string): Promise<{ error?: string }> => {
    try {
      const response = await twoFactorAuthAPI.resend({ email });
      if (response.data.success) return {};
      return { error: getErrorMessage(response.data, "Failed to resend two-factor code") };
    } catch (error: any) {
      return { error: getErrorMessage(error.response?.data, "An error occurred while resending two-factor code") };
    }
  };

  // ---- Authenticated TOTP management ----
  const enrolTwoFactor = async (): Promise<{ error?: string; qrCode?: string; secret?: string }> => {
    try {
      const response = await twoFactorAuthAPI.enrol();
      // Debug: log raw enrol response so the exact field names are visible in devtools
      if (import.meta.env.DEV) {
        console.log("[2FA enrol] raw response data:", JSON.stringify(response.data, null, 2));
      }
      if (response.data.success) {
        // Handle common nesting patterns (e.g. data.data, data.result, data.payload)
        const root = response.data;
        const d = root.data ?? root.result ?? root.payload ?? root.twoFactor ?? root;
        
        // Resolve QR code — backends differ on field name
        let qrCode: string | undefined =
          d?.qrCode ||
          d?.qrCodeUrl ||
          d?.qr_code ||
          d?.qr ||
          d?.otpauthUrl ||
          d?.otpauth_url ||
          d?.twoFactorQrCode ||
          d?.totpQrCode ||
          d?.qrcode ||
          d?.dataUrl ||
          root?.qrCode || // Fallback to root if nested wrong
          root?.qr_code ||
          undefined;
          
        // Resolve secret — backends differ on field name
        let secret: string | undefined =
          d?.secret ||
          d?.manualEntryKey ||
          d?.secretKey ||
          d?.base32Secret ||
          d?.twoFactorSecret ||
          d?.totpSecret ||
          d?.base32 ||
          root?.secret || // Fallback to root
          undefined;
          
        // If we got a secret but no QR code, generate the otpauth URL locally!
        if (!qrCode && secret) {
           const email = user?.email || "user@castglo.com";
           qrCode = `otpauth://totp/Castglo:${encodeURIComponent(email)}?secret=${secret}&issuer=Castglo`;
        }
          
        if (!qrCode && !secret) {
           secret = JSON.stringify(root); // DEBUG fallback so it shows in UI
        }
        
        return { qrCode, secret };
      }
      const errMsg = getErrorMessage(response.data, "Failed to start 2FA enrolment");
      if (errMsg.toLowerCase().includes("already enabled") && user) {
        const updated = { ...user, twoFactorEnabled: true };
        setUser(updated);
        localStorage.setItem('userData', JSON.stringify(updated));
      }
      return { error: errMsg };
    } catch (error: any) {
      const errMsg = getErrorMessage(error.response?.data, "An error occurred while starting 2FA enrolment");
      if (errMsg.toLowerCase().includes("already enabled") && user) {
        const updated = { ...user, twoFactorEnabled: true };
        setUser(updated);
        localStorage.setItem('userData', JSON.stringify(updated));
      }
      return { error: errMsg };
    }
  };

  const confirmTwoFactor = async (token: string): Promise<{ error?: string; backupCodes?: string[] }> => {
    try {
      const response = await twoFactorAuthAPI.confirm(token);
      if (response.data.success) {
        if (user) {
          const updated = { ...user, twoFactorEnabled: true };
          setUser(updated);
          localStorage.setItem('userData', JSON.stringify(updated));
        }
        await refreshUser(); // refresh user so twoFactorEnabled=true is reflected
        return { backupCodes: response.data.data?.backupCodes };
      }
      return { error: getErrorMessage(response.data, "Failed to confirm 2FA setup") };
    } catch (error: any) {
      return { error: getErrorMessage(error.response?.data, "An error occurred while confirming 2FA") };
    }
  };

  const disableTwoFactor = async (password: string): Promise<{ error?: string }> => {
    try {
      const response = await twoFactorAuthAPI.disable(password);
      if (response.data.success) {
        if (user) {
          const updated = { ...user, twoFactorEnabled: false };
          setUser(updated);
          localStorage.setItem('userData', JSON.stringify(updated));
        }
        return {};
      }
      return { error: getErrorMessage(response.data, "Failed to disable two-factor authentication") };
    } catch (error: any) {
      return { error: getErrorMessage(error.response?.data, "An error occurred while disabling two-factor authentication") };
    }
  };

  const regenerateBackupCodes = async (): Promise<{ error?: string; backupCodes?: string[] }> => {
    try {
      const response = await twoFactorAuthAPI.regenerateBackupCodes();
      if (response.data.success) {
        return { backupCodes: response.data.data?.backupCodes };
      }
      return { error: getErrorMessage(response.data, "Failed to regenerate backup codes") };
    } catch (error: any) {
      return { error: getErrorMessage(error.response?.data, "An error occurred while regenerating backup codes") };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      pendingTwoFactor,
      setPendingTwoFactor,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      forgotPassword,
      resetPassword,
      verifyEmail,
      resendVerification,
      refreshUser,
      updatePreferredCurrency: async (currency: string) => {
        try {
          const res = await userAPI.updateProfile({ preferredCurrency: currency });
          if (res.data.success) {
            await refreshUser();
            return {};
          }
          return { error: res.data.message || "Failed to update currency" };
        } catch (e: any) {
          return { error: e?.response?.data?.message || "An error occurred" };
        }
      },
      formatPrice: (amount: number | string | null | undefined) => {
        const currency = user?.preferredCurrency || "GBP";
        const symbolMap: Record<string, string> = {
          "GBP": "£",
          "NGN": "₦",
          "USD": "$",
          "EUR": "€"
        };
        const symbol = symbolMap[currency] || symbolMap["GBP"];
        if (amount === null || amount === undefined) return `${symbol}0`;
        const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.]/g, '')) : amount;
        if (isNaN(numericAmount)) return amount.toString();
        return `${symbol}${numericAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
      },
      verifyTwoFactor,
      resendTwoFactorCode,
      enrolTwoFactor,
      confirmTwoFactor,
      disableTwoFactor,
      regenerateBackupCodes,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}