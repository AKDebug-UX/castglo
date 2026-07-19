import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, Eye, Info, ShieldAlert, Globe, Clock, User, FileText, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { adminAPI } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function AdminActionLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getActionLogs({ limit: 100 });
      if (response.data?.success) {
        const rawData = response.data.data;
        let list = [];
        if (Array.isArray(rawData)) {
          list = rawData;
        } else if (rawData && Array.isArray(rawData.logs)) {
          list = rawData.logs;
        } else if (rawData && Array.isArray(rawData.actionLogs)) {
          list = rawData.actionLogs;
        } else if (rawData && Array.isArray(rawData.data)) {
          list = rawData.data;
        } else if (rawData && typeof rawData === 'object') {
          const firstArr = Object.values(rawData).find(val => Array.isArray(val));
          if (firstArr) list = firstArr as any[];
        }
        setLogs(list);
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

  const formatActionName = (actionStr: string) => {
    if (!actionStr) return 'Action';
    return actionStr
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const getActionBadge = (log: any) => {
    const rawAction = log.actionType || log.action || '';
    const act = rawAction.toLowerCase();
    const displayName = formatActionName(rawAction);

    if (act.includes("delete") || act.includes("remove") || act.includes("suspend") || act.includes("reject") || act.includes("revoke")) {
      return <Badge variant="destructive" className="capitalize">{displayName}</Badge>;
    }
    if (act.includes("create") || act.includes("approve") || act.includes("verify") || act.includes("grant") || act.includes("publish")) {
      return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-transparent capitalize">{displayName}</Badge>;
    }
    if (act.includes("update") || act.includes("edit") || act.includes("patch") || act.includes("change") || act.includes("close")) {
      return <Badge variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white capitalize">{displayName}</Badge>;
    }
    return <Badge variant="outline" className="capitalize">{displayName}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const sev = (severity || '').toLowerCase();
    if (sev === 'high' || sev === 'critical') {
      return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 capitalize">{severity}</Badge>;
    }
    if (sev === 'medium') {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 capitalize">{severity}</Badge>;
    }
    if (sev === 'low') {
      return <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 capitalize">{severity}</Badge>;
    }
    return <Badge variant="outline" className="capitalize">{severity || 'normal'}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const st = (status || '').toLowerCase();
    if (st === 'completed' || st === 'success') {
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 capitalize">{status}</Badge>;
    }
    if (st === 'failed' || st === 'error') {
      return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 capitalize">{status}</Badge>;
    }
    if (st === 'pending' || st === 'processing') {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 capitalize">{status}</Badge>;
    }
    return <Badge variant="outline" className="capitalize">{status || 'n/a'}</Badge>;
  };

  const getTargetTitle = (log: any) => {
    const prevState = log.previousState;
    const newState = log.newState;
    const meta = log.metadata;

    return (
      prevState?.title ||
      newState?.title ||
      prevState?.projectName ||
      newState?.projectName ||
      prevState?.fullName ||
      newState?.fullName ||
      prevState?.name ||
      newState?.name ||
      meta?.title ||
      meta?.name ||
      log.targetEmail ||
      log.targetId ||
      log.target ||
      'N/A'
    );
  };

  const getReasonOrDetails = (log: any) => {
    return (
      log.reason ||
      log.description ||
      log.details ||
      log.notes ||
      log.metadata?.reason ||
      log.metadata?.notes ||
      '—'
    );
  };

  const filteredLogs = logs.filter((log: any) => {
    const term = search.toLowerCase();
    const admin = (log.adminName || log.adminEmail || log.adminId || 'system').toLowerCase();
    const action = (log.actionType || log.action || '').toLowerCase();
    const targetType = (log.targetType || '').toLowerCase();
    const targetId = (log.targetId || log.target || '').toLowerCase();
    const targetTitle = String(getTargetTitle(log)).toLowerCase();
    const details = String(getReasonOrDetails(log)).toLowerCase();
    const ip = (log.ipAddress || '').toLowerCase();

    return (
      admin.includes(term) ||
      action.includes(term) ||
      targetType.includes(term) ||
      targetId.includes(term) ||
      targetTitle.includes(term) ||
      details.includes(term) ||
      ip.includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Action Logs</h1>
          <p className="text-sm text-muted-foreground">Monitor administrative actions, audit trails, and platform changes</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search action, target, admin, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Platform Audit History
            </CardTitle>
            <span className="text-xs text-muted-foreground">Showing {filteredLogs.length} entries</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">No matching action logs found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Admin / User</TableHead>
                  <TableHead className="w-[170px]">Action</TableHead>
                  <TableHead className="w-[220px]">Target</TableHead>
                  <TableHead>Reason / Details</TableHead>
                  <TableHead className="w-[100px]">Severity</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[170px]">Date & Time</TableHead>
                  <TableHead className="w-[60px] text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log: any, index: number) => {
                  const targetTitle = getTargetTitle(log);
                  const reason = getReasonOrDetails(log);

                  return (
                    <TableRow key={log._id || log.id || index} className="hover:bg-slate-50/80 cursor-pointer" onClick={() => setSelectedLog(log)}>
                      <TableCell className="font-semibold text-slate-900 truncate max-w-[180px]">
                        {log.adminName || log.adminEmail || log.adminId || 'System'}
                      </TableCell>
                      <TableCell><pre>{getActionBadge(log)}</pre></TableCell>
                      <TableCell className="font-medium text-slate-700">
                        <div className="flex flex-col min-w-0">
                          <span className="truncate text-sm font-medium text-slate-900">{targetTitle}</span>
                          {log.targetType && (
                            <span className="text-[11px] text-muted-foreground font-normal capitalize truncate max-w-[180px]">
                              {log.targetType.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 max-w-[280px] truncate" title={String(reason)}>
                        {reason}
                      </TableCell>
                      <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}>
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                {getActionBadge(selectedLog)}
                {selectedLog.severity && getSeverityBadge(selectedLog.severity)}
                {selectedLog.status && getStatusBadge(selectedLog.status)}
              </div>
              <DialogTitle className="text-xl font-bold">
                Action Log Details
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Log ID: {selectedLog.id || selectedLog._id || 'N/A'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Admin / Performer ID</span>
                    <span className="font-mono text-xs font-semibold">{selectedLog.adminName || selectedLog.adminId || 'System'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Date & Time</span>
                    <span className="font-medium">{selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Target Type & ID</span>
                    <span className="font-medium capitalize">{selectedLog.targetType || 'N/A'}</span>
                    <span className="font-mono text-xs block text-slate-500 truncate">{selectedLog.targetId || selectedLog.target || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">IP Address</span>
                    <span className="font-mono text-xs">{selectedLog.ipAddress || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* User Agent */}
              {selectedLog.userAgent && (
                <div className="text-xs text-muted-foreground bg-slate-50 p-2.5 rounded border border-slate-100 font-mono break-all">
                  <span className="font-semibold text-slate-700 block mb-0.5">User Agent:</span>
                  {selectedLog.userAgent}
                </div>
              )}

              {/* Reason / Description */}
              {(selectedLog.reason || selectedLog.description || selectedLog.notes) && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg text-amber-900 text-sm flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-xs text-amber-700">Reason / Notes:</span>
                    <p className="mt-0.5 leading-relaxed">{selectedLog.reason || selectedLog.description || selectedLog.notes}</p>
                  </div>
                </div>
              )}

              {/* Previous State */}
              {selectedLog.previousState && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    Target Previous State (Before Action)
                  </h4>
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-xs font-mono max-h-60">
                    <pre>{JSON.stringify(selectedLog.previousState, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* New State */}
              {selectedLog.newState && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    Target New State (After Action)
                  </h4>
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-xs font-mono max-h-60">
                    <pre>{JSON.stringify(selectedLog.newState, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedLog.metadata && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    Metadata
                  </h4>
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-xs font-mono max-h-60">
                    <pre>{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
