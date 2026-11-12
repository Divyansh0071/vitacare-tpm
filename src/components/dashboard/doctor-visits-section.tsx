"use client";

import * as React from "react";
import {
  Stethoscope,
  CheckCircle2,
  Clock,
  Plus,
} from "lucide-react";
import { Patient } from "@/types/quarantine";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DoctorVisitsSectionProps {
  patients: Patient[];
  onFilterVisits?: (status: string) => void;
  onOpenPatientModal?: (patient: Patient, tab?: "overview" | "vitals" | "doctor" | "discharge") => void;
  onCompleteNextVisit: (patientId: string) => void;
}

export function DoctorVisitsSection({
  patients,
  onFilterVisits,
  onOpenPatientModal,
  onCompleteNextVisit,
}: DoctorVisitsSectionProps) {
  const admitted = patients.filter((p) => p.isCurrentlyAdmitted);
  const total = admitted.length;

  const completed = admitted.filter(
    (p) => p.doctorVisitToday.status === "completed"
  ).length;

  const inProgress = admitted.filter(
    (p) => p.doctorVisitToday.status === "in_progress"
  ).length;

  const pending = admitted.filter(
    (p) => p.doctorVisitToday.status === "pending"
  ).length;

  const completionPct = total > 0 ? ((completed / total) * 100).toFixed(0) : "0";

  // Doctors on duty summary
  const doctorsMap: Record<
    string,
    { completed: number; pending: number; specialty: string }
  > = {};

  admitted.forEach((p) => {
    const docName = p.doctorVisitToday.doctorName;
    if (!doctorsMap[docName]) {
      doctorsMap[docName] = {
        completed: 0,
        pending: 0,
        specialty: p.doctorVisitToday.doctorSpecialty || "General Medicine",
      };
    }
    if (p.doctorVisitToday.status === "completed") {
      doctorsMap[docName].completed++;
    } else {
      doctorsMap[docName].pending++;
    }
  });

  const nextPendingPatient = admitted.find(
    (p) => p.doctorVisitToday.status === "pending"
  );

  return (
    <Card className="border border-slate-200/90 bg-white shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-teal-600" />
              Doctor Visit Completion Status
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Daily attending physician rounds & clinical evaluations
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              {completionPct}% Complete Today
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar & Summary Stats */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-xs">
            <button
              type="button"
              onClick={() => onFilterVisits?.("completed")}
              className="font-semibold text-slate-700 hover:text-teal-700 transition-colors cursor-pointer"
            >
              Rounds Conducted: {completed} of {total} Admitted Patients
            </button>
            <button
              type="button"
              onClick={() => onFilterVisits?.("pending")}
              className="text-slate-500 font-medium hover:text-amber-700 transition-colors cursor-pointer"
            >
              {pending} pending • {inProgress} in progress
            </button>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 flex">
            <div
              style={{ width: `${(completed / total) * 100}%` }}
              className="h-full bg-teal-500 transition-all duration-500 rounded-l-full"
              title={`Completed: ${completed}`}
            />
            <div
              style={{ width: `${(inProgress / total) * 100}%` }}
              className="h-full bg-amber-500 transition-all duration-500"
              title={`In Progress: ${inProgress}`}
            />
          </div>
        </div>

        {/* Doctor Roster & Workload */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Attending Physicians on Duty
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {Object.entries(doctorsMap).map(([doctorName, stats]) => (
              <div
                key={doctorName}
                className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {doctorName}
                  </p>
                  <p className="text-[10px] text-teal-700 font-medium">
                    {stats.specialty}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {stats.completed} Done
                  </span>
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {stats.pending} Due
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Visit Call-To-Action */}
        {nextPendingPatient && (
          <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-teal-100 p-2 text-teal-800">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Next Due: {nextPendingPatient.fullName} ({nextPendingPatient.roomNumber})
                </p>
                <p className="text-[11px] text-slate-600">
                  Assigned: {nextPendingPatient.doctorVisitToday.doctorName} •{" "}
                  {nextPendingPatient.doctorVisitToday.scheduledTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenPatientModal?.(nextPendingPatient, "doctor")}
                className="text-xs h-8 bg-white text-slate-700 hover:text-teal-700 gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3 text-teal-600" />
                Record Consultation
              </Button>

              <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => onCompleteNextVisit(nextPendingPatient.id)}
                  className="text-xs h-8 bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
                >
                  Mark Round Completed
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
