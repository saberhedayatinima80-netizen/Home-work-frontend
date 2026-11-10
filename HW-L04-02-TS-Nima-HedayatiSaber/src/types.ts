export type Role = "manager" | "member";
export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in-progress" | "done";

export interface Member {
  id: string;
  name: string;
  role: Role;
  // login credentials; empty strings mean the member was added without an account
  email: string;
  password: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string; // YYYY-MM-DD
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string; // YYYY-MM-DD, "" when no deadline
  assigneeId: string; // member id, "" when unassigned
}

export interface AppData {
  members: Member[];
  projects: Project[];
  tasks: Task[];
}

export const STATUSES: readonly Status[] = ["todo", "in-progress", "done"];
export const PRIORITIES: readonly Priority[] = ["low", "medium", "high"];

export const STATUS_LABEL: Record<Status, string> = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const isStatus = (v: string): v is Status => STATUSES.some((s) => s === v);
export const isPriority = (v: string): v is Priority => PRIORITIES.some((p) => p === v);
export const isRole = (v: string): v is Role => v === "manager" || v === "member";
