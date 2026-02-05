 import { createContext, useContext, useState, useEffect, ReactNode } from "react";
 
 export type UserRole = "talent" | "director" | "professional" | "admin";
 
 interface User {
   id: string;
   email: string;
   role: UserRole;
   name: string;
 }
 
 interface AuthContextType {
   user: User | null;
   isLoading: boolean;
   signIn: (email: string, password: string, role: UserRole) => Promise<{ error?: string }>;
   signUp: (email: string, password: string, role: UserRole) => Promise<{ error?: string }>;
   signOut: () => void;
 }
 
 const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
 export function AuthProvider({ children }: { children: ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     // Check for existing session in localStorage
     const storedUser = localStorage.getItem("castglo_user");
     if (storedUser) {
       setUser(JSON.parse(storedUser));
     }
     setIsLoading(false);
   }, []);
 
   const signIn = async (email: string, password: string, role: UserRole): Promise<{ error?: string }> => {
     // Mock authentication - in production, this would call a real API
     if (!email || !password) {
       return { error: "Email and password are required" };
     }
 
     // Simulate API delay
     await new Promise(resolve => setTimeout(resolve, 500));
 
     const mockUser: User = {
       id: crypto.randomUUID(),
       email,
       role,
       name: email.split("@")[0],
     };
 
     localStorage.setItem("castglo_user", JSON.stringify(mockUser));
     setUser(mockUser);
     return {};
   };
 
   const signUp = async (email: string, password: string, role: UserRole): Promise<{ error?: string }> => {
     // Mock registration
     if (!email || !password) {
       return { error: "Email and password are required" };
     }
 
     if (password.length < 6) {
       return { error: "Password must be at least 6 characters" };
     }
 
     // Simulate API delay
     await new Promise(resolve => setTimeout(resolve, 500));
 
     const mockUser: User = {
       id: crypto.randomUUID(),
       email,
       role,
       name: email.split("@")[0],
     };
 
     localStorage.setItem("castglo_user", JSON.stringify(mockUser));
     setUser(mockUser);
     return {};
   };
 
   const signOut = () => {
     localStorage.removeItem("castglo_user");
     setUser(null);
   };
 
   return (
     <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
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