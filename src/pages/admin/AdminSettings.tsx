import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authAPI, userAPI } from "@/lib/api";
import { toast } from "sonner";
import { KeyRound, Loader2, UserMinus } from "lucide-react";
import { useConfirm } from "@/contexts/ConfirmContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function AdminSettings() {
  const confirm = useConfirm();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success("Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccountClick = () => {
    setDeleteConfirmPassword("");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmPassword) {
      toast.error("Password is required to delete account");
      return;
    }
    if (!await confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) return;

    setIsSaving(true);
    try {
      await userAPI.deleteAccount({ password: deleteConfirmPassword });
      toast.success("Account deleted successfully");
      setIsDeleteModalOpen(false);
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete account");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Manage your administrator account security.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" /> Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-md">
          <Input type="password" placeholder="Current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />
          <Input type="password" placeholder="New password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />
          <Input type="password" placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} />
          <Button onClick={handleChangePassword} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-red-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <UserMinus className="w-5 h-5 text-red-500" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Permanently delete your administrator account and all associated data. This action is immediate and cannot be undone.
          </p>
          <Button variant="destructive" onClick={handleDeleteAccountClick}>
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md shadow-2xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">Confirm Account Deletion</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Please enter your password to confirm that you want to permanently delete your account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              type="password" 
              placeholder="Enter your password" 
              value={deleteConfirmPassword}
              onChange={(e) => setDeleteConfirmPassword(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl h-11 px-5">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isSaving} className="rounded-xl h-11 px-5">
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
