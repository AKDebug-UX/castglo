import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShieldCheck, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function VerificationProcess() {
  const [verificationType, setVerificationType] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocument(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!verificationType || !document) {
      toast.error('Please select a verification type and upload a document.');
      return;
    }

    setIsSubmitting(true);
    try {
      // This is a placeholder for the actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Submitting verification request:', { verificationType, document, notes });
      toast.success('Verification request submitted successfully!');
      // Reset form
      setVerificationType('');
      setDocument(null);
      setNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit verification request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Account Verification Process
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Submit your documents to get your account verified. Verified accounts gain more trust and visibility.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="font-medium">Verification Type</label>
              <Select value={verificationType} onValueChange={setVerificationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select verification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="identity">Identity Verification (Passport, Driver's License)</SelectItem>
                  <SelectItem value="professional">Professional Verification (Union Card, Guild Membership)</SelectItem>
                  <SelectItem value="company">Company Verification (Business Registration Documents)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="font-medium">Upload Document</label>
              <div className="flex items-center gap-4">
                <Input id="document-upload" type="file" className="hidden" onChange={handleFileChange} />
                <label htmlFor="document-upload" className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {document ? document.name : 'Click to upload your document'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium">Notes (Optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant notes for the verification team..."
                rows={3}
              />
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-[#009698] hover:bg-[#009698]/90">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit for Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
