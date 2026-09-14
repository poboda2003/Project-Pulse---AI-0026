import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { baselineProject, currency, type RiskSeverity, type TaskStatus } from "@/lib/project-data";
import {
  analyzeDisruption,
  supplierDelayEvent,
  type ImpactAnalysis,
} from "@/lib/disruption-analysis";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProjectPulse AI — AI Project Operations Assistant" },
      {
        name: "description",
        content:
          "Simulate a project disruption and see AI-generated impact analysis, recommended actions and a management briefing for the Q4 Product Launch.",
      },
      { property: "og:title", content: "ProjectPulse AI — AI Project Operations Assistant" },
      {
        property: "og:description",
        content:
          "An advisory operations console: disruption in, impact analysis, recommendations and a management briefing out.",
      },
    ],
  }),
  component: Dashboard,
});

const statusTone: Record<TaskStatus, { label: string; dot: string; text: string }> = {
  "on-track": { label: "On track", dot: "bg-green", text: "text-green" },
  "at-risk": { label: "At risk", dot: "bg-amber", text: "text-amber" },
  blocked: { label: "Blocked", dot: "bg-red", text: "text-red" },
  delayed: { label: "Delayed", dot: "bg-amber", text: "text-amber" },
};

const severityTone: Record<RiskSeverity, string> = {
  high: "bg-red/15 text-red ring-red/30",
  medium: "bg-amber/15 text-amber ring-amber/30",
  low: "bg-green/15 text-green ring-green/30",
};

