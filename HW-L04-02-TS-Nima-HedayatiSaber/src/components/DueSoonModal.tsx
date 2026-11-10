import { Link } from "react-router-dom";
import Modal from "./Modal";
import { today } from "../format";
import type { Project, Task } from "../types";

interface Props {
  tasks: Task[];
  projects: Project[];
  onClose: () => void;
}

export default function DueSoonModal({ tasks, projects, onClose }: Props) {
  const t = today();
  const projectTitle = (id: string) => projects.find((p) => p.id === id)?.title ?? "";
  return (
    <Modal title="⏰ Tasks due soon" onClose={onClose}>
      <p className="muted">These tasks assigned to you are overdue or due within the next 2 days.</p>
      <ul className="list">
        {tasks.map((task) => (
          <li key={task.id}>
            <div>
              <Link className="font-semibold hover:underline" to={`/projects/${task.projectId}`} onClick={onClose}>
                {task.title}
              </Link>
              <div className={task.dueDate < t ? "neg" : "muted"}>
                {task.dueDate < t ? "Overdue · " : task.dueDate === t ? "Due today · " : "Due "}
                {task.dueDate} · {projectTitle(task.projectId)}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button className="btn primary mt-4 w-full" onClick={onClose}>Got it</button>
    </Modal>
  );
}
