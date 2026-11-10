import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { actions } from "../store/appSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { isRole, type Role } from "../types";

export default function Members() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { push } = useToast();
  const { members, tasks } = useAppSelector((s) => s.app);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("member");
  const isManager = user?.role === "manager";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(actions.addMember({ id: crypto.randomUUID(), name: name.trim(), role, email: "", password: "" }));
    push(`${name.trim()} added to the team`);
    setName("");
    setRole("member");
  };

  return (
    <>
      <h1>Team</h1>
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="card">
          <h3>Members ({members.length})</h3>
          <ul className="list !max-h-none">
            {members.map((m) => {
              const assigned = tasks.filter((t) => t.assigneeId === m.id);
              const open = assigned.filter((t) => t.status !== "done").length;
              const self = m.id === user?.id;
              return (
                <li key={m.id}>
                  <span className="avatar">{m.name[0]?.toUpperCase()}</span>
                  <div>
                    <strong>{m.name}{self && <span className="muted"> (you)</span>}</strong>
                    <div className="muted">
                      {m.email || "No login"} · {assigned.length} assigned · {open} open
                    </div>
                  </div>
                  {isManager && !self ? (
                    <select
                      className="!w-auto"
                      value={m.role}
                      aria-label={`Role of ${m.name}`}
                      onChange={(e) => isRole(e.target.value) && dispatch(actions.setRole({ id: m.id, role: e.target.value }))}
                    >
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                    </select>
                  ) : (
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold capitalize">{m.role}</span>
                  )}
                  {isManager && !self && (
                    <button
                      className="icon"
                      title="Remove member"
                      onClick={() => {
                        if (!confirm(`Remove ${m.name}? Their tasks will become unassigned.`)) return;
                        dispatch(actions.removeMember(m.id));
                        push(`${m.name} removed`, "info");
                      }}
                    >
                      ✕
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card h-fit">
          <h3>Add team member</h3>
          {isManager ? (
            <form className="flex flex-col gap-2.5" onSubmit={submit}>
              <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <select value={role} onChange={(e) => isRole(e.target.value) && setRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="manager">Manager</option>
              </select>
              <button className="btn primary">Add member</button>
              <p className="muted">Added members can be assigned tasks. They can create their own login on the sign-up page.</p>
            </form>
          ) : (
            <p className="muted">Only managers can add or remove team members.</p>
          )}
        </div>
      </section>
    </>
  );
}
