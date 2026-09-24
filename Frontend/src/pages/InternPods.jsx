import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, LoaderCircle, Pencil, Plus, RefreshCw, Trash2, Users, X } from "lucide-react";
import {
	addInternPodMember,
	createInternPod,
	deleteInternPod,
	deleteInternPodMember,
	listInternPods,
	updateInternPod,
} from "../api/internPodApi";

const emptyForm = {
	pod_name: "",
	assigned_project_id: "",
	assigned_feature_module: "",
	mentor_employee_id: "",
	start_date: "",
	target_date: "",
	status: "Active",
	progress_percentage: 0,
};

function toPayload(form) {
	return {
		pod_name: form.pod_name.trim(),
		assigned_project_id: form.assigned_project_id ? Number(form.assigned_project_id) : null,
		assigned_feature_module: form.assigned_feature_module || null,
		mentor_employee_id: form.mentor_employee_id ? Number(form.mentor_employee_id) : null,
		start_date: form.start_date || null,
		target_date: form.target_date || null,
		status: form.status,
		progress_percentage: Number(form.progress_percentage) || 0,
	};
}

function formFromPod(pod) {
	return {
		pod_name: pod.pod_name || "",
		assigned_project_id: pod.assigned_project_id || "",
		assigned_feature_module: pod.assigned_feature_module || "",
		mentor_employee_id: pod.mentor_employee_id || "",
		start_date: pod.start_date || "",
		target_date: pod.target_date || "",
		status: pod.status || "Active",
		progress_percentage: pod.progress_percentage || 0,
	};
}

function PodForm({ initialValues, submitting, onSubmit, onClose }) {
	const [form, setForm] = useState(initialValues);
	const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

	return (
		<form className="content-card space-y-4" onSubmit={(event) => { event.preventDefault(); onSubmit(toPayload(form)); }}>
			<div className="flex items-center justify-between"><div><p className="eyebrow text-[#0871c6]">Pod workspace</p><h3 className="section-title">{initialValues.pod_name ? "Edit intern pod" : "Create intern pod"}</h3></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close form"><X size={18} /></button></div>
			<label className="field-label">Pod name<input className="field-input" value={form.pod_name} onChange={update("pod_name")} required /></label>
			<div className="grid gap-4 sm:grid-cols-2">
				<label className="field-label">Project ID<input className="field-input" type="number" min="1" value={form.assigned_project_id} onChange={update("assigned_project_id")} /></label>
				<label className="field-label">Mentor employee ID<input className="field-input" type="number" min="1" value={form.mentor_employee_id} onChange={update("mentor_employee_id")} /></label>
				<label className="field-label">Feature module<input className="field-input" value={form.assigned_feature_module} onChange={update("assigned_feature_module")} /></label>
				<label className="field-label">Status<select className="field-input" value={form.status} onChange={update("status")}><option>Active</option><option>Completed</option><option>Paused</option></select></label>
				<label className="field-label">Start date<input className="field-input" type="date" value={form.start_date} onChange={update("start_date")} /></label>
				<label className="field-label">Target date<input className="field-input" type="date" value={form.target_date} onChange={update("target_date")} /></label>
			</div>
			<label className="field-label">Progress percentage<input className="field-input" type="number" min="0" max="100" step="0.1" value={form.progress_percentage} onChange={update("progress_percentage")} /></label>
			<button className="primary-button w-full justify-center" disabled={submitting}>{submitting ? <LoaderCircle className="animate-spin" size={17} /> : <Check size={17} />} {submitting ? "Saving..." : "Save pod"}</button>
		</form>
	);
}

