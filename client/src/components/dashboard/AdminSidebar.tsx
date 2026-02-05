 import { Link, useLocation } from "react-router-dom";
 import { cn } from "@/lib/utils";
 import { Logo } from "@/components/Logo";
 import {
   LayoutDashboard,
   Shield,
   BarChart3,
   Users,
   FileVideo,
   Calendar,
 } from "lucide-react";
 
 const navItems = [
   { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
   { icon: Shield, label: "Moderation Queue", href: "/admin/moderation" },
   { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
   { icon: Users, label: "Users Management", href: "/admin/users" },
   { icon: FileVideo, label: "Submissions", href: "/admin/submissions" },
   { icon: Calendar, label: "Bookings", href: "/admin/bookings" },
 ];
 
 interface AdminSidebarProps {
   className?: string;
 }
 
 export function AdminSidebar({ className }: AdminSidebarProps) {
   const location = useLocation();
 
   return (
     <aside
       className={cn(
         "w-64 bg-card border-r border-border flex flex-col",
         className
       )}
     >
       <div className="p-4 border-b border-border">
         <Logo />
       </div>
 
       <nav className="flex-1 p-4 space-y-1">
         {navItems.map((item) => {
           const isActive =
             item.href === "/admin"
               ? location.pathname === "/admin"
               : location.pathname.startsWith(item.href);
 
           return (
             <Link
               key={item.href}
               to={item.href}
               className={cn(
                 "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                 isActive
                   ? "bg-primary text-primary-foreground"
                   : "text-muted-foreground hover:bg-muted hover:text-foreground"
               )}
             >
               <item.icon className="w-5 h-5" />
               {item.label}
             </Link>
           );
         })}
       </nav>
     </aside>
   );
 }