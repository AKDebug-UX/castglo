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
  {
    id: 4,
    name: "New Talent",
    role: "Actor • Professional",
    image: talentMichael,
    about: "Professional talent with extensive experience in the industry.",
    experience: "5+ years • Professional",
    location: "New York, NY",
    roles: "Actor, Commercial, Voiceover",
    equipment: "Home Studio, Professional Mic",
    software: ["Adobe Audition", "Pro Tools"],
    credits: ["Major Commercial Campaign", "Lead in Indie Film"],
    representation: {
      agency: "Lost Child Entertainment",
      email: "gerard@lostchildent.com",
      location: "New York, NY"
    },
    unionStatus: "Nonunion",
    documents: {
      hasDriversLicense: true,
      hasPassport: true
    }
  },
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
                  {talent.about || "Hey My name is Jataun Gilbert and I am a Full Service Production, I am a Emmy award winning Editor, colorist, Sound Design and Scorer. I do Graphic Design as well. In regards to Being on set I have done a lot of DP work I have my own Cinema Camera, Easy Rig, Lenses and Lights. I have also done Sound as well and have my own sound Equipment. I have won Some awards as a Director, I have also been an Assistant Director. I pride myself on being able to get the job done in the absolute best way possible!"}
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-xs text-muted-foreground">Experience</div>
                    <div className="text-sm">{talent.experience || "3–6 years • Experienced"}</div>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="text-sm">{talent.location || "Los Angeles, CA"}</div>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-xs text-muted-foreground">Roles</div>
                    <div className="text-sm">
                      {talent.roles || "Audio (Sound & Music), Sound Operator / Engineer, Dubbing Editor / Mixer, Composer, Sound Assistant, Sound Designer"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="text-xs text-muted-foreground">Equipment</div>
                    <div className="text-sm">
                      {talent.equipment || "Cinema Camera, Easy Rig, Lenses, Lights, Zoom H6 Recorder, Sound Equipment"}
                    </div>
                  </div>
                </div>

                {talent.representation && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Representation
                    </h3>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg bg-muted p-4">
                        <div className="text-xs text-muted-foreground">Agency</div>
                        <div className="text-sm font-medium">{talent.representation.agency}</div>
                      </div>
                      <div className="rounded-lg bg-muted p-4">
                        <div className="text-xs text-muted-foreground">Contact</div>
                        <div className="text-sm">{talent.representation.email}</div>
                        <div className="text-xs text-muted-foreground">{talent.representation.location}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 border-t pt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Union Membership
                    </h3>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-sm py-1 px-3">
                        {talent.unionStatus || "Nonunion"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Legal Documents
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {talent.documents?.hasDriversLicense && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-none">
                          Driver's License
                        </Badge>
                      )}
                      {talent.documents?.hasPassport && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-none">
                          Passport
                        </Badge>
                      )}
                      {!talent.documents && (
                        <span className="text-sm text-muted-foreground italic">None specified</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t pt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Software & Programs
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(talent.software || ["Adobe Premiere Pro", "Adobe After Effects", "Zoom Recorders"]).map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Selected Credits
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {(talent.credits || [
                      "Emmy Award-Winning Editor",
                      "Award-Winning Director",
                      "Assistant Director",
                      "DP / Camera Operator",
                      "Production Sound Mixer"
                    ]).map((credit, index) => (
                      <li key={index}>{credit}</li>
                    ))}
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
