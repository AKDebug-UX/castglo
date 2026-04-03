import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, Check, Zap, Sparkles, 
  History, ArrowRight, Download, 
  LayoutGrid, Rocket, Megaphone,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  date: string;
  item: string;
  amount: string;
  status: "paid" | "pending";
}

const HISTORY: Transaction[] = [
  { id: "TX-9021", date: "Mar 15, 2026", item: "Featured Project: 'Neon Nights'", amount: "$29.00", status: "paid" },
  { id: "TX-8842", date: "Feb 01, 2026", item: "Director Pro - Monthly", amount: "$49.00", status: "paid" },
  { id: "TX-8501", date: "Jan 01, 2026", item: "Director Pro - Monthly", amount: "$49.00", status: "paid" },
];

export default function DirectorBilling() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <header>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" /> Billing & Marketplace
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your subscription, view receipts, and promote your casting calls.
        </p>
      </header>

      {/* Subscription Plans */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-2 border-primary shadow-lg lg:col-span-1 h-fit">
          <div className="absolute top-0 right-0 p-2">
            <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-xl">Director Pro</CardTitle>
            <CardDescription>Advanced tools for professional teams.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">$49</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> 20 Active Projects
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> 5 Team Collaborators
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Advanced Talent Matching
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Virtual Audition Rooms
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" /> Download Talent CSVs
              </li>
            </ul>

            <Button variant="outline" className="w-full">Manage Subscription</Button>
          </CardContent>
        </Card>

        {/* Marketplace / Add-ons */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Marketplace Add-ons
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="group hover:border-primary/50 transition-all cursor-pointer">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Megaphone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Featured Project</h3>
                  <p className="text-xs text-muted-foreground mt-1">Get 5x more applicants by pinning your project to the top of the talent feed.</p>
                  <p className="text-sm font-bold mt-3 text-primary">$29.00 / project</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:border-primary/50 transition-all cursor-pointer">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Urgent Hiring</h3>
                  <p className="text-xs text-muted-foreground mt-1">Add a priority badge and get instant notifications to the most active talent.</p>
                  <p className="text-sm font-bold mt-3 text-primary">$15.00 / project</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:border-primary/50 transition-all cursor-pointer">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <LayoutGrid className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Extra Project Slot</h3>
                  <p className="text-xs text-muted-foreground mt-1">Found a new project? Add a single project slot without upgrading your whole plan.</p>
                  <p className="text-sm font-bold mt-3 text-primary">$10.00 / month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:border-primary/50 transition-all cursor-pointer">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Rocket className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Social Media Blast</h3>
                  <p className="text-xs text-muted-foreground mt-1">We'll promote your casting call on the Castglo Instagram & TikTok pages.</p>
                  <p className="text-sm font-bold mt-3 text-primary">$45.00 / blast</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" /> Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Item</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {HISTORY.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{tx.date}</td>
                    <td className="px-6 py-4">{tx.item}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 capitalize">
                         {tx.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold">{tx.amount}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Safety Info */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-amber-800">Payment Security</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            All payments are processed securely via Stripe. Castglo does not store your full card details. 
            For enterprise billing or invoicing, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
