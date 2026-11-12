"use client";

import * as React from "react";
import {
  Thermometer,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Patient } from "@/types/quarantine";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TemperatureMonitoringSectionProps {
  patients: Patient[];
  onFilterTempStatus?: (status: string) => void;
  onOpenPatientModal?: (patient: Patient) => void;
  onOpenRecordTempModal?: (patient?: Patient) => void;
}

export function TemperatureMonitoringSection({
  patients,
  onFilterTempStatus,
  onOpenPatientModal,
  onOpenRecordTempModal,
}: TemperatureMonitoringSectionProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const admitted = patients.filter((p) => p.isCurrentlyAdmitted);
  const total = admitted.length;

  const normalCount = admitted.filter(
    (p) => p.todayVitals.status === "normal"
  ).length;

  const elevatedCount = admitted.filter(
    (p) => p.todayVitals.status === "elevated"
  ).length;

  const feverCount = admitted.filter(
    (p) => p.todayVitals.status === "fever"
  ).length;

  const pendingCount = admitted.filter(
    (p) => p.todayVitals.status === "pending"
  ).length;

  const chartData = [
    { name: "Normal (<37.3°)", count: normalCount, color: "#10b981", key: "normal" },
    { name: "Elevated (37.3-38°)", count: elevatedCount, color: "#f59e0b", key: "elevated" },
    { name: "Fever (≥38.1°)", count: feverCount, color: "#ef4444", key: "fever" },
    { name: "Pending Check", count: pendingCount, color: "#94a3b8", key: "pending" },
  ];

  const pendingPatients = admitted.filter(
    (p) => p.todayVitals.status === "pending"
  );

  return (
    <Card className="border border-slate-200/90 bg-white shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-rose-500" />
              Today&apos;s Temperature Monitoring Status
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Daily vitals rounds & febrile surveillance across admitted cohort ({total} patients)
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {total - pendingCount} / {total} Checks Logged
            </span>
            {onOpenRecordTempModal && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenRecordTempModal()}
                className="h-8 text-xs gap-1 border-teal-300 text-teal-800 hover:bg-teal-50"
              >
                <Plus className="h-3.5 w-3.5 text-teal-600" />
                Log Reading
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => onFilterTempStatus?.("normal")}
            className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-left transition-all hover:bg-emerald-50 focus:outline-none cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-medium text-emerald-800">
              <span>Normal</span>
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-900">{normalCount}</div>
            <p className="text-[10px] text-emerald-700 mt-0.5">
              {total > 0 ? ((normalCount / total) * 100).toFixed(0) : 0}% of admitted
            </p>
          </button>

          <button
            type="button"
            onClick={() => onFilterTempStatus?.("elevated")}
            className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-left transition-all hover:bg-amber-50 focus:outline-none cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-medium text-amber-800">
              <span>Elevated</span>
              <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div className="mt-1 text-2xl font-bold text-amber-900">{elevatedCount}</div>
            <p className="text-[10px] text-amber-700 mt-0.5">
              37.3°C – 38.0°C range
            </p>
          </button>

          <button
            type="button"
            onClick={() => onFilterTempStatus?.("fever")}
            className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-left transition-all hover:bg-rose-50 focus:outline-none cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-medium text-rose-800">
              <span>High Fever</span>
              <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
            </div>
            <div className="mt-1 text-2xl font-bold text-rose-900">{feverCount}</div>
            <p className="text-[10px] text-rose-700 mt-0.5">
              Active antipyretic care
            </p>
          </button>

          <button
            type="button"
            onClick={() => onFilterTempStatus?.("pending")}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition-all hover:bg-slate-100 focus:outline-none cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span>Pending</span>
              <Clock className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{pendingCount}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Scheduled afternoon round
            </p>
          </button>
        </div>

        {/* Visual Bar Chart with isMounted guard to protect against SSR Hydration Mismatches */}
        <div className="h-44 w-full pt-1">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs">
                          <p className="font-semibold text-slate-900">{data.name}</p>
                          <p className="text-slate-600 mt-0.5">
                            Patients: <span className="font-bold text-slate-900">{data.count}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-slate-400 bg-slate-50/50 rounded-xl">
              Loading temperature surveillance chart...
            </div>
          )}
        </div>

        {/* Pending checks quick access list */}
        {pendingPatients.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                Action Required: Next Due for Temperature Logging
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {pendingPatients.length} awaiting
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {pendingPatients.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => onOpenPatientModal?.(p)}
                  className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition-all text-slate-800 cursor-pointer"
                >
                  <span className="font-semibold">{p.fullName}</span>
                  <span className="text-[10px] text-slate-500">({p.roomNumber})</span>
                  <span className="rounded bg-amber-100 text-amber-800 text-[9px] font-bold px-1">
                    Check Vitals
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
