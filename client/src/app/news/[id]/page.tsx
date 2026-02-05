"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Eye, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import newsAudition from "@/assets/news-audition.jpg";
import Image from "next/image";

const articleData = {
    "ai-casting-2025": {
        title: "How AI is Revolutionizing the Casting Process in 2025",
        subtitle: "Discover how artificial intelligence is transforming the way casting directors find and evaluate talent",
        date: "3/15/2025",
        readTime: "5 min read",
        views: "12.5K views",
        author: {
            name: "Sarah Mitchell",
            handle: "@sarahmitchell",
        },
        image: newsAudition,
        content: `
The entertainment industry is experiencing a seismic shift as artificial intelligence became an integral part of the casting process. What once took weeks of manual review and countless audition tapes can now be streamlined through sophisticated AI algorithms that help casting directors identify the perfect talent for their projects.

## The Evolution of Casting Technology

Traditional casting calls would receive hundreds or even thousands of submissions, spending countless hours reviewing headshots, resumes, and audition tapes. This process was not only time-consuming but also prone to unconscious biases and human error.

Enter artificial intelligence. Modern AI-powered casting platforms can analyze thousands of submissions in minutes, identifying key characteristics such as acting range, emotional authenticity, and even subtle nuances in performance that might be missed by the human eye.

## Key Benefits of AI in Casting

The integration of AI into the casting process offers several significant advantages:

- **Efficiency:** AI can process and categorize submissions exponentially faster than manual review, allowing casting directors to focus their time on the most promising candidates.
- **Objectivity:** By removing initial human bias, AI helps ensure that talent is evaluated based on merit and suitability for the role rather than unconscious preferences.
- **Discovery:** AI algorithms can identify emerging talent that might otherwise be overlooked, expanding opportunities for actors across diverse backgrounds.
- **Data-Driven Insights:** Advanced analytics provide casting directors with detailed performance metrics and compatibility assessments.

## Real-World Applications

Several major studios and streaming platforms have already begun implementing AI-assisted casting tools. These systems analyze everything from facial expressions to voice modulation to predict audience reception and emotional range. Some platforms are even learning to predict audience reception based on historical data and current trends, and comparing them against an actor's portfolio. AI can also suggest candidates who might not have been considered through traditional methods.

## Addressing Concerns

Despite the benefits, the integration of AI in casting has raised important questions about creativity, authenticity, and the human element in artistic decision-making. Industry professionals emphasize that AI should be viewed as a tool to augment human judgment, not replace it.

Casting directors maintain that final approval authority using AI insights to inform rather than dictate their choices. This hybrid approach combines the efficiency of technology with the irreplaceable intuition and experience of seasoned casting professionals.

## The Future of Casting

As AI technology continues to evolve, we can expect even more sophisticated applications in the casting process. Virtual auditions powered by AI could allow actors to demonstrate their range across multiple scenarios instantly. Predictive analytics might help identify potential stars before they become mainstream favorites.

The key to success lies in striking the right balance between technological innovation and human creativity. When used thoughtfully, AI has the potential to make the casting process more efficient, inclusive, and effective than ever before.

## Conclusion

The revolution in AI-powered casting is just beginning. As the technology matures and becomes more widely adopted, it will fundamentally reshape how we discover and nurture talent across the entertainment industry. For actors, casting directors, and producers alike, embracing these tools while maintaining the human touch will be essential to thriving in this new era.
    `,
    },
};

export default function NewsArticle() {
    const params = useParams();
    const id = params?.id as string;
    const article = articleData[id as keyof typeof articleData] || articleData["ai-casting-2025"];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <div className="container max-w-4xl py-8 px-4">
                    <Link
                        href="/news"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to News
                    </Link>

                    <article>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
                        <p className="text-lg text-muted-foreground mb-6">{article.subtitle}</p>

                        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {article.date}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {article.readTime}
                            </div>
                            <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {article.views}
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>{article.author.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{article.author.name}</p>
                                    <p className="text-sm text-muted-foreground">{article.author.handle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon-sm">
                                    <Share2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="aspect-video rounded-xl overflow-hidden mb-8 relative">
                            <Image
                                src={article.image}
                                alt={article.title}
                                className="w-full h-full object-cover"
                                fill
                            />
                        </div>

                        <div className="prose prose-lg max-w-none">
                            {article.content.split("\n\n").map((paragraph, i) => {
                                if (paragraph.startsWith("## ")) {
                                    return (
                                        <h2 key={i} className="text-xl font-bold mt-8 mb-4">
                                            {paragraph.replace("## ", "")}
                                        </h2>
                                    );
                                }
                                if (paragraph.startsWith("- ")) {
                                    const items = paragraph.split("\n").filter((line) => line.startsWith("- "));
                                    return (
                                        <ul key={i} className="list-disc pl-6 space-y-2 mb-4">
                                            {items.map((item, j) => (
                                                <li key={j}>{item.replace("- ", "").replace(/\*\*(.*?)\*\*/g, "$1")}</li>
                                            ))}
                                        </ul>
                                    );
                                }
                                if (paragraph.trim()) {
                                    return (
                                        <p key={i} className="mb-4 text-muted-foreground leading-relaxed">
                                            {paragraph}
                                        </p>
                                    );
                                }
                                return null;
                            })}
                        </div>

                        {/* Author Card */}
                        <div className="mt-12 p-6 bg-muted rounded-xl">
                            <p className="text-sm text-muted-foreground mb-3">About {article.author.name}</p>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>{article.author.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{article.author.name}</p>
                                    <p className="text-sm text-muted-foreground">{article.author.handle}</p>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </main>
            <Footer />
        </div>
    );
}
