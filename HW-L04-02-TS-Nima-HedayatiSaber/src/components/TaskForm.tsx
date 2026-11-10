import { useState, type FormEvent } from "react";
import { useToast } from "../context/ToastContext";
import { actions } from "../store/appSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  PRIORITIES,
  PRIORITY_LABEL,
  STATUSES,
  STATUS_LABEL,
  isPriority,
  isStatus,
  type Priority,
  type Status,
  type Task,
} from "../types";

interface Props {
  projectId: string;
  task: Task | null; // null = create a new task
  onDone: () => void;
}

export default function TaskForm({ projectId, task, onDone }: Props) {
  const dispatch = useAppDispatch();
  const { push } = useToast();
  const members = useAppSelector((s) => s.app.members);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "medium");
  const [status, setStatus] = useState<Status>(task?.status ?? "todo");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId ?? "");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const data = { title: title.trim(), description: description.trim(), priority, status, dueDate, assigneeId };
    if (task) {
      dispatch(actions.updateTask({ ...task, ...data }));
      push("Task updated");
    } else {
      dispatch(actions.addTask({ ...data, id: crypto.randomUUID(), projectId }));
      push("Task added");
    }
    onDone();
  };

  return (
    <form className="flex flex-col gap-2.5" onSubmit={submit}>
      <input placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
      <textarea rows={3} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="grid grid-cols-2 gap-2.5">
        <label className="muted flex flex-col gap-1">
          Priority
          <select value={priority} onChange={(e) => isPriority(e.target.value) && setPriority(e.target.value)}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
            ))}
          </select>
        </label>
        <label className="muted flex flex-col gap-1">
          Status
          <select value={status} onChange={(e) => isStatus(e.target.value) && setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </label>
        <label className="muted flex flex-col gap-1">
          Due date
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        <label className="muted flex flex-col gap-1">
          Assignee
          <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </label>
      </div>
      <button className="btn primary">{task ? "Save changes" : "Add task"}</button>
    </form>
  );
}
