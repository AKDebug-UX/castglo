import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Check, X, Search, Filter, Eye, Video, FileText, Calendar, User, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { submissionAPI, applicationAPI } from '@/lib/api';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  submitted: "bg-blue-500/10 text-blue-600 border-blue-200",
  pending: "bg-amber-500/10 text-amber-600 border-amber-200",
  shortlist: "bg-purple-500/10 text-purple-600 border-purple-200",
  shortlisted: "bg-purple-500/10 text-purple-600 border-purple-200",
  accepted: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  hired: "bg-emerald-600/10 text-emerald-700 border-emerald-300",
  rejected: "bg-rose-500/10 text-rose-600 border-rose-200",
  declined: "bg-rose-500/10 text-rose-600 border-rose-200",
  withdrawn: "bg-slate-500/10 text-slate-600 border-slate-200",
};

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const response = await submissionAPI.getAll();
      const resData = response.data;
      let list: any[] = [];
      if (resData) {
        if (Array.isArray(resData)) {
          list = resData;
        } else if (resData.success && Array.isArray(resData.data)) {
          list = resData.data;
        } else if (resData.submissions && Array.isArray(resData.submissions)) {
          list = resData.submissions;
        } else if (resData.data?.submissions && Array.isArray(resData.data.submissions)) {
          list = resData.data.submissions;
        }
      }
      setSubmissions(list);
    } catch (error: any) {
      console.error('Failed to fetch submissions:', error);
      // Fallback empty state with clear toast
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      try {
        await submissionAPI.updateStatus(id, newStatus);
      } catch {
        // Backup call to application API
        await applicationAPI.updateStatus(id, { status: newStatus });
      }
      toast.success(`Submission status updated to ${newStatus}`);
      fetchSubmissions();
      if (selectedSubmission && selectedSubmission._id === id) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredSubmissions = submissions.filter((item) => {
    const talentName = item.talentName || item.user?.name || item.talent?.name || item.talentId?.name || '';
    const castingTitle = item.castingTitle || item.castingCall?.title || item.projectTitle || '';
    const roleName = item.roleName || item.role?.name || '';
    const matchesSearch =
      talentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      castingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      roleName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || (item.status && item.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Audition Submissions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Review, audit, and moderate talent audition applications across all projects.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSubmissions} disabled={isLoading} className="self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by talent name, project title, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shortlist">Shortlisted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center justify-between">
            <span>Submissions Directory</span>
            <span className="text-sm font-normal text-muted-foreground">
              Showing {filteredSubmissions.length} of {submissions.length} total
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
              <span className="text-slate-500">Loading audition submissions...</span>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-lg font-medium text-slate-600">No submissions found</p>
              <p className="text-sm text-slate-400">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search query or status filter.'
                  : 'Submissions made by talent will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Talent</TableHead>
                    <TableHead>Casting Call / Role</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((sub: any) => {
                    const talentName = sub.talentName || sub.user?.name || sub.talent?.name || sub.talentId?.name || 'Talent User';
                    const talentEmail = sub.user?.email || sub.talent?.email || '';
                    const castingTitle = sub.castingTitle || sub.castingCall?.title || sub.projectTitle || 'Casting Call';
                    const roleName = sub.roleName || sub.role?.name || 'Role';
                    const status = sub.status || 'submitted';
                    const dateStr = sub.createdAt ? format(new Date(sub.createdAt), 'PPP') : 'N/A';

                    return (
                      <TableRow key={sub._id || sub.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white leading-tight">{talentName}</p>
                              {talentEmail && <p className="text-xs text-slate-400">{talentEmail}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{castingTitle}</p>
                            <p className="text-xs text-slate-400">Role: {roleName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{dateStr}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[status.toLowerCase()] || "bg-slate-100 text-slate-700"}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Inspect
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Submission Details</DialogTitle>
            <DialogDescription>
              Review complete audition application details and media submitted by the talent.
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Talent</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">
                    {selectedSubmission.talentName || selectedSubmission.user?.name || selectedSubmission.talent?.name || 'Talent User'}
                  </p>
                  {selectedSubmission.user?.email && (
                    <p className="text-xs text-slate-500">{selectedSubmission.user.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Casting / Role</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-1">
                    {selectedSubmission.castingTitle || selectedSubmission.castingCall?.title || 'Casting Project'}
                  </p>
                  <p className="text-xs text-slate-500">
                    Role: {selectedSubmission.roleName || selectedSubmission.role?.name || 'Main Role'}
                  </p>
                </div>
              </div>

              {/* Cover Note / Message */}
              {selectedSubmission.coverNote || selectedSubmission.message || selectedSubmission.notes ? (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Cover Note</p>
                  <div className="p-3 rounded border bg-white dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-300">
                    {selectedSubmission.coverNote || selectedSubmission.message || selectedSubmission.notes}
                  </div>
                </div>
              ) : null}

              {/* Video URL / Showreel */}
              {(selectedSubmission.showreel_url || selectedSubmission.videoUrl || selectedSubmission.mediaUrl) && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Audition Video / Showreel</p>
                  <a
                    href={selectedSubmission.showreel_url || selectedSubmission.videoUrl || selectedSubmission.mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline gap-1.5 p-2 rounded bg-primary/5 border border-primary/20"
                  >
                    <Video className="w-4 h-4 text-primary" />
                    <span>Watch Audition Reel</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </div>
              )}

              {/* Moderation Actions */}
              <div className="pt-4 border-t">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Change Submission Status</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedSubmission._id || selectedSubmission.id, 'accepted')}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve / Accept
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedSubmission._id || selectedSubmission.id, 'shortlist')}
                  >
                    Shortlist
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedSubmission._id || selectedSubmission.id, 'rejected')}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

