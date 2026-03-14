import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Eye, Star, Loader2 } from "lucide-react";
import { applicationAPI } from "@/lib/api";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  "applied": "bg-slate-500 text-white hover:bg-slate-600 capitalize",
  "in_review": "bg-blue-500 text-white hover:bg-blue-600 capitalize",
  "shortlisted": "bg-amber-500 text-white hover:bg-amber-600 capitalize",
  "rejected": "bg-rose-500 text-white hover:bg-rose-600 capitalize",
  "accepted": "bg-emerald-500 text-white hover:bg-emerald-600 capitalize",
};

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await applicationAPI.getMe();
        if (response.data.success && Array.isArray(response.data.data)) {
          const apps = response.data.data.map((app) => ({
            _id: app._id,
            status: app.status, // submitted, viewed, shortlisted, rejected, accepted, withdrawn
            createdAt: app.createdAt,
            castingCall: {
              title: app.castingCall?.title || "Unknown Position",
              category: app.castingCall?.category || "Other",
              postedBy: {
                fullName: app.castingCall?.postedBy?.fullName || "Casting Team"
              }
            }
          }));
          setSubmissions(apps);

          // Calculate stats
          setStats([
            { label: "Total Submissions", value: apps.length.toString(), sublabel: "All time", Icon: FileText },
            { label: "In Review", value: apps.filter((a) => a.status === "applied").length.toString(), sublabel: "Pending Review", Icon: Eye },
            { label: "Shortlisted", value: apps.filter((a) => a.status === "shortlisted").length.toString(), sublabel: "Callbacks Pending", Icon: Star },
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
        toast.error("Failed to load submissions");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

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
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No submissions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
