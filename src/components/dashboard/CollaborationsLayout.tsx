import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardSidebar as TalentSidebar } from "./TalentSidebar";
import { DirectorSidebar } from "./DirectorSidebar";
import { ProfessionalSidebar } from "./ProfessionalSidebar";
import { AdminSidebar } from "./AdminSidebar";
import { DashboardHeader } from "./Header";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function CollaborationsLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const renderSidebar = () => {
    switch (user?.role) {
      case "admin":
        return <AdminSidebar className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40" />;
      case "casting_director":
        return <DirectorSidebar className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40" />;
      case "industry_professional":
        return <ProfessionalSidebar className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40" />;
      case "talent":
      default:
        return <TalentSidebar className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40" />;
    }
  };

  const renderMobileSidebar = () => {
    switch (user?.role) {
      case "admin":
        return <AdminSidebar />;
      case "casting_director":
        return <DirectorSidebar />;
      case "industry_professional":
        return <ProfessionalSidebar />;
      case "talent":
      default:
        return <TalentSidebar />;
    }
  };

  return (
    <div className="min-h-screen bg-[#DEFCFE]">
      {/* Desktop Sidebar */}
      {renderSidebar()}

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          {renderMobileSidebar()}
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
