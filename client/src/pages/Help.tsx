import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";

export default function Help() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-10 max-w-3xl">
          <h1 className="text-3xl font-bold">Help Centre</h1>
          <p className="mt-2 text-muted-foreground">
            Get support with your Castglo account, auditions, and casting projects.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl bg-card p-5 shadow-card">
              <h2 className="text-sm font-semibold text-foreground">FAQs</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Find quick answers to the most common questions from talents and directors.
              </p>
              <Link
                to="/faq"
                className="mt-3 inline-flex text-xs text-primary hover:underline"
              >
                Browse FAQs
              </Link>
            </div>

            <div className="rounded-xl bg-card p-5 shadow-card">
              <h2 className="text-sm font-semibold text-foreground">Audition Guides</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Learn how to prepare, record, and submit strong auditions on Castglo.
              </p>
              <Link
                to="/guides"
                className="mt-3 inline-flex text-xs text-primary hover:underline"
              >
                View guides
              </Link>
            </div>

            <div className="rounded-xl bg-card p-5 shadow-card">
              <h2 className="text-sm font-semibold text-foreground">Need more help?</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                If you still need assistance, reach out to our support team.
              </p>
              <Link
                to="/contact"
                className="mt-3 inline-flex text-xs text-primary hover:underline"
              >
                Contact support
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

