import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
                  Hey My name is Jataun Gilbert and I am a Full Service Production, I am a Emmy award winning Editor, colorist, Sound Design and Scorer. I do Graphic Design as well. In regards to Being on set I have done a lot of DP work I have my own Cinema Camera, Easy Rig, Lenses and Lights. I have also done Sound as well and have my own sound Equipment. I have won Some awards as a Director, I have also been an Assistant Director. I pride myself on being able to get the job done in the absolute best way possible!
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-xs text-muted-foreground">Experience</div>
                    <div className="text-sm">3–6 years • Experienced</div>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="text-sm">Los Angeles, CA</div>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-xs text-muted-foreground">Roles</div>
                    <div className="text-sm">
                      Audio (Sound & Music), Sound Operator / Engineer, Dubbing Editor / Mixer, Composer, Sound Assistant, Sound Designer
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-xs text-muted-foreground">Equipment</div>
                    <div className="text-sm">
                      Cinema Camera, Easy Rig, Lenses, Lights, Zoom H6 Recorder, Sound Equipment
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Software & Programs
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Adobe Premiere Pro", "Adobe After Effects", "Zoom Recorders"].map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Selected Credits
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>Emmy Award-Winning Editor</li>
                    <li>Award-Winning Director</li>
                    <li>Assistant Director</li>
                    <li>DP / Camera Operator</li>
                    <li>Production Sound Mixer</li>
                  </ul>
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
