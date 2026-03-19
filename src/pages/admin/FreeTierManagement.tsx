import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, Clock, Save, ShieldCheck } from "lucide-react";
import { adminAPI } from "@/lib/api";
import { toast } from "sonner";

export default function FreeTierManagement() {
  const [days, setDays] = useState<number>(30);
  const [role, setRole] = useState<string>("talent");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSettings, setCurrentSettings] = useState<any[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await adminAPI.getSettings();
        if (response.data.success) {
          setCurrentSettings(response.data.data.freeTier || []);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        // Fallback to empty if API fails or doesn't exist yet
        setCurrentSettings([
          { role: "talent", days: 30 },
          { role: "casting_director", days: 14 },
          { role: "industry_professional", days: 14 }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await adminAPI.setFreeTier({ days, role });
      if (response.data.success) {
        toast.success(`Free tier for ${role} updated to ${days} days`);
        // Refresh settings
        const updatedResponse = await adminAPI.getSettings();
        if (updatedResponse.data.success) {
          setCurrentSettings(updatedResponse.data.data.freeTier);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update free tier settings");
    } finally {
      setIsSubmitting(false);
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Free Tier Management</h1>
        <p className="text-muted-foreground">Configure trial periods for different user categories</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Update Free Tier</CardTitle>
            <CardDescription>Set the number of trial days for new registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select User Category</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="talent">Talent</SelectItem>
                    <SelectItem value="casting_director">Casting Director</SelectItem>
                    <SelectItem value="industry_professional">Industry Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trial Duration (Days)</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    min="0" 
                    max="365"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">Users will have full access for this duration after signing up.</p>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Settings</CardTitle>
            <CardDescription>Active free tier durations by role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentSettings.map((setting) => (
                <div key={setting.role} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold capitalize">{setting.role.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">New users</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {setting.days} Days
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4 flex gap-3">
          <Info className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-bold">Important Note</p>
            <p>Changes to free tier settings will only apply to new users who register after the update. Existing users' trial periods will remain unchanged.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Info(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
