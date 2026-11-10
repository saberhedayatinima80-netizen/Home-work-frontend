import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Modal from "../components/Modal";
import TaskForm from "../components/TaskForm";
import { useToast } from "../context/ToastContext";
import { actions } from "../store/appSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { today } from "../format";
import {
  PRIORITIES,
  PRIORITY_LABEL,
  STATUSES,
  STATUS_LABEL,
  isStatus,
  type Priority,
  type Task,
} from "../types";

const PRIORITY_STYLE: Record<Priority, string> = {
  low: "bg-sky-500/20 text-sky-300",
  medium: "bg-amber-500/20 text-amber-300",
  high: "bg-red-500/20 text-red-300",
};

export default function ProjectTasks() {
  const { projectId = "" } = useParams();
  const dispatch = useAppDispatch();
  const { push } = useToast();
  const { projects, tasks, members } = useAppSelector((s) => s.app);
  const project = projects.find((p) => p.id === projectId);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignee, setAssignee] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  // `null` = closed, `"new"` = create form, a Task = edit form
  const [editing, setEditing] = useState<Task | "new" | null>(null);

  const own = useMemo(() => tasks.filter((t) => t.projectId === projectId), [tasks, projectId]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return own.filter((t) => {
      if (term && !t.title.toLowerCase().includes(term)) return false;
      if (status && t.status !== status) return false;
      if (priority && t.priority !== priority) return false;
      if (assignee === "none" ? t.assigneeId !== "" : assignee && t.assigneeId !== assignee) return false;
      if (from && (t.dueDate === "" || t.dueDate < from)) return false;
      if (to && (t.dueDate === "" || t.dueDate > to)) return false;
      return true;
    });
  }, [own, q, status, priority, assignee, from, to]);

  if (!project) return <Navigate to="/" replace />;

  const t0 = today();
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "Unassigned";
  const hasFilter = Boolean(q || status || priority || assignee || from || to);
  const reset = () => {
    setQ("");
    setStatus("");
    setPriority("");
    setAssignee("");
    setFrom("");
    setTo("");
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="muted"><Link to="/" className="hover:underline">Projects</Link> / {project.title}</div>
          <h1>{project.title}</h1>
          {project.description && <p className="muted mt-1 max-w-2xl">{project.description}</p>}
        </div>
        <button className="btn primary" onClick={() => setEditing("new")}>+ Add task</button>
      </div>

      <section className="card">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
          <input placeholder="Search by title" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
            ))}
          </select>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">All members</option>
            <option value="none">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} title="Due from" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} title="Due until" />
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="muted">Showing {filtered.length} of {own.length} tasks</span>
          {hasFilter && <button className="link" onClick={reset}>Clear filters</button>}
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="card muted">{own.length === 0 ? "No tasks yet. Add the first one." : "No tasks match your filters."}</div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {filtered.map((t) => {
            const overdue = t.status !== "done" && t.dueDate !== "" && t.dueDate < t0;
            return (
              <li key={t.id} className="card flex flex-wrap items-center gap-3 !p-4">
                <div className="min-w-48 flex-1">
                  <div className={`font-semibold ${t.status === "done" ? "line-through opacity-60" : ""}`}>{t.title}</div>
                  {t.description && <div className="muted line-clamp-2">{t.description}</div>}
                  <div className="muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORITY_STYLE[t.priority]}`}>
                      {PRIORITY_LABEL[t.priority]}
                    </span>
                    <span>👤 {nameOf(t.assigneeId)}</span>
                    <span className={overdue ? "neg" : ""}>
                      📅 {t.dueDate || "No due date"}{overdue && " (overdue)"}
                    </span>
                  </div>
                </div>
                <select
                  className="!w-auto"
                  value={t.status}
                  aria-label="Change status"
                  onChange={(e) => isStatus(e.target.value) && dispatch(actions.setStatus({ id: t.id, status: e.target.value }))}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
                <button className="btn small" onClick={() => setEditing(t)}>Edit</button>
                <button
                  className="btn small !border-red-400/50"
                  onClick={() => {
                    if (!confirm(`Delete task "${t.title}"?`)) return;
                    dispatch(actions.deleteTask(t.id));
                    push("Task deleted", "info");
                  }}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <Modal title={editing === "new" ? "Add task" : "Edit task"} onClose={() => setEditing(null)}>
          <TaskForm projectId={project.id} task={editing === "new" ? null : editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}
