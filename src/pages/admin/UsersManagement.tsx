 import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Ban, Trash2, Loader2, CheckCircle2, Gift, RefreshCcw } from "lucide-react";
import { adminAPI } from "@/lib/api";
import { toast } from "sonner";
import { useConfirm } from "@/contexts/ConfirmContext";

const getRoleBadgeVariant = (role: string) => {
  switch (role?.toLowerCase()) {
    case "talent":
      return "default";
    case "casting_director":
      return "secondary";
    case "industry_professional":
      return "outline";
    default:
      return "outline";
  }
};

export default function UsersManagement() {
  const confirm = useConfirm();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isGrantTrialOpen, setIsGrantTrialOpen] = useState(false);
  const [trialUser, setTrialUser] = useState<any>(null);
  const [trialDays, setTrialDays] = useState("14");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getUsers({});
      if (response.data.success) {
        setUsers(response.data.data.users || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSuspend = async (userId: string) => {
    setIsActionLoading(true);
    try {
      const response = await adminAPI.suspendUser(userId, "Violating platform terms");
      if (response.data.success) {
        toast.success("User suspended successfully");
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to suspend user");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnsuspend = async (userId: string) => {
    setIsActionLoading(true);
    try {
      const response = await adminAPI.unsuspendUser(userId);
      if (response.data.success) {
        toast.success("User unsuspended successfully");
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unsuspend user");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleVerify = async (userId: string) => {
    setIsActionLoading(true);
    try {
      const response = await adminAPI.verifyUser(userId);
      if (response.data.success) {
        toast.success("User verified successfully");
        fetchUsers();
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to verify user";
      if (message.toLowerCase().includes("profile not found")) {
        toast.error("User cannot be verified yet: They haven't created their profile.");
      } else {
        toast.error(message);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleGrantTrialSubmit = async () => {
    if (!trialUser || isNaN(Number(trialDays))) return;

    setIsActionLoading(true);
    try {
      const response = await adminAPI.grantTrial(trialUser._id, Number(trialDays));
      if (response.data.success) {
        toast.success(`Granted ${trialDays} days of free trial to ${trialUser.fullName}!`);
        setIsGrantTrialOpen(false);
        setTrialUser(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to grant free trial");
    } finally {
      setIsActionLoading(false);
    }
  };

  const openGrantTrial = (user: any) => {
    setTrialUser(user);
    setTrialDays("14");
    setIsGrantTrialOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!await confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    setIsActionLoading(true);
    try {
      const response = await adminAPI.deleteUser(userId);
      if (response.data.success) {
        toast.success("User deleted successfully");
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setIsActionLoading(false);
    }
  };

  const userStats = [
    { label: "Total Users", value: users.length.toString(), color: "foreground" },
    { label: "Talent", value: users.filter(u => u.role === "talent").length.toString(), color: "success" },
    { label: "Directors", value: users.filter(u => u.role === "casting_director").length.toString(), color: "primary" },
    { label: "Professionals", value: users.filter(u => u.role === "industry_professional").length.toString(), color: "accent" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Platform activity and engagement metrics</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {userStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">All Users</CardTitle>
          <p className="text-sm text-muted-foreground">Search, filter, and manage user accounts</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signup Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user._id || user.id || index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-muted text-sm">{user.fullName?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className={user.isSuspended ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"}>
                        {user.isSuspended ? 'Suspended' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {!user.isVerified && (
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => handleVerify(user._id)}
                            disabled={isActionLoading}
                            title="Verify User"
                          >
                            <CheckCircle2 className="w-4 h-4 text-success" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon-sm" 
                          onClick={() => openGrantTrial(user)}
                          disabled={isActionLoading}
                          title="Grant Free Trial"
                        >
                          <Gift className="w-4 h-4 text-[#009698]" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => setSelectedUser(user)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {user.isSuspended ? (
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => handleUnsuspend(user._id)}
                            disabled={isActionLoading}
                            title="Unsuspend User"
                          >
                            <RefreshCcw className="w-4 h-4 text-green-600" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon-sm" 
                            onClick={() => handleSuspend(user._id)}
                            disabled={isActionLoading || user.status === 'suspended'}
                            title="Suspend User"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon-sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(user._id)}
                          disabled={isActionLoading}
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-muted">{selectedUser.fullName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedUser.fullName}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email:</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status:</p>
                  <p className="font-medium capitalize">{selectedUser.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Signup Date:</p>
                  <p className="font-medium">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Verified:</p>
                  <p className="font-medium">{selectedUser.isVerified ? "Yes" : "No"}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Grant Trial Dialog */}
      <Dialog open={isGrantTrialOpen} onOpenChange={setIsGrantTrialOpen}>
        <DialogContent className="max-w-sm rounded-[32px] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Grant Free Trial</DialogTitle>
            <p className="text-sm text-muted-foreground">Extend access for {trialUser?.fullName}</p>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="p-4 rounded-2xl bg-[#DEFCFE]/30 border border-[#009698]/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <Gift className="w-6 h-6 text-[#009698]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Current Plan</p>
                <p className="text-xs text-[#009698] font-bold uppercase tracking-wider">{trialUser?.subscription?.planId?.name || 'Free Tier'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Number of Days</label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  className="rounded-xl h-12 pl-4 font-bold text-lg"
                  min="1"
                  max="365"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">Days</div>
              </div>
              <p className="text-[10px] text-muted-foreground px-1 italic">Trial will expire automatically after this period.</p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl h-12 font-bold" 
                onClick={() => setIsGrantTrialOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 rounded-xl h-12 font-bold bg-[#009698] hover:bg-[#009698]/90" 
                onClick={handleGrantTrialSubmit}
                disabled={isActionLoading}
              >
                {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Grant Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}