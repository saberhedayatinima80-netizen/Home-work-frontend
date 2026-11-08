import { createContext, useContext, useState } from "react";
import { load, save } from "../storage.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => load("et_users", []));
  const [current, setCurrent] = useState(() => load("et_current", null));

  const register = (name, email, password) => {
    if (users.some((u) => u.email === email)) return "Email already registered";
    const user = { id: crypto.randomUUID(), name, email, password };
    const next = [...users, user];
    setUsers(next);
    save("et_users", next);
    setCurrent(user.id);
    save("et_current", user.id);
    return null;
  };

  const login = (email, password) => {
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) return "Invalid email or password";
    setCurrent(user.id);
    save("et_current", user.id);
    return null;
  };

  const logout = () => {
    setCurrent(null);
    save("et_current", null);
  };

  const user = users.find((u) => u.id === current) || null;

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
