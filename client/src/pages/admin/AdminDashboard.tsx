 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Avatar, AvatarFallback } from "@/components/ui/avatar";
 import { Users, FileText, ThumbsUp, Calendar, TrendingUp } from "lucide-react";
 import {
   AreaChart,
   Area,
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
 } from "recharts";
 
 const stats = [
   {
     label: "Total Users",
     value: "1,248",
     change: "12.5%",
     changeType: "positive",
     icon: Users,
   },
   {
     label: "Active Submissions",
     value: "243",
     change: "+8.2%",
     changeType: "positive",
     icon: FileText,
   },
   {
     label: "Votes & Engagement",
     value: "12,458",
     change: "+18.3%",
     changeType: "positive",
     icon: ThumbsUp,
   },
   {
     label: "Total Bookings",
     value: "89",
     change: "+5.7%",
     changeType: "positive",
     icon: Calendar,
   },
 ];
 
 const submissionsData = [
   { name: "Mon 1", value: 65 },
   { name: "Mon 2", value: 72 },
   { name: "Mon 3", value: 58 },
   { name: "Mon 4", value: 80 },
 ];
 
 const userGrowthData = [
   { name: "Jan", value: 120 },
   { name: "Feb", value: 180 },
   { name: "Mar", value: 250 },
   { name: "Apr", value: 380 },
   { name: "May", value: 520 },
   { name: "Jun", value: 680 },
 ];
 
 const recentActivity = [
   {
     initials: "S",
     name: "Sarah Johnson",
     action: "submitted audition for Lead Role - Indie Drama",
     time: "2 minutes ago",
   },
   {
     initials: "M",
     name: "Michael Chen",
     action: "created casting call Commercial Campaign",
     time: "15 minutes ago",
   },
   {
     initials: "E",
     name: "Emma Davis",
     action: "booked service with John Smith (Professional)",
     time: "1 hour ago",
   },
   {
     initials: "A",
     name: "Admin",
     action: "approved flagged content Audition #1234",
     time: "2 hours ago",
   },
 ];
 
 export default function AdminDashboard() {
   return (
     <div className="space-y-6">
       <div>
         <h1 className="text-2xl font-bold">Admin Dashboard</h1>
         <p className="text-muted-foreground">Platform overview and key metrics</p>
       </div>
 
       {/* Stats Grid */}
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
         {stats.map((stat) => (
           <Card key={stat.label}>
             <CardContent className="p-4">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-sm text-muted-foreground">{stat.label}</span>
                 <stat.icon className="w-5 h-5 text-muted-foreground" />
               </div>
               <div className="text-2xl font-bold">{stat.value}</div>
               <div className="flex items-center gap-1 text-sm text-success">
                 <TrendingUp className="w-4 h-4" />
                 {stat.change} from last month
               </div>
             </CardContent>
           </Card>
         ))}
       </div>
 
       {/* Charts */}
       <div className="grid gap-6 lg:grid-cols-2">
         <Card>
           <CardHeader>
             <CardTitle className="text-base font-semibold">Submissions Volume</CardTitle>
             <p className="text-sm text-muted-foreground">Weekly submission trends</p>
           </CardHeader>
           <CardContent>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={submissionsData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                   <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                   <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                   <Tooltip
                     contentStyle={{
                       background: "hsl(var(--card))",
                       border: "1px solid hsl(var(--border))",
                       borderRadius: "8px",
                     }}
                   />
                   <Bar dataKey="value" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </CardContent>
         </Card>
 
         <Card>
           <CardHeader>
             <CardTitle className="text-base font-semibold">User Growth</CardTitle>
             <p className="text-sm text-muted-foreground">Monthly user registration by role</p>
           </CardHeader>
           <CardContent>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={userGrowthData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                   <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                   <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                   <Tooltip
                     contentStyle={{
                       background: "hsl(var(--card))",
                       border: "1px solid hsl(var(--border))",
                       borderRadius: "8px",
                     }}
                   />
                   <Area
                     type="monotone"
                     dataKey="value"
                     stroke="hsl(var(--primary))"
                     fill="hsl(var(--primary) / 0.2)"
                   />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Recent Activity */}
       <Card>
         <CardHeader>
           <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
           <p className="text-sm text-muted-foreground">Latest platform actions</p>
         </CardHeader>
         <CardContent className="space-y-4">
           {recentActivity.map((activity, i) => (
             <div key={i} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
               <Avatar className="h-10 w-10">
                 <AvatarFallback className="bg-muted">{activity.initials}</AvatarFallback>
               </Avatar>
               <div className="flex-1 min-w-0">
                 <p className="text-sm">
                   <span className="font-medium">{activity.name}</span> {activity.action}
                 </p>
                 <p className="text-xs text-muted-foreground">{activity.time}</p>
               </div>
             </div>
           ))}
         </CardContent>
       </Card>
     </div>
   );
 }