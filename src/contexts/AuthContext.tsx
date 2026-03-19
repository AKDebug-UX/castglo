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
              role: userData.roles[0] as UserRole,
              fullName: userData.fullName,
              profilePicture: userData.profilePicture,
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

  const signIn = async (email: string, password: string): Promise<{ error?: string; role?: UserRole }> => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('token', token);
        
        const userObj: User = {
          id: userData._id || userData.id,
          email: userData.email,
          role: userData.role as UserRole,
          fullName: userData.fullName,
          profilePicture: userData.profilePicture,
        };
        setUser(userObj);
        localStorage.setItem('userData', JSON.stringify(userObj));
        return { role: userObj.role };
      }
      return { error: response.data.message || "Sign in failed" };
    } catch (error: any) {
      return { error: error.response?.data?.message || "An error occurred during sign in" };
    }
  };

  const signUp = async (data: { email: string, password: string, role: UserRole, fullName: string, phoneNumber?: string }): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.register(data);
      if (response.data.success) {
        return {};
      }
      return { error: response.data.message || "Registration failed" };
    } catch (error: any) {
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
    } catch (error: any) {
      return { error: error.response?.data?.message || "An error occurred" };
    }
  };

  const resetPassword = async (data: { token: string, newPassword: string, confirmPassword: string }): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.resetPassword(data);
      if (response.data.success) return {};
      return { error: response.data.message };
    } catch (error: any) {
      return { error: error.response?.data?.message || "An error occurred" };
    }
  };

  const verifyEmail = async (token: string): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.verifyEmail({ token });
      if (response.data.success) return {};
      return { error: response.data.message };
    } catch (error: any) {
      return { error: error.response?.data?.message || "An error occurred" };
    }
  };

  const resendVerification = async (email: string): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.resendVerification(email);
      if (response.data.success) return {};
      return { error: response.data.message };
    } catch (error: any) {
      return { error: error.response?.data?.message || "An error occurred" };
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
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}