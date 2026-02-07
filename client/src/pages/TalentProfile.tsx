import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

import talentMichael from "@/assets/talent-michael.jpg";
import talentTom from "@/assets/talent-tom.jpg";
import talentSarah from "@/assets/talent-sarah.jpg";

const allTalents = [
  { id: 1, name: "Michael Chen", role: "Character Actor • Comedy", image: talentMichael },
  { id: 2, name: "Tom Andy", role: "Lead Actor • Drama", image: talentTom },
  { id: 3, name: "Sarah Johnson", role: "Voice Actor • Animation", image: talentSarah },
];

export default function TalentProfile() {
  const params = useParams();
  const id = Number(params.id);
  const talent = useMemo(() => allTalents.find(t => t.id === id), [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F1FBFB]">
        <section className="container py-8">
          {!talent ? (
            <div className="rounded-xl bg-card p-6 shadow-card">
              <h1 className="text-xl font-semibold">Talent not found</h1>
              <p className="mt-2 text-sm text-muted-foreground">Please go back and select a profile again.</p>
              <Button className="mt-4" variant="outline" asChild>
                <Link to="/">Go Home</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-[280px,1fr]">
              <div className="rounded-xl bg-card overflow-hidden shadow-card">
                <img src={talent.image} alt={talent.name} className="w-full h-64 object-cover" />
                <div className="p-4">
                  <h1 className="text-xl font-bold">{talent.name}</h1>
                  <p className="text-sm text-muted-foreground">{talent.role}</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="hero">Book Talent</Button>
                    <Button variant="outline" asChild>
                      <Link to="/browse">Back to Browse</Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-card p-6 shadow-card">
                <h2 className="font-semibold text-lg">About</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  This is a demo public profile. Integrate with your backend to load real data
                  (bio, credits, media, availability, contact) and manage bookings.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-xs text-muted-foreground">Experience</div>
                    <div className="text-sm">5+ years • Film/TV</div>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="text-sm">Los Angeles, CA</div>
                  </div>
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