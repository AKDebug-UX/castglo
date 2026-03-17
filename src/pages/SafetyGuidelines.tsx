import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function SafetyGuidelines() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-12 max-w-3xl space-y-8">
          <header>
            <h1 className="text-3xl font-bold">Safety Guidelines for Talents</h1>
            <p className="mt-2 text-muted-foreground">
              Effective Date: 16th March 2026
            </p>
          </header>

          <section className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              CastGlo is committed to promoting a safe and professional environment for everyone using the platform. These safety guidelines are designed to help Talents, particularly new or emerging performers, navigate opportunities responsibly.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Personal Safety</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Talents should always prioritise personal safety when interacting with potential employers, agencies, or collaborators. Recommended practices include:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>verify the identity of casting directors or agencies before attending meetings</li>
              <li>research production companies and individuals offering opportunities</li>
              <li>avoid sharing sensitive personal information unnecessarily</li>
              <li>meet in public or professional locations where possible</li>
              <li>inform a trusted person of your meeting details</li>
              <li>be cautious of requests for private auditions or meetings in unsafe environments</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Communication Safety</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use the CastGlo messaging system whenever possible when communicating with new contacts. Avoid:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>sharing personal contact details immediately</li>
              <li>accepting suspicious links or files</li>
              <li>engaging with users who pressure you to move conversations off-platform quickly</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Minor Safety</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where Talents are minors:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>all communications should occur through a parent or guardian account</li>
              <li>guardians should supervise interactions and opportunities</li>
              <li>minors should never attend auditions or meetings alone</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Reporting Concerns</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you encounter suspicious behaviour, harassment, unsafe requests, or potential scams, please report the user through the platform or contact: <a href="mailto:admin@castglo.com" className="text-primary hover:underline">admin@castglo.com</a>.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CastGlo may suspend or remove accounts that violate safety expectations.
            </p>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
