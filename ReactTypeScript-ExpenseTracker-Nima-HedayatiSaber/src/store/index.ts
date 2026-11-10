import { configureStore } from "@reduxjs/toolkit";
import finance, { dataKey } from "./financeSlice";
import { save } from "../storage";

export const store = configureStore({ reducer: { finance } });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// persist each user's data in LocalStorage whenever the store changes
let last: string | null = null;
store.subscribe(() => {
  const { userId, ...data } = store.getState().finance;
  if (!userId) {
    last = null;
    return;
  }
  const json = JSON.stringify(data);
  if (json !== last) {
    last = json;
    save(dataKey(userId), data);
  }
});
