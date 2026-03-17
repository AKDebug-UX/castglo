import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AntiScamGuidelines() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-12 max-w-3xl space-y-8">
          <header>
            <h1 className="text-3xl font-bold">Anti-Scam Guidelines</h1>
            <p className="mt-2 text-muted-foreground">
              Effective Date: 16th March 2026
            </p>
          </header>

          <section className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              CastGlo works to maintain a trustworthy environment, but users should remain vigilant against potential scams.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Common Scam Warning Signs</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users should be cautious if a casting opportunity or service:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>requests upfront payments for auditions or job placements</li>
              <li>asks for financial transfers outside secure payment systems</li>
              <li>promises guaranteed roles or unrealistic earnings</li>
              <li>requests sensitive personal or financial information</li>
              <li>pressures you to act quickly or avoid verification</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Safe Practices</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To protect yourself:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>verify organisations offering opportunities</li>
              <li>use the CastGlo platform for communications when possible</li>
              <li>avoid sending money to unknown parties</li>
              <li>confirm contracts and agreements independently</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Reporting Suspected Scams</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you believe an opportunity or user is fraudulent, report it immediately. Reports may be sent to: <a href="mailto:admin@castglo.com" className="text-primary hover:underline">admin@castglo.com</a>.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              CastGlo may investigate reports and take action including removing listings or suspending accounts.
            </p>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
