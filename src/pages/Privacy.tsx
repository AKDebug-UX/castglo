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
            This Privacy Policy explains how Castglo collects, uses, and protects your information when you use our platform.
          </p>

          <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-foreground">1. Information We Collect</h2>
              <p className="mt-2">
                We collect information you provide directly, such as account details, profile information, casting call
                data, messages, and media uploads. We also collect technical information like device details, usage data,
                and approximate location to improve the platform.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">2. How We Use Your Information</h2>
              <p className="mt-2">
                We use your information to operate and improve Castglo, match talent with casting opportunities, provide
                customer support, communicate important updates, and maintain the safety and integrity of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">3. Sharing Of Information</h2>
              <p className="mt-2">
                We share information with other users as needed for casting workflows, with trusted service providers who
                help us run Castglo, and when required by law. We do not sell your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">4. Your Choices</h2>
              <p className="mt-2">
                You can update your profile, manage notification preferences, and request deletion of your account. Some
                information may be retained where required for legal or security reasons.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">5. Contact</h2>
              <p className="mt-2">
                If you have questions about this Privacy Policy or how we handle your data, you can contact us at
                support@castglo.com.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

