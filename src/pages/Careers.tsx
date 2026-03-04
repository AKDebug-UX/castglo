import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const roles = [
  {
    title: "Founding Full‑Stack Engineer",
    location: "Remote",
    type: "Full-time",
    description:
      "Help design and build core product features for talents, casting directors, and professionals.",
  },
  {
    title: "Product Designer",
    location: "Remote",
    type: "Contract",
    description:
      "Shape the end-to-end experience of Castglo across web and future mobile products.",
  },
  {
    title: "Community & Partnerships Lead",
    location: "Hybrid • Lagos / Remote",
    type: "Full-time",
    description:
      "Grow our talent and casting director community through programs, events, and partnerships.",
  },
];

export default function Careers() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-10 max-w-3xl space-y-8">
          <header>
            <h1 className="text-3xl font-bold">Careers at Castglo</h1>
            <p className="mt-2 text-muted-foreground">
              Join the team building the future of casting and talent discovery.
            </p>
          </header>

          <section className="rounded-xl bg-card p-6 shadow-card">
            <h2 className="text-base font-semibold text-foreground">
              Why work with us
            </h2>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground list-disc list-inside">
              <li>Work on a product that supports talents and storytellers globally.</li>
              <li>Collaborate with a small, focused team of builders and creatives.</li>
              <li>Enjoy flexible, remote-friendly work with room to grow your role.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">
              Open roles
            </h2>
            {roles.map((role) => (
              <article
                key={role.title}
                className="rounded-xl bg-card p-6 shadow-card flex flex-col gap-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {role.title}
                  </h3>
                  <div className="flex gap-2 text-[11px] text-muted-foreground">
                    <span>{role.location}</span>
                    <span>•</span>
                    <span>{role.type}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {role.description}
                </p>
                <p className="mt-2 text-xs text-primary">
                  Send your CV, portfolio, and a short note to careers@castglo.com
                </p>
              </article>
            ))}
          </section>

          <section className="rounded-xl bg-card p-6 shadow-card">
            <h2 className="text-base font-semibold text-foreground">
              Don&apos;t see your role?
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              We&apos;re always happy to hear from people who are passionate about the
              casting and entertainment space. If you feel you can add value to
              Castglo, email us at careers@castglo.com with how you&apos;d like to
              contribute.
            </p>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}

