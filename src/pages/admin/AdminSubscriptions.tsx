import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '@/lib/api';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getSubscriptions();
      if (response.data?.success) {
        setSubscriptions(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch subscriptions');
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <h1 className="text-2xl font-bold">Subscriptions Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No subscriptions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Next Billing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub: any) => (
                  <TableRow key={sub._id || sub.id}>
                    <TableCell className="font-medium">{sub.user?.name || sub.userId || 'N/A'}</TableCell>
                    <TableCell>{sub.plan?.name || sub.planId || 'Standard'}</TableCell>
                    <TableCell>
                      <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                        {sub.status || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>${sub.amount || 0}</TableCell>
                    <TableCell className="capitalize">{sub.billingCycle || 'Monthly'}</TableCell>
                    <TableCell>{new Date(sub.startDate || sub.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : 'N/A'}</TableCell>
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
