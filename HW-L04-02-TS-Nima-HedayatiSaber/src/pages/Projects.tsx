import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { actions } from "../store/appSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { today } from "../format";
import type { Project } from "../types";

function ProjectForm({ project, onDone }: { project: Project | null; onDone: () => void }) {
  const dispatch = useAppDispatch();
  const { push } = useToast();
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (project) {
      dispatch(actions.updateProject({ ...project, title: title.trim(), description: description.trim() }));
      push("Project updated");
    } else {
      dispatch(
        actions.addProject({
          id: crypto.randomUUID(),
          title: title.trim(),
          description: description.trim(),
          createdAt: today(),
        })
      );
      push("Project created");
    }
    onDone();
  };

  return (
    <form className="flex flex-col gap-2.5" onSubmit={submit}>
      <input placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
      <textarea rows={4} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      {!project && <p className="muted">Creation date: {today()}</p>}
      <button className="btn primary">{project ? "Save changes" : "Create project"}</button>
    </form>
  );
}

export default function Projects() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { push } = useToast();
  const { projects, tasks } = useAppSelector((s) => s.app);
  // `null` = closed, `"new"` = create form, a Project = edit form
  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const isManager = user?.role === "manager";

  return (
    <>
      <div className="flex items-center justify-between">
        <h1>Projects</h1>
        <button className="btn primary" onClick={() => setEditing("new")}>+ New project</button>
      </div>

      {projects.length === 0 ? (
        <div className="card muted">No projects yet. Create your first project to start adding tasks.</div>
      ) : (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
          {projects.map((p) => {
            const own = tasks.filter((t) => t.projectId === p.id);
            const done = own.filter((t) => t.status === "done").length;
            const pct = own.length ? Math.round((done / own.length) * 100) : 0;
            return (
              <article key={p.id} className="card flex flex-col gap-2">
                <Link to={`/projects/${p.id}`} className="text-lg font-bold hover:underline">{p.title}</Link>
                <p className="muted line-clamp-3 min-h-10">{p.description || "No description"}</p>
                <div className="muted">Created {p.createdAt} · {own.length} task{own.length === 1 ? "" : "s"}</div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10" title={`${pct}% done`}>
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-brand" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Link to={`/projects/${p.id}`} className="btn primary small">Open</Link>
                  <button className="btn small" onClick={() => setEditing(p)}>Edit</button>
                  {isManager && (
                    <button
                      className="btn small ml-auto !border-red-400/50"
                      onClick={() => {
                        if (!confirm(`Delete "${p.title}" and its ${own.length} task(s)?`)) return;
                        dispatch(actions.deleteProject(p.id));
                        push("Project deleted", "info");
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {editing && (
        <Modal title={editing === "new" ? "New project" : "Edit project"} onClose={() => setEditing(null)}>
          <ProjectForm project={editing === "new" ? null : editing} onDone={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}
