import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function CommunityGuidelines() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-12 max-w-3xl space-y-8">
          <header>
            <h1 className="text-3xl font-bold">Community Guidelines</h1>
            <p className="mt-2 text-muted-foreground">
              Effective Date: 16th March 2026
            </p>
          </header>

          <section className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              CastGlo aims to foster a respectful and professional community within the entertainment industry.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Respectful Conduct</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users should interact respectfully and professionally with others on the platform. Harassment, discrimination, abusive behaviour, or threats will not be tolerated.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Honest Representation</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users must represent themselves and their organisations truthfully. Profiles, casting calls, and service listings must not contain misleading or false information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Professional Opportunities</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Casting calls and service listings should be legitimate and relevant to the entertainment industry. Opportunities should clearly describe:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>project details</li>
              <li>role requirements</li>
              <li>compensation terms (where applicable)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Prohibited Behaviour</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users must not:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>post fraudulent opportunities</li>
              <li>solicit inappropriate or exploitative content</li>
              <li>impersonate another individual or organisation</li>
              <li>misuse the platform to harvest personal data</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Enforcement</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CastGlo may remove content, restrict access, suspend accounts, or terminate users who violate these guidelines.
            </p>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
