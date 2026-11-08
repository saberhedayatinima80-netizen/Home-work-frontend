import { createContext, useContext, useEffect, useReducer } from "react";
import { load, save } from "../storage.js";

const ExpenseContext = createContext(null);

export const DEFAULT_CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Salary", "Other"];

const initial = {
  transactions: load("et_transactions", []),
  categories: load("et_categories", DEFAULT_CATEGORIES),
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TX":
      return { ...state, transactions: [action.tx, ...state.transactions] };
    case "DELETE_TX":
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) };
    case "ADD_CATEGORY":
      if (!action.name || state.categories.includes(action.name)) return state;
      return { ...state, categories: [...state.categories, action.name] };
    case "IMPORT": {
      const extra = action.txs
        .map((t) => t.category)
        .filter((c, i, a) => c && a.indexOf(c) === i && !state.categories.includes(c));
      return {
        transactions: [...action.txs, ...state.transactions],
        categories: [...state.categories, ...extra],
      };
    }
    default:
      return state;
  }
}

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => save("et_transactions", state.transactions), [state.transactions]);
  useEffect(() => save("et_categories", state.categories), [state.categories]);

  return (
    <ExpenseContext.Provider value={{ ...state, dispatch }}>{children}</ExpenseContext.Provider>
  );
}

export const useExpenses = () => useContext(ExpenseContext);
