import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { leadAPI } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getApiErrorMessage } from "@/lib/utils";

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await leadAPI.submitContact(formData);
      if (response.data.success) {
        toast.success("Message sent successfully! We will get back to you soon.");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error(response.data.message || "Failed to send message");
      }
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "An error occurred while sending your message"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

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
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">First Name</label>
                    <Input 
                      id="firstName"
                      placeholder="John" 
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Last Name</label>
                    <Input 
                      id="lastName"
                      placeholder="Doe" 
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="you@example.com" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
                  <Input 
                    id="subject"
                    placeholder="I’d like to learn more" 
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Message</label>
                  <Textarea 
                    id="message"
                    placeholder="Tell us how we can help" 
                    className="min-h-[120px]" 
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button className="w-full" variant="hero" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-card p-6 shadow-card h-full flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Support Email</p>
                  <a href="mailto:support@castglo.com" className="text-lg font-medium text-[#009698] hover:underline">
                    support@castglo.com
                  </a>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Press & Media</p>
                  <a href="mailto:support@castglo.com" className="text-lg font-medium text-slate-700 hover:underline">
                    support@castglo.com
                  </a>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Careers</p>
                  <a href="mailto:support@castglo.com" className="text-lg font-medium text-slate-700 hover:underline">
                    support@castglo.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}