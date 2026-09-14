/**
 * Simulated project data for the ProjectPulse AI prototype.
 *
 * In a production build this would come from the project management system of
 * record (e.g. Jira / Asana / an internal API) through a server function.
 * Keeping it in one typed module means swapping the source later only touches
 * the loader, not the UI.
 */

export type TaskStatus = "on-track" | "at-risk" | "blocked" | "delayed";
export type RiskSeverity = "high" | "medium" | "low";

export interface Task {
  id: string;
  name: string;
  owner: string;
  due: string;
  status: TaskStatus;
  note?: string;
}

export interface Risk {
  id: string;
  title: string;
  detail: string;
  severity: RiskSeverity;
  isNew?: boolean;
}

export interface Project {
  name: string;
  statusLabel: string;
  completion: number;
  budgetSpent: number;
  budgetTotal: number;
  deadline: string;
  daysToDeadline: number;
  velocity: number;
  tasksOnTrack: number;
  tasksTotal: number;
  tasks: Task[];
  risks: Risk[];
}

export const baselineProject: Project = {
  name: "Q4 Product Launch",
  statusLabel: "On track",
  completion: 68,
  budgetSpent: 1_720_000,
  budgetTotal: 2_400_000,
  deadline: "Oct 14, 2026",
  daysToDeadline: 12,
  velocity: 91,
  tasksOnTrack: 14,
  tasksTotal: 15,
  tasks: [
    {
      id: "t1",
      name: "Supplier hardware integration",
      owner: "M. Idris",
      due: "Oct 09",
      status: "on-track",
    },
    {
      id: "t2",
      name: "Fulfillment readiness",
      owner: "T. Okafor",
      due: "Oct 06",
      status: "at-risk",
      note: "Dependent on supplier intake",
    },
    { id: "t3", name: "Beta QA sign-off", owner: "L. Chen", due: "Oct 12", status: "on-track" },
    { id: "t4", name: "Launch comms draft", owner: "R. Vance", due: "Oct 11", status: "on-track" },
    { id: "t5", name: "Retail packaging run", owner: "S. Patel", due: "Oct 08", status: "on-track" },
  ],
  risks: [
    {
      id: "r1",
      title: "Supplier lead-time exposure",
      detail: "Single hardware dependency",
      severity: "medium",
    },
    {
      id: "r2",
      title: "QA regression window compressing",
      detail: "Buffer shrinking to 2 days",
      severity: "medium",
    },
    {
      id: "r3",
      title: "Marketing asset handoff",
      detail: "On schedule",
      severity: "low",
    },
  ],
};

export const currency = (value: number) =>
  value >= 1_000_000
    ? `$${(value / 1_000_000).toFixed(2)}M`
    : `$${Math.round(value / 1000)}K`;
