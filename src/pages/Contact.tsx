import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { leadAPI } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getApiErrorMessage } from "@/lib/utils";
import { contactSchema, ContactFormValues } from "@/lib/validations";

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsLoading(true);

    try {
      const response = await leadAPI.submitContact(data);
      if (response.data.success) {
        toast.success("Message sent successfully! We will get back to you soon.");
        reset();
      } else {
        toast.error(response.data.message || "Failed to send message");
      }
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, "An error occurred while sending your message"));
    } finally {
      setIsLoading(false);
    }
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
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">First Name</label>
                    <Input 
                      {...register("firstName")}
                      id="firstName"
                      placeholder="John" 
                      disabled={isLoading}
                      className={errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-xs font-medium text-destructive mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Last Name</label>
                    <Input 
                      {...register("lastName")}
                      id="lastName"
                      placeholder="Doe" 
                      disabled={isLoading}
                      className={errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-xs font-medium text-destructive mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <Input 
                    {...register("email")}
                    id="email"
                    type="email" 
                    placeholder="you@example.com" 
                    disabled={isLoading}
                    className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs font-medium text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
                  <Input 
                    {...register("subject")}
                    id="subject"
                    placeholder="I’d like to learn more" 
                    disabled={isLoading}
                    className={errors.subject ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.subject && (
                    <p className="text-xs font-medium text-destructive mt-1">{errors.subject.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Message</label>
                  <Textarea 
                    {...register("message")}
                    id="message"
                    placeholder="Tell us how we can help" 
                    className={`min-h-[120px] ${errors.message ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    disabled={isLoading}
                  />
                  {errors.message && (
                    <p className="text-xs font-medium text-destructive mt-1">{errors.message.message}</p>
                  )}
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