import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, X, Download } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for verification requests
const mockVerificationRequests = [
  {
    id: '1',
    user: 'John Doe',
    userType: 'Talent',
    verificationType: 'Identity',
    documentUrl: '#',
    status: 'Pending',
    submittedAt: new Date().toISOString(),
  },
  {
    id: '2',
    user: 'Jane Smith',
    userType: 'Director',
    verificationType: 'Professional',
    documentUrl: '#',
    status: 'Pending',
    submittedAt: new Date().toISOString(),
  },
  {
    id: '3',
    user: 'Creative Inc.',
    userType: 'Company',
    verificationType: 'Company',
    documentUrl: '#',
    status: 'Approved',
    submittedAt: new Date().toISOString(),
  },
];

export default function VerificationManagement() {
  const [requests, setRequests] = useState(mockVerificationRequests);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleVerification = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRequests(requests.map(req => req.id === id ? { ...req, status } : req));
      toast.success(`Verification status updated to ${status}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update verification status.');
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
      <h1 className="text-2xl font-bold">Verification Management</h1>
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
