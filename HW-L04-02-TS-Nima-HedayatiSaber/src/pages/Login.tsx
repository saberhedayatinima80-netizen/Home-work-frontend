import { useState, type ChangeEvent, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isRole, type Role } from "../types";

type Mode = "login" | "register";
interface AuthForm {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export default function Login() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState<AuthForm>({ name: "", email: "", password: "", role: "member" });
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" replace />;

  const set = (k: "name" | "email" | "password") => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err =
      mode === "login"
        ? login(form.email.trim(), form.password)
        : register(form.name.trim(), form.email.trim(), form.password, form.role);
    setError(err ?? "");
  };

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form className="card flex w-full max-w-sm flex-col gap-3" onSubmit={submit}>
        <h1>✅ Team Task Manager</h1>
        <p className="muted">{mode === "login" ? "Sign in to your workspace" : "Create your account"}</p>
        {mode === "register" && (
          <>
            <input placeholder="Full name" value={form.name} onChange={set("name")} required />
            <select
              value={form.role}
              onChange={(e) => isRole(e.target.value) && setForm({ ...form, role: e.target.value })}
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
            </select>
          </>
        )}
        <input type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
        <input type="password" placeholder="Password" value={form.password} onChange={set("password")} required minLength={4} />
        {error && <div className="text-red-400">{error}</div>}
        <button className="btn primary">{mode === "login" ? "Sign in" : "Sign up"}</button>
        <button
          type="button"
          className="link"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
        {mode === "register" && <p className="muted">The first account is always created as a manager.</p>}
      </form>
    </div>
  );
}
