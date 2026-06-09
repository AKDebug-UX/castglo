import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Star, Loader2, Info, Trash2 } from "lucide-react";
import { applicationAPI } from "@/lib/api";
import { toast } from "sonner";
import { ApplicationDetailsModal } from "@/components/applications/ApplicationDetailsModal";

const statusColors: Record<string, string> = {
  "submitted": "bg-slate-500 text-white hover:bg-slate-600 capitalize",
  "viewed": "bg-blue-400 text-white hover:bg-blue-500 capitalize",
  "shortlisted": "bg-amber-500 text-white hover:bg-amber-600 capitalize",
  "rejected": "bg-rose-500 text-white hover:bg-rose-600 capitalize",
  "accepted": "bg-emerald-500 text-white hover:bg-emerald-600 capitalize",
  "withdrawn": "bg-slate-300 text-slate-700 hover:bg-slate-400 capitalize",
};

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([]);
  
  // Modal state
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          const apps = appsData.map((app: { _id: any; status: any; createdAt: any; project: { title: any; projectName: any; postedBy: { fullName: any; }; productionCompany: any; }; castingCall: { title: any; category: any; postedBy: { fullName: any; }; }; role: { role_name: any; name: any; title: any; }; }) => ({
            _id: app._id,
            status: app.status, // submitted, viewed, shortlisted, rejected, accepted, withdrawn
            createdAt: app.createdAt,
            castingCall: {
              title: app.project?.title || app.project?.projectName || app.castingCall?.title || "Unknown Position",
              category: app.role?.role_name || app.role?.name || app.role?.title || app.castingCall?.category || "Other",
              postedBy: {
                fullName: app.project?.postedBy?.fullName || app.project?.productionCompany || app.castingCall?.postedBy?.fullName || "Casting Team"
              }
            }
          }));
          setSubmissions(apps);

          // Calculate stats
          setStats([
            { label: "Total Submissions", value: apps.length.toString(), sublabel: "All time", Icon: FileText },
            { label: "Viewed/In Review", value: apps.filter((a: { status: string; }) => ["submitted", "viewed"].includes(a.status)).length.toString(), sublabel: "Pending Review", Icon: Eye },
            { label: "Shortlisted", value: apps.filter((a: { status: string; }) => a.status === "shortlisted").length.toString(), sublabel: "Callbacks Pending", Icon: Star },
          ]);
        } else {
          setSubmissions([]);
          setStats([
            { label: "Total Submissions", value: "0", sublabel: "All time", Icon: FileText },
            { label: "In Review", value: "0", sublabel: "Pending Review", Icon: Eye },
            { label: "Shortlisted", value: "0", sublabel: "Callbacks Pending", Icon: Star },
          ]);
        }
      } catch (error) {
        console.error("Error loading submissions:", error);
        toast.error("Failed to load submissions");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const handleWithdraw = async (applicationId: string) => {
    if (!window.confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) return;
    
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
      <div>
        <h1 className="text-2xl font-bold">My Submissions</h1>
        <p className="text-muted-foreground">Track your audition submissions and feedback</p>
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

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <p className="text-sm text-muted-foreground">View and manage all your audition submissions</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Submission Date</TableHead>
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
                    <TableCell>{new Date(submission.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[submission.status] || "bg-muted"}>
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(submission._id)}>
                          <Info className="w-4 h-4 mr-1" /> Details
                        </Button>
                        {["submitted", "viewed"].includes(submission.status) && (
                          <Button variant="destructive" size="sm" onClick={() => handleWithdraw(submission._id)}>
                            <Trash2 className="w-4 h-4 mr-1" /> Withdraw
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No submissions found.
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
