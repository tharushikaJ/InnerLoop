import { LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProfileField({ label, value }) {
  if (!value) return null;
  return <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"><dt className="text-[10px] font-extrabold uppercase tracking-[.16em] text-slate-400">{label}</dt><dd className="mt-1.5 text-sm font-bold capitalize text-slate-800">{value}</dd></div>;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = async () => { await logout(); navigate("/login", { replace: true }); };
  const initials = user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="space-y-7">
      <section className="subpage-hero"><div className="relative z-10 flex max-w-2xl flex-col gap-5 sm:flex-row sm:items-center"><div className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-[#e5f3ff] text-3xl font-black text-[#075fae] ring-8 ring-white">{initials}</div><div><p className="eyebrow text-[#199d1c]">InnerLoop account</p><h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#10233f]">{user.name}</h2><p className="mt-2 flex items-center gap-2 text-sm text-slate-500"><Mail size={15} /> {user.email}</p></div></div><div className="subpage-ring" /></section>
      <section className="content-card mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow text-[#0871c6]">Account details</p><h3 className="section-title">Your profile</h3></div><div className="inline-flex items-center gap-2 rounded-full bg-[#e8f8e6] px-3 py-2 text-xs font-extrabold capitalize text-[#168f18]"><ShieldCheck size={15} /> {user.status}</div></div>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2"><ProfileField label="Name" value={user.name} /><ProfileField label="Email" value={user.email} /><ProfileField label="Role" value={user.role} /><ProfileField label="Designation" value={user.designation} /><ProfileField label="Department" value={user.department} /><ProfileField label="Status" value={user.status} /></dl>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6"><div className="flex items-center gap-3 text-sm text-slate-500"><UserRound size={18} className="text-[#075fae]" /> Signed in securely with InnerLoop</div><button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-extrabold text-red-600 transition hover:bg-red-100"><LogOut size={17} /> Logout</button></div>
      </section>
    </div>
  );
}
