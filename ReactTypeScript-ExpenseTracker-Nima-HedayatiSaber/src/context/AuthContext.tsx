import { createContext, useContext, useState, type ReactNode } from "react";
import { load, save } from "../storage";
import type { User } from "../types";

interface AuthValue {
  user: User | null;
  register: (name: string, email: string, password: string) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => load<User[]>("et_users", []));
  const [current, setCurrent] = useState<string | null>(() => load<string | null>("et_current", null));

  const register: AuthValue["register"] = (name, email, password) => {
    if (users.some((u) => u.email === email)) return "Email already registered";
    const user: User = { id: crypto.randomUUID(), name, email, password };
    const next = [...users, user];
    setUsers(next);
    save("et_users", next);
    setCurrent(user.id);
    save("et_current", user.id);
    return null;
  };

  const login: AuthValue["login"] = (email, password) => {
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

  const user = users.find((u) => u.id === current) ?? null;

  return <AuthContext.Provider value={{ user, register, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
