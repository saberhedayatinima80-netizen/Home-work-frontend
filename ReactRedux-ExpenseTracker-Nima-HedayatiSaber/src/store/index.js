import { configureStore } from "@reduxjs/toolkit";
import finance, { dataKey } from "./financeSlice.js";
import { save } from "../storage.js";

export const store = configureStore({ reducer: { finance } });

// persist each user's data in LocalStorage whenever the store changes
let last = null;
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
