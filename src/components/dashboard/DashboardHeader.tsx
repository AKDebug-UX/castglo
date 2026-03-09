import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu, Bell, Settings, LogOut } from "lucide-react";
import userAvatar from "@/assets/user-avatar.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { notificationAPI } from "@/lib/api";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationAPI.getAll({ limit: 5, sort: "-createdAt" });
        if (response.data.success && Array.isArray(response.data.data)) {
          const fetchedNotifications = response.data.data;
          setNotifications(fetchedNotifications);
          const unread = fetchedNotifications.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);
 
   const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const getNotificationPath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "admin":
        return "/admin/notifications";
      case "casting_director":
        return "/director/notifications";
      case "industry_professional":
        return "/professional/notifications";
      case "talent":
      default:
        return "/dashboard/notifications";
    }
  };
 
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/90 backdrop-blur px-4 flex items-center justify-between">
      <Button 
        variant="ghost" 
        size="icon" 
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-2 font-medium">Notifications</div>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <DropdownMenuItem key={notification._id} asChild>
                  <Link to={notification.metadata?.link || "/notifications"} className="flex items-start gap-3 p-2 cursor-pointer">
                    <div className={`mt-1 h-2 w-2 rounded-full ${notification.isRead ? "bg-transparent" : "bg-primary"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-sm text-center text-muted-foreground">No new notifications</div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={getNotificationPath()} className="justify-center p-2 cursor-pointer">
                View All Notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userAvatar} alt="User" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
             <div className="px-2 py-1.5 text-sm font-medium truncate">
               {user?.email}
             </div>
             <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/profile" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
               <LogOut className="w-4 h-4 mr-2" />
               Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
