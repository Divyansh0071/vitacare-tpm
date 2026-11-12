"use client";

import * as React from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { NavItem } from "@/constants/navigation";

interface AppShellProps {
  children: React.ReactNode;
  activeNav?: string;
  onSelectNav?: (item: NavItem) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  patientCount?: number;
  capacity?: number;
  alertCount?: number;
  onSelectAlertPatient?: (patientId: string) => void;
}

export function AppShell({
  children,
  activeNav = "dashboard",
  onSelectNav,
  searchTerm = "",
  onSearchChange,
  patientCount = 14,
  capacity = 74,
  alertCount = 3,
  onSelectAlertPatient,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50/60 text-slate-900 selection:bg-teal-500/20 selection:text-teal-900">
      {/* Dark Navy Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={activeNav}
        onSelectNav={onSelectNav}
        patientCount={patientCount}
        capacity={capacity}
      />

      {/* Main Content Area with Header */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          alertCount={alertCount}
          onSelectAlertPatient={onSelectAlertPatient}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
