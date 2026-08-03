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
               notifications.map((notification: any, index: number) => (
                  <DropdownMenuItem key={notification._id || notification.id || index} asChild>
                    <Link 
                      to={getNotificationLink(notification)} 
                      onClick={() => handleNotificationClick(notification)}
                      className="flex items-start gap-3 p-2 cursor-pointer"
                    >
                      <div className={`mt-1 h-2 w-2 rounded-full ${(typeof notification.isRead === 'boolean' ? notification.isRead : notification.read) ? "bg-transparent" : "bg-primary"}`} />
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
                <AvatarImage src={user?.profilePicture || getAvatarUrl(user?.fullName)} alt={user?.fullName || "User"} />
                <AvatarFallback>{getInitials(user?.fullName || "")}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
             <div className="px-2 py-1.5 text-sm font-medium truncate">
               {user?.email}
             </div>
             <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={getProfilePath()} className="cursor-pointer">
                <UserCircle className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={getSettingsPath()} className="cursor-pointer">
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
