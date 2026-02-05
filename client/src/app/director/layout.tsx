"use client";

import { DirectorLayout } from "@/components/dashboard/DirectorLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={["director"]}>
            <DirectorLayout>
                {children}
            </DirectorLayout>
        </ProtectedRoute>
    );
}
