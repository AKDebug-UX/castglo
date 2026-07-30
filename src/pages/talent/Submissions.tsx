import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Star, Loader2, Info, Trash2, MoreVertical, Upload, CheckCircle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { applicationAPI } from "@/lib/api";
import { toast } from "sonner";
import { ApplicationDetailsModal } from "@/components/applications/ApplicationDetailsModal";
import { ProjectSubmissionModal } from "@/components/submissions/ProjectSubmissionModal";
import { useConfirm } from "@/contexts/ConfirmContext";

const statusColors: Record<string, string> = {
  "submitted": "bg-slate-500 text-white hover:bg-slate-600 capitalize",
  "viewed": "bg-blue-400 text-white hover:bg-blue-500 capitalize",
  "shortlisted": "bg-amber-500 text-white hover:bg-amber-600 capitalize",
  "rejected": "bg-rose-500 text-white hover:bg-rose-600 capitalize",
  "accepted": "bg-emerald-500 text-white hover:bg-emerald-600 capitalize",
  "withdrawn": "bg-slate-300 text-slate-700 hover:bg-slate-400 capitalize",
};

export default function Submissions() {
  const confirm = useConfirm();
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([]);
  
  // Modal state
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delivery Modal State
  const [deliverySubmission, setDeliverySubmission] = useState<any | null>(null);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  const handleOpenDeliveryForm = (submission: any) => {
    setDeliverySubmission(submission);
    setIsDeliveryModalOpen(true);
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await applicationAPI.getMe();
        console.log('Full API response:', response);
        console.log('Response data:', response.data);
        
        let appsData = null;
        if (response.data.success) {
          // Check if data is array directly, or has an applications property
          if (Array.isArray(response.data.data)) {
            appsData = response.data.data;
          } else if (response.data.data && Array.isArray(response.data.data.applications)) {
            appsData = response.data.data.applications;
          }
        }

        if (appsData && Array.isArray(appsData)) {
          // Filter to only include casting call submissions (which typically don't have appliedRole)
          const castingCallApps = appsData.filter(app => !app.appliedRole);
          
          const apps = castingCallApps.map((app: any) => ({
            _id: app._id,
            status: app.status, // submitted, viewed, shortlisted, rejected, accepted, withdrawn
            createdAt: app.createdAt,
            castingCall: {
              title: app.castingCallId?.project_title || app.project?.projectName || app.castingCall?.title || "Unknown Position",
              category: app.role?.role_name || app.role?.name || app.role?.title || app.castingCall?.category || "Other",
              postedBy: {
                fullName: app.project?.postedBy?.fullName || app.project?.productionCompany || app.castingCall?.postedBy?.fullName || "Casting Team"
              }
            }
          }));
          setSubmissions(apps);

          // Calculate stats
          setStats([
            { label: "Total Deliverables", value: apps.length.toString(), sublabel: "All time", Icon: FileText },
            { label: "Pending Approval", value: apps.filter((a: { status: string; }) => ["submitted", "viewed", "shortlisted"].includes(a.status)).length.toString(), sublabel: "Awaiting Review", Icon: Eye },
            { label: "Approved Deliverables", value: apps.filter((a: { status: string; }) => a.status === "accepted").length.toString(), sublabel: "Completed", Icon: Star },
          ]);
        } else {
          setSubmissions([]);
          setStats([
            { label: "Total Deliverables", value: "0", sublabel: "All time", Icon: FileText },
            { label: "Pending Approval", value: "0", sublabel: "Awaiting Review", Icon: Eye },
            { label: "Approved Deliverables", value: "0", sublabel: "Completed", Icon: Star },
          ]);
        }
      } catch (error) {
        console.error("Error loading deliverables:", error);
        toast.error("Failed to load deliverables");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const handleWithdraw = async (applicationId: string) => {
    if (!await confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) return;
    
    try {
      const res = await applicationAPI.withdraw(applicationId);
      if (res.data?.success) {
        toast.success("Application withdrawn successfully");
        setSubmissions(prev => prev.map(sub => sub._id === applicationId ? { ...sub, status: "withdrawn" } : sub));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Deliverables</h1>
          <p className="text-muted-foreground">Track your audition deliverables and feedback</p>
        </div>
        <Button 
          className="bg-[#009698] hover:bg-[#009698]/90 text-white flex items-center gap-2 font-semibold shadow-sm transition-all duration-200 self-start sm:self-center"
          onClick={() => handleOpenDeliveryForm(null)}
        >
          <Upload className="w-4 h-4" /> Submit Deliverables
        </Button>
      </div>

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

      {/* Deliverables Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deliverable History</CardTitle>
          <p className="text-sm text-muted-foreground">View and manage all your audition deliverables</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length > 0 ? submissions.map((submission) => (
                  <TableRow key={submission._id}>
                    <TableCell className="font-medium">{submission.castingCall?.title}</TableCell>
                    <TableCell>{submission.castingCall?.postedBy?.fullName || "Unknown"}</TableCell>
                    <TableCell>{submission.castingCall?.category}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[submission.status] || "bg-muted"}>
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        {submission.status === "accepted" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100/80 hover:text-teal-800 flex items-center gap-1.5 h-8 font-semibold"
                            onClick={() => handleOpenDeliveryForm(submission)}
                          >
                            <Upload className="w-3.5 h-3.5" /> Submit Work
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuItem onClick={() => handleViewDetails(submission._id || submission.id)} className="cursor-pointer">
                              <Info className="w-4 h-4 mr-2" /> Details
                            </DropdownMenuItem>
                            {submission.status === "accepted" && (
                              <DropdownMenuItem onClick={() => handleOpenDeliveryForm(submission)} className="cursor-pointer text-teal-600 focus:text-teal-600 font-medium">
                                <CheckCircle className="w-4 h-4 mr-2" /> Submit Work
                              </DropdownMenuItem>
                            )}
                            {["submitted", "viewed"].includes(submission.status) && (
                              <DropdownMenuItem 
                                onClick={() => handleWithdraw(submission._id || submission.id)} 
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
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No deliverables found.
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

      <ProjectSubmissionModal
        submission={deliverySubmission}
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
      />
    </div>
  );
}
