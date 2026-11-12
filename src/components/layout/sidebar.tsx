"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Thermometer,
  Stethoscope,
  UserCheck,
  BarChart3,
  X,
  ShieldCheck,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MAIN_NAVIGATION, NavItem } from "@/constants/navigation";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeItem?: string;
  onSelectNav?: (item: NavItem) => void;
  patientCount?: number;
  capacity?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Thermometer,
  Stethoscope,
  UserCheck,
  BarChart3,
};

export function Sidebar({
  isOpen,
  onClose,
  activeItem = "dashboard",
  onSelectNav,
  patientCount = 14,
  capacity = 74,
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-[#0B1528] text-slate-200 transition-transform duration-300 ease-in-out md:static md:translate-x-0 shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-white tracking-tight">VitaCare</span>
                <span className="rounded bg-teal-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-teal-300">
                  SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Quarantine Management
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3.5 py-5">
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Main Navigation
            </p>

            <nav className="mt-2 space-y-1">
              {MAIN_NAVIGATION.map((item) => {
                const Icon = iconMap[item.iconName] || LayoutDashboard;
                const isActive = activeItem === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (onSelectNav) onSelectNav(item);
                      if (onClose) onClose();
                    }}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-left",
                      isActive
                        ? "bg-gradient-to-r from-teal-500/20 to-blue-500/10 text-teal-300 font-semibold border-l-2 border-teal-400 shadow-sm"
                        : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive
                            ? "text-teal-400"
                            : "text-slate-400 group-hover:text-slate-200"
                        )}
                      />
                      <span>{item.title}</span>
                    </div>

                    {item.id === "patients" && (
                      <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[11px] font-semibold text-teal-300">
                        {patientCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Facility Status Card */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-teal-400" />
                  Facility Wing A
                </span>
                <span className="flex items-center gap-1 text-[11px] text-teal-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                  Live
                </span>
              </div>
              <div className="mt-2.5 flex justify-between text-[11px] text-slate-400">
                <span>Occupancy</span>
                <span className="font-semibold text-slate-200">
                  {patientCount} / {capacity} beds
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full"
                  style={{
                    width: `${Math.min((patientCount / capacity) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 px-2 text-[11px] text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
              <span>VitaCare v2.4 Enterprise</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
