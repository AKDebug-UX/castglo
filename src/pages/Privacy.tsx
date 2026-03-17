import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-10 max-w-3xl">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="mt-2 text-muted-foreground">
            Effective Date: 16th March 2026
          </p>

          <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-foreground">1. Data Controller</h2>
              <p className="mt-2">
                Castglo Ltd<br />
                Suite 6730 Unit 3a, 3435 Hatton Garden<br />
                Holborn, London EC1N 8DX<br />
                England & Wales<br />
                Contact: admin@castglo.com
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">2. Information We Collect</h2>
              <p className="mt-2">
                We may collect the following personal data:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><b>Account Information:</b> name, stage name, email address, phone number, location</li>
                <li><b>Professional Profile Information:</b> biography, skills and experience, training and education, portfolios and showreels</li>
                <li><b>Media Content:</b> photos, videos, voice recordings, resumes</li>
                <li><b>Verification Data:</b> identity documents, age verification data</li>
                <li><b>Transaction Data:</b> subscription records, billing information</li>
                <li><b>Technical Data:</b> IP address, browser type, device information, usage analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">3. How We Use Personal Data</h2>
              <p className="mt-2">
                We process personal data to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>create and manage accounts</li>
                <li>verify identities and ages</li>
                <li>operate the Platform</li>
                <li>enable messaging and casting applications</li>
                <li>process subscription payments</li>
                <li>moderate profiles and casting calls</li>
                <li>improve platform functionality</li>
                <li>detect fraud and misuse</li>
                <li>comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">4. Legal Basis</h2>
              <p className="mt-2">
                We rely on lawful bases including contractual necessity, legitimate interests, legal obligations, and consent where required. Where processing is based on legitimate interests, CastGlo ensures such interests do not override the rights and freedoms of users.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">5. Data Sharing</h2>
              <p className="mt-2">
                We may share data with:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Stripe (payment processing)</li>
                <li>Amazon Web Services (AWS) (hosting infrastructure)</li>
                <li>analytics and security providers</li>
                <li>professional advisers and regulators where required</li>
              </ul>
              <p className="mt-2">
                We do not sell personal data.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">6. Data Storage</h2>
              <p className="mt-2">
                Platform data may be hosted using AWS cloud infrastructure.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">7. International Transfers</h2>
              <p className="mt-2">
                As the Platform expands internationally, personal data may be processed outside the UK. Where transfers occur, appropriate safeguards will be used.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">8. Data Retention</h2>
              <p className="mt-2">
                Personal data is retained only as long as necessary for account operation, legal compliance, fraud prevention, and dispute resolution. CastGlo uses appropriate technical and organisational measures designed to protect personal data.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">9. Your Rights</h2>
              <p className="mt-2">
                Users may have rights to access personal data, correct inaccurate data, request deletion, restrict processing, and object to processing. Requests can be sent to admin@castglo.com.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">10. Complaints</h2>
              <p className="mt-2">
                Users may lodge complaints with the UK Information Commissioner’s Office (ICO).
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">11. Updates</h2>
              <p className="mt-2">
                This Privacy Policy may be updated periodically.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

