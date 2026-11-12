"use client";

import * as React from "react";
import {
  Bell,
  Menu,
  Search,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuToggle?: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  alertCount?: number;
  onSelectAlertPatient?: (patientId: string) => void;
}

export function Header({
  onMenuToggle,
  searchTerm = "",
  onSearchChange,
  alertCount = 3,
  onSelectAlertPatient,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = React.useState(false);

  const notifications = [
    {
      id: "N1",
      patientId: "PT-1004",
      title: "Critical Vital Alert: David J. Miller (ICU-02)",
      desc: "Temperature 39.2°C & SpO2 dropped to 91%. Immediate review required.",
      type: "critical",
      time: "10m ago",
      icon: ShieldAlert,
    },
    {
      id: "N2",
      patientId: "PT-1007",
      title: "High Risk Vitals: Fatima Al-Mansoor (B-210)",
      desc: "Borderline SpO2 93% with hypertensive baseline.",
      type: "warning",
      time: "25m ago",
      icon: AlertTriangle,
    },
    {
      id: "N3",
      patientId: "PT-1003",
      title: "Discharge Ready: Amara Okafor (A-108)",
      desc: "Completed full protocol. Awaiting discharge checkout paperwork.",
      type: "success",
      time: "45m ago",
      icon: UserCheck,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 shadow-xs">
      {/* Left side: Mobile menu toggle + breadcrumb / subtitle */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-slate-700 hover:bg-slate-100"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Quarantine Unit Alpha
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Facility ID: FAC-NORTH-01
            </span>
          </div>
          <h2 className="text-sm font-semibold text-slate-900 hidden sm:block">
            Clinical Operations Center
          </h2>
        </div>
      </div>

      {/* Right side: Search, Notifications, Doctor Profile */}
      <div className="flex items-center gap-3">
        {/* Real-time Search Input */}
        <div className="relative w-48 sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search patient, room, ID..."
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {alertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {alertCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-3 shadow-xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Clinical Priority Alerts
                  </h4>
                  <span className="rounded-full bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-700">
                    {alertCount}
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="rounded-md p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-80 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        setShowNotifications(false);
                        onSelectAlertPatient?.(n.patientId);
                      }}
                      className="w-full text-left p-2.5 rounded-xl transition-colors hover:bg-slate-50 flex items-start gap-2.5 border border-slate-100"
                    >
                      <div
                        className={`rounded-lg p-1.5 shrink-0 ${
                          n.type === "critical"
                            ? "bg-rose-100 text-rose-700"
                            : n.type === "warning"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {n.desc}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {n.time} • Click to open record
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-blue-600 text-white text-xs font-bold shadow-xs">
            SL
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              Dr. Sarah Lin
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Chief Officer</p>
          </div>
        </div>
      </div>
    </header>
  );
}
