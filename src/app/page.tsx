"use client";

import * as React from "react";
import {
  MOCK_PATIENTS,
  FACILITY_CAPACITY,
  calculateDashboardMetrics,
} from "@/data/mock-patients";
import { Patient, NavItem } from "@/types";
import { AppShell } from "@/components/layout/app-shell";
import { KpiCardsRow } from "@/components/dashboard/kpi-cards-row";
import { OccupancySection } from "@/components/dashboard/occupancy-section";
import { TemperatureMonitoringSection } from "@/components/dashboard/temperature-monitoring-section";
import { DoctorVisitsSection } from "@/components/dashboard/doctor-visits-section";
import { RecentAdmissionsSection } from "@/components/dashboard/recent-admissions-section";
import { AttentionSection } from "@/components/dashboard/attention-section";
import { BenchmarksSection } from "@/components/dashboard/benchmarks-section";
import { PatientDetailModal } from "@/components/dashboard/patient-detail-modal";
import {
  FileSpreadsheet,
  RotateCcw,
  CheckCircle,
  FilterX,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [patients, setPatients] = React.useState<Patient[]>(() => {
    if (typeof window === "undefined") return MOCK_PATIENTS;
    try {
      const saved = localStorage.getItem("vitacare-patients");
      return saved ? (JSON.parse(saved) as Patient[]) : MOCK_PATIENTS;
    } catch {
      return MOCK_PATIENTS;
    }
  });
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeNav, setActiveNav] = React.useState("dashboard");
  const [activeKpiFilter, setActiveKpiFilter] = React.useState("all");
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [systemAlertMessage, setSystemAlertMessage] = React.useState<string | null>(null);

  // Persist patients to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem("vitacare-patients", JSON.stringify(patients));
  }, [patients]);

  // Dynamic calculations from current patient state
  const metrics = React.useMemo(() => {
    return calculateDashboardMetrics(patients, FACILITY_CAPACITY);
  }, [patients]);

  const [modalInitialTab, setModalInitialTab] = React.useState<"overview" | "vitals" | "doctor" | "discharge">("overview");

  const handleOpenPatientModal = (patient: Patient, tab?: "overview" | "vitals" | "doctor" | "discharge") => {
    setSelectedPatient(patient);
    setModalInitialTab(tab ?? "overview");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
    setModalInitialTab("overview");
  };

  const handleRecordVitals = (patientId: string, temp: number, spo2: number) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;

        let status: "normal" | "elevated" | "fever" = "normal";
        if (temp >= 38.1) status = "fever";
        else if (temp >= 37.3) status = "elevated";

        const newLog = {
          id: `VH-${p.id}-${Date.now()}`,
          patientId: p.id,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          temperatureCelsius: temp,
          heartRateBpm: 76,
          oxygenSaturationPct: spo2,
          systolicBp: 120,
          diastolicBp: 78,
          notes: "Real-time vitals recorded by attending nursing staff.",
        };

        return {
          ...p,
          todayVitals: {
            ...p.todayVitals,
            temperatureCelsius: temp,
            oxygenSaturationPct: spo2,
            status,
            checkedAt: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            checkedBy: "Clinical Staff (Current Shift)",
          },
          vitalsHistory: [newLog, ...p.vitalsHistory],
        };
      })
    );

    setSystemAlertMessage(`Vitals recorded for ${patientId}: ${temp}°C, ${spo2}% SpO2.`);
    setTimeout(() => setSystemAlertMessage(null), 4000);
  };

  const handleDischargePatient = (patientId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          isCurrentlyAdmitted: false,
          status: "discharged",
          finalOutcome: "recovered",
          outcomeDate: new Date().toISOString().split("T")[0],
          todayVitals: {
            ...p.todayVitals,
            status: "normal",
          },
          doctorVisitToday: {
            ...p.doctorVisitToday,
            status: "completed",
            notes: "Final medical discharge certificate verified.",
          },
        };
      })
    );

    setSystemAlertMessage(`Patient ${patientId} successfully discharged! Bed released.`);
    setTimeout(() => setSystemAlertMessage(null), 4000);
  };

  const handleCompleteNextVisit = (patientId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          doctorVisitToday: {
            ...p.doctorVisitToday,
            status: "completed",
            completedAt: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            notes: "Evaluation round conducted by attending doctor. Vitals verified.",
          },
        };
      })
    );

    setSystemAlertMessage(`Doctor evaluation round marked as completed for ${patientId}.`);
    setTimeout(() => setSystemAlertMessage(null), 4000);
  };

  const handleRecordDoctorConsultation = (
    patientId: string,
    doctorName: string,
    notes: string,
    recommendation: string
  ) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          doctorVisitToday: {
            ...p.doctorVisitToday,
            status: "completed",
            doctorName,
            completedAt: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            notes: `${notes} [Recommendation: ${recommendation}]`,
          },
        };
      })
    );
    setSystemAlertMessage(`Doctor consultation recorded for ${patientId}.`);
    setTimeout(() => setSystemAlertMessage(null), 4000);
  };

  const handleSelectNav = (item: NavItem) => {
    setActiveNav(item.id);

    // Scroll or set view according to the selected sidebar item
    if (item.id === "patients") {
      const el = document.getElementById("section-admissions");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (item.id === "temperature") {
      const el = document.getElementById("section-temperature");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (item.id === "doctor-visits") {
      const el = document.getElementById("section-doctor-visits");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (item.id === "discharges") {
      setActiveKpiFilter("cleared");
      const el = document.getElementById("section-admissions");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (item.id === "analytics") {
      const el = document.getElementById("section-benchmarks");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      setActiveKpiFilter("all");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSelectAlertPatient = (patientId: string) => {
    const p = patients.find((pat) => pat.id === patientId);
    if (p) {
      handleOpenPatientModal(p);
    }
  };

  const handleResetData = () => {
    setPatients(MOCK_PATIENTS);
    setActiveKpiFilter("all");
    setSearchTerm("");
    setSystemAlertMessage("Demo patient data reset to standard baseline.");
    setTimeout(() => setSystemAlertMessage(null), 3000);
  };

  const handleExportCensus = () => {
    const csvHeader = "ID,Name,Room,Bed,Status,RiskLevel,Temperature,SpO2\n";
    const csvRows = patients
      .filter((p) => p.isCurrentlyAdmitted)
      .map(
        (p) =>
          `"${p.id}","${p.fullName}","${p.roomNumber}","${p.bedNumber}","${p.status}","${p.riskLevel}","${p.todayVitals.temperatureCelsius || "N/A"}","${p.todayVitals.oxygenSaturationPct || "N/A"}"`
      )
      .join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vitacare_census_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setSystemAlertMessage("Daily patient census CSV generated and downloaded.");
    setTimeout(() => setSystemAlertMessage(null), 3000);
  };

  // Filtered patients for admissions table based on KPI selection
  const displayedPatients = React.useMemo(() => {
    if (activeKpiFilter === "admitted") {
      return patients.filter((p) => p.isCurrentlyAdmitted);
    }
    if (activeKpiFilter === "pending-temp") {
      return patients.filter(
        (p) => p.isCurrentlyAdmitted && p.todayVitals.status === "pending"
      );
    }
    if (activeKpiFilter === "pending-visit") {
      return patients.filter(
        (p) => p.isCurrentlyAdmitted && p.doctorVisitToday.status === "pending"
      );
    }
    if (activeKpiFilter === "cleared") {
      return patients.filter(
        (p) => p.isCurrentlyAdmitted && p.status === "cleared"
      );
    }
    if (activeKpiFilter === "flagged") {
      return patients.filter(
        (p) => p.isCurrentlyAdmitted && p.status === "flagged"
      );
    }
    if (activeKpiFilter === "monitoring") {
      return patients.filter(
        (p) => p.isCurrentlyAdmitted && p.status === "monitoring"
      );
    }
    if (activeKpiFilter === "isolated") {
      return patients.filter(
        (p) => p.isCurrentlyAdmitted && p.status === "isolated"
      );
    }
    return patients;
  }, [patients, activeKpiFilter]);

  return (
    <AppShell
      activeNav={activeNav}
      onSelectNav={handleSelectNav}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      patientCount={metrics.totalAdmittedPatients}
      capacity={FACILITY_CAPACITY}
      alertCount={metrics.highAttentionPatientsCount}
      onSelectAlertPatient={handleSelectAlertPatient}
    >
      <div className="space-y-6 pb-12">
        {/* Toast / Feedback Banner */}
        {systemAlertMessage && (
          <div className="flex items-center justify-between rounded-xl bg-teal-50 px-4 py-2.5 text-xs text-teal-900 border border-teal-200 shadow-sm animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-teal-600" />
              <span className="font-semibold">{systemAlertMessage}</span>
            </div>
            <button
              onClick={() => setSystemAlertMessage(null)}
              className="text-teal-700 hover:text-teal-950 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Dashboard Title & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                VitaCare Operations
              </h1>
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                Live Wing Census
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Quarantine facility monitoring, vital check surveillance, and clinical rounds tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCensus}
              className="gap-1.5 text-xs bg-white text-slate-700 hover:bg-slate-50"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              Export Census CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetData}
              className="gap-1.5 text-xs bg-white text-slate-700 hover:bg-slate-50"
              title="Reset all modified vitals and statuses back to initial dataset"
            >
              <RotateCcw className="h-4 w-4 text-slate-500" />
              Reset Demo
            </Button>
          </div>
        </div>

        {/* 6 Dashboard KPI Cards */}
        <div id="section-kpis">
          <KpiCardsRow
            metrics={metrics}
            activeFilter={activeKpiFilter}
            onFilterChange={setActiveKpiFilter}
          />
        </div>

        {/* Active Filter notification pill */}
        {activeKpiFilter !== "all" && (
          <div className="flex items-center justify-between rounded-xl bg-slate-100/90 px-3.5 py-2 text-xs text-slate-700 border border-slate-200">
            <span>
              Filtering dashboard by:{" "}
              <strong className="text-slate-900 uppercase">{activeKpiFilter}</strong> (
              {displayedPatients.filter((p) => p.isCurrentlyAdmitted).length} patients shown)
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveKpiFilter("all")}
              className="h-6 px-2 text-xs gap-1 text-slate-600 hover:text-slate-900"
            >
              <FilterX className="h-3 w-3" />
              Clear Filter
            </Button>
          </div>
        )}

        {/* 1. Patient Occupancy Progress Bar */}
        <div id="section-occupancy">
          <OccupancySection
            patients={patients}
            metrics={metrics}
            onFilterStatus={(status) => setActiveKpiFilter(status)}
          />
        </div>

        {/* 2. Temperature Monitoring & 3. Doctor Visits (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div id="section-temperature">
            <TemperatureMonitoringSection
              patients={patients}
              onFilterTempStatus={(status) => {
                if (status === "pending") setActiveKpiFilter("pending-temp");
                else setActiveKpiFilter("all");
              }}
              onOpenPatientModal={handleOpenPatientModal}
            />
          </div>

          <div id="section-doctor-visits">
            <DoctorVisitsSection
              patients={patients}
              onFilterVisits={(status) => {
                if (status === "pending") setActiveKpiFilter("pending-visit");
                else setActiveKpiFilter("all");
              }}
              onOpenPatientModal={handleOpenPatientModal}
              onCompleteNextVisit={handleCompleteNextVisit}
            />
          </div>
        </div>

        {/* 5. Patients Requiring Attention */}
        <div id="section-attention">
          <AttentionSection
            patients={patients}
            onOpenPatientModal={handleOpenPatientModal}
          />
        </div>

        {/* 4. Recent Patient Admissions */}
        <div id="section-admissions">
          <RecentAdmissionsSection
            patients={displayedPatients}
            onOpenPatientModal={handleOpenPatientModal}
            searchTerm={searchTerm}
          />
        </div>

        {/* 6. Mortality Rate (15% benchmark) & 7. Treatment Success Rate (85% benchmark) */}
        <div id="section-benchmarks">
          <div className="mb-2">
            <h3 className="text-base font-bold text-slate-900">
              Clinical Quality & Epidemiological Benchmarks
            </h3>
            <p className="text-xs text-slate-500">
              Calculated dynamically strictly from {metrics.mortalityTotalOutcomes} confirmed closed cases.
            </p>
          </div>
          <BenchmarksSection metrics={metrics} />
        </div>
      </div>

      {/* Interactive Patient Detail Modal */}
      <PatientDetailModal
        key={selectedPatient?.id ?? "no-patient"}
        patient={selectedPatient}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRecordVitals={handleRecordVitals}
        onRecordDoctorConsultation={handleRecordDoctorConsultation}
        onDischarge={handleDischargePatient}
        initialTab={modalInitialTab}
      />
    </AppShell>
  );
}
