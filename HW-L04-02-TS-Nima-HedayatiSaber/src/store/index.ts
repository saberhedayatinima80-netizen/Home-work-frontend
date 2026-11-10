import { configureStore } from "@reduxjs/toolkit";
import app, { DATA_KEY } from "./appSlice";
import { save } from "../storage";

export const store = configureStore({ reducer: { app } });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// keep users, projects and tasks in LocalStorage so they survive a refresh
store.subscribe(() => save(DATA_KEY, store.getState().app));
