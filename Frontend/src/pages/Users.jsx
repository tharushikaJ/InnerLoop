import { useEffect, useState } from "react";
import { LoaderCircle, Save, ShieldCheck, UserRound } from "lucide-react";

import { workspaceApi } from "../api/workspaceApi";

export default function Users() {
  const [users, setUsers] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([workspaceApi.users(), workspaceApi.supervisors()])
      .then(([userItems, supervisorItems]) => {
        if (!active) return;
        setUsers(userItems);
        setSupervisors(supervisorItems);
        setDrafts(Object.fromEntries(userItems.filter((user) => user.role === "intern").map((user) => [user.id, user.assigned_supervisor_id || ""])));
      })
      .catch((requestError) => active && setError(requestError.message || "Unable to load users."));
    return () => { active = false; };
  }, []);

  const saveSupervisor = async (userId) => {
    setSavingId(userId);
    setError("");
    setSuccess("");
    try {
      const updated = await workspaceApi.updateUser(userId, {
        assigned_supervisor_id: drafts[userId] ? Number(drafts[userId]) : null,
      });
      setUsers((current) => current.map((user) => user.id === userId ? updated : user));
      setSuccess(`Supervisor updated for ${updated.name}.`);
    } catch (requestError) {
      setError(requestError.message || "Unable to update the supervisor.");
    } finally {
      setSavingId(null);
    }
  };

  return <div className="space-y-7">
    <section className="subpage-hero"><div className="relative z-10 max-w-xl"><p className="eyebrow text-[#199d1c]">Management workspace</p><h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#10233f]">Users</h2><p className="mt-3 text-sm leading-6 text-slate-500">Review accounts and manage each intern’s assigned supervisor.</p></div><div className="subpage-ring" /></section>
    {error && <div className="content-card border border-red-100 bg-red-50 text-sm font-semibold text-red-700" role="alert">{error}</div>}
    {success && <div className="content-card border border-emerald-100 bg-emerald-50 text-sm font-semibold text-emerald-700" role="status">{success}</div>}
    {users === null ? <div className="content-card flex items-center gap-2 text-sm font-semibold text-slate-400"><LoaderCircle size={17} className="animate-spin" /> Loading users…</div> : !users.length ? <div className="content-card text-center text-sm text-slate-400">No users are available.</div> : <section className="grid gap-4 xl:grid-cols-2">{users.map((user) => <article className="content-card" key={user.id}><div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e5f3ff] text-[#075fae]"><UserRound size={20} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="truncate text-sm font-black text-[#10233f]">{user.name}</h3><p className="mt-1 truncate text-xs text-slate-400">{user.email}</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-extrabold capitalize text-slate-600"><ShieldCheck size={12} /> {user.role}</span></div>{user.role === "intern" ? <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"><label className="field-label flex-1">Assigned Supervisor<select className="field-input" value={drafts[user.id] ?? ""} onChange={(event) => setDrafts((current) => ({ ...current, [user.id]: event.target.value }))}><option value="">Not Assigned</option>{supervisors.map((supervisor) => <option key={supervisor.id} value={supervisor.id}>{supervisor.name}</option>)}</select>{!supervisors.length && <span className="mt-1.5 block text-[11px] font-semibold text-slate-400">No active employees are available.</span>}</label><button type="button" onClick={() => saveSupervisor(user.id)} disabled={savingId === user.id} className="primary-button justify-center disabled:opacity-60">{savingId === user.id ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />} Save</button></div> : <p className="mt-5 text-xs font-semibold text-slate-400">Supervisor assignment is available for interns only.</p>}</div></div></article>)}</section>}
  </div>;
}
