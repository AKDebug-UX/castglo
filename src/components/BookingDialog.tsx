import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, MapPin, DollarSign, Loader2, CheckCircle2 } from "lucide-react";
import { bookingAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface BookingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  talent: any;
}

export function BookingDialog({ isOpen, onOpenChange, talent }: BookingDialogProps) {
  const { formatPrice } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    location: "",
    amount: "",
    notes: "",
    serviceName: "Professional Session"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.amount) {
      toast.error("Please fill in the required fields");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        talentId: talent.userId?._id || talent.userId?.id || talent._id,
        serviceName: formData.serviceName,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        amount: Number(formData.amount),
        notes: formData.notes,
        status: "Pending"
      };

      const response = await bookingAPI.create(payload);
      if (response.data.success) {
        setIsSuccess(true);
        toast.success("Booking request sent successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold mb-2">Request Sent!</DialogTitle>
          <DialogDescription className="text-muted-foreground mb-6">
            Your booking request for <strong>{talent.userId?.fullName}</strong> has been sent. 
            You'll be notified once they accept or decline the request.
          </DialogDescription>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-[32px] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Book {talent?.userId?.fullName}</DialogTitle>
          <DialogDescription>
            Send a booking request to this talent for a professional session or service.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                Date *
              </label>
              <Input 
                type="date" 
                required 
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Time
              </label>
              <Input 
                type="time" 
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Location
            </label>
            <Input 
              placeholder="e.g., Studio in London, or Remote" 
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Budget / Amount ({formatPrice(0).replace(/[0-9.]/g, '')}) *
            </label>
            <Input 
              type="number" 
              placeholder="e.g., 250" 
              required 
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold">Additional Notes</label>
            <Textarea 
              placeholder="Provide details about the project, role, or requirements..." 
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-xl"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="rounded-xl bg-primary hover:bg-primary/90 min-w-[120px]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
