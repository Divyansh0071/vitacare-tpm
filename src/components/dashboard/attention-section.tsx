"use client";

import * as React from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Eye,
  CheckCircle,
} from "lucide-react";
import { Patient } from "@/types/quarantine";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AttentionSectionProps {
  patients: Patient[];
  onOpenPatientModal: (patient: Patient) => void;
}

export function AttentionSection({
  patients,
  onOpenPatientModal,
}: AttentionSectionProps) {
  // Filter admitted patients needing clinical attention
  const attentionPatients = patients.filter(
    (p) =>
      p.isCurrentlyAdmitted &&
      (p.riskLevel === "critical" ||
        p.riskLevel === "high" ||
        p.status === "flagged" ||
        (p.todayVitals.temperatureCelsius !== null &&
          p.todayVitals.temperatureCelsius >= 38.2) ||
        (p.todayVitals.oxygenSaturationPct !== null &&
          p.todayVitals.oxygenSaturationPct < 95))
  );

  return (
    <Card className="border border-rose-200/90 bg-white shadow-xs">
      <CardHeader className="pb-3 border-b border-rose-100 bg-rose-50/30 rounded-t-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-600 animate-pulse" />
              Patients Requiring Immediate Attention
            </CardTitle>
            <CardDescription className="text-xs text-rose-700/80">
              Active febrile spikes, critical SpO2 drops, or clinical flags requiring attending intervention
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800 border border-rose-200 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
              {attentionPatients.length} Active Alerts
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {attentionPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
            <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-slate-800">
              All Active Patient Vitals Within Safe Parameters
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              No patients currently exceed febrile or hypoxic alert thresholds.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {attentionPatients.map((patient) => {
              const hasHighFever =
                patient.todayVitals.temperatureCelsius !== null &&
                patient.todayVitals.temperatureCelsius >= 38.2;
              const hasLowSpo2 =
                patient.todayVitals.oxygenSaturationPct !== null &&
                patient.todayVitals.oxygenSaturationPct < 95;

              return (
                <div
                  key={patient.id}
                  className="rounded-xl border border-rose-200/80 bg-white p-3.5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Name, Room, Risk Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900">
                            {patient.fullName}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {patient.id} • Room:{" "}
                          <span className="font-semibold text-slate-800">
                            {patient.roomNumber} ({patient.bedNumber})
                          </span>
                        </p>
                      </div>

                      <Badge
                        variant={
                          patient.riskLevel === "critical"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {patient.riskLevel.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Alert Reason Banner */}
                    <div className="rounded-lg bg-rose-50 p-2 text-xs text-rose-900 border border-rose-200/60 mb-3">
                      <p className="font-semibold flex items-center gap-1.5 text-[11px]">
                        <AlertTriangle className="h-3 w-3 text-rose-600 shrink-0" />
                        {patient.flagReason ||
                          (hasHighFever
                            ? `Acute Fever: ${patient.todayVitals.temperatureCelsius}°C`
                            : hasLowSpo2
                            ? `Hypoxia Warning: SpO2 ${patient.todayVitals.oxygenSaturationPct}%`
                            : "Clinical Triage Flag")}
                      </p>
                    </div>

                    {/* Vitals Snapshot */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                      <div
                        className={`rounded-lg p-2 ${
                          hasHighFever
                            ? "bg-rose-100/70 text-rose-900 font-bold border border-rose-300"
                            : "bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="text-[10px] text-slate-500 block">Temp</span>
                        {patient.todayVitals.temperatureCelsius !== null
                          ? `${patient.todayVitals.temperatureCelsius}°C`
                          : "Pending"}
                      </div>

                      <div
                        className={`rounded-lg p-2 ${
                          hasLowSpo2
                            ? "bg-rose-100/70 text-rose-900 font-bold border border-rose-300"
                            : "bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="text-[10px] text-slate-500 block">SpO2</span>
                        {patient.todayVitals.oxygenSaturationPct !== null
                          ? `${patient.todayVitals.oxygenSaturationPct}%`
                          : "Pending"}
                      </div>

                      <div className="rounded-lg p-2 bg-slate-50 text-slate-700">
                        <span className="text-[10px] text-slate-500 block">Pulse</span>
                        {patient.todayVitals.heartRateBpm !== null
                          ? `${patient.todayVitals.heartRateBpm} bpm`
                          : "Pending"}
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Assigned: {patient.doctorVisitToday.doctorName}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenPatientModal(patient)}
                      className="h-7 text-xs border-rose-200 text-rose-800 hover:bg-rose-50"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Review Alert
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

