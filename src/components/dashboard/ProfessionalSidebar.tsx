import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  Search,
  Calendar,
  MessageSquare,
  Bell,
  Settings
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/professional", Icon: LayoutDashboard },
  { title: "Profile", href: "/professional/profile", Icon: User },
  { title: "Services", href: "/professional/services", Icon: Briefcase },
  { title: "Browse Talents", href: "/professional/talents", Icon: Search },
  { title: "Bookings", href: "/professional/bookings", Icon: Calendar },
  { title: "Messages", href: "/professional/messages", Icon: MessageSquare },
  { title: "Notifications", href: "/professional/notifications", Icon: Bell },
  { title: "Settings", href: "/professional/settings", Icon: Settings },
];

interface ProfessionalSidebarProps {
  className?: string;
}

export function ProfessionalSidebar({ className }: ProfessionalSidebarProps) {
  const location = useLocation();

  return (
    <aside className={cn("w-64 bg-card border-r border-border flex flex-col", className)}>
      <div className="p-3 border-b border-border">
        <Logo />
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/professional" && location.pathname.startsWith(item.href));
          
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
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
