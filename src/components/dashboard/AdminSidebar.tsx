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
   Bell,
   Clock,
   Settings,
   BadgeCheck,
   Target,
   CreditCard,
   Film,
   Activity,
 } from "lucide-react";
 
 const navItems = [
   { Icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
   { Icon: Shield, label: "Moderation Queue", href: "/admin/moderation" },
   { Icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
   { Icon: Users, label: "Users Management", href: "/admin/users" },
   { Icon: Clock, label: "Platform Settings", href: "/admin/free-tier" },
   { Icon: FileVideo, label: "Submissions", href: "/admin/submissions" },
   { Icon: Calendar, label: "Bookings", href: "/admin/bookings" },
   { Icon: BadgeCheck, label: "Verifications", href: "/admin/verification" },
   { Icon: Target, label: "Leads", href: "/admin/leads" },
   { Icon: CreditCard, label: "Subscriptions", href: "/admin/subscriptions" },
   { Icon: Film, label: "Casting Calls", href: "/admin/casting-calls" },
   { Icon: Bell, label: "Notifications", href: "/admin/notifications" },
   { Icon: Activity, label: "Action Logs", href: "/admin/action-logs" },
   { Icon: Settings, label: "Settings", href: "/admin/settings" },
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
       <div className="p-3 border-b border-border">
         <Logo />
       </div>
 
       <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
               <item.Icon className="w-5 h-5" />
               {item.label}
             </Link>
           );
         })}
       </nav>
     </aside>
   );
 }