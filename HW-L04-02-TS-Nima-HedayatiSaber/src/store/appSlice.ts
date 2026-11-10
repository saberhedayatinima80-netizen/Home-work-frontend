import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { load } from "../storage";
import type { AppData, Member, Project, Role, Status, Task } from "../types";

export const DATA_KEY = "tm_data";

const initialState: AppData = load<AppData>(DATA_KEY, { members: [], projects: [], tasks: [] });

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // team members
    addMember(state, { payload }: PayloadAction<Member>) {
      state.members.push(payload);
    },
    setRole(state, { payload }: PayloadAction<{ id: string; role: Role }>) {
      const m = state.members.find((x) => x.id === payload.id);
      if (m) m.role = payload.role;
    },
    removeMember(state, { payload: id }: PayloadAction<string>) {
      state.members = state.members.filter((m) => m.id !== id);
      state.tasks.forEach((t) => {
        if (t.assigneeId === id) t.assigneeId = "";
      });
    },
    // projects
    addProject(state, { payload }: PayloadAction<Project>) {
      state.projects.unshift(payload);
    },
    updateProject(state, { payload }: PayloadAction<Project>) {
      const i = state.projects.findIndex((p) => p.id === payload.id);
      if (i >= 0) state.projects[i] = payload;
    },
    deleteProject(state, { payload: id }: PayloadAction<string>) {
      state.projects = state.projects.filter((p) => p.id !== id);
      state.tasks = state.tasks.filter((t) => t.projectId !== id);
    },
    // tasks
    addTask(state, { payload }: PayloadAction<Task>) {
      state.tasks.unshift(payload);
    },
    updateTask(state, { payload }: PayloadAction<Task>) {
      const i = state.tasks.findIndex((t) => t.id === payload.id);
      if (i >= 0) state.tasks[i] = payload;
    },
    setStatus(state, { payload }: PayloadAction<{ id: string; status: Status }>) {
      const t = state.tasks.find((x) => x.id === payload.id);
      if (t) t.status = payload.status;
    },
    deleteTask(state, { payload: id }: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== id);
    },
  },
});

export const actions = slice.actions;
export default slice.reducer;
