"use client";

import * as React from "react";
import {
  X,
  User,
  Heart,
  Thermometer,
  Activity,
  Wind,
  Calendar,
  Stethoscope,
  CheckCircle,
  Clock,
  ShieldAlert,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import { Patient } from "@/types/quarantine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PatientDetailModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordVitals?: (patientId: string, temp: number, spo2: number) => void;
  onRecordDoctorConsultation?: (
    patientId: string,
    doctorName: string,
    notes: string,
    recommendation: string
  ) => void;
  onDischarge?: (patientId: string) => void;
  initialTab?: "overview" | "vitals" | "doctor" | "discharge";
}

export function PatientDetailModal({
  patient,
  isOpen,
  onClose,
  onRecordVitals,
  onRecordDoctorConsultation,
  onDischarge,
  initialTab = "overview",
}: PatientDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "vitals" | "doctor" | "discharge"
  >(initialTab);

  // Vitals form state
  const [tempInput, setTempInput] = React.useState("36.8");
  const [spo2Input, setSpo2Input] = React.useState("98");

  // Doctor consultation form state
  const [doctorNameInput, setDoctorNameInput] = React.useState("Dr. Sarah Lin");
  const [consultationNotesInput, setConsultationNotesInput] = React.useState(
    "Patient is alert, lungs clear bilaterally. Vitals stable. Continue current quarantine protocol."
  );
  const [recommendationInput, setRecommendationInput] = React.useState(
    "Continue standard monitoring"
  );

  const [feedbackMsg, setFeedbackMsg] = React.useState<string | null>(null);
  const [dischargeError, setDischargeError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setActiveTab(initialTab);
    setFeedbackMsg(null);
    setDischargeError(null);
  }, [initialTab, patient?.id]);

  if (!isOpen || !patient) return null;

  // 3-Day Fever-Free Rule Validation
  // Definition: All recorded temperatures in the past 3 days (history + today) must be < 37.5°C,
  // today's vitals must be logged, and there must not be any fever reading >= 37.5°C in that 72h window.
  const evaluateThreeDayFeverFreeRule = () => {
    const readings: { date: string; temp: number; isFever: boolean }[] = [];

    // Add recent vitals history
    if (patient.vitalsHistory && patient.vitalsHistory.length > 0) {
      patient.vitalsHistory.slice(0, 3).forEach((v) => {
        readings.push({
          date: v.timestamp,
          temp: v.temperatureCelsius,
          isFever: v.temperatureCelsius >= 37.5,
        });
      });
    }

    // Add today's vitals if logged
    if (patient.todayVitals.temperatureCelsius !== null) {
      readings.unshift({
        date: `Today (${patient.todayVitals.checkedAt || "Current"})`,
        temp: patient.todayVitals.temperatureCelsius,
        isFever: patient.todayVitals.temperatureCelsius >= 37.5,
      });
    }

    const hasFeverInWindow = readings.some((r) => r.isFever);
    const hasEnoughData = readings.length >= 2;
    const isTodayNormal =
      patient.todayVitals.temperatureCelsius !== null &&
      patient.todayVitals.temperatureCelsius < 37.3;

    const isEligible = !hasFeverInWindow && isTodayNormal && hasEnoughData;

    return {
      isEligible,
      readings,
      hasFeverInWindow,
      isTodayNormal,
      hasEnoughData,
      reason: !isTodayNormal
        ? "Today's temperature reading is either pending or above normal threshold (<37.3°C)."
        : hasFeverInWindow
        ? "Patient recorded a febrile spike (≥37.5°C) within the mandatory 72-hour observation window."
        : !hasEnoughData
        ? "Insufficient consecutive daily temperature records (at least 2 consecutive afebrile logs required)."
        : "Patient meets all medical criteria: 3-day fever-free protocol verified.",
    };
  };

  const feverFreeCheck = evaluateThreeDayFeverFreeRule();

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const tempNum = parseFloat(tempInput);
    const spo2Num = parseInt(spo2Input, 10);
    if (!isNaN(tempNum) && !isNaN(spo2Num) && onRecordVitals) {
      onRecordVitals(patient.id, tempNum, spo2Num);
      setFeedbackMsg("New vitals recorded successfully!");
      setTimeout(() => setFeedbackMsg(null), 3000);
      setActiveTab("overview");
    }
  };

  const handleSaveConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRecordDoctorConsultation) {
      onRecordDoctorConsultation(
        patient.id,
        doctorNameInput,
        consultationNotesInput,
        recommendationInput
      );
      setFeedbackMsg("Doctor consultation details recorded!");
      setTimeout(() => setFeedbackMsg(null), 3000);
      setActiveTab("overview");
    }
  };

  const handleDischargeConfirm = () => {
    if (!feverFreeCheck.isEligible) {
      setDischargeError(
        `Discharge Prohibited: ${feverFreeCheck.reason}`
      );
      return;
    }

    if (onDischarge) {
      onDischarge(patient.id);
      setFeedbackMsg("Patient discharge authorized! Bed has been released.");
      setTimeout(() => {
        setFeedbackMsg(null);
        onClose();
      }, 1500);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "cleared":
        return "success";
      case "isolated":
        return "warning";
      case "flagged":
      case "deceased":
        return "destructive";
      case "discharged":
        return "secondary";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-patient-name"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-bold text-lg">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="modal-patient-name"
                  className="text-xl font-bold text-slate-900"
                >
                  {patient.fullName}
                </h3>
                <Badge variant={getStatusBadgeVariant(patient.status)}>
                  {patient.status.toUpperCase()}
                </Badge>
                <Badge variant={getRiskBadgeVariant(patient.riskLevel)}>
                  Risk: {patient.riskLevel.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ID: {patient.id} • National ID: {patient.nationalId} • Age: {patient.age} ({patient.gender})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs inside Modal */}
        <div className="flex items-center gap-1 border-b border-slate-200 mt-3 pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "bg-teal-50 text-teal-800 font-bold border border-teal-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Clinical Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vitals")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "vitals"
                ? "bg-teal-50 text-teal-800 font-bold border border-teal-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Thermometer className="h-3.5 w-3.5" />
            Record Vitals
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("doctor")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "doctor"
                ? "bg-teal-50 text-teal-800 font-bold border border-teal-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Doctor Consultation
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("discharge")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "discharge"
                ? "bg-teal-50 text-teal-800 font-bold border border-teal-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <FileCheck className="h-3.5 w-3.5" />
            Discharge Protocol
          </button>
        </div>

        {feedbackMsg && (
          <div className="my-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 border border-emerald-200">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            {feedbackMsg}
          </div>
        )}

        {/* Tab 1: Clinical Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6 pt-4">
            {/* Facility & Location Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 rounded-xl p-3 text-xs border border-slate-100">
              <div>
                <span className="text-slate-500 font-medium">Room & Bed:</span>
                <p className="text-slate-900 font-semibold mt-0.5">
                  {patient.roomNumber} ({patient.bedNumber})
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Admission Date:</span>
                <p className="text-slate-900 font-semibold mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  {patient.admissionDate}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Expected Discharge:</span>
                <p className="text-slate-900 font-semibold mt-0.5">
                  {patient.expectedDischargeDate}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Emergency Contact:</span>
                <p className="text-slate-900 font-semibold mt-0.5 truncate" title={patient.emergencyContact}>
                  {patient.emergencyContact}
                </p>
              </div>
            </div>

            {/* Primary Condition & Flag Banner */}
            {patient.flagReason && (
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3.5 border border-amber-200 text-amber-900 text-sm">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-950">Active Clinical Flag</p>
                  <p className="text-xs text-amber-800 mt-0.5">{patient.flagReason}</p>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Primary Diagnosis / Clinical Assessment
              </h4>
              <p className="text-sm text-slate-800 bg-white p-3 rounded-xl border border-slate-200">
                {patient.primaryCondition}
              </p>
            </div>

            {/* Today's Vitals Summary */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Latest Recorded Vitals
                </h4>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {patient.todayVitals.checkedAt || "Check pending for today"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                    <Thermometer className="h-4 w-4 text-rose-500" />
                    Temperature
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {patient.todayVitals.temperatureCelsius !== null
                      ? `${patient.todayVitals.temperatureCelsius}°C`
                      : "Pending"}
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      patient.todayVitals.status === "fever"
                        ? "bg-rose-100 text-rose-800"
                        : patient.todayVitals.status === "elevated"
                        ? "bg-amber-100 text-amber-800"
                        : patient.todayVitals.status === "normal"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {patient.todayVitals.status.toUpperCase()}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                    <Wind className="h-4 w-4 text-sky-500" />
                    SpO2 Oxygen
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {patient.todayVitals.oxygenSaturationPct !== null
                      ? `${patient.todayVitals.oxygenSaturationPct}%`
                      : "Pending"}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {patient.todayVitals.oxygenSaturationPct &&
                    patient.todayVitals.oxygenSaturationPct < 95
                      ? "Sub-optimal"
                      : "Optimal"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                    <Heart className="h-4 w-4 text-pink-500" />
                    Heart Rate
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {patient.todayVitals.heartRateBpm !== null
                      ? `${patient.todayVitals.heartRateBpm} bpm`
                      : "Pending"}
                  </div>
                  <span className="text-[10px] text-slate-500">Resting pulse</span>
                </div>

                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                    <Activity className="h-4 w-4 text-indigo-500" />
                    Blood Pressure
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {patient.todayVitals.systolicBp && patient.todayVitals.diastolicBp
                      ? `${patient.todayVitals.systolicBp}/${patient.todayVitals.diastolicBp}`
                      : "Pending"}
                  </div>
                  <span className="text-[10px] text-slate-500">mmHg</span>
                </div>
              </div>
            </div>

            {/* Doctor Rounds Status */}
            <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4 text-teal-600" />
                  Attending Physician Assessment
                </span>
                <Badge
                  variant={
                    patient.doctorVisitToday.status === "completed"
                      ? "success"
                      : patient.doctorVisitToday.status === "in_progress"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {patient.doctorVisitToday.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-900">
                {patient.doctorVisitToday.doctorName} (
                {patient.doctorVisitToday.doctorSpecialty || "General Medicine"})
              </p>
              {patient.doctorVisitToday.notes && (
                <p className="text-xs text-slate-600 mt-1 italic bg-white p-2.5 rounded-lg border border-slate-200">
                  &ldquo;{patient.doctorVisitToday.notes}&rdquo;
                </p>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("vitals")}
                  className="gap-1.5"
                >
                  <Thermometer className="h-4 w-4 text-teal-600" />
                  Record Vitals
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("doctor")}
                  className="gap-1.5"
                >
                  <Stethoscope className="h-4 w-4 text-teal-600" />
                  Doctor Consultation
                </Button>

                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setActiveTab("discharge")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <FileCheck className="h-4 w-4" />
                  Discharge Status
                </Button>
              </div>

              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Record Vitals Form */}
        {activeTab === "vitals" && (
          <form onSubmit={handleSaveVitals} className="space-y-4 pt-4">
            <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
              <h4 className="text-sm font-bold text-teal-950 flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-teal-600" />
                Record Temperature & Vitals for {patient.fullName}
              </h4>
              <p className="text-xs text-teal-800 mt-0.5">
                Updates daily surveillance logs and recalculates facility metrics immediately.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="35"
                    max="42"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Normal: &lt; 37.3°C • Fever threshold: ≥ 37.5°C
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block">
                    SpO2 Oxygen Saturation (%)
                  </label>
                  <input
                    type="number"
                    min="70"
                    max="100"
                    value={spo2Input}
                    onChange={(e) => setSpo2Input(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Optimal: 95%–100% • Hypoxia alert: &lt; 95%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("overview")}
              >
                Back to Overview
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Save Reading & Update Chart
              </Button>
            </div>
          </form>
        )}

        {/* Tab 3: Doctor Consultation Form */}
        {activeTab === "doctor" && (
          <form onSubmit={handleSaveConsultation} className="space-y-4 pt-4">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
              <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-indigo-600" />
                Record Doctor Consultation for {patient.fullName}
              </h4>
              <p className="text-xs text-indigo-800 mt-0.5">
                Save attending physician evaluation notes, diagnosis updates, and care orders.
              </p>

              <div className="space-y-3 mt-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block">
                    Attending Physician
                  </label>
                  <select
                    value={doctorNameInput}
                    onChange={(e) => setDoctorNameInput(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Dr. Sarah Lin">Dr. Sarah Lin (Chief Epidemiologist)</option>
                    <option value="Dr. Marcus Vance">Dr. Marcus Vance (Infectious Diseases)</option>
                    <option value="Dr. Alan Reed">Dr. Alan Reed (Critical Care Specialist)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block">
                    Consultation Clinical Notes
                  </label>
                  <textarea
                    rows={3}
                    value={consultationNotesInput}
                    onChange={(e) => setConsultationNotesInput(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter clinical examination notes, lung sounds, symptom changes..."
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block">
                    Care Order / Recommendation
                  </label>
                  <select
                    value={recommendationInput}
                    onChange={(e) => setRecommendationInput(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Continue standard monitoring">Continue standard monitoring</option>
                    <option value="Maintain isolation precautions">Maintain isolation precautions</option>
                    <option value="Approve for 3-day discharge protocol">Approve for 3-day discharge protocol</option>
                    <option value="Order supplemental oxygen">Order supplemental oxygen</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("overview")}
              >
                Back to Overview
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Complete Round & Save Record
              </Button>
            </div>
          </form>
        )}

        {/* Tab 4: Discharge Protocol with 3-Day Fever-Free Rule */}
        {activeTab === "discharge" && (
          <div className="space-y-4 pt-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-emerald-600" />
                Three-Day Fever-Free Discharge Protocol
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Mandatory health protocol: Patients must maintain normal temperature (&lt;37.5°C) across 3 consecutive days prior to release.
              </p>

              {/* 72-Hour Temperature History Table */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-white overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Observation Period</th>
                      <th className="py-2.5 px-3">Recorded Temp</th>
                      <th className="py-2.5 px-3">Clinical Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {feverFreeCheck.readings.map((r, idx) => (
                      <tr key={idx} className={r.isFever ? "bg-rose-50/50" : ""}>
                        <td className="py-2 px-3 text-slate-700 font-medium">{r.date}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {r.temp}°C
                        </td>
                        <td className="py-2 px-3">
                          {r.isFever ? (
                            <span className="text-rose-700 font-semibold flex items-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                              Febrile Event (≥37.5°C)
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                              Afebrile / Safe
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Validation Status Box */}
              <div
                className={`mt-4 rounded-xl p-3.5 border ${
                  feverFreeCheck.isEligible
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {feverFreeCheck.isEligible ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold text-xs uppercase tracking-wider">
                      {feverFreeCheck.isEligible
                        ? "3-Day Fever-Free Rule Passed"
                        : "3-Day Fever-Free Rule Not Satisfied"}
                    </p>
                    <p className="text-xs mt-1">{feverFreeCheck.reason}</p>
                  </div>
                </div>
              </div>

              {dischargeError && (
                <div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-900 font-semibold">
                  {dischargeError}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("overview")}
              >
                Back to Overview
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={!feverFreeCheck.isEligible || !patient.isCurrentlyAdmitted}
                onClick={handleDischargeConfirm}
                className={`${
                  feverFreeCheck.isEligible && patient.isCurrentlyAdmitted
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Authorize Official Discharge
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
