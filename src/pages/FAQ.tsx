import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const faqs = [
  {
    question: "What is Castglo?",
    answer:
      "Castglo is a casting and talent discovery platform that connects talents, casting directors, and industry professionals in one place.",
  },
  {
    question: "How do I create a talent profile?",
    answer:
      "Sign up as a talent, complete your profile with photos, reels, and credits, and keep your details up to date so directors can discover you.",
  },
  {
    question: "How do casting calls work?",
    answer:
      "Casting directors post roles and requirements. Talents can browse available castings, submit auditions, and track their submissions.",
  },
  {
    question: "Is Castglo free to use?",
    answer:
      "You can create an account and explore the platform for free. Some advanced tools and features may require a subscription.",
  },
  {
    question: "Who can use Castglo?",
    answer:
      "Talents, casting directors, producers, and other verified industry professionals can use Castglo to collaborate on projects.",
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-10 max-w-3xl">
          <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
          <p className="mt-2 text-muted-foreground">
            Answers to common questions about using Castglo as a talent or casting director.
          </p>

          <div className="mt-8 space-y-6">
            {faqs.map((item) => (
              <div
                key={item.question}
                className="rounded-xl bg-card p-5 shadow-card"
              >
                <h2 className="text-sm font-semibold text-foreground">
                  {item.question}
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

