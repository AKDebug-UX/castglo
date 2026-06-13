import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '@/lib/api';

export default function AdminActionLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetching up to 50 logs for the full page view
      const response = await adminAPI.getActionLogs({ limit: 50 });
      if (response.data?.success) {
        setLogs(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch action logs');
      setLogs([]);
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
        <h1 className="text-2xl font-bold">Action Logs</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No action logs found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: any, index: number) => (
                  <TableRow key={log._id || log.id || index}>
                    <TableCell className="font-medium">{log.adminName || log.adminId || 'System'}</TableCell>
                    <TableCell className="capitalize">{log.action}</TableCell>
                    <TableCell>{log.target || log.targetId || 'N/A'}</TableCell>
                    <TableCell>{log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}</TableCell>
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
