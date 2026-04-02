import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Star, Briefcase, Mail, ShieldCheck, Globe, Instagram, Linkedin, Building2, Calendar } from "lucide-react";
import { profileAPI } from "@/lib/api";
import { toast } from "sonner";
import { formatLocation, getAvatarUrl } from "@/lib/utils";

export default function ProfessionalPublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const response = await profileAPI.getOne(id);
        if (response.data.success) {
          setProfile(response.data.data);
        }
      } catch (error) {
        toast.error("Failed to load professional profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F1FBFB]">
        <section className="container py-8">
          {!profile ? (
            <div className="rounded-xl bg-card p-6 shadow-card text-center max-w-md mx-auto mt-12 border">
              <h1 className="text-xl font-semibold">Profile not found</h1>
              <p className="mt-2 text-sm text-muted-foreground">Please check the link and try again.</p>
              <Button className="mt-6" variant="outline" asChild>
                <Link to="/browse-talent">Back to Browse</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-[320px,1fr]">
              {/* Profile Sidebar */}
              <div className="space-y-6">
                <div className="rounded-2xl bg-card overflow-hidden shadow-card border">
                  <img 
                    src={profile.userId?.profilePicture || getAvatarUrl(profile.userId?.fullName)} 
                    alt={profile.userId?.fullName} 
                    className="w-full aspect-square object-cover" 
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-1">
                       <h1 className="text-2xl font-bold">{profile.userId?.fullName}</h1>
                       {profile.isVerified && <ShieldCheck className="w-5 h-5 text-success" />}
                    </div>
                    <p className="text-sm text-primary font-medium capitalize mt-1">
                      {profile.professionalCategory?.replace(/_/g, ' ') || profile.professionalRoles?.join(" • ") || "Industry Professional"}
                    </p>
                    <div className="flex items-center gap-1 text-sm mt-3">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="font-medium">{profile.rating || "0.0"}</span>
                      <span className="text-muted-foreground">({profile.reviewCount || 0} reviews)</span>
                    </div>
                    
                    <div className="mt-6 flex flex-col gap-2">
                      <Button variant="hero" className="w-full" asChild>
                        <Link to={`/professional/messages?recipientId=${profile.userId?._id}`}>Message Professional</Link>
                      </Button>
                      <Button variant="outline" className="w-full">Book Service</Button>
                    </div>
                  </div>
                </div>

                {/* Additional Sidebar Info */}
                <Card className="rounded-2xl shadow-card border">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{formatLocation(profile.location) || "Remote / Worldwide"}</span>
                    </div>
                    
                    {profile.companyName && (
                      <div className="flex items-center gap-3 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{profile.companyName}</span>
                      </div>
                    )}

                    {profile.experienceYears && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{profile.experienceYears} Years in Industry</span>
                      </div>
                    )}

                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Online Presence</h4>
                      
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-primary hover:underline">
                          <Globe className="w-4 h-4" />
                          <span className="truncate">{profile.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      )}

                      {profile.instagram && (
                        <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                          <Instagram className="w-4 h-4" />
                          <span>@{profile.instagram.replace('@', '')}</span>
                        </a>
                      )}

                      {profile.linkedin && (
                        <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                          <Linkedin className="w-4 h-4" />
                          <span>LinkedIn Profile</span>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Main Content */}
              <div className="space-y-6">
                <div className="rounded-2xl bg-card p-8 shadow-card border">
                  <h2 className="font-bold text-xl mb-4">About</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {profile.bio || "No biography provided."}
                  </p>
                  
                  <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-muted/50 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expertise</span>
                      </div>
                      <div className="text-sm font-medium">{profile.professionalCategory?.replace(/_/g, ' ') || "Professional Service"}</div>
                    </div>
                    
                    <div className="rounded-xl bg-muted/50 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {profile.skills?.map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-white text-[10px]">{skill}</Badge>
                        )) || <span className="text-sm text-muted-foreground">None specified</span>}
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Gallery */}
                  {profile.headshots && profile.headshots.length > 0 && (
                    <div className="mt-10 border-t pt-8">
                      <h3 className="font-bold text-xl mb-6">Work Portfolio</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {profile.headshots.map((shot) => (
                          <div key={shot._id} className="aspect-square rounded-xl overflow-hidden border bg-muted">
                            <img src={shot.url} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Portfolio" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specialties Section */}
                  {profile.specialties && profile.specialties.length > 0 && (
                    <div className="mt-10 border-t pt-8">
                      <h3 className="font-bold text-xl mb-4">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.specialties.map((spec) => (
                          <div key={spec} className="px-4 py-2 rounded-full bg-primary/5 border border-primary/20 text-primary text-sm font-medium">
                            {spec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
