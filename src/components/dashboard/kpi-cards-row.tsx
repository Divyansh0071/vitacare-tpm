"use client";

import * as React from "react";
import {
  Users,
  BedDouble,
  CheckCircle2,
  ThermometerSnowflake,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { DashboardMetrics } from "@/types/quarantine";
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardsRowProps {
  metrics: DashboardMetrics;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export function KpiCardsRow({
  metrics,
  activeFilter = "all",
  onFilterChange,
}: KpiCardsRowProps) {
  const kpis = [
    {
      id: "admitted",
      title: "Total Admitted",
      value: metrics.totalAdmittedPatients,
      subtitle: `${metrics.occupancyRatePct}% of total capacity`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "hover:border-blue-300",
      activeRing: "ring-2 ring-blue-500",
      filterKey: "admitted",
    },
    {
      id: "occupied-beds",
      title: "Occupied Beds",
      value: `${metrics.occupiedBeds} / ${metrics.facilityCapacity}`,
      subtitle: `${metrics.occupancyRatePct}% current bed occupancy`,
      icon: BedDouble,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "hover:border-indigo-300",
      activeRing: "ring-2 ring-indigo-500",
      filterKey: "admitted",
    },
    {
      id: "available-beds",
      title: "Available Beds",
      value: metrics.availableBeds,
      subtitle: `Out of ${metrics.facilityCapacity} total beds`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "hover:border-emerald-300",
      activeRing: "ring-2 ring-emerald-500",
      filterKey: "available",
    },
    {
      id: "pending-temperature",
      title: "Pending Temp Checks",
      value: metrics.pendingTemperatureChecks,
      subtitle: `${metrics.completedTemperatureChecks} completed today`,
      icon: ThermometerSnowflake,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "hover:border-amber-300",
      activeRing: "ring-2 ring-amber-500",
      filterKey: "pending-temp",
    },
    {
      id: "pending-visits",
      title: "Pending Doctor Visits",
      value: metrics.pendingDoctorVisits,
      subtitle: `${metrics.completedDoctorVisits} rounds completed`,
      icon: Stethoscope,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "hover:border-teal-300",
      activeRing: "ring-2 ring-teal-500",
      filterKey: "pending-visit",
    },
    {
      id: "discharge-eligible",
      title: "Discharge Eligible",
      value: metrics.dischargeEligiblePatients,
      subtitle: "Cleared protocols & afebrile",
      icon: UserCheck,
      color: "text-sky-600",
      bgColor: "bg-sky-50",
      borderColor: "hover:border-sky-300",
      activeRing: "ring-2 ring-sky-500",
      filterKey: "cleared",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isSelected = activeFilter === kpi.filterKey;

        return (
          <button
            key={kpi.id}
            onClick={() => onFilterChange?.(isSelected ? "all" : kpi.filterKey)}
            className="text-left w-full focus:outline-none transition-transform active:scale-[0.98]"
            title={`Click to filter dashboard by ${kpi.title}`}
          >
            <Card
              className={`h-full transition-all duration-200 border border-slate-200/90 bg-white shadow-xs hover:shadow-md ${kpi.borderColor} ${
                isSelected ? `${kpi.activeRing} bg-slate-50/50` : ""
              }`}
            >
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider line-clamp-1">
                    {kpi.title}
                  </span>
                  <div className={`p-1.5 rounded-lg ${kpi.bgColor} ${kpi.color} shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {kpi.value}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {kpi.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

