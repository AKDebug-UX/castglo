import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminLeadsAPI } from '@/lib/api';

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await adminLeadsAPI.getAll();
      if (response.data?.success) {
        setLeads(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch leads');
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConvert = async (id: string) => {
    try {
      const response = await adminLeadsAPI.convert(id);
      if (response.data?.success) {
        toast.success('Lead successfully converted');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to convert lead');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      const response = await adminLeadsAPI.delete(id);
      if (response.data?.success) {
        toast.success('Lead deleted');
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete lead');
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
        <h1 className="text-2xl font-bold">Leads Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No leads found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead: any) => (
                  <TableRow key={lead._id || lead.id}>
                    <TableCell className="font-medium">{lead.name || 'N/A'}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.source || 'Direct'}</TableCell>
                    <TableCell>
                      <Badge variant={lead.status === 'converted' ? 'default' : 'secondary'}>
                        {lead.status || 'New'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="flex gap-2">
                      {lead.status !== 'converted' && (
                        <Button variant="ghost" size="icon" onClick={() => handleConvert(lead._id || lead.id)} title="Convert to User">
                          <UserCheck className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(lead._id || lead.id)} title="Delete Lead">
                        <Trash2 className="w-4 h-4 text-red-600" />
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
