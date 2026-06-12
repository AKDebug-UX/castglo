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

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; role?: UserRole; requiresTwoFactor?: boolean; tempToken?: string }>;
  signInWithGoogle: (idToken: string, role?: UserRole) => Promise<{ error?: string; role?: UserRole }>;
  signUp: (data: { email: string, password: string, role: UserRole, fullName: string, phoneNumber?: string, collaboratorToken?: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error?: string }>;
  resetPassword: (data: { token: string, newPassword: string, confirmPassword: string }) => Promise<{ error?: string }>;
  verifyEmail: (token: string) => Promise<{ error?: string }>;
  resendVerification: (email: string) => Promise<{ error?: string }>;
  refreshUser: () => Promise<void>;
  updatePreferredCurrency: (currency: string) => Promise<{ error?: string }>;
  formatPrice: (amount: number | string) => string;
  enableTwoFactor: () => Promise<{ error?: string }>;
  disableTwoFactor: (password: string) => Promise<{ error?: string }>;
  verifyTwoFactor: (code: string, tempToken?: string) => Promise<{ error?: string; role?: UserRole }>;
  resendTwoFactorCode: (email?: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('userData');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          if (response.data.success) {
            const userData = response.data.data;
            const userObj: User = {
              id: userData._id || userData.id,
              email: userData.email,
              role: (userData.role || (userData.roles && userData.roles[0])) as UserRole,
              fullName: userData.fullName,
              profilePicture: userData.profilePicture,
              isEmailVerified: userData.emailVerified || userData.isEmailVerified,
              isVerified: userData.isVerified || (userData.emailVerified || userData.isEmailVerified),
              preferredCurrency: userData.preferredCurrency || "GBP",
              twoFactorEnabled: userData.twoFactorEnabled || false,
            };
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
      if (response.data.data.requiresTwoFactor) {
        return { requiresTwoFactor: true, tempToken: response.data.data.tempToken };
      }
      const { token, user: userData } = response.data.data;
      localStorage.setItem('token', token);
      
      const userObj: User = {
        id: userData._id || userData.id,
        email: userData.email,
        role: (userData.role || (userData.roles && userData.roles[0])) as UserRole,
        fullName: userData.fullName,
        profilePicture: userData.profilePicture,
        isEmailVerified: userData.emailVerified || userData.isEmailVerified || false,
        isVerified: userData.isVerified || (userData.emailVerified || userData.isEmailVerified) || false,
        preferredCurrency: userData.preferredCurrency || "GBP",
        twoFactorEnabled: userData.twoFactorEnabled || false,
      };
      setUser(userObj);
      localStorage.setItem('userData', JSON.stringify(userObj));
      return { role: userObj.role };
    }
    return { error: response.data.message || "Sign in failed" };
  } catch (error) {
    return { error: error.response?.data?.message || "An error occurred during sign in" };
  }
};

  const signInWithGoogle = async (idToken: string, role?: UserRole): Promise<{ error?: string; role?: UserRole }> => {
    try {
      const response = await authAPI.google({ idToken, role });
      
      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('token', token);
        
        const userObj: User = {
          id: userData._id || userData.id,
          email: userData.email,
          role: (userData.role || (userData.roles && userData.roles[0])) as UserRole,
          fullName: userData.fullName,
          profilePicture: userData.profilePicture,
          isEmailVerified: userData.emailVerified || userData.isEmailVerified || false,
          isVerified: userData.isVerified || (userData.emailVerified || userData.isEmailVerified) || false,
          preferredCurrency: userData.preferredCurrency || "GBP",
          twoFactorEnabled: userData.twoFactorEnabled || false,
        };
        setUser(userObj);
        localStorage.setItem('userData', JSON.stringify(userObj));
        return { role: userObj.role };
      }
      return { error: response.data.message || "Google authentication failed" };
    } catch (error: any) {
      return { error: error.response?.data?.message || "An error occurred during Google sign in" };
    }
  };

  const signUp = async (data: { email: string, password: string, role: UserRole, fullName: string, phoneNumber?: string, collaboratorToken?: string }): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.register(data);
      if (response.data.success) {
        return {};
      }
      return { error: response.data.message || "Registration failed" };
    } catch (error) {
      return { error: error.response?.data?.message || "An error occurred during registration" };
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
      setUser(null);
    }
  };

  const forgotPassword = async (email: string): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.forgotPassword(email);
      if (response.data.success) return {};
      return { error: response.data.message };
    } catch (error) {
      return { error: error.response?.data?.message || "An error occurred" };
    }
  };

  const resetPassword = async (data: { token: string, newPassword: string, confirmPassword: string }): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.resetPassword(data);
      if (response.data.success) return {};
      return { error: response.data.message };
    } catch (error) {
      return { error: error.response?.data?.message || "An error occurred" };
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
      return { error: response.data.message };
    } catch (error) {
      return { error: error.response?.data?.message || "An error occurred" };
    }
  };

  const resendVerification = async (email: string): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.resendVerification(email);
      if (response.data.success) return {};
      return { error: response.data.message };
    } catch (error) {
      return { error: error.response?.data?.message || "An error occurred" };
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getMe();
        if (response.data.success) {
          const userData = response.data.data;
          const userObj: User = {
            id: userData._id || userData.id,
            email: userData.email,
            role: (userData.role || (userData.roles && userData.roles[0])) as UserRole,
            fullName: userData.fullName,
            profilePicture: userData.profilePicture,
            isEmailVerified: userData.emailVerified || userData.isEmailVerified || false,
            isVerified: userData.isVerified || (userData.emailVerified || userData.isEmailVerified) || false,
            preferredCurrency: userData.preferredCurrency || "GBP",
            twoFactorEnabled: userData.twoFactorEnabled || false,
          };
          setUser(userObj);
          localStorage.setItem('userData', JSON.stringify(userObj));
        }
      } catch (error) {
        console.error("User refresh failed:", error);
      }
    }
  };

  const enableTwoFactor = async (): Promise<{ error?: string }> => {
    try {
      const response = await twoFactorAuthAPI.enable();
      if (response.data.success) {
        await refreshUser();
        return {};
      }
      return { error: response.data.message || "Failed to enable two-factor authentication" };
    } catch (error: any) {
      return { error: error?.response?.data?.message || "An error occurred while enabling two-factor authentication" };
    }
  };

  const disableTwoFactor = async (password: string): Promise<{ error?: string }> => {
    try {
      const response = await twoFactorAuthAPI.disable({ password });
      if (response.data.success) {
        await refreshUser();
        return {};
      }
      return { error: response.data.message || "Failed to disable two-factor authentication" };
    } catch (error: any) {
      return { error: error?.response?.data?.message || "An error occurred while disabling two-factor authentication" };
    }
  };

  const verifyTwoFactor = async (code: string, tempToken?: string): Promise<{ error?: string; role?: UserRole }> => {
    try {
      const response = await twoFactorAuthAPI.verify({ code, tempToken });
      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('token', token);
        
        const userObj: User = {
          id: userData._id || userData.id,
          email: userData.email,
          role: (userData.role || (userData.roles && userData.roles[0])) as UserRole,
          fullName: userData.fullName,
          profilePicture: userData.profilePicture,
          isEmailVerified: userData.emailVerified || userData.isEmailVerified || false,
          isVerified: userData.isVerified || (userData.emailVerified || userData.isEmailVerified) || false,
          preferredCurrency: userData.preferredCurrency || "GBP",
          twoFactorEnabled: userData.twoFactorEnabled || false,
        };
        setUser(userObj);
        localStorage.setItem('userData', JSON.stringify(userObj));
        return { role: userObj.role };
      }
      return { error: response.data.message || "Failed to verify two-factor code" };
    } catch (error: any) {
      return { error: error?.response?.data?.message || "An error occurred while verifying two-factor code" };
    }
  };

  const resendTwoFactorCode = async (email?: string): Promise<{ error?: string }> => {
    try {
      const response = await twoFactorAuthAPI.resend({ email });
      if (response.data.success) {
        return {};
      }
      return { error: response.data.message || "Failed to resend two-factor code" };
    } catch (error: any) {
      return { error: error?.response?.data?.message || "An error occurred while resending two-factor code" };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
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
      enableTwoFactor,
      disableTwoFactor,
      verifyTwoFactor,
      resendTwoFactorCode,
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