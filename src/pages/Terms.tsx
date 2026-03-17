import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-10 max-w-3xl">
          <h1 className="text-3xl font-bold">Terms & Conditions</h1>
          <p className="mt-2 text-muted-foreground">
            Effective Date: 16th March 2026
          </p>

          <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
            <p>
              These Terms and Conditions govern your access to and use of the CastGlo website and platform (the "Platform") operated by:
            </p>
            <p>
              Castglo Ltd<br />
              Company No. 16207293<br />
              Suite 6730 Unit 3a, 34-35 Hatton Garden, Holborn, London, EC1N 8DX<br />
              England & Wales
            </p>
            <p>
              By accessing or using the Platform, you agree to these Terms.
            </p>

            <section>
              <h2 className="text-base font-semibold text-foreground">1. About CastGlo</h2>
              <p className="mt-2">
                CastGlo is an online platform designed to connect stakeholders within the entertainment industry, including:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Talents (actors, performers, creatives)</li>
                <li>Casting Directors</li>
                <li>Agencies</li>
                <li>Professional Service Providers</li>
                <li>Educational Institutions</li>
              </ul>
              <p className="mt-2">
                Users may create profiles, upload portfolios, publish casting opportunities, advertise services, apply for roles, and communicate with other users. CastGlo acts solely as a digital platform facilitating connections between users. CastGlo does not guarantee employment, bookings, or professional opportunities.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">2. Eligibility</h2>
              <p className="mt-2">
                Users must be legally capable of entering into binding agreements. The Platform is generally intended for users aged 18 years or older. Where a Talent is a minor, an account must be created and managed by a parent or legal guardian, who accepts full responsibility for the account. CastGlo may require identity verification using government-issued documentation.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">3. User Accounts</h2>
              <p className="mt-2">
                Users must provide accurate information when registering. You are responsible for:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>maintaining the security of your account credentials</li>
                <li>all activity under your account</li>
                <li>keeping profile information up to date</li>
              </ul>
              <p className="mt-2">
                CastGlo may suspend or terminate accounts that provide false or misleading information.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">4. Platform Moderation</h2>
              <p className="mt-2">
                All profiles and casting calls may be reviewed or approved by CastGlo before publication. Approval does not constitute endorsement and CastGlo does not guarantee the legitimacy or quality of opportunities posted by users.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">5. User Content</h2>
              <p className="mt-2">
                Users may upload content including:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>photos</li>
                <li>videos</li>
                <li>portfolios</li>
                <li>resumes</li>
                <li>casting descriptions</li>
                <li>service listings</li>
              </ul>
              <p className="mt-2">
                Users are responsible for ensuring they have the legal rights to upload such content. By uploading content, you grant CastGlo a worldwide non-exclusive licence to host, display, distribute, and use the content to operate and promote the Platform. This may include displaying user content on:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>profile pages</li>
                <li>search results</li>
                <li>homepage highlights</li>
                <li>marketing materials promoting the Platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">6. Direct Messaging and Applications</h2>
              <p className="mt-2">
                Users may communicate with one another via the Platform and apply to casting calls. Users must maintain professional and lawful communication and must not harass or abuse other users.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">7. Subscription Services</h2>
              <p className="mt-2">
                Some Platform features may require a paid subscription. CastGlo may offer:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Monthly subscriptions</li>
                <li>Annual subscriptions</li>
              </ul>
              <p className="mt-2">
                Subscription features and pricing will be displayed on the Platform. Subscriptions may automatically renew unless cancelled prior to the next billing period.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">8. Refund Policy</h2>
              <p className="mt-2">
                Subscription payments are non-refundable, except where required by applicable law. Cancelling a subscription prevents future renewals but does not refund the current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">9. Commission Structure</h2>
              <p className="mt-2">
                CastGlo may charge commission when a job or engagement is successfully booked through the Platform; or a professional service advertised on the Platform results in a successful engagement. Users agree not to circumvent the Platform in order to avoid applicable commissions.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">10. Payments</h2>
              <p className="mt-2">
                Payments are processed through Stripe. Payment processing is subject to Stripe’s own terms and privacy policies. CastGlo does not store full payment card details.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">11. Prohibited Conduct</h2>
              <p className="mt-2">
                Users must not:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>post fraudulent casting calls</li>
                <li>impersonate another individual or organisation</li>
                <li>upload unlawful or infringing content</li>
                <li>harass or discriminate against other users</li>
                <li>engage in scams or deceptive conduct</li>
                <li>attempt to bypass subscription or commission structures</li>
              </ul>
              <p className="mt-2">
                Violation may result in account suspension or termination.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">12. Intellectual Property</h2>
              <p className="mt-2">
                All intellectual property relating to the Platform, including branding, design, software, and content created by CastGlo, remains the property of Castglo Ltd. Users may not reproduce or distribute platform content without permission.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">13. Limitation of Liability</h2>
              <p className="mt-2">
                To the fullest extent permitted by law, CastGlo shall not be liable for:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>loss of business or income</li>
                <li>missed opportunities</li>
                <li>disputes between users</li>
                <li>user-generated content</li>
              </ul>
              <p className="mt-2">
                Users interact with one another at their own risk. Nothing in these Terms excludes liability which cannot be excluded under applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">14. Account Suspension</h2>
              <p className="mt-2">
                CastGlo may suspend or terminate accounts where users:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>violate these Terms</li>
                <li>provide misleading information</li>
                <li>misuse the Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">15. Governing Law</h2>
              <p className="mt-2">
                These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the jurisdiction of the courts of England and Wales.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

