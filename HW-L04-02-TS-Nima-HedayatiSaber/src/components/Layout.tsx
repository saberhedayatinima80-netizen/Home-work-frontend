import { useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useAppSelector } from "../store/hooks";
import { addDays } from "../format";
import DueSoonModal from "./DueSoonModal";

const NAV = [
  { to: "/", label: "Projects", icon: "📁", end: true },
  { to: "/members", label: "Team", icon: "👥", end: false },
] as const;

const SEEN_KEY = "tm_due_shown";

// only signed-in users can see the pages rendered inside this layout
export default function Layout() {
  const { user, logout } = useAuth();
  const { push } = useToast();
  const { tasks, projects } = useAppSelector((s) => s.app);
  const [open, setOpen] = useState(false);

  const dueSoon = useMemo(() => {
    if (!user) return [];
    const limit = addDays(2);
    return tasks
      .filter((t) => t.assigneeId === user.id && t.status !== "done" && t.dueDate !== "" && t.dueDate <= limit)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks, user]);

  // remind the user once per browser session, right after signing in
  const userId = user?.id;
  const dueCount = dueSoon.length;
  useEffect(() => {
    if (!userId || dueCount === 0) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY) === userId) return;
      sessionStorage.setItem(SEEN_KEY, userId);
    } catch {
      /* sessionStorage unavailable: just show the reminder */
    }
    setOpen(true);
    push(`You have ${dueCount} task${dueCount > 1 ? "s" : ""} due soon`, "warning");
  }, [userId, dueCount, push]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="grid min-h-screen grid-cols-1 gap-5 p-3 md:grid-cols-[260px_1fr] md:p-5">
      <aside className="sidebar">
        <div className="brand"><span className="logo">T</span> TEAM TASKS</div>
        <hr />
        <nav className="flex flex-row flex-wrap gap-1.5 md:flex-col">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav ${isActive ? "active" : ""}`}>
              <span className="ico">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
          <div className="mx-3 mb-1 mt-4 hidden text-xs font-bold md:block">ACCOUNT</div>
          <button className="nav" onClick={logout}>
            <span className="ico">🚪</span>Sign out
          </button>
        </nav>
        <div className="help hidden md:flex">
          <span className="logo">?</span>
          <strong>Need help?</strong>
          <span>Open a project to add, edit and track its tasks.</span>
        </div>
      </aside>

      <main className="flex min-w-0 flex-col gap-5">
        <header className="flex items-center justify-between gap-3">
          <div className="muted">Signed in as</div>
          <div className="flex items-center gap-3">
            <button className="btn small relative" onClick={() => setOpen(true)} disabled={dueCount === 0} title="Tasks due soon">
              🔔{dueCount > 0 && <span className="badge !ml-1">{dueCount}</span>}
            </button>
            <div className="flex items-center gap-2.5 font-semibold">
              <span className="avatar">{user.name[0]?.toUpperCase()}</span>
              <div className="leading-tight">
                {user.name}
                <div className="muted capitalize">{user.role}</div>
              </div>
            </div>
          </div>
        </header>
        <Outlet />
      </main>

      {open && dueCount > 0 && <DueSoonModal tasks={dueSoon} projects={projects} onClose={() => setOpen(false)} />}
    </div>
  );
}
