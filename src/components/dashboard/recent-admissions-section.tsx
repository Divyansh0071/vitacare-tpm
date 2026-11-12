"use client";

import * as React from "react";
import {
  Users,
  Eye,
  Calendar,
  Thermometer,
} from "lucide-react";
import { Patient } from "@/types/quarantine";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecentAdmissionsSectionProps {
  patients: Patient[];
  onOpenPatientModal: (patient: Patient) => void;
  searchTerm?: string;
}

export function RecentAdmissionsSection({
  patients,
  onOpenPatientModal,
  searchTerm = "",
}: RecentAdmissionsSectionProps) {
  // Filter admitted patients and sort by admission date descending
  const admitted = patients.filter((p) => p.isCurrentlyAdmitted);

  const filtered = admitted.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term) ||
      p.roomNumber.toLowerCase().includes(term) ||
      p.status.toLowerCase().includes(term)
    );
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime()
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "cleared":
        return "success";
      case "isolated":
        return "warning";
      case "flagged":
        return "destructive";
      default:
        return "default";
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "critical":
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      default:
        return "success";
    }
  };

  return (
    <Card className="border border-slate-200/90 bg-white shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Recent Patient Admissions
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Active admissions sorted by arrival date into Quarantine Unit Alpha
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Showing {sorted.length} of {admitted.length} active patients</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">Patient Name & ID</th>
                <th className="py-3 px-3">Room / Bed</th>
                <th className="py-3 px-3">Admission</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-3">Quarantine Status</th>
                <th className="py-3 px-3">Latest Vitals</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching patients found.
                  </td>
                </tr>
              ) : (
                sorted.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px]">
                          {patient.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{patient.fullName}</p>
                          <p className="text-[10px] text-slate-400">
                            {patient.id} • {patient.age}y ({patient.gender[0].toUpperCase()})
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {patient.roomNumber}{" "}
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({patient.bedNumber})
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {patient.admissionDate}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <Badge variant={getRiskBadgeVariant(patient.riskLevel)}>
                        {patient.riskLevel.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3 px-3">
                      <Badge variant={getStatusBadgeVariant(patient.status)}>
                        {patient.status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3 px-3">
                      {patient.todayVitals.temperatureCelsius !== null ? (
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <Thermometer
                            className={`h-3.5 w-3.5 ${
                              patient.todayVitals.status === "fever"
                                ? "text-rose-500"
                                : patient.todayVitals.status === "elevated"
                                ? "text-amber-500"
                                : "text-emerald-500"
                            }`}
                          />
                          <span>{patient.todayVitals.temperatureCelsius}°C</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({patient.todayVitals.oxygenSaturationPct}% O2)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          Pending Check
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenPatientModal(patient)}
                        className="h-7 px-2.5 text-xs text-slate-700 hover:text-teal-700 hover:border-teal-400 hover:bg-teal-50/50"
                      >
                        <Eye className="h-3 w-3 mr-1 text-teal-600" />
                        View Chart
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

