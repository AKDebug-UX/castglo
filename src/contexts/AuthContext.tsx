import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI } from "@/lib/api";

export type UserRole = "talent" | "casting_director" | "industry_professional" | "admin";

interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; role?: UserRole }>;
  signUp: (data: { email: string, password: string, role: UserRole, fullName: string, phoneNumber?: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error?: string }>;
  resetPassword: (data: { token: string, newPassword: string, confirmPassword: string }) => Promise<{ error?: string }>;
  verifyEmail: (token: string) => Promise<{ error?: string }>;
  resendVerification: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.getMe();
      if (response.data.success) {
        const userData = response.data.data;
        setUser({
          id: userData._id,
          email: userData.email,
          role: userData.role as UserRole,
          fullName: userData.fullName,
          profilePicture: userData.profilePicture,
        });
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string; role?: UserRole }> => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('token', token);
        
        const userObj: User = {
          id: userData._id,
          email: userData.email,
          role: userData.role as UserRole,
          fullName: userData.fullName,
          profilePicture: userData.profilePicture,
        };
        setUser(userObj);
        return { role: userObj.role };
      }
      return { error: response.data.message || "Sign in failed" };
    } catch (error) {
      return { error: error.response?.data?.message || "An error occurred during sign in" };
    }
  };

  const signUp = async (data: { email: string, password: string, role: UserRole, fullName: string, phoneNumber?: string }): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.register(data);

      if (response.data.success) {
        // We don't log in automatically because email verification might be required
        // but if the backend returns a token, we can use it.
        if (response.data.data?.token) {
          const { token, user: userData } = response.data.data;
          localStorage.setItem('token', token);
          setUser({
            id: userData._id,
            email: userData.email,
            role: userData.role as UserRole,
            fullName: userData.fullName,
            profilePicture: userData.profilePicture,
          });
        }
        return {};
      }
      return { error: response.data.message || "Registration failed" };
    } catch (error) {
      return { error: error.response?.data?.message || "An error occurred during registration" };
    }
  };

  const forgotPassword = async (email: string): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.forgotPassword(email);
      if (response.data.success) {
        return {};
      }
      return { error: response.data.message || "Failed to send reset link" };
    } catch (error) {
      return { error: error.response?.data?.message || "An error occurred" };
    }
  };

  const resetPassword = async (data: { token: string, newPassword: string, confirmPassword: string }): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.resetPassword(data);
      if (response.data.success) {
        return {};
      }
      return { error: response.data.message || "Password reset failed" };
    } catch (error) {
      return { error: error.response?.data?.message || "An error occurred" };
    }
  };

  const verifyEmail = async (token: string): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.verifyEmail({ token });
      if (response.data.success) {
        return {};
      }
      return { error: response.data.message || "Email verification failed" };
    } catch (error) {
      return { error: error.response?.data?.message || "An error occurred" };
    }
  };

  const resendVerification = async (email: string): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.resendVerification(email);
      if (response.data.success) {
        return {};
      }
      return { error: response.data.message || "Failed to resend verification" };
    } catch (error) {
      return { error: error.response?.data?.message || "An error occurred" };
    }
  };

  const signOut = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      signIn, 
      signUp, 
      signOut,
      forgotPassword,
      resetPassword,
      verifyEmail,
      resendVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}