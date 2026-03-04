import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  Search,
  Calendar,
  MessageSquare
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/professional", icon: LayoutDashboard },
  { title: "Profile", href: "/professional/profile", icon: User },
  { title: "Services", href: "/professional/services", icon: Briefcase },
  { title: "Browse Talents", href: "/professional/talents", icon: Search },
  { title: "Bookings", href: "/professional/bookings", icon: Calendar },
  { title: "Messages", href: "/professional/messages", icon: MessageSquare },
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
              <item.icon className="w-5 h-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
