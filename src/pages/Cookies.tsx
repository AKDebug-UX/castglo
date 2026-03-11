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
              Last updated: March 11, 2026
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">1. What Are Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">2. How We Use Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use cookies for several reasons, including:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>To provide you with the service you have requested (Essential Cookies).</li>
              <li>To understand how you use our website and to improve your experience.</li>
              <li>To remember your preferences and settings.</li>
              <li>To provide relevant advertisements to you.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">3. Your Choices</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.allaboutcookies.org" className="text-primary hover:underline">allaboutcookies.org</a>.
            </p>
          </section>

          <section className="space-y-4 border-t pt-8">
            <p className="text-sm text-muted-foreground">
              If you have any questions about our use of cookies, please contact us at <a href="mailto:privacy@castglo.com" className="text-primary hover:underline">privacy@castglo.com</a>.
            </p>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
