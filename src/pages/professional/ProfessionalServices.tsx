import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { 
  Briefcase, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Eye,
  Image as ImageIcon,
  Upload,
  Loader2
} from "lucide-react";
import { serviceAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfessionalServices() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
  });

  const fetchServices = async () => {
    try {
      const [servicesRes, statsRes] = await Promise.all([
        serviceAPI.getMyServices(),
        serviceAPI.getStats()
      ]);

      if (servicesRes.data.success) {
        setServices(servicesRes.data.data || []);
      }
      if (statsRes.data.success) {
        const s = statsRes.data.data;
        setStats([
          { label: "Active Services", value: s.activeServices || "0", change: "Services listed", icon: Briefcase },
          { label: "Total Bookings", value: s.totalBookings || "0", change: "All time", icon: Calendar },
          { label: "Avg. Price", value: `$${s.averagePrice || "0"}`, change: "Per service", icon: DollarSign },
          { label: "Completed Bookings", value: `${s.completedBookings || "0"}`, change: "All time", icon: TrendingUp },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
      toast.error("Could not load your services");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateService = async () => {
    if (!formData.title || !formData.description || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await serviceAPI.create({
        ...formData,
        price: Number(formData.price),
        image: selectedImage // Backend should handle base64 or you might need FormData
      });

      if (response.data.success) {
        toast.success("Service created successfully!");
        setIsDialogOpen(false);
        setFormData({ title: "", description: "", price: "", duration: "" });
        setSelectedImage(null);
        fetchServices();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const response = await serviceAPI.delete(id);
      if (response.data.success) {
        toast.success("Service deleted");
        fetchServices();
      }
    } catch (error) {
      toast.error("Failed to delete service");
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.fullName?.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Manage your professional service offerings</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className="icon-circle-primary w-10 h-10">
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Professional Services</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Add New Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[600px] rounded-[32px] border-none shadow-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Create New Service</DialogTitle>
                <p className="text-sm text-muted-foreground">Add a new service to your professional portfolio</p>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Service Title</label>
                    <Input 
                      placeholder="e.g., Professional Headshot Session" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Description</label>
                    <Textarea 
                      rows={3} 
                      placeholder="Describe your service in detail..." 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-1.5 block">Price (£)</label>
                      <Input 
                        placeholder="250" 
                        type="number" 
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-1.5 block">Duration</label>
                      <Input 
                        placeholder="e.g., 2 hours" 
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 block">Service Image / Portfolio Work</label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-8 hover:bg-slate-50 transition-colors cursor-pointer relative group">
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                    {selectedImage ? (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                        <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                          <ImageIcon className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-600">Click or drag to upload an image</p>
                        <p className="text-xs text-slate-400 mt-1 text-center">Showcase your previous work or a service gig image</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" className="rounded-xl px-8" onClick={() => {
                  setIsDialogOpen(false);
                  setSelectedImage(null);
                }}>Cancel</Button>
                <Button 
                  className="rounded-xl px-8 font-bold bg-[#009698] hover:bg-[#009698]/90" 
                  onClick={handleCreateService}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Service"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No services listed yet.</p>
              <Button variant="link" className="text-[#009698]" onClick={() => setIsDialogOpen(true)}>Create your first service</Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {services.map((service) => (
                <Card key={service._id || service.id} className="relative group overflow-hidden border-none shadow-xl rounded-[32px] transition-all hover:scale-[1.01]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-[#DEFCFE] text-[#009698] hover:bg-[#DEFCFE] border-none px-3 py-0.5 rounded-full text-xs font-bold">
                            {service.status || 'Active'}
                          </Badge>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {service.bookingsCount || 0} bookings
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500"
                          onClick={() => handleDeleteService(service._id || service.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-6">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-2xl font-black text-slate-900">£{service.price}</p>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider mt-0.5">
                          <Clock className="w-3 h-3" />
                          {service.duration || 'Flexible'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full px-6 font-bold border-slate-200 text-slate-600 hover:bg-slate-50">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
