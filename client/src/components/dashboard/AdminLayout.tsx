import { useState } from "react";
 import { Outlet } from "react-router-dom";
 import { AdminSidebar } from "./AdminSidebar";
 import { DashboardHeader } from "./DashboardHeader";
 import { Sheet, SheetContent } from "@/components/ui/sheet";
 
 export function AdminLayout() {
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 
   return (
     <div className="min-h-screen flex bg-[#DEFCFE]">
       {/* Desktop Sidebar */}
       <AdminSidebar className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40" />
 
       {/* Mobile Sidebar */}
       <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
         <SheetContent side="left" className="p-0 w-64">
           <AdminSidebar />
         </SheetContent>
       </Sheet>
 
       {/* Main Content */}
       <div className="flex-1 flex flex-col min-w-0">
         <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />
         <main className="flex-1 p-4 lg:p-6 overflow-auto lg:ml-64">
           <Outlet />
         </main>
       </div>
     </div>
   );
 }