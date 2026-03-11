import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-10">
          <h1 className="text-3xl font-normal">About Us</h1>
          <p className="mt-4 text-muted-foreground max-w-3xl text-lg leading-relaxed font-normal">
            Castglo is a next-generation global casting and talent discovery platform built to bridge the gap between emerging talent and the creative industry. We exist to give students, performers, and creators a credible, secure, and professional pathway into film, television, theatre, music, fashion, and digital media no matter where they start.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl bg-card p-6 shadow-card">
              <h3 className="font-normal text-lg">Our Mission</h3>
              <p className="mt-2 text-sm text-muted-foreground font-normal">
                Empower performers and streamline casting through modern, accessible technology.
              </p>
            </div>
            <div className="rounded-xl bg-card p-6 shadow-card">
              <h3 className="font-normal text-lg">For Talent</h3>
              <p className="mt-2 text-sm text-muted-foreground font-normal">
                Build profiles, upload reels, and get discovered by verified directors.
              </p>
            </div>
            <div className="rounded-xl bg-card p-6 shadow-card">
              <h3 className="font-normal text-lg">For Directors</h3>
              <p className="mt-2 text-sm text-muted-foreground font-normal">
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