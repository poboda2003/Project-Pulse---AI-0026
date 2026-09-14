/**
 * Disruption -> AI impact analysis layer.
 *
 * === WHERE A REAL LLM WOULD CONNECT ===
 * `analyzeDisruption` is intentionally an async function with a narrow,
 * serializable input/output contract. To connect a real model:
 *
 *   1. Create a server function (src/lib/analysis.functions.ts) that calls the
 *      LLM provider. API keys are read there via process.env inside .handler(),
 *      so no key is ever present in frontend code.
 *   2. Prompt the model with the current project snapshot + the disruption
 *      event, and require a JSON response matching `ImpactAnalysis` below.
 *   3. Replace the body of `analyzeDisruption` with a call to that server
 *      function. No UI component changes are needed.
 *
 * Until then the prototype returns a deterministic, realistic simulated
 * response so the demo works immediately with no backend.
 */

import type { Project, Risk, Task } from "./project-data";

export interface DisruptionEvent {
  id: string;
  headline: string;
  source: string;
  detail: string;
}

export interface AffectedTask {
  taskId: string;
  name: string;
  owner: string;
  previousStatus: Task["status"];
  newStatus: Task["status"];
  slipDays: number;
}

export interface RecommendedAction {
  id: string;
  title: string;
  rationale: string;
  tradeoff: string;
  confidence: number;
}

export interface ImpactAnalysis {
  event: DisruptionEvent;
  summary: string;
  affectedTasks: AffectedTask[];
  timeline: { slipDays: number; newDeadline: string; note: string };
  budget: { exposure: number; note: string };
  newRisks: Risk[];
  recommendedActions: RecommendedAction[];
  briefing: string;
  generatedAt: string;
}

export const supplierDelayEvent: DisruptionEvent = {
  id: "d1",
  headline: "Key supplier has reported a 5-day delivery delay",
  source: "Supplier portal · Meridian Components",
  detail:
    "Hardware batch HW-4471 (critical path) will arrive Oct 11 instead of Oct 06.",
};

/**
 * Simulated AI analysis. Swap for a server-function LLM call (see file header).
 */
export async function analyzeDisruption(
  project: Project,
  event: DisruptionEvent = supplierDelayEvent,
): Promise<ImpactAnalysis> {
  // Simulated inference latency so the UI's analyzing state is visible.
  await new Promise((resolve) => setTimeout(resolve, 1600));

  return {
    event,
    summary:
      "A 5-day slip on the critical hardware batch pushes fulfillment and QA out of sequence. The launch date is recoverable, but only with an expedite decision in the next 48 hours.",
    affectedTasks: [
      {
        taskId: "t1",
        name: "Supplier hardware integration",
        owner: "M. Idris",
        previousStatus: "on-track",
        newStatus: "blocked",
        slipDays: 5,
      },
      {
        taskId: "t2",
        name: "Fulfillment readiness",
        owner: "T. Okafor",
        previousStatus: "at-risk",
        newStatus: "blocked",
        slipDays: 5,
      },
      {
        taskId: "t3",
        name: "Beta QA sign-off",
        owner: "L. Chen",
        previousStatus: "on-track",
        newStatus: "at-risk",
        slipDays: 3,
      },
      {
        taskId: "t5",
        name: "Retail packaging run",
        owner: "S. Patel",
        previousStatus: "on-track",
        newStatus: "delayed",
        slipDays: 4,
      },
    ],
    timeline: {
      slipDays: 4,
      newDeadline: "Oct 18, 2026",
      note: "5-day supplier slip absorbs the 1-day float on the critical path; net 4-day launch slip if no action is taken.",
    },
    budget: {
      exposure: 180_000,
      note: "Expedited freight ($112K), contractor QA cover ($44K) and packaging line rescheduling ($24K).",
    },
    newRisks: [
      {
        id: "nr1",
        title: "Launch date slips past Oct 14 commitment",
        detail: "External comms and retail slots already booked",
        severity: "high",
        isNew: true,
      },
      {
        id: "nr2",
        title: "QA regression compressed to 2 days",
        detail: "Defect-escape probability rises materially",
        severity: "high",
        isNew: true,
      },
      {
        id: "nr3",
        title: "Freight overage on two SKUs",
        detail: "Budget contingency drops below 5%",
        severity: "medium",
        isNew: true,
      },
    ],
    recommendedActions: [
      {
        id: "a1",
        title: "Air-freight the critical hardware batch",
        rationale: "Recovers 4 of the 5 lost days and unblocks fulfillment by Oct 08.",
        tradeoff: "+$112K freight cost, needs approval within 48 hours",
        confidence: 0.86,
      },
      {
        id: "a2",
        title: "Re-sequence QA to run parallel to integration",
        rationale: "Protects the Oct 14 date by removing QA from the critical path.",
        tradeoff: "Requires one contract QA engineer (+$44K)",
        confidence: 0.78,
      },
      {
        id: "a3",
        title: "Engage backup supplier for non-critical SKUs",
        rationale: "De-risks the remaining 30% of inventory from the same dependency.",
        tradeoff: "Slightly higher unit cost; onboarding takes 3 days",
        confidence: 0.71,
      },
      {
        id: "a4",
        title: "Pre-brief retail partners on a 4-day contingency",
        rationale: "Preserves credibility if the expedite decision is declined.",
        tradeoff: "Signals uncertainty before the decision is made",
        confidence: 0.64,
      },
    ],
    briefing:
      "Q4 Product Launch — supplier disruption update. Meridian Components has reported a 5-day delay on the critical hardware batch (HW-4471), now arriving Oct 11. Unmitigated, this moves the launch from Oct 14 to Oct 18 and raises two high-severity risks: a missed public commitment and a compressed QA window. Analysis puts mitigation exposure at roughly $180K, primarily expedited freight. The team's recommended path is to air-freight the critical batch and run QA in parallel, which holds the Oct 14 date. This is a decision request, not a status note: we need approval on the expedite spend by Oct 03 to keep that option open.",
    generatedAt: new Date().toISOString(),
  };
}
