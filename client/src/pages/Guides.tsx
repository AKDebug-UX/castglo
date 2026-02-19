import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Guides() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-10 max-w-3xl space-y-8">
          <header>
            <h1 className="text-3xl font-bold">Audition Guides</h1>
            <p className="mt-2 text-muted-foreground">
              Practical tips to help you prepare, record, and submit strong auditions on Castglo.
            </p>
          </header>

          <section className="rounded-xl bg-card p-6 shadow-card">
            <h2 className="text-base font-semibold text-foreground">
              1. Getting Ready For Your Audition
            </h2>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground list-disc list-inside">
              <li>Read the casting breakdown carefully and note all requirements.</li>
              <li>Choose wardrobe that fits the role while keeping the focus on your performance.</li>
              <li>Warm up your voice and body so you feel confident before recording.</li>
            </ul>
          </section>

          <section className="rounded-xl bg-card p-6 shadow-card">
            <h2 className="text-base font-semibold text-foreground">
              2. Recording A Great Self‑Tape
            </h2>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground list-disc list-inside">
              <li>Use natural light or a soft light source so your face is clearly visible.</li>
              <li>Frame from mid‑chest up and keep the camera steady at eye level.</li>
              <li>Check your audio levels and record in a quiet space with minimal echo.</li>
            </ul>
          </section>

          <section className="rounded-xl bg-card p-6 shadow-card">
            <h2 className="text-base font-semibold text-foreground">
              3. Submitting On Castglo
            </h2>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground list-disc list-inside">
              <li>Upload your video in a supported format and double‑check playback.</li>
              <li>Attach your latest headshot, résumé, and any requested links or materials.</li>
              <li>Review everything once more before you hit submit to avoid mistakes.</li>
            </ul>
          </section>

          <section className="rounded-xl bg-card p-6 shadow-card">
            <h2 className="text-base font-semibold text-foreground">
              4. Staying Professional
            </h2>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground list-disc list-inside">
              <li>Be respectful in all messages and communication with casting teams.</li>
              <li>Only submit to roles that genuinely fit your profile and experience.</li>
              <li>Keep your Castglo profile updated so directors always see your best work.</li>
            </ul>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}

