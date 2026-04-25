import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users,
  MessageSquare,
  Settings,
  Sparkles,
  Handshake,
  CreditCard,
  UserCircle,
  Briefcase,
  User
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/director", Icon: LayoutDashboard },
  { title: "Profile", href: "/director/profile", Icon: UserCircle },
  { title: "Projects", href: "/director/projects", Icon: FolderOpen },
  { title: "Roles", href: "/director/roles", Icon: Briefcase },
  { title: "Applicants", href: "/director/applicants", Icon: Users },
  { title: "Matched", href: "/director/matched", Icon: Sparkles },
  { title: "Messages", href: "/director/messages", Icon: MessageSquare },
  { title: "Collaborators", href: "/director/collaborators", Icon: Handshake },
  { title: "Billing / Add-ons", href: "/director/billing", Icon: CreditCard },
  { title: "Settings", href: "/director/settings", Icon: Settings },
];

interface DirectorSidebarProps {
  className?: string;
}

export function DirectorSidebar({ className }: DirectorSidebarProps) {
  const location = useLocation();

  return (
    <aside className={cn("w-64 bg-card border-r border-border flex flex-col", className)}>
      <div className="p-3 border-b border-border">
        <Logo />
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/director" && location.pathname.startsWith(item.href));
          
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
