import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Users, Zap, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hub() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#DEFCFE]">
        <section className="container py-12 max-w-5xl space-y-10">
          <header className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Glo Hub</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your central ecosystem for the entertainment industry. Connect, discover, and grow with Castglo's community resources.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-elevated">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Talent Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect with fellow performers, share experiences, and find collaborators for your next project. Our community is built on support and professional growth.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/join">Join Community</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Industry Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Stay updated with the latest trends in film, TV, and theater. Get exclusive interviews with casting directors and successful talent from around the world.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/news">Read Latest News</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>Career Accelerators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Access premium tools and workshops designed to fast-track your career. From portfolio reviews to technical training, we provide the spark you need.
                </p>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Success Stories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Be inspired by talent who found their big break on Castglo. Learn about their journey, their audition process, and how they used our platform to succeed.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/browse">Explore Opportunities</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
