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
  Video,
  Settings,
  Shield,
  CreditCard,
  BadgeCheck
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useMemo, useState } from "react";

const mainNavItems = [
  { title: "Dashboard", href: "/talent", Icon: LayoutDashboard },
  { title: "Profile", href: "/talent/profile", Icon: User },
  { title: "Create Auditions", href: "/talent/audition", Icon: Video },
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
  const [settingsOpen, setSettingsOpen] = useState(true);

  const settingsLinks = useMemo(
    () => [
      { title: "Overview", href: "/talent/account-settings", Icon: Settings },
      { title: "Security", href: "/talent/account-settings?tab=security", Icon: Shield },
      { title: "Subscriptions", href: "/talent/account-settings?tab=subscriptions", Icon: BadgeCheck },
      { title: "Payment Settings", href: "/talent/account-settings?tab=payments", Icon: CreditCard },
      { title: "Payment History", href: "/talent/account-settings?tab=payment-history", Icon: CreditCard },
      { title: "Plans", href: "/talent/account-settings?tab=plans", Icon: BadgeCheck },
      { title: "Notification Settings", href: "/talent/account-settings?tab=notifications", Icon: Bell },
      { title: "Verification", href: "/talent/account-settings?tab=verification", Icon: BadgeCheck },
    ],
    []
  );

  return (
    <aside className={cn("w-64 bg-card border-r border-border flex flex-col", className)}>
      <div className="p-3 border-b border-border">
        <Logo />
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {mainNavItems.map((item) => {
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

        <div className="pt-3">
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                location.pathname.startsWith("/talent/account-settings")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                Account Settings
              </span>
              <span className="text-xs">{settingsOpen ? "–" : "+"}</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-3 pt-2 space-y-1">
              {settingsLinks.map((item) => {
                const [targetPath, targetQuery] = item.href.split("?");
                const isActive = location.pathname === targetPath && (targetQuery ? location.search === `?${targetQuery}` : true);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                      isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
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
      </nav>
    </aside>
  );
}
