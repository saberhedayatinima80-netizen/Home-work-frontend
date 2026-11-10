import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import ProjectTasks from "./pages/ProjectTasks";
import Members from "./pages/Members";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* every route below requires a signed-in user (see Layout) */}
        <Route element={<Layout />}>
          <Route index element={<Projects />} />
          <Route path="projects/:projectId" element={<ProjectTasks />} />
          <Route path="members" element={<Members />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
