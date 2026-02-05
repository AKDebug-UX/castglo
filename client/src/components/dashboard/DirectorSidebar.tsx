"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  Plus,
  Users,
  MessageSquare
} from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/director", icon: LayoutDashboard },
  { title: "My Projects", href: "/director/projects", icon: FolderOpen },
  { title: "Create Casting Calls", href: "/director/create", icon: Plus },
  { title: "Submissions", href: "/director/submissions", icon: Users },
  { title: "Messages", href: "/director/messages", icon: MessageSquare },
];

interface DirectorSidebarProps {
  className?: string;
}

export function DirectorSidebar({ className }: DirectorSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("w-64 bg-card border-r border-border flex flex-col", className)}>
      <div className="p-4 border-b border-border">
        <Logo />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/director" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
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
