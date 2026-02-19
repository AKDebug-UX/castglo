import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-10 max-w-3xl">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="mt-2 text-muted-foreground">
            These Terms of Service govern your use of Castglo and form a legal agreement between you and Castglo.
          </p>

          <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-foreground">1. Using Castglo</h2>
              <p className="mt-2">
                You must be at least 18 years old or have consent from a legal guardian to use Castglo. You agree to
                provide accurate information and to use the platform only for lawful casting, talent discovery, and
                professional networking purposes.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">2. Accounts And Security</h2>
              <p className="mt-2">
                You are responsible for maintaining the confidentiality of your login details and for all activity under
                your account. Notify us immediately if you suspect unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">3. Content And Conduct</h2>
              <p className="mt-2">
                You are responsible for the content you post, including profiles, casting calls, and messages. You agree
                not to post unlawful, harmful, or misleading content, and not to harass or exploit other users.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">4. Platform Rights</h2>
              <p className="mt-2">
                Castglo may update, suspend, or discontinue parts of the platform at any time. We may remove content or
                terminate accounts that violate these Terms or put other users at risk.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">5. Limitation Of Liability</h2>
              <p className="mt-2">
                Castglo is provided on an as-is basis. To the fullest extent permitted by law, we are not liable for any
                indirect, incidental, or consequential damages arising from your use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">6. Changes To These Terms</h2>
              <p className="mt-2">
                We may update these Terms from time to time. If changes are material, we will notify you by email or
                through the platform. Your continued use of Castglo after changes take effect means you accept the
                updated Terms.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

