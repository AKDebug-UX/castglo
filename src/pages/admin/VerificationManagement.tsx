import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '@/lib/api';

export default function VerificationManagement() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [requestsRes, statsRes] = await Promise.all([
        adminAPI.getVerifications(),
        adminAPI.getVerificationStats()
      ]);

      if (requestsRes.data.success) {
        setRequests(requestsRes.data.data.requests || []);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch verification requests');
      // Fallback for UI if API is not fully ready
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerification = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const response = await adminAPI.updateVerificationStatus(id, status);
      if (response.data.success) {
        toast.success(`Verification status updated to ${status}`);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update verification status.');
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
        <h1 className="text-2xl font-bold">Verification Management</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verification Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Verification Type</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map(req => (
                <TableRow key={req.id}>
                  <TableCell>{req.user}</TableCell>
                  <TableCell>{req.userType}</TableCell>
                  <TableCell>{req.verificationType}</TableCell>
                  <TableCell>{new Date(req.submittedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={req.status === 'Pending' ? 'secondary' : req.status === 'Approved' ? 'default' : 'destructive'}>
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <a href={req.documentUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                    {req.status === 'Pending' && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleVerification(req.id, 'Approved')}>
                          <Check className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleVerification(req.id, 'Rejected')}>
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
