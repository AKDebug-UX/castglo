"use client";

import { ProfessionalLayout } from "@/components/dashboard/ProfessionalLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={["professional"]}>
            <ProfessionalLayout>
                {children}
            </ProfessionalLayout>
        </ProtectedRoute>
    );
}
