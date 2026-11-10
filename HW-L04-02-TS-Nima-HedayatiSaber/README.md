# Team Task Manager - HW L04-02 (TypeScript)

React + TypeScript + Redux Toolkit + React Router + Tailwind CSS. Author: Nima HedayatiSaber.

## Features (by step in the assignment)
1. **Team members** - add members with a name and a role (manager / member), separate Team page, assign tasks to members.
2. **Projects** - create with title, description and creation date; project list on the home page; open a project to manage its tasks.
3. **Tasks** - title, description, priority (low/medium/high), status (to do / in progress / done), due date, assignee; add, edit, delete and change status.
4. **Search and filter** - search by title; filter by status, priority, assignee and due-date range.
5. **Pages** - `/` projects, `/projects/:id` tasks, `/members` team, `/login`; create/edit forms open in modals.
6. **Persistence** - members, projects and tasks are saved in LocalStorage (survive refresh / closing the browser).
7. **Authentication** - sign up / sign in; every page except `/login` is protected; the active user is shown in the header. The first account is always a manager. Only managers can add/remove members, change roles and delete projects.
8. **Notifications** - tasks assigned to you that are overdue or due within 2 days trigger a modal and a toast once per session after signing in; the bell icon shows the count and reopens the list. Toasts also confirm actions.

## TypeScript
- Everything is `.ts` / `.tsx` (including `vite.config.ts`), `strict` plus `noUncheckedIndexedAccess`.
- Shared types and literal unions (`Role`, `Priority`, `Status`) in `src/types.ts` with type guards instead of `as` casts.
- Typed Redux hooks in `src/store/hooks.ts`.

## State
- Redux Toolkit (`src/store`) for members, projects and tasks.
- Context API for authentication (`AuthContext`) and toasts (`ToastContext`).

## Run
```bash
npm install
npm run dev
```
