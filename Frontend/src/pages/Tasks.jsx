import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, FileCheck2, LoaderCircle, RefreshCw, Send, X } from "lucide-react";

import { listTasks, submitTask } from "../api/taskApi";

const emptySubmission = { completion_evidence_link: "", progress_note: "", submission_status: "Submitted" };

function statusStyle(status) {
	if (status === "Approved") return "bg-[#e5f8e3] text-[#189b1b]";
	if (status === "Needs revision") return "bg-red-50 text-red-600";
	if (status === "Submitted") return "bg-blue-50 text-[#0769ba]";
	return "bg-slate-100 text-slate-500";
}

function TaskCard({ task, onSubmitted }) {
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState({ completion_evidence_link: task.completion_evidence_link || "", progress_note: task.progress_note || "", submission_status: task.submission_status || "Not submitted" });
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

	async function save(event) {
		event.preventDefault();
		setSaving(true); setError("");
		try { const updated = await submitTask(task.id, form); onSubmitted(updated); setOpen(false); }
		catch (requestError) { setError(requestError.message); }
		finally { setSaving(false); }
	}

	return <article className="content-card">
		<div className="flex flex-wrap items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e5f3ff] text-[#0769ba]"><FileCheck2 size={19} /></div><div className="min-w-0 flex-1"><h3 className="text-base font-extrabold text-slate-800">{task.task_title}</h3><p className="mt-1 text-sm text-slate-500">{task.description || "No task description provided."}</p></div><span className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${statusStyle(task.submission_status)}`}>{task.submission_status || "Not submitted"}</span></div>
		<div className="mt-5 grid gap-3 text-xs text-slate-500 sm:grid-cols-3"><span><b className="text-slate-700">Priority:</b> {task.priority || "Not set"}</span><span><b className="text-slate-700">Due:</b> {task.due_date || "Not set"}</span><span><b className="text-slate-700">Task status:</b> {task.status || "Not set"}</span></div>
		{task.completion_evidence_link && <a className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#0769ba] hover:underline" href={task.completion_evidence_link} target="_blank" rel="noreferrer">View submitted evidence <ExternalLink size={14} /></a>}
		{task.supervisor_feedback && <div className="mt-4 rounded-2xl bg-[#f3f9ff] p-4"><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#0769ba]">Supervisor feedback</p><p className="mt-2 text-sm leading-6 text-slate-600">{task.supervisor_feedback}</p></div>}
		<div className="mt-5 flex items-center justify-between gap-3"><span className="text-xs text-slate-400">{task.assigned_intern_pod_id ? `Assigned through pod #${task.assigned_intern_pod_id}` : "Direct assignment"}</span><button className="secondary-button min-h-10 px-4" onClick={() => setOpen((value) => !value)}>{open ? <X size={16} /> : <Send size={16} />} {open ? "Close" : "Submit evidence"}</button></div>
		{open && <form className="mt-5 space-y-4 border-t border-slate-100 pt-5" onSubmit={save}><label className="field-label">Evidence link<input className="field-input" type="url" placeholder="https://..." value={form.completion_evidence_link} onChange={update("completion_evidence_link")} /></label><label className="field-label">Progress note<textarea className="field-input min-h-24 resize-y" value={form.progress_note} onChange={update("progress_note")} placeholder="Describe what you completed..." /></label><label className="field-label">Submission status<select className="field-input" value={form.submission_status} onChange={update("submission_status")}><option>Not submitted</option><option>Submitted</option></select></label>{error && <p className="text-xs font-semibold text-red-600">{error}</p>}<button className="primary-button w-full justify-center" disabled={saving}>{saving ? <LoaderCircle size={17} className="animate-spin" /> : <CheckCircle2 size={17} />} {saving ? "Saving..." : "Save submission"}</button></form>}
	</article>;
}

export default function Tasks() {
	const [tasks, setTasks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	async function loadTasks() {
		setLoading(true); setError("");
		try { setTasks(await listTasks()); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
	}

	useEffect(() => { loadTasks(); }, []);

	function replaceTask(updated) {
		setTasks((current) => current.map((task) => task.id === updated.id ? updated : task));
	}

	return <div className="space-y-7"><section className="subpage-hero"><div className="relative z-10 max-w-xl"><p className="eyebrow text-[#199d1c]">Your work queue</p><h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#10233f]">Assigned tasks</h2><p className="mt-3 text-sm leading-6 text-slate-500">Track your assigned work, submit evidence, and respond to supervisor feedback.</p></div><div className="subpage-ring" /></section><section className="content-card"><div className="mb-5 flex items-center justify-between"><div><p className="eyebrow text-[#0871c6]">Live tasks</p><h3 className="section-title">Assigned tasks <span className="ml-2 text-sm font-bold text-slate-400">{tasks.length}</span></h3></div><button className="icon-button" onClick={loadTasks} aria-label="Refresh tasks"><RefreshCw size={17} /></button></div>{error && <div className="mb-4 flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button></div>}{loading ? <div className="flex items-center justify-center gap-2 py-14 text-sm font-semibold text-slate-400"><LoaderCircle size={18} className="animate-spin" /> Loading assigned tasks...</div> : tasks.length ? <div className="space-y-4">{tasks.map((task) => <TaskCard key={task.id} task={task} onSubmitted={replaceTask} />)}</div> : <div className="py-14 text-center"><FileCheck2 className="mx-auto text-slate-300" size={36} /><p className="mt-3 text-sm font-extrabold text-slate-600">No assigned tasks</p><p className="mt-1 text-sm text-slate-400">New work assigned directly or through your intern pod will appear here.</p></div>}</section></div>;
}
