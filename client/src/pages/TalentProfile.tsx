import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

import talentMichael from "@/assets/talent-michael.jpg";
import talentTom from "@/assets/talent-tom.jpg";
import talentSarah from "@/assets/talent-sarah.jpg";

const allTalents = [
  {
    id: 1,
    name: "Jataun Gilbert",
    role: "Emmy Award-Winning Editor • Colorist • Sound Designer • DP",
    image: talentMichael,
  },
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
                  Jataun Gilbert is a full-service production creative and Emmy award-winning editor
                  with experience across film, television, and voiceover. Their work spans editing,
                  color, sound design, scoring, and graphic design, with a strong focus on telling
                  grounded, emotionally resonant stories and delivering polished final masters.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  On set, Jataun regularly works as a director of photography and camera operator,
                  bringing their own cinema camera, easy rig, lenses, and lighting package. They
                  also operate as a production sound mixer with their own sound equipment, and have
                  earned awards as a director while supporting sets as an assistant director and
                  production team member.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-xs text-muted-foreground">Experience</div>
                    <div className="text-sm">3–6 years • Film, TV, Voiceover</div>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="text-sm">Los Angeles, CA</div>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-xs text-muted-foreground">Departments</div>
                    <div className="text-sm">
                      Post-Production, Camera, Sound, Producing, Directing, Art & Locations
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-xs text-muted-foreground">Equipment</div>
                    <div className="text-sm">
                      Cinema camera, easy rig, lenses, lights, Zoom H6 recorder, sound kit
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Selected Credits
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>Intende Parents – Producer / Editor</li>
                    <li>Down For The Count – Producer / Actor / Casting Director</li>
                    <li>Peace Brother – DP / Editor</li>
                    <li>The Girl in Apartment 15 – Editor / Colorist / Sound Design</li>
                    <li>No Promises – Director / Editor / Sound Design / Colorist</li>
                    <li>Hello E.P. – DP / Producer / Casting Director</li>
                    <li>Manhood Talkshow – Editor / Colorist / Sound Design</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Software & Programs
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Adobe Premiere Pro, Adobe After Effects, Zoom recorders (including Zoom H6).
                  </p>
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
