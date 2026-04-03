import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Star, Briefcase, Mail, ShieldCheck, Instagram, Youtube, Globe, User, Languages as LangIcon, Ruler, Weight, Eye as EyeIcon, Palette, BriefcaseIcon, BadgeCheck } from "lucide-react";
import { profileAPI } from "@/lib/api";
import { toast } from "sonner";
import { formatLocation } from "@/lib/utils";
import { BookingDialog } from "@/components/BookingDialog";

export default function TalentProfile() {
  const { id } = useParams();
  const [talent, setTalent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchTalent = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const response = await profileAPI.getOne(id);
        if (response.data.success) {
          setTalent(response.data.data);
        }
      } catch (error) {
        toast.error("Failed to load talent profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTalent();
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
          {!talent ? (
            <div className="rounded-xl bg-card p-6 shadow-card text-center max-w-md mx-auto mt-12">
              <h1 className="text-xl font-semibold">Talent not found</h1>
              <p className="mt-2 text-sm text-muted-foreground">Please go back and select a profile again.</p>
              <Button className="mt-6" variant="outline" asChild>
                <Link to="/browse-talent">Back to Browse</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-[320px,1fr]">
              {/* Profile Sidebar */}
              <div className="space-y-6">
                <div className="rounded-2xl bg-card overflow-hidden shadow-card">
                  <img 
                    src={talent.talent.headshots[0].url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"} 
                    alt={talent.userId?.fullName} 
                    className="w-full aspect-square object-cover" 
                  />
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">{talent.userId?.fullName}</h1>
                    <p className="text-sm text-primary font-medium capitalize mt-1">
                      {talent.professionalRoles?.join(" • ") || talent.userRole}
                    </p>
                    <div className="flex items-center gap-1 text-sm mt-3">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="font-medium">{talent.rating || "0.0"}</span>
                      <span className="text-muted-foreground">({talent.reviewCount || 0} reviews)</span>
                    </div>

                    {/* Social Media Links */}
                    <div className="flex gap-3 mt-4">
                      {talent.instagramUrl && (
                        <a href={talent.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors">
                          <Instagram className="w-4 h-4 text-primary" />
                        </a>
                      )}
                      {talent.tiktokUrl && (
                        <a href={talent.tiktokUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors">
                          <div className="w-4 h-4 flex items-center justify-center font-bold text-[10px]">TT</div>
                        </a>
                      )}
                      {talent.youtubeUrl && (
                        <a href={talent.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-secondary/10 rounded-full hover:bg-secondary/20 transition-colors">
                          <Youtube className="w-4 h-4 text-primary" />
                        </a>
                      )}
                    </div>
                    <div className="mt-6 flex flex-col gap-2">
                      <Button variant="hero" className="w-full" onClick={() => setIsBookingOpen(true)}>Book Talent</Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/browse-talent">Back to Browse</Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Booking Dialog */}
                {talent && (
                  <BookingDialog 
                    isOpen={isBookingOpen} 
                    onOpenChange={setIsBookingOpen} 
                    talent={talent} 
                  />
                )}

                {/* Additional Sidebar Info */}
                <Card className="rounded-2xl shadow-card">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{formatLocation(talent.location) || "Remote / Worldwide"}</span>
                    </div>
                    {talent.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{talent.email}</span>
                      </div>
                    )}
                    {talent.isVerified && (
                      <div className="flex items-center gap-3 text-sm text-success">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="font-medium">Verified Profile</span>
                      </div>
                    )}
                    {talent.nationality && (
                      <div className="flex items-center gap-3 text-sm pt-2 border-t mt-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="capitalize">{talent.nationality}</span>
                      </div>
                    )}
                    {talent.unionStatus && (
                      <div className="flex items-center gap-3 text-sm mt-2">
                        <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="capitalize">{talent.unionStatus}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Profile Main Content */}
              <div className="space-y-6">
                <div className="rounded-2xl bg-card p-8 shadow-card">
                  <h2 className="font-bold text-xl mb-4">About</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {talent.bio || "No biography provided."}
                  </p>
                  
                  {talent.highlights && (
                    <div className="mt-8">
                      <h3 className="font-semibold text-lg mb-3">Career Highlights</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{talent.highlights}</p>
                    </div>
                  )}

                  {talent.careerGoals && (
                    <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Career Goals
                      </h3>
                      <p className="text-muted-foreground text-sm italic">"{talent.careerGoals}"</p>
                    </div>
                  )}

                  <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-muted/50 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience</span>
                      </div>
                      <div className="text-sm font-medium">{talent.experience || "Not specified"}</div>
                    </div>
                    
                    <div className="rounded-xl bg-muted/50 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {talent.skills?.map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-white text-[10px]">{skill}</Badge>
                        )) || <span className="text-sm text-muted-foreground">None specified</span>}
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Gallery */}
                  {talent.talent.headshots && talent.talent.headshots.length > 0 && (
                    <div className="mt-10 border-t pt-8">
                      <h3 className="font-bold text-xl mb-6">Portfolio</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {talent.talent.headshots.map((shot) => (
                          <div key={shot._id} className="aspect-square rounded-xl overflow-hidden border bg-muted">
                            <img src={shot.url} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Portfolio" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Physical Attributes */}
                  {talent.physicalAttributes && (
                    <div className="mt-10 border-t pt-8">
                      <h3 className="font-bold text-xl mb-6">Physical Attributes</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {Object.entries(talent.physicalAttributes).map(([key, value]: [string, any]) => (
                          value && (
                            <div key={key}>
                              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                              <div className="text-sm font-semibold">{value}</div>
                            </div>
                          )
                        ))}
                        {talent.gender && (
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Gender Identity</div>
                            <div className="text-sm font-semibold capitalize">{talent.gender}</div>
                          </div>
                        )}
                        {talent.ethnicity && (
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Ethnicity</div>
                            <div className="text-sm font-semibold capitalize">{talent.ethnicity}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Specialized Fields Render */}
                  {talent.specialties && Object.keys(talent.specialties).length > 0 && (
                    <div className="mt-10 border-t pt-8">
                      <h3 className="font-bold text-xl mb-6">Specialized Details</h3>
                      <div className="grid gap-6">
                        {talent.specialties.actor && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">Acting Credentials</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {talent.specialties.actor.training && <div><span className="text-muted-foreground block">Training</span>{talent.specialties.actor.training}</div>}
                              {talent.specialties.actor.techniques && <div><span className="text-muted-foreground block">Techniques</span>{talent.specialties.actor.techniques}</div>}
                              {talent.specialties.actor.accents && <div><span className="text-muted-foreground block">Accents</span>{talent.specialties.actor.accents}</div>}
                              {talent.specialties.actor.monologueLink && (
                                <a href={talent.specialties.actor.monologueLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 font-medium">Watch Monologue <BadgeCheck className="w-3 h-3" /></a>
                              )}
                            </div>
                          </div>
                        )}
                        {talent.specialties.model && (
                          <div className="space-y-3 pt-4 border-t border-dashed">
                            <h4 className="text-sm font-bold text-primary">Modeling Specifications</h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              {talent.specialties.model.categories && <div><span className="text-muted-foreground block">Categories</span>{talent.specialties.model.categories}</div>}
                              {talent.specialties.model.measurements && <div><span className="text-muted-foreground block">Measurements</span>{talent.specialties.model.measurements}</div>}
                              {talent.specialties.model.shoeSize && <div><span className="text-muted-foreground block">Shoe Size</span>{talent.specialties.model.shoeSize}</div>}
                            </div>
                          </div>
                        )}
                        {talent.specialties.singer && (
                          <div className="space-y-3 pt-4 border-t border-dashed">
                            <h4 className="text-sm font-bold text-primary">Musical Talents</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              {talent.specialties.singer.voiceType && <div><span className="text-muted-foreground block">Voice/Instruments</span>{talent.specialties.singer.voiceType}</div>}
                              {talent.specialties.singer.genres && <div><span className="text-muted-foreground block">Genres</span>{talent.specialties.singer.genres}</div>}
                              {talent.specialties.singer.reelLink && (
                                <a href={talent.specialties.singer.reelLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs font-semibold col-span-2">Listen to Vocal Reel</a>
                              )}
                            </div>
                          </div>
                        )}
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
