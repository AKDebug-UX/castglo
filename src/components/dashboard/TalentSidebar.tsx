import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  User, 
  Search, 
  FileText, 
  MessageSquare,
  Bell,
  Video
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/talent", Icon: LayoutDashboard },
  { title: "Profile", href: "/talent/profile", Icon: User },
  { title: "Browse Casting Calls", href: "/talent/browse-cast", Icon: Search },
  { title: "My Submissions", href: "/talent/submissions", Icon: FileText },
  { title: "Messages", href: "/talent/messages", Icon: MessageSquare },
  { title: "Notifications", href: "/talent/notifications", Icon: Bell },
  { title: "Livestreams", href: "/talent/livestreams", Icon: Video },
];

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const location = useLocation();

  return (
    <aside className={cn("w-64 bg-card border-r border-border flex flex-col", className)}>
      <div className="p-3 border-b border-border">
        <Logo />
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/talent" && location.pathname.startsWith(item.href));
          
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
