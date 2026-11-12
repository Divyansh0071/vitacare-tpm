"use client";

import * as React from "react";
import { BedDouble, CheckCircle2 } from "lucide-react";
import { Patient, DashboardMetrics } from "@/types/quarantine";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface OccupancySectionProps {
  patients: Patient[];
  metrics: DashboardMetrics;
  onFilterStatus?: (status: string) => void;
}

export function OccupancySection({
  patients,
  metrics,
  onFilterStatus,
}: OccupancySectionProps) {
  const admitted = patients.filter((p) => p.isCurrentlyAdmitted);

  const monitoringCount = admitted.filter((p) => p.status === "monitoring").length;
  const isolatedCount = admitted.filter((p) => p.status === "isolated").length;
  const clearedCount = admitted.filter((p) => p.status === "cleared").length;
  const flaggedCount = admitted.filter((p) => p.status === "flagged").length;

  const total = metrics.facilityCapacity; // 74

  const monitoringPct = (monitoringCount / total) * 100;
  const isolatedPct = (isolatedCount / total) * 100;
  const clearedPct = (clearedCount / total) * 100;
  const flaggedPct = (flaggedCount / total) * 100;

  return (
    <Card className="border border-slate-200/90 bg-white shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-teal-600" />
              Patient Occupancy & Bed Distribution
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Real-time capacity utilization across quarantine isolation wards
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Facility Capacity:</span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-900">
              {metrics.facilityCapacity} Beds Total
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Top metrics summary */}
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {metrics.occupiedBeds}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              / {metrics.facilityCapacity} Beds Occupied
            </span>
            <span className="ml-2 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700 border border-teal-200">
              {metrics.occupancyRatePct}% Occupancy
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{metrics.availableBeds} Available Beds Ready for Intake</span>
          </div>
        </div>

        {/* Multi-segment visual progress bar */}
        <div className="space-y-1.5">
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 flex">
            {/* Monitoring */}
            <div
              style={{ width: `${monitoringPct}%` }}
              className="h-full bg-teal-500 rounded-l-full transition-all duration-500"
              title={`Monitoring: ${monitoringCount} beds (${monitoringPct.toFixed(1)}%)`}
            />
            {/* Isolated */}
            <div
              style={{ width: `${isolatedPct}%` }}
              className="h-full bg-amber-500 transition-all duration-500"
              title={`Isolated: ${isolatedCount} beds (${isolatedPct.toFixed(1)}%)`}
            />
            {/* Cleared */}
            <div
              style={{ width: `${clearedPct}%` }}
              className="h-full bg-sky-500 transition-all duration-500"
              title={`Cleared / Discharge Ready: ${clearedCount} beds (${clearedPct.toFixed(1)}%)`}
            />
            {/* Flagged */}
            <div
              style={{ width: `${flaggedPct}%` }}
              className="h-full bg-rose-500 transition-all duration-500"
              title={`Flagged for Attention: ${flaggedCount} beds (${flaggedPct.toFixed(1)}%)`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>0 Beds</span>
            <span>37 Beds (50%)</span>
            <span>74 Beds (100% Full)</span>
          </div>
        </div>

        {/* Breakdown Filter Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => onFilterStatus?.("monitoring")}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-teal-50/60 border border-slate-200/80 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
              <span className="text-xs font-medium text-slate-700">Monitoring</span>
            </div>
            <span className="text-xs font-bold text-slate-900">{monitoringCount}</span>
          </button>

          <button
            onClick={() => onFilterStatus?.("isolated")}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-medium text-slate-700">Isolated</span>
            </div>
            <span className="text-xs font-bold text-slate-900">{isolatedCount}</span>
          </button>

          <button
            onClick={() => onFilterStatus?.("cleared")}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-sky-50/60 border border-slate-200/80 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              <span className="text-xs font-medium text-slate-700">Discharge Ready</span>
            </div>
            <span className="text-xs font-bold text-slate-900">{clearedCount}</span>
          </button>

          <button
            onClick={() => onFilterStatus?.("flagged")}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-rose-50/60 border border-slate-200/80 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span className="text-xs font-medium text-slate-700">Flagged Attention</span>
            </div>
            <span className="text-xs font-bold text-slate-900">{flaggedCount}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

