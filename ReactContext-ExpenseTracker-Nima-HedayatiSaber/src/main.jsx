import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ExpenseProvider } from "./context/ExpenseContext.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ExpenseProvider>
      <App />
    </ExpenseProvider>
  </AuthProvider>
);
