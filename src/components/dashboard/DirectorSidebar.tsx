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
  CreditCard,
  UserCircle,
  Award,
  UserPlus,
  FolderKanban,
  Video,
  Radio,
  ChevronDown
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface DirectorSidebarProps {
  className?: string;
}

export function DirectorSidebar({ className }: DirectorSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const isCollaborationsActive = 
    location.pathname.startsWith("/director/collaborators") || 
    location.pathname.startsWith("/collaborations");

  const isAuditionsActive = 
    location.pathname.startsWith("/director/audition") || 
    location.pathname.startsWith("/director/livestreams");

  const [collaborationsOpen, setCollaborationsOpen] = useState(isCollaborationsActive);
  const [auditionsOpen, setAuditionsOpen] = useState(isAuditionsActive);

  const topNavItems = [
    { title: "Dashboard", href: "/director", Icon: LayoutDashboard },
    { title: "Profile", href: "/director/profile", Icon: UserCircle },
    { title: "Deliverable History", href: user?.id ? `/director/${user.id}?tab=deliverables` : "/director/profile", Icon: Award },
    { title: "Projects", href: "/director/projects", Icon: FolderOpen },
  ];

  const collaboratorSubItems = [
    { title: "Collaborators", href: "/director/collaborators", Icon: UserPlus },
    { title: "My Collaborations", href: "/collaborations", Icon: FolderKanban },
  ];

  const auditionSubItems = [
    { title: "Virtual Auditions", href: "/director/audition", Icon: Video },
    { title: "Livestreams", href: "/director/livestreams", Icon: Radio },
  ];

  const bottomNavItems = [
    { title: "Applicants", href: "/director/applicants", Icon: Users },
    { title: "Matched", href: "/director/matched", Icon: Sparkles },
    { title: "Messages", href: "/director/messages", Icon: MessageSquare },
    { title: "Billing / Add-ons", href: "/director/billing", Icon: CreditCard },
    { title: "Settings", href: "/director/settings", Icon: Settings },
  ];

  return (
    <aside className={cn("w-64 bg-card border-r border-border flex flex-col", className)}>
      <div className="p-3 border-b border-border">
        <Logo />
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {topNavItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/director" && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-white shadow-sm font-semibold" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.Icon className="w-5 h-5" />
              {item.title}
            </Link>
          );
        })}

        {/* Collapsible Collaborations Accordion Menu */}
        <div className="py-0.5">
          <Collapsible open={collaborationsOpen} onOpenChange={setCollaborationsOpen}>
            <CollapsibleTrigger
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isCollaborationsActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <UserPlus className="w-5 h-5" />
                Collaborations
              </span>
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", collaborationsOpen && "rotate-180")} />
            </CollapsibleTrigger>

            <CollapsibleContent className="pl-4 pt-1 space-y-1 overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              {collaboratorSubItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== "/collaborations" && location.pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                      isActive 
                        ? "bg-primary text-white shadow-sm font-semibold" 
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    )}
                  >
                    <item.Icon className="w-4 h-4" />
                    {item.title}
                  </Link>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Collapsible Virtual Auditions & Livestreams Accordion Menu */}
        <div className="py-0.5">
          <Collapsible open={auditionsOpen} onOpenChange={setAuditionsOpen}>
            <CollapsibleTrigger
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isAuditionsActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <Video className="w-5 h-5" />
                Auditions & Live
              </span>
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", auditionsOpen && "rotate-180")} />
            </CollapsibleTrigger>

            <CollapsibleContent className="pl-4 pt-1 space-y-1 overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              {auditionSubItems.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                      isActive 
                        ? "bg-primary text-white shadow-sm font-semibold" 
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    )}
                  >
                    <item.Icon className="w-4 h-4" />
                    {item.title}
                  </Link>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/director" && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-white shadow-sm font-semibold" 
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
