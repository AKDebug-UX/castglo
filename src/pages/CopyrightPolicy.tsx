import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function CopyrightPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-12 max-w-3xl space-y-8">
          <header>
            <h1 className="text-3xl font-bold">Copyright & DMCA / Takedown Policy</h1>
            <p className="mt-2 text-muted-foreground">
              Effective Date: 16th March 2026
            </p>
          </header>

          <section className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              CastGlo respects intellectual property rights and expects users to do the same.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">User Responsibility</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Users must only upload content that they own or have permission to use. Content must not infringe copyright, trademarks, performer rights, publicity rights, or other intellectual property rights.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Reporting Copyright Infringement</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you believe that content on the platform infringes your copyright, you may submit a takedown request. Requests should include:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>your name and contact details</li>
              <li>identification of the copyrighted work</li>
              <li>the URL or location of the infringing content</li>
              <li>a statement that you believe the use is unauthorised</li>
              <li>a declaration that the information provided is accurate</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Requests should be sent to: <a href="mailto:legal@castglo.com" className="text-primary hover:underline">legal@castglo.com</a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Response Process</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upon receiving a valid complaint, CastGlo may:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>remove or restrict access to the content</li>
              <li>notify the user who uploaded the material</li>
              <li>investigate the complaint</li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Repeated infringement may result in account suspension or termination.
            </p>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
