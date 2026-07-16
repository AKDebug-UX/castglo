import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Check, X, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '@/lib/api';

export default function AdminCastingCallsPending() {
  const [castingCalls, setCastingCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = activeTab === 'pending' ? { status: 'pending' } : {};
      const response = await adminAPI.getPendingCastingCalls(params);
      if (response.data?.success) {
        const rawData = response.data.data;
        let list = [];
        if (Array.isArray(rawData)) {
          list = rawData;
        } else if (rawData && Array.isArray(rawData.castingCalls)) {
          list = rawData.castingCalls;
        } else if (rawData && Array.isArray(rawData.pendingCastingCalls)) {
          list = rawData.pendingCastingCalls;
        } else if (rawData && Array.isArray(rawData.data)) {
          list = rawData.data;
        } else {
          list = [];
        }
        
        if (activeTab === 'pending') {
          // Filter to only display casting calls that are actually pending approval
          const pendingCalls = list.filter((call: any) => 
            call.status === 'pending' || 
            call.status === 'pending_approval' ||
            !call.status
          );
          setCastingCalls(pendingCalls);
        } else {
          setCastingCalls(list);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch casting calls');
      setCastingCalls([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    try {
      const response = await adminAPI.approveCastingCall(id);
      if (response.data?.success) {
        toast.success('Casting call approved');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve casting call');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await adminAPI.rejectCastingCall(id);
      if (response.data?.success) {
        toast.success('Casting call rejected');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject casting call');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Casting Calls Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="all">All Casting Calls</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'pending' ? 'Needs Review' : 'All Listings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[200px]">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : castingCalls.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Inbox className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm font-semibold">
                    {activeTab === 'pending' ? 'No pending casting calls to review.' : 'No casting calls found on the platform.'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Director/Creator</TableHead>
                      <TableHead>Project Type</TableHead>
                      <TableHead>Date Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {castingCalls.map((call: any, index: number) => {
                      const statusLower = String(call.status || '').toLowerCase();
                      const isPending = statusLower === 'pending' || statusLower === 'pending_approval' || !call.status;
                      return (
                        <TableRow key={call._id || call.id || index}>
                          <TableCell className="font-medium">{call.title || 'Untitled Project'}</TableCell>
                          <TableCell>{call.director?.name || call.createdBy?.name || 'Unknown'}</TableCell>
                          <TableCell className="capitalize">{call.projectType || 'N/A'}</TableCell>
                          <TableCell>{call.createdAt ? new Date(call.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                statusLower === 'open' || statusLower === 'approved' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-none' :
                                isPending ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-none' :
                                statusLower === 'rejected' ? 'bg-red-100 text-red-800 hover:bg-red-200 border-none' :
                                'bg-slate-100 text-slate-800 hover:bg-slate-200 border-none'
                              }
                              variant="outline"
                            >
                              {call.status || 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {/* Show Approve button if it's pending, pending_approval, or rejected */}
                              {(isPending || statusLower === 'rejected') && (
                                <Button variant="ghost" size="icon" onClick={() => handleApprove(call._id || call.id)} title="Approve">
                                  <Check className="w-4 h-4 text-green-600" />
                                </Button>
                              )}
                              {/* Show Reject/Disapprove button if it's pending, pending_approval, approved, or open */}
                              {(isPending || statusLower === 'open' || statusLower === 'approved') && (
                                <Button variant="ghost" size="icon" onClick={() => handleReject(call._id || call.id)} title="Reject / Disapprove">
                                  <X className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                              {/* Fallback if no actions are available */}
                              {!(isPending || statusLower === 'rejected' || statusLower === 'open' || statusLower === 'approved') && (
                                <span className="text-xs text-muted-foreground">N/A</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
