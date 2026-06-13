import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '@/lib/api';

export default function AdminCastingCallsPending() {
  const [castingCalls, setCastingCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getPendingCastingCalls();
      if (response.data?.success) {
        setCastingCalls(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch pending casting calls');
      setCastingCalls([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pending Casting Calls</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Needs Review</CardTitle>
        </CardHeader>
        <CardContent>
          {castingCalls.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No pending casting calls to review.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Director/Creator</TableHead>
                  <TableHead>Project Type</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {castingCalls.map((call: any) => (
                  <TableRow key={call._id || call.id}>
                    <TableCell className="font-medium">{call.title || 'Untitled Project'}</TableCell>
                    <TableCell>{call.director?.name || call.createdBy?.name || 'Unknown'}</TableCell>
                    <TableCell>{call.projectType || 'N/A'}</TableCell>
                    <TableCell>{new Date(call.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleApprove(call._id || call.id)} title="Approve">
                        <Check className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleReject(call._id || call.id)} title="Reject">
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
