import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI } from "@/lib/api";

export type UserRole = "talent" | "director" | "professional" | "admin";

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
  signUp: (email: string, password: string, role: UserRole) => Promise<{ error?: string }>;
  signOut: () => void;
  forgotPassword: (email: string) => Promise<{ error?: string }>;
  resetPassword: (password: string, token: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authAPI.getMe();
      if (response.data.success) {
        const userData = response.data.data;
        setUser({
          id: userData._id,
          email: userData.email,
          role: userData.role,
          fullName: userData.fullName,
          profilePicture: userData.profilePicture,
        });
      }
    } catch (error: any) {
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
    } catch (error: any) {
      return { error: error.response?.data?.message || "An error occurred during sign in" };
    }
  };

  const signUp = async (email: string, password: string, role: UserRole): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.register({ 
        email, 
        password, 
        role,
        fullName: email.split("@")[0] // Default name if not provided
      });

      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('token', token);
        
        setUser({
          id: userData._id,
          email: userData.email,
          role: userData.role,
          fullName: userData.fullName,
          profilePicture: userData.profilePicture,
        });
        return {};
      }
      return { error: response.data.message || "Registration failed" };
    } catch (error: any) {
      return { error: error.response?.data?.message || "An error occurred during registration" };
    }
  };

  const forgotPassword = async (email: string): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.forgotPassword({ email });
      if (response.data.success) {
        return {};
      }
      return { error: response.data.message || "Failed to send reset link" };
    } catch (error: any) {
      return { error: error.response?.data?.message || "An error occurred" };
    }
  };

  const resetPassword = async (password: string, token: string): Promise<{ error?: string }> => {
    try {
      const response = await authAPI.resetPassword({ password, token });
      if (response.data.success) {
        return {};
      }
      return { error: response.data.message || "Password reset failed" };
    } catch (error: any) {
      return { error: error.response?.data?.message || "An error occurred" };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      signIn, 
      signUp, 
      signOut,
      forgotPassword,
      resetPassword
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