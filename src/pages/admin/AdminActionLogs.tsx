import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AdminActionLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetching up to 100 logs for the full page view to ensure robust data is available
      const response = await adminAPI.getActionLogs({ limit: 100 });
      if (response.data?.success) {
        const rawData = response.data.data;
        if (Array.isArray(rawData)) {
          setLogs(rawData);
        } else if (rawData && Array.isArray(rawData.logs)) {
          setLogs(rawData.logs);
        } else if (rawData && Array.isArray(rawData.actionLogs)) {
          setLogs(rawData.actionLogs);
        } else if (rawData && Array.isArray(rawData.data)) {
          setLogs(rawData.data);
        } else {
          setLogs([]);
        }
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

  const getActionBadge = (action: string) => {
    const act = (action || "").toLowerCase();
    if (act.includes("delete") || act.includes("suspend") || act.includes("reject") || act.includes("revoke")) {
      return <Badge variant="destructive" className="capitalize">{action}</Badge>;
    }
    if (act.includes("create") || act.includes("approve") || act.includes("verify") || act.includes("grant")) {
      return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-transparent capitalize">{action}</Badge>;
    }
    if (act.includes("update") || act.includes("edit") || act.includes("patch") || act.includes("change")) {
      return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white capitalize">{action}</Badge>;
    }
    return <Badge variant="outline" className="capitalize">{action}</Badge>;
  };

  const filteredLogs = logs.filter((log: any) => {
    const term = search.toLowerCase();
    const admin = (log.adminName || log.adminId || 'system').toLowerCase();
    const action = (log.action || '').toLowerCase();
    const target = (log.target || log.targetId || '').toLowerCase();
    const details = (log.details || log.reason || log.notes || '').toLowerCase();
    return admin.includes(term) || action.includes(term) || target.includes(term) || details.includes(term);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Action Logs</h1>
          <p className="text-sm text-muted-foreground">Monitor administrative actions and platform changes</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Platform Activity History</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No matching action logs found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Admin</TableHead>
                  <TableHead className="w-[150px]">Action</TableHead>
                  <TableHead className="w-[200px]">Target</TableHead>
                  <TableHead>Details / Notes</TableHead>
                  <TableHead className="w-[180px]">Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log: any, index: number) => {
                  const detailsText = log.details || log.reason || log.notes || (log.metadata && (log.metadata.reason || log.metadata.notes || JSON.stringify(log.metadata))) || '—';
                  return (
                    <TableRow key={log._id || log.id || index}>
                      <TableCell className="font-semibold text-slate-950">
                        {log.adminName || log.adminId || 'System'}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="font-medium text-slate-700">
                        {log.target || log.targetId || 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-500 max-w-[300px] truncate" title={String(detailsText)}>
                        {detailsText}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
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
  );
}
