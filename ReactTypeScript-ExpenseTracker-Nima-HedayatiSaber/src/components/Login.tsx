import { useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "register";
interface AuthForm {
  name: string;
  email: string;
  password: string;
}

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState<AuthForm>({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const set = (k: keyof AuthForm) => (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err =
      mode === "login" ? login(form.email, form.password) : register(form.name, form.email, form.password);
    setError(err ?? "");
  };

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form className="card flex w-full max-w-sm flex-col gap-3" onSubmit={submit}>
        <h1>💸 Expense Tracker</h1>
        <p className="muted">{mode === "login" ? "Welcome back" : "Create your account"}</p>
        {mode === "register" && <input placeholder="Full name" value={form.name} onChange={set("name")} required />}
        <input type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={set("password")}
          required
          minLength={4}
        />
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
      </form>
    </div>
  );
}
