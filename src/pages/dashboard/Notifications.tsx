import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, Clock, Loader2, Trash2, MailOpen } from "lucide-react";
import { notificationAPI } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll({ limit: 50 });
      if (response.data.success) {
        // Ensure we always have an array
        const data = response.data.data;
        setNotifications(Array.isArray(data) ? data : (data?.notifications || []));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await notificationAPI.markRead(id);
      if (response.data.success && Array.isArray(notifications)) {
        setNotifications(notifications.map(n => 
          n._id === id ? { ...n, isRead: true } : n
        ));
      }
    } catch (error: any) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAllRead(true);
    try {
      const response = await notificationAPI.readAll();
      if (response.data.success && Array.isArray(notifications)) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        toast.success("All notifications marked as read");
      }
    } catch (error: any) {
      toast.error("Failed to mark all as read");
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your latest activities</p>
        </div>
        {Array.isArray(notifications) && notifications.some(n => !n.isRead) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllRead}
            disabled={isMarkingAllRead}
          >
            {isMarkingAllRead ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MailOpen className="w-4 h-4 mr-2" />}
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {Array.isArray(notifications) && notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className={cn(
                    "flex items-start gap-4 p-4 transition-colors hover:bg-muted/50",
                    !notification.isRead && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    notification.isRead ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                  )}>
                    <Bell className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={cn(
                        "font-medium text-sm sm:text-base truncate",
                        !notification.isRead ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3">
                      {!notification.isRead && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10 p-0"
                          onClick={() => handleMarkAsRead(notification._id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      {notification.type && (
                        <Badge variant="secondary" className="text-[10px] h-5 uppercase">
                          {notification.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No notifications yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                When you receive notifications, they will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