function Dashboard() {
  const project = baselineProject;
  const [state, setState] = useState<"idle" | "analyzing" | "done">("idle");
  const [analysis, setAnalysis] = useState<ImpactAnalysis | null>(null);
  const [decisions, setDecisions] = useState<Record<string, "accepted" | "dismissed">>({});
  const [copied, setCopied] = useState(false);

  const disrupted = state === "done" && analysis !== null;

  // Triggers the (currently simulated) AI analysis pipeline.
  async function runSimulation() {
    setState("analyzing");
    setDecisions({});
    const result = await analyzeDisruption(project, supplierDelayEvent);
    setAnalysis(result);
    setState("done");
  }

  function reset() {
    setState("idle");
    setAnalysis(null);
    setDecisions({});
  }

  async function copyBriefing() {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(analysis.briefing);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const affectedIds = new Set(analysis?.affectedTasks.map((t) => t.taskId) ?? []);
  const completion = disrupted ? 68 : project.completion;
  const deadline = disrupted && analysis ? analysis.timeline.newDeadline : project.deadline;
  const daysLeft = disrupted && analysis
    ? project.daysToDeadline + analysis.timeline.slipDays
    : project.daysToDeadline;
  const budgetSpent = project.budgetSpent + (disrupted && analysis ? analysis.budget.exposure : 0);
  const budgetPct = Math.min(100, Math.round((budgetSpent / project.budgetTotal) * 100));

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink-950 font-body text-ice selection:bg-accent/25">
      <div className="ops-ambient pointer-events-none fixed inset-0 z-0" />
      <div className="pointer-events-none fixed -top-24 right-8 z-0 hidden h-[640px] w-[640px] -skew-x-12 rounded-[40px] border border-accent/10 bg-ice/[0.015] lg:block" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-5 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-accent font-display text-base font-bold text-ink-950 ring-1 ring-accent/40">
              P
            </div>
            <div>
              <div className="font-display text-[15px] font-semibold leading-none">
                ProjectPulse <span className="text-accent">AI</span>
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-fog-dim">
                Operations Assistant
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-ink-850/70 px-3 py-1.5 ring-1 ring-ice/10 sm:flex">
              <span className="size-1.5 rounded-full bg-green" />
              <span className="font-mono text-[11px] text-fog">LIVE · Advisory mode</span>
            </div>
            {disrupted ? (
              <button
                onClick={reset}
                className="rounded-lg bg-ink-800 px-4 py-2.5 font-display text-[13px] font-semibold text-ice ring-1 ring-ice/10 transition-colors hover:bg-ink-700"
              >
                Reset scenario
              </button>
            ) : (
              <button
                onClick={runSimulation}
                disabled={state === "analyzing"}
                className="sweep relative rounded-lg bg-accent px-4 py-2.5 font-display text-[13px] font-semibold text-ink-950 ring-1 ring-accent/50 transition-colors hover:bg-ice disabled:opacity-70"
              >
                <span className="relative z-10">
                  {state === "analyzing" ? "Analyzing…" : "Simulate Disruption"}
                </span>
              </button>
            )}
          </div>
        </header>

        {disrupted && analysis && (
          <div className="rise mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-red/10 px-4 py-3 ring-1 ring-red/25">
            <span className="rounded bg-red/20 px-2 py-0.5 font-mono text-[10px] tracking-widest text-red">
              DISRUPTION
            </span>
            <span className="text-[13px] text-ice">{analysis.event.headline}</span>
            <span className="font-mono text-[11px] text-fog-dim">{analysis.event.source}</span>
          </div>
        )}

        {state === "analyzing" && (
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-ink-900/70 px-4 py-3 ring-1 ring-ice/10">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-fog">
              Assessing critical path, budget and downstream risk…
            </span>
          </div>
        )}

        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Project overview */}
          <div className="lg:col-span-7">
            <div className="h-full rounded-2xl bg-ink-900/70 p-5 ring-1 ring-ice/10 backdrop-blur-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-fog-dim">
                    Active project
                  </div>
                  <h1 className="mt-1.5 text-balance font-display text-2xl font-bold tracking-tight sm:text-3xl">
                    {project.name}
                  </h1>
                </div>
                <div
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 ring-1 ${
                    disrupted ? "bg-red/10 ring-red/30" : "bg-green/10 ring-green/30"
                  }`}
                >
                  <span
                    className={`size-2 rounded-full ${disrupted ? "bg-red" : "bg-green"}`}
                  />
                  <span
                    className={`font-mono text-[12px] ${disrupted ? "text-red" : "text-green"}`}
                  >
                    {disrupted ? "At risk" : "On track"}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-fog-dim">
                      Completion
                    </span>
                    <span className="font-mono text-[12px] text-ice">{completion}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-700">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-700"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-fog-dim">
                      Budget spend {disrupted && <span className="text-red">· +exposure</span>}
                    </span>
                    <span className="font-mono text-[12px] text-ice">
                      {currency(budgetSpent)}{" "}
                      <span className="text-fog-dim">/ {currency(project.budgetTotal)}</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-700">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        disrupted ? "bg-red" : "bg-amber"
                      }`}
                      style={{ width: `${budgetPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-ink-850/60 p-4 ring-1 ring-ice/10">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-fog-dim">
                    Deadline
                  </div>
                  <div className="mt-1 font-display text-xl font-semibold">{daysLeft} days</div>
                  <div className={`mt-0.5 font-mono text-[11px] ${disrupted ? "text-red" : "text-fog"}`}>
                    {deadline}
                  </div>
                </div>
                <div className="rounded-xl bg-ink-850/60 p-4 ring-1 ring-ice/10">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-fog-dim">
                    Team velocity
                  </div>
                  <div className="mt-1 font-display text-xl font-semibold">
                    {project.velocity}
                    <span className="text-base text-fog-dim">%</span>
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-fog">
                    {project.tasksOnTrack} of {project.tasksTotal} on track
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risks */}
          <div className="lg:col-span-5">
            <div className="h-full rounded-2xl bg-ink-900/70 p-5 ring-1 ring-ice/10 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-widest text-fog-dim">
                  Active risks
                </span>
                {disrupted && analysis && (
                  <span className="font-mono text-[10px] text-red">
                    +{analysis.newRisks.length} new
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-2.5">
                {[...(analysis?.newRisks ?? []), ...project.risks].map((risk) => (
                  <div
                    key={risk.id}
                    className="flex items-center gap-3 rounded-lg bg-ink-850/60 px-3 py-2.5 ring-1 ring-ice/10"
                  >
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[10px] ring-1 ${severityTone[risk.severity]}`}
                    >
                      {risk.severity.slice(0, 4).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13px] text-ice">
                        {risk.title}
                        {risk.isNew && (
                          <span className="ml-2 font-mono text-[10px] text-red">NEW</span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-fog-dim">{risk.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task board */}
          <div className="lg:col-span-12">
            <div className="rounded-2xl bg-ink-900/70 p-5 ring-1 ring-ice/10 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-widest text-fog-dim">
                  Task board
                </span>
                <span className="font-mono text-[10px] text-fog-dim">
                  {disrupted ? `${affectedIds.size} affected by disruption` : "15 total"}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="border-b border-ice/10 font-mono text-[10px] uppercase tracking-wider text-fog-dim">
                      <th className="pb-2 font-medium">Task</th>
                      <th className="pb-2 font-medium">Owner</th>
                      <th className="pb-2 font-medium">Due</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px]">
                    {project.tasks.map((task) => {
                      const affected = analysis?.affectedTasks.find((a) => a.taskId === task.id);
                      const status = affected ? affected.newStatus : task.status;
                      const tone = statusTone[status];
                      return (
                        <tr key={task.id} className="border-b border-ice/5 last:border-0">
                          <td className="py-2.5 text-ice">
                            {task.name}
                            {affected && (
                              <span className="ml-2 font-mono text-[10px] text-red">
                                +{affected.slipDays}d
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-fog">{task.owner}</td>
                          <td className="py-2.5 font-mono text-[12px] text-fog">{task.due}</td>
                          <td className="py-2.5">
                            <span className="inline-flex items-center gap-1.5">
                              <span className={`size-1.5 rounded-full ${tone.dot}`} />
                              <span className={tone.text}>{tone.label}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* AI impact analysis */}
          {disrupted && analysis && (
            <div className="rise lg:col-span-12" style={{ animationDelay: "60ms" }}>
              <div className="rounded-2xl bg-ink-900/70 p-5 ring-1 ring-ice/10 sm:p-6">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-accent" />
                  <span className="font-display text-[15px] font-semibold">AI Impact Analysis</span>
                  <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-fog-dim">
                    Simulated model output
                  </span>
                </div>
                <p className="mt-3 max-w-3xl text-pretty text-[13px] leading-relaxed text-fog">
                  {analysis.summary}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-ink-850/60 p-4 ring-1 ring-ice/10">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-fog-dim">
                      Timeline impact
                    </div>
                    <div className="mt-1 font-display text-2xl font-semibold text-amber">
                      +{analysis.timeline.slipDays} days
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-fog">
                      New date {analysis.timeline.newDeadline}
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed text-fog-dim">
                      {analysis.timeline.note}
                    </p>
                  </div>
                  <div className="rounded-xl bg-ink-850/60 p-4 ring-1 ring-ice/10">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-fog-dim">
                      Budget impact
                    </div>
                    <div className="mt-1 font-display text-2xl font-semibold text-red">
                      +{currency(analysis.budget.exposure)}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-fog">Mitigation exposure</div>
                    <p className="mt-2 text-[12px] leading-relaxed text-fog-dim">
                      {analysis.budget.note}
                    </p>
                  </div>
                  <div className="rounded-xl bg-ink-850/60 p-4 ring-1 ring-ice/10">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-fog-dim">
                      Affected tasks
                    </div>
                    <div className="mt-1 font-display text-2xl font-semibold">
                      {analysis.affectedTasks.length}
                    </div>
                    <ul className="mt-2 space-y-1">
                      {analysis.affectedTasks.map((task) => (
                        <li
                          key={task.taskId}
                          className="flex items-center justify-between gap-2 text-[12px]"
                        >
                          <span className="truncate text-fog">{task.name}</span>
                          <span className={`font-mono text-[11px] ${statusTone[task.newStatus].text}`}>
                            {statusTone[task.newStatus].label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations + briefing */}
          {disrupted && analysis && (
            <div className="rise lg:col-span-12" style={{ animationDelay: "120ms" }}>
              <div className="grid grid-cols-1 gap-6 rounded-2xl bg-ink-900/70 p-5 ring-1 ring-ice/10 sm:p-6 md:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-accent" />
                    <span className="font-display text-[15px] font-semibold">
                      AI Recommended Actions
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-fog-dim">
                    Advisory — your call. Accept or dismiss each.
                  </p>
                  <div className="mt-4 space-y-2.5">
                    {analysis.recommendedActions.map((action) => {
                      const decision = decisions[action.id];
                      return (
                        <div
                          key={action.id}
                          className={`rounded-lg bg-ink-850/60 p-3 ring-1 transition-colors ${
                            decision === "accepted"
                              ? "ring-green/40"
                              : decision === "dismissed"
                                ? "opacity-50 ring-ice/10"
                                : "ring-ice/10"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="text-[13px] text-ice">{action.title}</div>
                            <span className="shrink-0 font-mono text-[10px] text-fog-dim">
                              {Math.round(action.confidence * 100)}% conf.
                            </span>
                          </div>
                          <p className="mt-1 text-[12px] leading-relaxed text-fog-dim">
                            {action.rationale}
                          </p>
                          <p className="mt-1 font-mono text-[11px] text-amber">
                            Trade-off: {action.tradeoff}
                          </p>
                          <div className="mt-2.5 flex items-center gap-2">
                            {decision ? (
                              <>
                                <span
                                  className={`font-mono text-[11px] ${
                                    decision === "accepted" ? "text-green" : "text-fog-dim"
                                  }`}
                                >
                                  {decision === "accepted"
                                    ? "Accepted by manager"
                                    : "Dismissed by manager"}
                                </span>
                                <button
                                  onClick={() =>
                                    setDecisions((d) => {
                                      const next = { ...d };
                                      delete next[action.id];
                                      return next;
                                    })
                                  }
                                  className="font-mono text-[11px] text-accent transition-colors hover:text-ice"
                                >
                                  Undo
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    setDecisions((d) => ({ ...d, [action.id]: "accepted" }))
                                  }
                                  className="rounded-md bg-accent px-3 py-1 text-[11px] font-semibold text-ink-950 transition-colors hover:bg-ice"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() =>
                                    setDecisions((d) => ({ ...d, [action.id]: "dismissed" }))
                                  }
                                  className="rounded-md bg-ink-700 px-3 py-1 text-[11px] text-fog ring-1 ring-ice/10 transition-colors hover:text-ice"
                                >
                                  Dismiss
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="md:border-l md:border-ice/10 md:pl-6">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[15px] font-semibold">
                      Management Briefing
                    </span>
                    <button
                      onClick={copyBriefing}
                      className="font-mono text-[11px] text-accent transition-colors hover:text-ice"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-fog-dim">
                    Draft for senior management — review before sending.
                  </p>
                  <div className="mt-4 text-pretty rounded-lg bg-ink-950/60 p-4 text-[13px] leading-relaxed text-fog ring-1 ring-ice/10">
                    <span className="mb-2 block font-mono text-[11px] text-fog-dim">
                      RE: {project.name} — supplier disruption
                    </span>
                    {analysis.briefing}
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-fog-dim">
                    ProjectPulse AI has not changed the plan. Nothing is actioned until you accept a
                    recommendation and send this briefing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 pb-4">
          <span className="font-mono text-[11px] text-fog-dim">
            ProjectPulse AI · simulated data · advisory prototype
          </span>
          <span className="font-mono text-[11px] text-fog-dim">
            The AI recommends. The manager decides.
          </span>
        </footer>
      </div>
    </div>
  );
}
