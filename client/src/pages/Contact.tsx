import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-10 grid gap-8 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold">Contact Us</h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Have a question or want to collaborate? Send us a message and we’ll get back to you.
            </p>

            <div className="mt-6 rounded-xl bg-card p-6 shadow-card">
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">First Name</label>
                    <Input placeholder="John" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Last Name</label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <Input type="email" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
                  <Input placeholder="I’d like to learn more" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Message</label>
                  <Textarea placeholder="Tell us how we can help" className="min-h-[120px]" />
                </div>
                <Button className="w-full" variant="hero">Send Message</Button>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-card p-6 shadow-card">
              <h3 className="font-semibold">Contact Information</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Email: support@castglo.com
                <br />
                Press: press@castglo.com
                <br />
                Careers: careers@castglo.com
              </p>
            </div>
            <div className="rounded-xl bg-card p-6 shadow-card">
              <h3 className="font-semibold">Office</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Los Angeles, CA
                <br />
                Mon–Fri: 9:00am – 6:00pm PT
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}