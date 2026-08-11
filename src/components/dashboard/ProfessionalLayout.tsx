import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ProfessionalSidebar } from "./ProfessionalSidebar";
import { DashboardHeader } from "./Header";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function ProfessionalLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-slate-50/80 to-[#eefcfd] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Desktop Sidebar */}
      <ProfessionalSidebar className="hidden lg:flex fixed top-0 left-0 h-screen w-64 overflow-y-auto z-40" />

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <ProfessionalSidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
