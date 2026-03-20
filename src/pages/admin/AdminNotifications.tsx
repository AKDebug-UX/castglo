import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Users, ShieldCheck, Info } from "lucide-react";
import { notificationAPI, adminAPI } from "@/lib/api";
import { toast } from "sonner";

export default function AdminNotifications() {
  const [isSending, setIsSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [formData, setFormData] = useState({
    recipient: "all",
    title: "",
    message: "",
    type: "message",
    metadata: "",
  });

  const fetchUsers = async (search: string = "") => {
    setIsLoadingUsers(true);
    try {
      const response = await adminAPI.getUsers({ search, limit: 20 });
      if (response.data.success) {
        setUsers(response.data.data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSending(true);
    try {
      let metadata = {};
      try {
        if (formData.metadata) {
          metadata = JSON.parse(formData.metadata);
        }
      } catch (e) {
        toast.error("Invalid JSON format in metadata field");
        setIsSending(false);
        return;
      }

      const payload: any = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        metadata,
      };

      if (formData.recipient !== "all") {
        payload.userId = formData.recipient;
      } else {
        // Backend now supports broadcast when userId is "all" or omitted
        payload.userId = "all";
        payload.sendToAll = true;
      }

      const response = await notificationAPI.send(payload);
      if (response.data.success) {
        toast.success("Push notification sent!");
        setFormData({
          recipient: "all",
          title: "",
          message: "",
          type: "message",
          metadata: "",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send notification");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Notifications</h1>
          <p className="text-muted-foreground">Send push notifications to platform users</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr,300px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Recipient</label>
                <Select 
                  value={formData.recipient} 
                  onValueChange={(v) => setFormData({ ...formData, recipient: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Registered Users</SelectItem>
                    {users.map((user: any) => (
                      <SelectItem key={user._id} value={user._id}>
                        <div className="flex flex-col">
                          <span>{user.fullName}</span>
                          <span className="text-[10px] text-muted-foreground">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="relative mt-2">
                  <Input 
                    placeholder="Search users by name or email..." 
                    onChange={(e) => fetchUsers(e.target.value)}
                    className="text-xs h-8"
                  />
                  {isLoadingUsers && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>

                {formData.recipient === "all" ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 italic">
                    <Users className="w-3 h-3" />
                    Broadcast mode selected.
                  </p>
                ) : (
                  <p className="text-xs text-[#009698] font-medium flex items-center gap-1 mt-1">
                    Targeted user selected.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notification Type</label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">General Message</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="alert">Alert/Warning</SelectItem>
                    <SelectItem value="update">Platform Update</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground font-medium">
                  Note: Different types may trigger different notification styles on mobile devices.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input 
                  placeholder="Enter notification title" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Enter notification message" 
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Metadata (JSON format - Optional)</label>
                <Textarea 
                  placeholder='{ "link": "/dashboard/browse-cast", "category": "new_casting" }' 
                  rows={2}
                  value={formData.metadata}
                  onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                  className="font-mono text-xs"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSending}>
                {isSending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Notification
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Admin Usage Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <div className="shrink-0 mt-1">
                  <Info className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Use notifications sparingly to avoid spamming users.
                </p>
              </div>
              <div className="flex gap-2">
                <div className="shrink-0 mt-1">
                  <Info className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Announcements are public. Alerts are for critical issues.
                </p>
              </div>
              <div className="flex gap-2">
                <div className="shrink-0 mt-1">
                  <Info className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Broadcasting to "All Users" may take a few moments.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
