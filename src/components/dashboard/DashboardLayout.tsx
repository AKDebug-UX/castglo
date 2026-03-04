import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#DEFCFE]">
      {/* Desktop Sidebar (fixed) */}
      <DashboardSidebar className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40" />

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <DashboardSidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen min-w-0">
        <div className="sticky top-0 z-30">
          <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />
        </div>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
