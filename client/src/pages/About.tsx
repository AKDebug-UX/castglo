import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-10">
          <h1 className="text-3xl font-bold">About Castglo</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Castglo connects talent, casting directors, and industry professionals with tools to discover, audition, and collaborate.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl bg-card p-6 shadow-card">
              <h3 className="font-semibold">Our Mission</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Empower performers and streamline casting through modern, accessible technology.
              </p>
            </div>
            <div className="rounded-xl bg-card p-6 shadow-card">
              <h3 className="font-semibold">For Talent</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Build profiles, upload reels, and get discovered by verified directors.
              </p>
            </div>
            <div className="rounded-xl bg-card p-6 shadow-card">
              <h3 className="font-semibold">For Directors</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Post casting calls, manage submissions, and find the perfect fit faster.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}