import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Star, Loader2, Info, Trash2, MoreVertical } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { applicationAPI } from "@/lib/api";
import { toast } from "sonner";
import { ApplicationDetailsModal } from "@/components/applications/ApplicationDetailsModal";

const statusColors: Record<string, string> = {
  "review": "bg-slate-500 text-white hover:bg-slate-600 capitalize",
  "shortlist": "bg-amber-500 text-white hover:bg-amber-600 capitalize",
  "contacting": "bg-purple-500 text-white hover:bg-purple-600 capitalize",
  "audition_requested": "bg-orange-500 text-white hover:bg-orange-600 capitalize",
  "self_tape_requested": "bg-pink-500 text-white hover:bg-pink-600 capitalize",
  "invite": "bg-teal-500 text-white hover:bg-teal-600 capitalize",
  "offer": "bg-emerald-500 text-white hover:bg-emerald-600 capitalize",
  "hired": "bg-green-600 text-white hover:bg-green-700 capitalize",
  "declined": "bg-rose-500 text-white hover:bg-rose-600 capitalize",
  "matched": "bg-indigo-500 text-white hover:bg-indigo-600 capitalize",
  // Legacy backups
  "submitted": "bg-slate-500 text-white hover:bg-slate-600 capitalize",
  "viewed": "bg-blue-400 text-white hover:bg-blue-500 capitalize",
  "shortlisted": "bg-amber-500 text-white hover:bg-amber-600 capitalize",
  "rejected": "bg-rose-500 text-white hover:bg-rose-600 capitalize",
  "accepted": "bg-emerald-500 text-white hover:bg-emerald-600 capitalize",
  "withdrawn": "bg-slate-300 text-slate-700 hover:bg-slate-400 capitalize",
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([]);
  
  // Modal state
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await applicationAPI.getMe();
        
        let appsData = null;
        if (response.data.success) {
          if (Array.isArray(response.data.data)) {
            appsData = response.data.data;
          } else if (response.data.data && Array.isArray(response.data.data.applications)) {
            appsData = response.data.data.applications;
          }
        }

        if (appsData && Array.isArray(appsData)) {
          // Filter to only include project applications (which typically have appliedRole)
          const projectApps = appsData.filter(app => !!app.appliedRole);

          const apps = projectApps.map((app: any) => ({
            _id: app._id,
            status: app.status,
            createdAt: app.createdAt,
            project: {
              title: app.castingCallId?.project_title || app.castingCallId?.title || app.project?.projectName || "Unknown Project",
              role: app.appliedRole || app.role?.role_name || app.role?.title || "Unknown Role",
              postedBy: {
                fullName: app.castingCallId?.castingDirectorId?.fullName || app.project?.postedBy?.fullName || "Casting Team"
              }
            }
          }));
          setApplications(apps);

          // Calculate stats
          setStats([
            { label: "Total Applications", value: apps.length.toString(), sublabel: "All time", Icon: FileText },
            { label: "Under Review", value: apps.filter((a: { status: string; }) => ["review", "submitted", "viewed"].includes(a.status)).length.toString(), sublabel: "Pending Review", Icon: Eye },
            { label: "Shortlisted", value: apps.filter((a: { status: string; }) => ["shortlist", "shortlisted"].includes(a.status)).length.toString(), sublabel: "Callbacks Pending", Icon: Star },
          ]);
        } else {
          setApplications([]);
          setStats([
            { label: "Total Applications", value: "0", sublabel: "All time", Icon: FileText },
            { label: "Under Review", value: "0", sublabel: "Pending Review", Icon: Eye },
            { label: "Shortlisted", value: "0", sublabel: "Callbacks Pending", Icon: Star },
          ]);
        }
      } catch (error) {
        console.error("Error loading applications:", error);
        toast.error("Failed to load applications");
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId: string) => {
    if (!window.confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) return;
    
    try {
      const res = await applicationAPI.withdraw(applicationId);
      if (res.data?.success) {
        toast.success("Application withdrawn successfully");
        setApplications(prev => prev.map(sub => sub._id === applicationId ? { ...sub, status: "withdrawn" } : sub));
      } else {
        toast.error("Failed to withdraw application");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while withdrawing");
    }
  };

  const handleViewDetails = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setIsModalOpen(true);
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
      <div>
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">Track your applications to projects and roles</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.sublabel}</p>
                </div>
                <div className="icon-circle-primary w-10 h-10">
                  <stat.Icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Application History</CardTitle>
          <p className="text-sm text-muted-foreground">View and manage your project applications</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Casting Team</TableHead>
                  <TableHead>Applied Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length > 0 ? applications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell className="font-medium">{app.project?.title}</TableCell>
                    <TableCell>{app.project?.postedBy?.fullName}</TableCell>
                    <TableCell>{app.project?.role}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[app.status] || "bg-muted"}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem onClick={() => handleViewDetails(app._id)} className="cursor-pointer">
                              <Info className="w-4 h-4 mr-2" /> Details
                            </DropdownMenuItem>
                            {["review", "submitted", "viewed"].includes(app.status) && (
                              <DropdownMenuItem 
                                onClick={() => handleWithdraw(app._id)} 
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Withdraw
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No applications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ApplicationDetailsModal 
        applicationId={selectedApplicationId} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
