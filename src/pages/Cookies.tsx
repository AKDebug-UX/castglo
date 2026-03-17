import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Cookies() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-12 max-w-3xl space-y-8">
          <header>
            <h1 className="text-3xl font-bold">Cookie Policy</h1>
            <p className="mt-2 text-muted-foreground">
              Effective Date: 16th March 2026
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. What Are Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cookies are small text files placed on your device when visiting a website. They help websites function properly and improve user experience.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. Types of Cookies We Use</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li><b>Essential Cookies:</b> Necessary for core site functionality such as login and security.</li>
              <li><b>Functional Cookies:</b> Remember user preferences and settings.</li>
              <li><b>Analytics Cookies:</b> Help us understand how visitors interact with the website.</li>
              <li><b>Marketing Cookies:</b> Used to measure marketing effectiveness where applicable.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Why We Use Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use cookies to:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>operate the Platform</li>
              <li>remember user preferences</li>
              <li>improve website performance</li>
              <li>analyse traffic and behaviour</li>
              <li>support security and fraud prevention</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">4. Third-Party Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Some cookies may be placed by third-party services used on the Platform, such as analytics providers or payment processors.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">5. Managing Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users can manage cookie settings through their browser settings or through the website cookie consent tool. Disabling certain cookies may affect website functionality. Where required by law, non-essential cookies will only be placed after user consent through the website cookie banner.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">6. Updates</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This Cookie Policy may be updated periodically.
            </p>
          </section>

          <section className="space-y-4 border-t pt-8">
            <h2 className="text-xl font-semibold">7. Contact</h2>
            <p className="text-sm text-muted-foreground">
              Questions regarding this policy can be sent to <a href="mailto:admin@castglo.com" className="text-primary hover:underline">admin@castglo.com</a>.
            </p>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