function PodRow({ pod, expanded, onToggle, onEdit, onDelete, onMemberAdded, onMemberDeleted }) {
	const [internUserId, setInternUserId] = useState("");
	const [memberBusy, setMemberBusy] = useState(false);
	const [memberError, setMemberError] = useState("");
	const members = pod.members || [];

	async function addMember(event) {
		event.preventDefault();
		if (!internUserId) return;
		setMemberBusy(true); setMemberError("");
		try { await addInternPodMember(pod.id, { intern_user_id: Number(internUserId), status: "Assigned" }); setInternUserId(""); onMemberAdded(); }
		catch (error) { setMemberError(error.message); }
		finally { setMemberBusy(false); }
	}

	async function removeMember(memberId) {
		setMemberBusy(true); setMemberError("");
		try { await deleteInternPodMember(pod.id, memberId); onMemberDeleted(); }
		catch (error) { setMemberError(error.message); }
		finally { setMemberBusy(false); }
	}

	return (
		<article className="rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-blue-100 sm:p-5">
			<div className="flex flex-wrap items-center gap-4">
				<div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e5f3ff] text-[#0769ba]"><Users size={19} /></div>
				<div className="min-w-0 flex-1"><h3 className="truncate text-sm font-extrabold text-slate-800">{pod.pod_name}</h3><p className="mt-1 text-xs text-slate-400">{pod.assigned_feature_module || "No feature module"} {pod.assigned_project_id ? `· Project #${pod.assigned_project_id}` : ""}</p></div>
				<span className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${pod.status === "Active" ? "bg-[#e5f8e3] text-[#189b1b]" : "bg-slate-100 text-slate-500"}`}>{pod.status}</span>
				<div className="hidden w-28 sm:block"><div className="flex justify-between text-[10px] font-bold text-slate-400"><span>Progress</span><span>{pod.progress_percentage}%</span></div><div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#20b51d]" style={{ width: `${Math.min(100, pod.progress_percentage)}%` }} /></div></div>
				<button className="icon-button" onClick={() => onToggle(pod.id)} aria-label="Toggle members">{expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button>
				<button className="icon-button" onClick={() => onEdit(pod)} aria-label="Edit pod"><Pencil size={16} /></button>
				<button className="icon-button hover:border-red-200 hover:bg-red-50 hover:text-red-600" onClick={() => onDelete(pod)} aria-label="Delete pod"><Trash2 size={16} /></button>
			</div>
			{expanded && <div className="mt-5 border-t border-slate-100 pt-4"><div className="flex items-center justify-between"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-slate-400">Members ({members.length})</p></div><div className="mt-3 space-y-2">{members.length ? members.map((member) => <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2" key={member.id}><span className="text-sm font-semibold text-slate-700">User #{member.intern_user_id} <span className="ml-2 text-xs text-slate-400">{member.status}</span></span><button className="text-slate-400 hover:text-red-500" onClick={() => removeMember(member.id)} disabled={memberBusy} aria-label="Remove member"><Trash2 size={15} /></button></div>) : <p className="text-sm text-slate-400">No members assigned yet.</p>}</div><form className="mt-4 flex flex-wrap gap-2" onSubmit={addMember}><input className="field-input mt-0 min-w-0 flex-1 sm:max-w-xs" type="number" min="1" placeholder="Intern user ID" value={internUserId} onChange={(event) => setInternUserId(event.target.value)} /><button className="secondary-button min-h-11 px-4" disabled={memberBusy}><Plus size={16} /> Add member</button></form>{memberError && <p className="mt-2 text-xs font-semibold text-red-600">{memberError}</p>}</div>}
		</article>
	);
}

export default function InternPods() {
	const [pods, setPods] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [form, setForm] = useState(null);
	const [saving, setSaving] = useState(false);
	const [expandedId, setExpandedId] = useState(null);

	async function loadPods() {
		setLoading(true); setError("");
		try { setPods(await listInternPods()); }
		catch (requestError) { setError(requestError.message); }
		finally { setLoading(false); }
	}

	useEffect(() => { loadPods(); }, []);

	async function savePod(payload) {
		setSaving(true); setError("");
		try { if (form.id) await updateInternPod(form.id, payload); else await createInternPod(payload); setForm(null); await loadPods(); }
		catch (requestError) { setError(requestError.message); }
		finally { setSaving(false); }
	}

	async function removePod(pod) {
		if (!window.confirm(`Delete ${pod.pod_name}?`)) return;
		try { await deleteInternPod(pod.id); await loadPods(); }
		catch (requestError) { setError(requestError.message); }
	}

	return (
		<div className="space-y-7">
			<section className="subpage-hero"><div className="relative z-10 max-w-xl"><p className="eyebrow text-[#199d1c]">Digital Lab workspace</p><h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#10233f]">Intern pods</h2><p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">Organize mentors, interns and feature work in one connected pod.</p><button className="primary-button mt-6" onClick={() => setForm({ ...emptyForm })}><Plus size={17} /> Add intern pod</button></div><div className="subpage-ring" /></section>
			{form && <PodForm initialValues={form} submitting={saving} onSubmit={savePod} onClose={() => setForm(null)} />}
			<section className="content-card"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow text-[#0871c6]">Live data</p><h3 className="section-title">All intern pods <span className="ml-2 text-sm font-bold text-slate-400">{pods.length}</span></h3></div><button className="icon-button" onClick={loadPods} aria-label="Refresh intern pods"><RefreshCw size={17} /></button></div>{error && <div className="mb-4 flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button></div>}{loading ? <div className="flex items-center justify-center gap-2 py-14 text-sm font-semibold text-slate-400"><LoaderCircle className="animate-spin" size={18} /> Loading intern pods...</div> : pods.length ? <div className="space-y-3">{pods.map((pod) => <PodRow key={pod.id} pod={pod} expanded={expandedId === pod.id} onToggle={(id) => setExpandedId(expandedId === id ? null : id)} onEdit={(item) => setForm({ ...formFromPod(item), id: item.id })} onDelete={removePod} onMemberAdded={loadPods} onMemberDeleted={loadPods} />)}</div> : <div className="py-14 text-center"><Users className="mx-auto text-slate-300" size={36} /><p className="mt-3 text-sm font-extrabold text-slate-600">No intern pods yet</p><p className="mt-1 text-sm text-slate-400">Create the first pod to connect interns with a project.</p></div>}</section>
		</div>
	);
}
