import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShieldCheck, Upload, Zap, FileCheck, CheckCircle2 } from 'lucide-react';
import { verificationAPI } from '@/lib/api';
import { toast } from 'sonner';
import { VerifyProfileButton } from '@/components/verification/VerifyProfileButton';

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
      const formData = new FormData();
      formData.append('document', document);
      formData.append('documentType', verificationType);
      formData.append('notes', notes);

      const response = await verificationAPI.submit(formData);
      
      if (response.data.success) {
        toast.success('Verification request submitted successfully!');
        setVerificationType('');
        setDocument(null);
        setNotes('');
      } else {
        throw new Error(response.data.message || 'Failed to submit verification request.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to submit verification request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="px-3 py-1 text-sm border-primary/30 text-primary bg-primary/5 mb-2">
            <ShieldCheck className="w-4 h-4 mr-1.5 inline-block" /> Account Verification
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Get Verified on CastGlo</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Verified accounts gain higher trust, exclusive casting opportunities, and enhanced profile visibility across the platform.
          </p>
        </div>

        {/* Primary Method: Instant Didit Identity Verification */}
        <Card className="border-2 border-primary/20 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 fill-current" /> Recommended & Instant
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="w-5 h-5 text-primary" />
              Instant Identity Verification (Didit SDK)
            </CardTitle>
            <CardDescription>
              Verify your identity instantly using your camera/selfie and official photo ID via Didit Protocol.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/40 rounded-xl p-4 border space-y-2 text-sm">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Secure biometric selfie matching
              </div>
              <div className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Automated real-time verification processing
              </div>
              <div className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant verification badge on approval
              </div>
            </div>

            <div className="pt-2">
              <VerifyProfileButton
                size="lg"
                className="w-full bg-[#009698] hover:bg-[#009698]/90 text-white font-semibold py-6 text-base shadow-sm"
              >
                <Zap className="w-5 h-5 mr-2" /> Start Instant Didit Verification
              </VerifyProfileButton>
            </div>
          </CardContent>
        </Card>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-muted"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            Or Submit Documents Manually
          </span>
          <div className="flex-grow border-t border-muted"></div>
        </div>

        {/* Secondary Method: Manual Document Submission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-muted-foreground" />
              Manual Document Upload
            </CardTitle>
            <CardDescription>
              Upload documents (Passport, Union Card, Business Reg) for manual review by our verification team (takes 24-48 hours).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="font-medium text-sm">Verification Type</label>
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
              <label className="font-medium text-sm">Upload Document</label>
              <div className="flex items-center gap-4">
                <Input id="document-upload" type="file" className="hidden" onChange={handleFileChange} />
                <label htmlFor="document-upload" className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {document ? document.name : 'Click to upload your document'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-sm">Notes (Optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant notes for the verification team..."
                rows={3}
              />
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting} variant="outline" className="w-full">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Manual Documents
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
