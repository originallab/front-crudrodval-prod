"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function ContenedoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        <AppSidebar />

        {/* Contenido principal */}
        <div className="flex-1 p-4"  >
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
