import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { User, Search, Briefcase, Shield } from "lucide-react";

const userTypes = [
    {
        id: "talent",
        title: "Join as Talent",
        description: "Showcase your skills and connect with casting directors",
        icon: User,
        href: "/join/talent",
        color: "primary",
    },
    {
        id: "director",
        title: "Join as Casting Director",
        description: "Discover exceptional talent for your productions",
        icon: Search,
        href: "/join/director",
        color: "accent",
    },
    {
        id: "professional",
        title: "Join as Industry Professional",
        description: "Showcase your craft and get hired for your next production",
        icon: Briefcase,
        href: "/join/professional",
        color: "info",
    },
    {
        id: "admin",
        title: "Join as Admin",
        description: "Manage and moderate the platform",
        icon: Shield,
        href: "/join/admin",
        color: "accent",
    },
];

export default function Join() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <Logo className="justify-center" />
                </div>

                <div className="bg-card rounded-2xl shadow-card p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold">Ready to Get Started?</h1>
                        <p className="text-muted-foreground mt-2">
                            Join Castglo to unlock full access to talent profiles and connect with industry professionals
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {userTypes.map((type) => (
                            <Link
                                key={type.id}
                                href={type.href}
                                className="group rounded-xl border-2 border-border p-6 text-center hover:border-primary transition-colors card-elevated block"
                            >
                                <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-${type.color}/10`}>
                                    <type.icon className={`w-6 h-6 text-${type.color}`} />
                                </div>
                                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                                    {type.title.replace("Join as ", "")}
                                </h3>
                                <p className="text-sm text-muted-foreground">{type.description}</p>
                            </Link>
                        ))}
                    </div>

                    <p className="text-center text-sm mt-8">
                        Already have an account?{" "}
                        <Link href="/sign-in" className="text-primary font-medium hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
