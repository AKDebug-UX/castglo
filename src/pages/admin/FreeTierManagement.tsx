import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, Clock, Save, ShieldCheck } from "lucide-react";
import { adminAPI } from "@/lib/api";
import { toast } from "sonner";

export default function FreeTierManagement() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [durations, setDurations] = useState<Record<string, number>>({
    talent: 30,
    casting_director: 14,
    industry_professional: 14,
    professional: 14
  });

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      if (response.data && response.data.success) {
        // Handle both object format and array format for flexibility
        const data = response.data.data;
        if (data && data.freeTierDurations) {
          setDurations(data.freeTierDurations);
        } else if (data && Array.isArray(data.freeTier)) {
          const mapped = data.freeTier.reduce((acc, curr) => ({
            ...acc,
            [curr.role]: curr.days
          }), {});
          setDurations(prev => ({ ...prev, ...mapped }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateRole = async (role: string, days: number) => {
    setIsSubmitting(true);
    try {
      const response = await adminAPI.setFreeTier({ days, role });
      if (response.data.success) {
        toast.success(`Updated ${role.replace('_', ' ')} trial to ${days} days`);
        setDurations(prev => ({ ...prev, [role]: days }));
      }
    } catch (error) {
      toast.error("Failed to update settings");
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
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global platform behavior and trial durations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Trial Configurations
          </CardTitle>
          <CardDescription>
            Configure how many days of free access new users receive based on their role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {Object.entries(durations || {}).map(([role, days]) => (
              <div key={role} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-white shadow-sm border border-slate-100">
                    <ShieldCheck className="w-5 h-5 text-[#009698]" />
                  </div>
                  <div>
                    <p className="font-bold capitalize text-slate-900">{role.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">Initial free access period</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative w-32">
                    <Input 
                      type="number" 
                      value={days}
                      onChange={(e) => setDurations(prev => ({ ...prev, [role]: parseInt(e.target.value) || 0 }))}
                      className="pr-12 font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Days</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-[#009698] hover:bg-[#009698]/90 h-10 px-4"
                    onClick={() => handleUpdateRole(role, durations[role])}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#DEFCFE]/30 border-[#009698]/10">
        <CardContent className="p-4 flex gap-3">
          <div className="w-10 h-10 rounded-full bg-[#009698]/10 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-[#009698]" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-slate-900">Automatic Application</p>
            <p className="text-slate-600">These settings are applied automatically to all new registrations. Changes do not affect users who have already signed up.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Info(props) {
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
