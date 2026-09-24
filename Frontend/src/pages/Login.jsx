import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import Brand from "../components/Brand";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { isAuthenticated, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ role: "intern", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!authLoading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await login({ ...form, email: form.email.trim().toLowerCase() });
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Invalid email, password, or role.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="login-loop login-loop-one" aria-hidden="true" />
      <div className="login-loop login-loop-two" aria-hidden="true" />
      <section className="auth-card" aria-labelledby="login-title">
        <Brand to="/login" />
        <div className="mt-9">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#edf8ff] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#075fae]"><ShieldCheck size={14} /> Secure workspace</div>
          <h1 id="login-title" className="text-3xl font-black tracking-[-0.035em] text-[#10233f]">Welcome back.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to continue to your InnerLoop workspace.</p>
        </div>
        {location.state?.message && <div className="auth-success" role="status">{location.state.message}</div>}
        {error && <div className="auth-error" role="alert">{error}</div>}
        <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
          <label className="field-label">Role<select name="role" value={form.role} onChange={update} className="field-input" required><option value="intern">Intern</option><option value="employee">Employee</option><option value="management">Management</option></select></label>
          <label className="field-label">Email<input name="email" type="email" autoComplete="email" value={form.email} onChange={update} className="field-input" placeholder="name@example.com" required /></label>
          <label className="field-label">Password<span className="relative block"><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={form.password} onChange={update} className="field-input pr-12" placeholder="Enter your password" required /><button type="button" onClick={() => setShowPassword((value) => !value)} className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
          <button type="submit" disabled={submitting || authLoading} className="primary-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <><LoaderCircle size={18} className="animate-spin" /> Signing in…</> : <>Login <ArrowRight size={17} /></>}</button>
        </form>
        <p className="mt-7 text-center text-sm text-slate-500">New to InnerLoop? <Link to="/register" className="font-extrabold text-[#075fae] hover:underline">Register</Link></p>
      </section>
    </main>
  );
}
