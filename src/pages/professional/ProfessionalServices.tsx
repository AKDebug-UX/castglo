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
  Loader2,
  Users,
  Target,
  Layers,
  CheckCircle2,
  Info
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { serviceAPI, uploadAPI } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfessionalServices() {
  const { user, formatPrice } = useAuth();
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    pricing_model: "fixed",
    price: "",
    duration: "",
    target_clients: [] as string[],
    industry_areas: [] as string[],
    availability_type: "project_based",
    working_days: ["mon", "tue", "wed", "thu", "fri"] as string[],
    lead_time: "1_week",
  });
  const [editingService, setEditingService] = useState<any | null>(null);
  const [viewingService, setViewingService] = useState<any | null>(null);

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      pricing_model: "fixed",
      price: "",
      duration: "",
      target_clients: [],
      industry_areas: [],
      availability_type: "project_based",
      working_days: ["mon", "tue", "wed", "thu", "fri"],
      lead_time: "1_week",
    });
    setSelectedImage(null);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      title: service.serviceTitle || service.title || "",
      description: service.serviceShortDescription || service.description || "",
      category: service.serviceCategory || service.category || "",
      pricing_model: service.pricing_model || "fixed",
      price: service.priceAmount !== undefined ? String(service.priceAmount) : service.price !== undefined ? String(service.price) : "",
      duration: service.duration !== undefined ? String(service.duration) : "",
      target_clients: service.target_clients || [],
      industry_areas: service.industry_areas || [],
      availability_type: service.availability_type || "project_based",
      working_days: service.working_days || ["mon", "tue", "wed", "thu", "fri"],
      lead_time: service.lead_time || "1_week",
    });
    setSelectedImage(service.image || null);
    setImageFile(null);
    setIsDialogOpen(true);
  };

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
          { label: "Avg. Price", value: formatPrice(s.averagePrice || 0), change: "Per service", icon: DollarSign },
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
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitService = async () => {
    if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.duration) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = selectedImage && !selectedImage.startsWith('data:') ? selectedImage : undefined;
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("image", imageFile);
        const uploadRes = await uploadAPI.uploadImage(uploadFormData);
        imageUrl = uploadRes.data?.data?.url || uploadRes.data?.url;
      }

      const payload = {
        ...formData,
        serviceTitle: formData.title,
        serviceShortDescription: formData.description,
        serviceCategory: formData.category,
        price: Number(formData.price),
        image: imageUrl || undefined,
      };

      let response;
      if (editingService) {
        response = await serviceAPI.update(editingService._id || editingService.id, payload);
      } else {
        response = await serviceAPI.create(payload);
      }

      if (response.data.success) {
        toast.success(editingService ? "Service updated successfully!" : "Service created successfully!");
        setIsDialogOpen(false);
        setFormData({
          title: "",
          description: "",
          category: "",
          pricing_model: "fixed",
          price: "",
          duration: "",
          target_clients: [],
          industry_areas: [],
          availability_type: "project_based",
          working_days: ["mon", "tue", "wed", "thu", "fri"],
          lead_time: "1_week",
        });
        setSelectedImage(null);
        setImageFile(null);
        setEditingService(null);
        fetchServices();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${editingService ? "update" : "create"} service`);
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
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingService(null);
            }
          }}>
            <Button className="rounded-xl font-bold" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Service
            </Button>
            <DialogContent className="max-w-2xl h-[600px] rounded-[32px] border-none shadow-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{editingService ? "Edit Service" : "Create New Service"}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {editingService ? "Update your professional service details" : "Add a new service to your professional portfolio"}
                </p>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Service Title</Label>
                      <Input 
                        placeholder="e.g. Professional Headshot Session" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Service Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(v) => setFormData({...formData, category: v})}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="photography">Photography</SelectItem>
                          <SelectItem value="makeup">Makeup & Hair</SelectItem>
                          <SelectItem value="coaching">Acting/Voice Coaching</SelectItem>
                          <SelectItem value="editing">Video Editing</SelectItem>
                          <SelectItem value="styling">Fashion Styling</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold">Service Description</Label>
                    <Textarea 
                      rows={3} 
                      placeholder="Describe your service in detail..." 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="rounded-xl resize-none"
                    />
                  </div>

                  <Separator className="my-2" />

                  {/* Pricing & Duration */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#009698]" /> 
                        Pricing Model
                      </Label>
                      <Select 
                        value={formData.pricing_model} 
                        onValueChange={(v) => setFormData({...formData, pricing_model: v})}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Price</SelectItem>
                          <SelectItem value="hourly">Hourly Rate</SelectItem>
                          <SelectItem value="daily">Daily Rate</SelectItem>
                          <SelectItem value="starting_from">Starting From</SelectItem>
                          <SelectItem value="package">Package Price</SelectItem>
                          <SelectItem value="quote">Custom Quote</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-bold">
                        {formData.pricing_model === 'quote' ? 'Currency Preference' : 'Price'}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">{formatPrice(0).replace(/[0-9.]/g, '')}</span>
                        <Input 
                          placeholder={formData.pricing_model === 'quote' ? 'GBP' : '0.00'}
                          type={formData.pricing_model === 'quote' ? 'text' : 'number'}
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="rounded-xl pl-7"
                          disabled={formData.pricing_model === 'quote'}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#009698]" /> 
                        Duration (Minutes)
                      </Label>
                      <Input 
                        type="number"
                        placeholder="e.g. 60" 
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-bold">
                        Availability Type
                      </Label>
                      <Select 
                        value={formData.availability_type} 
                        onValueChange={(v) => setFormData({...formData, availability_type: v})}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="project_based">Project Based</SelectItem>
                          <SelectItem value="retainer">Retainer</SelectItem>
                          <SelectItem value="one_time">One Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#009698]" /> Target Clients
                    </Label>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-muted/20 rounded-2xl border">
                      {['Talent', 'Brands', 'Agencies', 'Events', 'Individuals'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox 
                             id={`target-${type}`} 
                             checked={formData.target_clients.includes(type.toLowerCase())}
                             onCheckedChange={(checked) => {
                               const val = type.toLowerCase();
                               setFormData(p => ({
                                 ...p,
                                 target_clients: checked 
                                   ? [...p.target_clients, val]
                                   : p.target_clients.filter(v => v !== val)
                               }));
                             }}
                          />
                          <label htmlFor={`target-${type}`} className="text-xs font-medium cursor-pointer">{type}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-2" />

                  {/* Availability */}
                  <div className="space-y-4">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#009698]" /> Work Availability
                    </Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Booking Lead Time</Label>
                        <Select 
                          value={formData.lead_time} 
                          onValueChange={(v) => setFormData({...formData, lead_time: v})}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instant">Instant Booking</SelectItem>
                            <SelectItem value="24_hours">24 Hours Notice</SelectItem>
                            <SelectItem value="1_week">1 Week Notice</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                         <Label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Working Days</Label>
                         <div className="flex flex-wrap gap-1.5">
                           {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                             const dayVal = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][i];
                             const active = formData.working_days.includes(dayVal);
                             return (
                               <button
                                 key={i}
                                 type="button"
                                 onClick={() => {
                                   setFormData(p => ({
                                     ...p,
                                     working_days: active 
                                       ? p.working_days.filter(d => d !== dayVal)
                                       : [...p.working_days, dayVal]
                                   }));
                                 }}
                                 className={`w-8 h-8 rounded-full text-[10px] font-bold transition-all ${
                                   active ? 'bg-[#009698] text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                 }`}
                               >
                                 {day}
                               </button>
                             );
                           })}
                         </div>
                      </div>
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
                  setEditingService(null);
                }}>Cancel</Button>
                <Button 
                  className="rounded-xl px-8 font-bold bg-[#009698] hover:bg-[#009698]/90" 
                  onClick={handleSubmitService}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingService ? (
                    "Save Changes"
                  ) : (
                    "Create Service"
                  )}
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
                        <h3 className="text-xl font-bold text-slate-900">{service.serviceTitle || service.title}</h3>
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900"
                          onClick={() => handleOpenEdit(service)}
                        >
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
                      {service.serviceShortDescription || service.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-2xl font-black text-slate-900">{formatPrice(service.priceAmount)}</p>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider mt-0.5">
                          <Clock className="w-3 h-3" />
                          {service.duration || 'Flexible'}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full px-6 font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                        onClick={() => setViewingService(service)}
                      >
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

      {/* View Details Dialog */}
      <Dialog open={!!viewingService} onOpenChange={(open) => !open && setViewingService(null)}>
        <DialogContent className="max-w-2xl rounded-[32px] border-none shadow-2xl overflow-y-auto max-h-[90vh] p-6">
          {viewingService && (
            <div className="space-y-6">
              <DialogHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-[#DEFCFE] text-[#009698] hover:bg-[#DEFCFE] border-none px-3 py-0.5 rounded-full text-xs font-bold uppercase">
                    {viewingService.serviceCategory || viewingService.category || 'General'}
                  </Badge>
                  <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none px-3 py-0.5 rounded-full text-xs font-bold uppercase">
                    {viewingService.status || 'Active'}
                  </Badge>
                </div>
                <DialogTitle className="text-3xl font-black text-slate-900 leading-tight">
                  {viewingService.serviceTitle || viewingService.title}
                </DialogTitle>
              </DialogHeader>

              {viewingService.image && (
                <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-md">
                  <img 
                    src={viewingService.image} 
                    alt={viewingService.serviceTitle || viewingService.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Description</h4>
                  <p className="text-slate-700 mt-1.5 leading-relaxed whitespace-pre-wrap">
                    {viewingService.serviceShortDescription || viewingService.description}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pricing Model</p>
                    <p className="text-sm font-black text-slate-900 mt-1 capitalize">
                      {(viewingService.pricing_model || 'fixed').replace('_', ' ')}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price</p>
                    <p className="text-sm font-black text-[#009698] mt-1">
                      {formatPrice(viewingService.priceAmount)}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                    <p className="text-sm font-black text-slate-900 mt-1 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {viewingService.duration ? `${viewingService.duration} mins` : 'Flexible'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Availability</p>
                    <p className="text-sm font-black text-slate-900 mt-1 capitalize">
                      {(viewingService.availability_type || 'project_based').replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-[#009698]" />
                      Target Clients
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingService.target_clients && viewingService.target_clients.length > 0 ? (
                        viewingService.target_clients.map((client: string) => (
                          <Badge key={client} className="bg-white border border-slate-200 text-slate-600 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize">
                            {client}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">All clients</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#009698]" />
                      Lead Time
                    </p>
                    <p className="text-sm font-bold text-slate-900 capitalize">
                      {(viewingService.lead_time || '1_week').replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {viewingService.working_days && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Working Days</p>
                    <div className="flex flex-wrap gap-2">
                      {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
                        const isActive = viewingService.working_days.includes(day);
                        return (
                          <div 
                            key={day} 
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase transition-colors ${
                              isActive ? 'bg-[#009698] text-white font-bold' : 'bg-white border border-slate-200 text-slate-400'
                            }`}
                          >
                            {day.slice(0, 2)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4 gap-2 flex justify-end">
                <Button 
                  variant="outline" 
                  className="rounded-xl px-6" 
                  onClick={() => setViewingService(null)}
                >
                  Close
                </Button>
                <Button 
                  className="rounded-xl px-6 bg-[#009698] hover:bg-[#009698]/90 text-white font-bold"
                  onClick={() => {
                    const svc = viewingService;
                    setViewingService(null);
                    handleOpenEdit(svc);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Service
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
