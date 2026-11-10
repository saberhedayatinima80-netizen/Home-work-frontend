import { createContext, useContext, useState, type ReactNode } from "react";
import { load, save } from "../storage";
import { actions } from "../store/appSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { Member, Role } from "../types";

interface AuthValue {
  user: Member | null;
  register: (name: string, email: string, password: string, role: Role) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
}

const CURRENT_KEY = "tm_current";
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const members = useAppSelector((s) => s.app.members);
  const dispatch = useAppDispatch();
  const [current, setCurrent] = useState<string | null>(() => load<string | null>(CURRENT_KEY, null));

  const start = (id: string | null) => {
    setCurrent(id);
    save(CURRENT_KEY, id);
  };

  const register: AuthValue["register"] = (name, email, password, role) => {
    if (members.some((m) => m.email !== "" && m.email === email)) return "Email already registered";
    const member: Member = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      // the very first account must be a manager so someone can manage the team
      role: members.length === 0 ? "manager" : role,
    };
    dispatch(actions.addMember(member));
    start(member.id);
    return null;
  };

  const login: AuthValue["login"] = (email, password) => {
    const m = members.find((x) => x.email !== "" && x.email === email && x.password === password);
    if (!m) return "Invalid email or password";
    start(m.id);
    return null;
  };

  const logout = () => start(null);

  const user = members.find((m) => m.id === current) ?? null;

  return <AuthContext.Provider value={{ user, register, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
