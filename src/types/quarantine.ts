export type QuarantineStatus =
  | "isolated"
  | "monitoring"
  | "cleared"
  | "transferred"
  | "flagged"
  | "discharged"
  | "deceased";

export type HealthRiskLevel = "low" | "medium" | "high" | "critical";

export type FinalOutcome = "recovered" | "deceased" | "transferred" | null;

export interface HealthVitalsLog {
  id: string;
  patientId: string;
  timestamp: string;
  temperatureCelsius: number;
  heartRateBpm: number;
  oxygenSaturationPct: number;
  systolicBp: number;
  diastolicBp: number;
  notes?: string;
}

export interface TodayVitals {
  temperatureCelsius: number | null;
  oxygenSaturationPct: number | null;
  heartRateBpm: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  status: "normal" | "elevated" | "fever" | "pending";
  checkedAt: string | null;
  checkedBy?: string;
}

export interface DoctorVisit {
  status: "completed" | "in_progress" | "pending";
  doctorName: string;
  doctorSpecialty?: string;
  scheduledTime: string;
  completedAt?: string;
  notes?: string;
}

export interface Patient {
  id: string;
  nationalId: string;
  fullName: string;
  age: number;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  contactNumber: string;
  emergencyContact: string;
  status: QuarantineStatus;
  riskLevel: HealthRiskLevel;
  facilityId: string;
  roomNumber: string;
  bedNumber: string;
  admissionDate: string;
  expectedDischargeDate: string;
  isCurrentlyAdmitted: boolean;
  finalOutcome: FinalOutcome;
  outcomeDate?: string | null;
  primaryCondition: string;
  todayVitals: TodayVitals;
  doctorVisitToday: DoctorVisit;
  vitalsHistory: HealthVitalsLog[];
  flagReason?: string;
}

export interface QuarantineFacility {
  id: string;
  name: string;
  location: string;
  totalCapacity: number;
  occupiedCapacity: number;
  contactPerson: string;
  contactPhone: string;
  status: "active" | "full" | "maintenance";
}

export interface DashboardMetrics {
  totalAdmittedPatients: number;
  occupiedBeds: number;
  availableBeds: number;
  facilityCapacity: number;
  occupancyRatePct: number;
  pendingTemperatureChecks: number;
  completedTemperatureChecks: number;
  pendingDoctorVisits: number;
  completedDoctorVisits: number;
  dischargeEligiblePatients: number;
  highAttentionPatientsCount: number;
  mortalityRatePct: number;
  mortalityBenchmarkPct: number;
  mortalityTotalOutcomes: number;
  mortalityDeceasedCount: number;
  treatmentSuccessRatePct: number;
  treatmentSuccessBenchmarkPct: number;
  treatmentSuccessRecoveredCount: number;
}
