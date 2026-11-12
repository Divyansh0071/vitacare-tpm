"use client";

import * as React from "react";
import {
  HeartPulse,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Info,
} from "lucide-react";
import { DashboardMetrics } from "@/types/quarantine";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BenchmarksSectionProps {
  metrics: DashboardMetrics;
}

export function BenchmarksSection({ metrics }: BenchmarksSectionProps) {
  // Mortality Rate calculation vs 15% benchmark
  const mortalityRate = metrics.mortalityRatePct;
  const mortalityBenchmark = metrics.mortalityBenchmarkPct; // 15.0%
  const isMortalityWithinBenchmark = mortalityRate <= mortalityBenchmark;
  const mortalityDiff = Math.abs(mortalityRate - mortalityBenchmark).toFixed(1);

  // Treatment Success Rate calculation vs 85% benchmark
  const successRate = metrics.treatmentSuccessRatePct;
  const successBenchmark = metrics.treatmentSuccessBenchmarkPct; // 85.0%
  const isSuccessMeetingBenchmark = successRate >= successBenchmark;
  const successDiff = Math.abs(successRate - successBenchmark).toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 6. Mortality Rate against 15% benchmark */}
      <Card className="border border-slate-200/90 bg-white shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-rose-50 p-2 text-rose-600">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Mortality Rate vs. Benchmark
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Clinical outcome metric against the 15.0% ceiling threshold
                </CardDescription>
              </div>
            </div>

            <Badge
              variant={isMortalityWithinBenchmark ? "success" : "warning"}
              className="text-xs"
            >
              {isMortalityWithinBenchmark ? "Within Target" : "Elevated Watch"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {mortalityRate}%
              </span>
              <span className="text-xs text-slate-500 font-medium ml-2">
                Current Outcome Rate
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-700 block">
                Target Benchmark: ≤ {mortalityBenchmark}%
              </span>
              <span
                className={`text-[11px] font-semibold flex items-center gap-1 justify-end mt-0.5 ${
                  isMortalityWithinBenchmark ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {isMortalityWithinBenchmark ? (
                  <>
                    <TrendingDown className="h-3 w-3" />
                    {mortalityDiff}% below maximum allowable
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-3 w-3" />
                    +{mortalityDiff}% delta from threshold
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Visual Benchmark Comparison Bar */}
          <div className="space-y-1.5">
            <div className="relative h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                style={{ width: `${Math.min(mortalityRate, 100)}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  isMortalityWithinBenchmark ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              {/* Benchmark marker line at 15% */}
              <div
                style={{ left: `${mortalityBenchmark}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                title={`Benchmark Target: ${mortalityBenchmark}%`}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>0%</span>
              <span className="font-semibold text-slate-700">
                ▲ 15.0% Benchmark Threshold
              </span>
              <span>30% Scale</span>
            </div>
          </div>

          {/* Dynamic Evidence Details */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-600">
              <span>Recorded Final Outcomes:</span>
              <span className="font-bold text-slate-900">
                {metrics.mortalityTotalOutcomes} Patients
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Deceased Patient Count:</span>
              <span className="font-bold text-slate-900">
                {metrics.mortalityDeceasedCount} ({metrics.mortalityRatePct}%)
              </span>
            </div>
            <p className="text-[10px] text-slate-400 pt-1 flex items-start gap-1">
              <Info className="h-3 w-3 shrink-0 mt-0.5" />
              Calculated dynamically from final recorded outcomes. No outcomes are assumed for active admitted patients.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 7. Treatment Success Rate against 85% benchmark */}
      <Card className="border border-slate-200/90 bg-white shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-teal-50 p-2 text-teal-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Treatment Success Rate vs. Benchmark
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Recovery & viral clearance metric against the 85.0% target
                </CardDescription>
              </div>
            </div>

            <Badge
              variant={isSuccessMeetingBenchmark ? "success" : "warning"}
              className="text-xs"
            >
              {isSuccessMeetingBenchmark ? "Target Exceeded" : "Near Benchmark"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {successRate}%
              </span>
              <span className="text-xs text-slate-500 font-medium ml-2">
                Recovery Success Rate
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-700 block">
                Target Benchmark: ≥ {successBenchmark}%
              </span>
              <span
                className={`text-[11px] font-semibold flex items-center gap-1 justify-end mt-0.5 ${
                  isSuccessMeetingBenchmark ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {isSuccessMeetingBenchmark ? (
                  <>
                    <TrendingUp className="h-3 w-3" />
                    +{successDiff}% above quality standard
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3" />
                    {successDiff}% under target
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Visual Benchmark Comparison Bar */}
          <div className="space-y-1.5">
            <div className="relative h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                style={{ width: `${Math.min(successRate, 100)}%` }}
                className="h-full rounded-full bg-teal-500 transition-all duration-500"
              />
              {/* Benchmark marker line at 85% */}
              <div
                style={{ left: `${successBenchmark}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                title={`Benchmark Target: ${successBenchmark}%`}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>0%</span>
              <span className="font-semibold text-slate-700">
                ▲ 85.0% Quality Standard Target
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Dynamic Evidence Details */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-600">
              <span>Recovered & Cleared Cases:</span>
              <span className="font-bold text-slate-900">
                {metrics.treatmentSuccessRecoveredCount} of {metrics.mortalityTotalOutcomes} Discharges
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Discharge Quality Index:</span>
              <span className="font-bold text-teal-700">
                {successRate}% Protocol Compliance
              </span>
            </div>
            <p className="text-[10px] text-slate-400 pt-1 flex items-start gap-1">
              <Info className="h-3 w-3 shrink-0 mt-0.5" />
              Calculated dynamically from confirmed recoveries vs recorded mortality events. Active cases remain unassigned.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

