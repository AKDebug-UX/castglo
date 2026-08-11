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
import { Menu, Bell, Settings, LogOut, UserCircle } from "lucide-react";
import userAvatar from "@/assets/user-avatar.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { socketService } from "@/lib/socket";
import { notificationAPI } from "@/lib/api";
import { getAvatarUrl, getInitials } from "@/lib/utils";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationAPI.getAll({ limit: 5, sort: "-createdAt" });
        if (response.data.success) {
          const data = response.data.data;
          const fetchedNotifications = Array.isArray(data) ? data : (data?.notifications || []);
          setNotifications(fetchedNotifications);
          const unread = fetchedNotifications.filter((n: any) => !(typeof n.isRead === 'boolean' ? n.isRead : n.read)).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    if (user?.id) {
      fetchNotifications();
      // Increase to 2 minutes to reduce server load, as real-time updates should ideally come via socket
      const interval = setInterval(fetchNotifications, 120000); 
      
      // Setup WebSockets for real-time notifications
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token);
        
        const handleNewNotification = (data: any) => {
          console.log("Real-time notification received:", data);
          // Assuming the backend sends { notification: { ... } } or just the notification object
          const newNotif = data.notification || data;
          
          setNotifications(prev => {
            // Prevent duplicates
            if (prev.some((n: any) => n._id === newNotif._id)) return prev;
            return [newNotif, ...prev].slice(0, 5); // Keep top 5 in dropdown
          });
          
          setUnreadCount(prev => prev + 1);
        };

        socketService.on('new_notification', handleNewNotification);
      }
      
      return () => {
        clearInterval(interval);
        socketService.off('new_notification');
      };
    }
  }, [user?.id]);
 
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
        return "/talent/notifications";
    }
  };

  const getNotificationLink = (notification: any) => {
    if (notification.type === "message") {
      if (!user) return "/";
      switch (user.role) {
        case "casting_director":
          return "/director/messages";
        case "industry_professional":
          return "/professional/messages";
        case "talent":
        default:
          return "/talent/messages";
      }
    }
    return notification.metadata?.link || getNotificationPath();
  };

  const handleNotificationClick = async (notification: any) => {
    const isRead = typeof notification.isRead === 'boolean' ? notification.isRead : notification.read;
    if (!isRead) {
      try {
        const notifId = notification._id || notification.id;
        const response = await notificationAPI.markRead(notifId);
        if (response.data.success) {
          setNotifications(prev => prev.map(n => {
            const id = n._id || n.id;
            return id === notifId ? { ...n, isRead: true, read: true } : n;
          }));
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
  };

  const getProfilePath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "admin":
        return "/admin/profile";
      case "casting_director":
        return "/director/profile";
      case "industry_professional":
        return "/professional/settings";
      case "talent":
      default:
        return "/talent/account-settings";
    }
  };
 
  const getSettingsPath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "admin":
        return "/admin/settings";
      case "casting_director":
        return "/director/settings";
      case "industry_professional":
        return "/professional/settings";
      case "talent":
      default:
        return "/talent/account-settings";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between shadow-xs transition-all duration-300">
      {/* Subtle top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#009698] via-[#00c9cc] to-[#009698] opacity-80" />

      <Button 
        variant="ghost" 
        size="icon" 
        className="lg:hidden hover:bg-primary/10 rounded-xl"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5 text-foreground" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-primary/10 transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary shadow-xs"></span>
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-84 p-2 rounded-2xl border border-border/60 shadow-xl backdrop-blur-md bg-card/95">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>
            <DropdownMenuSeparator className="my-1" />
            <div className="max-h-72 overflow-y-auto space-y-1 py-1">
              {notifications.length > 0 ? (
                notifications.map((notification: any, index: number) => {
                  const isUnread = !(typeof notification.isRead === 'boolean' ? notification.isRead : notification.read);
                  return (
                    <DropdownMenuItem key={notification._id || notification.id || index} asChild>
                      <Link 
                        to={getNotificationLink(notification)} 
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                          isUnread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/60"
                        }`}
                      >
                        <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${isUnread ? "bg-primary shadow-xs animate-pulse" : "bg-transparent"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{notification.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <div className="p-6 text-xs text-center text-muted-foreground">No new notifications</div>
              )}
            </div>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem asChild>
              <Link to={getNotificationPath()} className="justify-center p-2 text-xs font-semibold text-primary hover:text-primary/80 cursor-pointer rounded-xl">
                View All Notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.profilePicture || getAvatarUrl(user?.fullName)} alt={user?.fullName || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{getInitials(user?.fullName || "")}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border border-border/60 shadow-xl backdrop-blur-md bg-card/95">
            <div className="px-3 py-2">
              <p className="text-sm font-bold text-foreground truncate">{user?.fullName || "Account"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              {user?.role && (
                <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {user.role.replace("_", " ")}
                </span>
              )}
            </div>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem asChild>
              <Link to={getProfilePath()} className="cursor-pointer rounded-xl text-xs font-medium py-2">
                <UserCircle className="w-4 h-4 mr-2.5 text-primary" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={getSettingsPath()} className="cursor-pointer rounded-xl text-xs font-medium py-2">
                <Settings className="w-4 h-4 mr-2.5 text-muted-foreground" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-xl text-xs font-medium py-2">
              <LogOut className="w-4 h-4 mr-2.5" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
