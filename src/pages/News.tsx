 import { useState } from "react";
 import { Link } from "react-router-dom";
 import { Header } from "@/components/Header";
 import { Footer } from "@/components/Footer";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Calendar, Clock, ArrowRight } from "lucide-react";
 import newsAudition from "@/assets/news-audition.jpg";
 import newsProduction from "@/assets/news-production.jpg";
 
 const categories = ["All", "Technology", "Casting", "Industry Trend"];
 
 const featuredArticles = [
   {
     id: "ai-casting-2025",
     title: "How AI is Revolutionizing the Casting Process in 2025",
     excerpt: "Discover how artificial intelligence is transforming the way casting directors find and evaluate talent, making the process more efficient and inclusive.",
     date: "3/15/2025",
     readTime: "5 min read",
     author: { name: "Sarah Mitchell", handle: "@sarahmitchell" },
     image: newsAudition,
     category: "Technology",
     featured: true,
   },
   {
     id: "diversity-entertainment-2025",
     title: "Diversity and Inclusion in Entertainment: 2025 Report",
     excerpt: "An in-depth look at the progress and challenges in creating more diverse and inclusive casting opportunities across the industry.",
     date: "3/10/2025",
     readTime: "7 min read",
     author: { name: "David Park", handle: "@davidpark" },
     image: newsProduction,
     category: "Industry Trend",
   },
 ];
 
 const articles = [
   {
     id: "ai-revolutionizing",
     title: "How AI is Revolutionizing the Casting Process in 2025",
     excerpt: "Discover how artificial intelligence is transforming the way casting directors find and evaluate talent, making the process more efficient and inclusive.",
     date: "March 15, 2025",
     readTime: "5 min read",
     author: { name: "Sarah Mitchell" },
     image: newsAudition,
     category: "Technology",
   },
   {
     id: "self-tape-tips",
     title: "10 Tips for Nailing Your Self-Tape Audition",
     excerpt: "Master the art of self-tape auditions with expert advice from industry professionals on lighting, framing, and performance techniques.",
     date: "March 12, 2025",
     readTime: "7 min read",
     author: { name: "David Park" },
     image: newsProduction,
     category: "Casting",
   },
   {
     id: "streaming-platforms",
     title: "How Streaming Platforms are Changing Casting Dynamics",
     excerpt: "Explore the impact of streaming services on casting decisions and opportunities for emerging talent.",
     date: "April 2, 2025",
     readTime: "7 min read",
     author: { name: "Emily Watson" },
     image: newsAudition,
     category: "Industry Trend",
   },
   {
     id: "casting-director-interview",
     title: "Inside the Mind of a Casting Director: Interview Tips",
     excerpt: "Top casting directors share their insights on what they look for in auditions and how to stand out.",
     date: "April 25, 2025",
     readTime: "5 min read",
     author: { name: "Robert Thompson" },
     image: newsProduction,
     category: "Casting",
   },
 ];
 
 export default function News() {
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("All");
 
   const filteredArticles = articles.filter((article) => {
     const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
     return matchesSearch && matchesCategory;
   });
 
   return (
     <div className="bg-[#DEFCFE] min-h-screen flex flex-col">
       <Header />
       <main className="flex-1">
         {/* Hero Section */}
         <section className="py-12 px-4">
           <div className="container text-center max-w-2xl mx-auto">
             <h1 className="text-3xl md:text-4xl font-bold mb-2">
               Industry <span className="text-primary">News</span> & Insights
             </h1>
             <p className="text-muted-foreground mb-6">
               Stay updated with the latest trends, insights, and opportunities in the entertainment industry
             </p>
             <div className="flex gap-2 max-w-lg mx-auto">
               <Input
                 placeholder="Search article"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="flex-1"
               />
               <Button>Search</Button>
             </div>
           </div>
         </section>
 
         {/* Categories */}
         <section className="py-6 px-4">
           <div className="container">
             <div className="flex gap-2 flex-wrap">
               {categories.map((category) => (
                 <Button
                   key={category}
                   variant={selectedCategory === category ? "default" : "outline"}
                   size="sm"
                   onClick={() => setSelectedCategory(category)}
                   className="rounded-full"
                 >
                   {category}
                 </Button>
               ))}
             </div>
           </div>
         </section>
 
         {/* Featured Articles */}
         <section className="py-8 px-4">
           <div className="container">
             <h2 className="text-xl font-bold mb-6">Featured Articles</h2>
             <div className="grid gap-6 md:grid-cols-2">
               {featuredArticles.map((article) => (
                 <Link
                   key={article.id}
                   to={`/news/${article.id}`}
                   className="group bg-card rounded-xl overflow-hidden shadow-card card-elevated"
                 >
                   <div className="aspect-video overflow-hidden">
                     <img
                       src={article.image}
                       alt={article.title}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                     />
                   </div>
                   <div className="p-5">
                     <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                       {article.title}
                     </h3>
                     <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                       {article.excerpt}
                     </p>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-xs text-muted-foreground">
                         <Calendar className="w-3.5 h-3.5" />
                         {article.date}
                         <Clock className="w-3.5 h-3.5 ml-2" />
                         {article.readTime}
                       </div>
                       <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                     </div>
                   </div>
                 </Link>
               ))}
             </div>
           </div>
         </section>
 
         {/* All Articles */}
         <section className="py-8 px-4">
           <div className="container">
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
               {filteredArticles.map((article) => (
                 <Link
                   key={article.id}
                   to={`/news/${article.id}`}
                   className="group bg-card rounded-xl overflow-hidden shadow-card card-elevated"
                 >
                   <div className="aspect-video overflow-hidden">
                     <img
                       src={article.image}
                       alt={article.title}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                     />
                   </div>
                   <div className="p-4">
                     <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                       <span>{article.date}</span>
                       <span>•</span>
                       <span>{article.readTime}</span>
                     </div>
                     <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                       {article.title}
                     </h3>
                     <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                       {article.excerpt}
                     </p>
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Avatar className="h-6 w-6">
                           <AvatarFallback className="text-xs">{article.author.name[0]}</AvatarFallback>
                         </Avatar>
                         <span className="text-sm">{article.author.name}</span>
                       </div>
                       <span className="text-primary text-sm font-medium">Read More</span>
                     </div>
                   </div>
                 </Link>
               ))}
             </div>
           </div>
         </section>
 
         {/* Newsletter */}
         <section className="py-12 px-4">
           <div className="container text-center max-w-md mx-auto">
             <h2 className="text-2xl font-bold mb-2">Stay in the Loop</h2>
             <p className="text-muted-foreground mb-6">
               Subscribe to our newsletter and get the latest industry news delivered to your inbox
             </p>
             <div className="flex gap-2">
               <Input placeholder="Enter your mail" className="flex-1" />
               <Button>Subscribe</Button>
             </div>
           </div>
         </section>
       </main>
       <Footer />
     </div>
   );
 }