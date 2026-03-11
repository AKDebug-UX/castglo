import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/landing/HeroSection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        
        {/* Get Started Section */}
        <section className="py-16 bg-gradient-to-b from-[#DEFCFE] to-white">
          <div className="container">
            <h2 className="text-3xl font-normal text-center mb-12">Get Started in 4 Simple Steps</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: 1, title: "Create Profile", desc: "Build your professional profile and showcase your talent." },
                { step: 2, title: "Upload Reel", desc: "Upload your demo reels and headshots for directors to see." },
                { step: 3, title: "Search Jobs", desc: "Browse through hundreds of casting calls and opportunities." },
                { step: 4, title: "Apply & Audition", desc: "Submit your audition and get discovered by industry pros." }
              ].map((item) => (
                <div key={item.step} className="text-center group">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-normal transition-colors group-hover:bg-primary group-hover:text-white">
                    {item.step}
                  </div>
                  <h3 className="font-normal text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
