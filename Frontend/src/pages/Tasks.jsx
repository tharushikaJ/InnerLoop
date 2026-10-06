import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, CalendarClock, Check, CheckCircle2, Circle, Clock3, ExternalLink,
  ChevronDown, Flag, FolderKanban, LayoutList, LoaderCircle, RefreshCw, Search,
  Send, SlidersHorizontal, Sparkles, Plus, UserRound, Users, X,
} from "lucide-react";

import { listProjects } from "../api/projectApi";
import { createTask, getTaskOptions, listTasks, submitTask } from "../api/taskApi";
import { useAuth } from "../context/AuthContext";
import { canCreateTasks } from "../utils/rolePermissions";

const DONE = new Set(["completed", "complete", "done", "closed", "approved"]);
const DOING = new Set(["in progress", "in-progress", "active", "review", "in review"]);
const emptyTaskForm = { task_title: "", description: "", project_id: "", assigned_user_id: "", assigned_intern_pod_id: "", priority: "Medium", status: "To do", due_date: "", progress_note: "" };

function normalized(value) { return String(value || "").trim().toLowerCase(); }
function isDone(task) { return DONE.has(normalized(task.status)); }
function isOverdue(task) { return Boolean(task.due_date && !isDone(task) && new Date(`${task.due_date}T23:59:59`) < new Date()); }
function formatDate(value) { return value ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "No due date"; }

function priorityTone(priority) {
  const value = normalized(priority);
  if (["urgent", "critical", "high"].includes(value)) return "bg-rose-50 text-rose-700 ring-rose-200";
  if (["medium", "normal"].includes(value)) return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
}

function Metric({ icon: Icon, label, value, detail, tone = "blue" }) {
  const color = tone === "green" ? "bg-emerald-50 text-emerald-600" : tone === "rose" ? "bg-rose-50 text-rose-600" : tone === "amber" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-[#075fae]";
  return <article className="stat-card"><span className={`grid h-11 w-11 place-items-center rounded-2xl ${color}`}><Icon size={20} /></span><div><p className="text-[11px] font-extrabold uppercase tracking-[.14em] text-slate-400">{label}</p><p className="mt-1 text-2xl font-black text-[#10233f]">{value}</p><p className="mt-1 text-[11px] text-slate-400">{detail}</p></div></article>;
}

function AssigneeDropdown({ title, users, selectedId, onChange }) {
  const selected = users.find((user) => user.id === Number(selectedId));

  return (
    <details className="group relative">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-[#0871c6] hover:bg-white [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            {title}
          </span>
          <span className="mt-1 block truncate text-sm font-semibold text-slate-700">
            {selected ? selected.name : `Choose ${title.toLowerCase()}`}
          </span>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-slate-400 shadow-sm transition group-open:rotate-180">
          <ChevronDown size={16} />
        </span>
      </summary>

      <div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
        {users.length ? (
          users.map((user) => (
            <label
              key={user.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-blue-50"
            >
              <input
                className="h-4 w-4 accent-[#0871c6]"
                type="checkbox"
                checked={Number(selectedId) === user.id}
                onChange={() => onChange(user.id)}
              />
              <span className="min-w-0">
                <span className="block truncate font-semibold">{user.name}</span>
                <span className="block truncate text-xs text-slate-400">{user.email}</span>
              </span>
            </label>
          ))
        ) : (
          <p className="px-3 py-2 text-sm text-slate-400">
            No {title.toLowerCase()} available.
          </p>
        )}
      </div>
    </details>
  );
}

function ProjectDropdown({ projects, selectedId, onChange }) {
  const selected = projects.find((project) => project.id === Number(selectedId));

  return (
    <details className="group relative">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-[#0871c6] hover:bg-white [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Project
          </span>
          <span className="mt-1 block truncate text-sm font-semibold text-slate-700">
            {selected ? selected.project_name : "Choose project"}
          </span>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-slate-400 shadow-sm transition group-open:rotate-180">
          <ChevronDown size={16} />
        </span>
      </summary>

      <div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
        {projects.length ? (
          projects.map((project) => (
            <label
              key={project.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-blue-50"
            >
              <input
                className="h-4 w-4 accent-[#0871c6]"
                type="checkbox"
                checked={Number(selectedId) === project.id}
                onChange={() => onChange(project.id)}
              />
              <span className="min-w-0">
                <span className="block truncate font-semibold">{project.project_name}</span>
              </span>
            </label>
          ))
        ) : (
          <p className="px-3 py-2 text-sm text-slate-400">No projects available.</p>
        )}
      </div>
    </details>
  );
}

function TaskForm({ options, assignedUserId, submitting, onSubmit, onClose }) {
  const [form, setForm] = useState({ ...emptyTaskForm, assigned_user_id: assignedUserId || "" });
  const employees = options.assignees.filter((user) => user.role === "employee");
  const interns = options.interns?.length? options.interns: options.assignees.filter((user) => user.role === "intern");
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const optional = (value) => value.trim() || null;

  function selectAssignee(id) {
    setForm((current) => ({
      ...current,
      assigned_user_id: Number(current.assigned_user_id) === id ? "" : id,
    }));
  }

  function selectProject(id) {
    setForm((current) => ({ ...current, project_id: Number(current.project_id) === id ? "" : id }));
  }

  function save(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      task_title: form.task_title.trim(),
      description: optional(form.description),
      project_id: form.project_id ? Number(form.project_id) : null,
      assigned_user_id: form.assigned_user_id ? Number(form.assigned_user_id) : null,
      assigned_intern_pod_id: form.assigned_intern_pod_id ? Number(form.assigned_intern_pod_id) : null,
      due_date: form.due_date || null,
      progress_note: optional(form.progress_note),
      created_source: "Employee workspace",
    });
  }

return (
  <form className="content-card space-y-5" onSubmit={save}>
    <div className="flex items-center justify-between">
      <div>
        <p className="eyebrow text-[#0871c6]">Task workspace</p>
        <h3 className="section-title">Create task</h3>
      </div>

      <button
        type="button"
        className="icon-button"
        onClick={onClose}
        aria-label="Close task form"
      >
        <X size={18} />
      </button>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <label className="field-label sm:col-span-2">
        Task title
        <input
          className="field-input"
          value={form.task_title}
          onChange={update("task_title")}
          required
          maxLength={255}
        />
      </label>
    </div>

    <div className="sm:col-span-2 grid gap-5 lg:grid-cols-2">
      <fieldset>
        <legend className="field-label">Assignees</legend>

        <div className="mt-2 space-y-3">
          <AssigneeDropdown
            title="Employees"
            users={employees}
            selectedId={form.assigned_user_id}
            onChange={selectAssignee}
          />

          <AssigneeDropdown
            title="Interns"
            users={interns}
            selectedId={form.assigned_user_id}
            onChange={selectAssignee}
          />
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          A task can have one direct employee or intern assignee.
        </p>
      </fieldset>

      <fieldset>
        <legend className="field-label">Selected project</legend>
        <div className="mt-2">
          <ProjectDropdown
            projects={options.projects}
            selectedId={form.project_id}
            onChange={selectProject}
          />
        </div>
      </fieldset>
    </div>

    <label className="field-label">
      Intern pod
      <select
        className="field-input"
        value={form.assigned_intern_pod_id}
        onChange={update("assigned_intern_pod_id")}
      >
        <option value="">No intern pod</option>
        {options.pods.map((pod) => (
          <option key={pod.id} value={pod.id}>
            {pod.pod_name}
          </option>
        ))}
      </select>
    </label>

    <label className="field-label">
      Due date
      <input
        className="field-input"
        type="date"
        value={form.due_date}
        onChange={update("due_date")}
      />
    </label>

    <label className="field-label">
      Priority
      <select
        className="field-input"
        value={form.priority}
        onChange={update("priority")}
      >
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
        <option>Urgent</option>
      </select>
    </label>

    <label className="field-label">
      Status
      <select
        className="field-input"
        value={form.status}
        onChange={update("status")}
      >
        <option>To do</option>
        <option>In progress</option>
        <option>Review</option>
        <option>Completed</option>
        <option>Blocked</option>
      </select>
    </label>

    <label className="field-label sm:col-span-2">
      Description
      <textarea
        className="field-input min-h-24 resize-y"
        value={form.description}
        onChange={update("description")}
        placeholder="Describe the expected outcome and acceptance criteria."
      />
    </label>

    <label className="field-label sm:col-span-2">
      Progress note
      <textarea
        className="field-input min-h-20 resize-y"
        value={form.progress_note}
        onChange={update("progress_note")}
        placeholder="Optional handoff or starting context"
      />
    </label>

    <button
      className="primary-button w-full justify-center"
      disabled={submitting}
    >
      {submitting ? (
        <LoaderCircle className="animate-spin" size={17} />
      ) : (
        <Check size={17} />
      )}

      {submitting ? "Saving..." : "Save task"}
    </button>
  </form>
);
}
function SubmissionForm({ task, onSubmitted }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    completion_evidence_link: task.completion_evidence_link || "",
    progress_note: task.progress_note || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (event) =>
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const updated = await submitTask(task.id, form);
      onSubmitted(updated);
      setOpen(false);
    } catch (requestError) {
      setError(requestError.message || "Unable to save submission.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <div className="flex justify-end">
        <button
          className="secondary-button min-h-10 px-4"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={15} /> : <Send size={15} />}
          {open ? "Close" : "Submit work"}
        </button>
      </div>

      {open && (
        <form className="mt-4 space-y-4" onSubmit={save}>
          <label className="field-label">
            Evidence link
            <input
              className="field-input"
              type="url"
              placeholder="https://..."
              value={form.completion_evidence_link}
              onChange={update("completion_evidence_link")}
            />
          </label>

          <label className="field-label">
            Progress note
            <textarea
              className="field-input min-h-24 resize-y"
              value={form.progress_note}
              onChange={update("progress_note")}
              placeholder="Summarize what you completed..."
            />
          </label>

          {error && (
            <p className="text-xs font-semibold text-rose-600">{error}</p>
          )}

          <button
            className="primary-button w-full justify-center"
            disabled={saving}
          >
            {saving ? (
              <LoaderCircle className="animate-spin" size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}

            {saving ? "Saving..." : "Save submission"}
          </button>
        </form>
      )}
    </div>
  );
}

function TaskCard({ task, projectName, isIntern, onSubmitted }) {
  const overdue = isOverdue(task);
  return <article className={`flex h-full flex-col rounded-[26px] border bg-white p-5 shadow-[0_10px_35px_rgba(15,45,75,.045)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(15,45,75,.09)] ${overdue ? "border-rose-200" : "border-slate-200/80"}`}>
    <div className="flex items-start gap-3"><span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${isDone(task) ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-[#075fae]"}`}>{isDone(task) ? <CheckCircle2 size={18} /> : <Circle size={18} />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ring-1 ${priorityTone(task.priority)}`}><Flag className="mr-1 inline" size={10} />{task.priority || "No priority"}</span>{overdue && <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white">Overdue</span>}</div><h3 className="mt-3 text-base font-black leading-snug text-[#10233f]">{task.task_title}</h3></div></div>
    <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-slate-500">{task.description || "No task description has been added."}</p>
    <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-xs"><div className="flex items-center gap-2 text-slate-500"><FolderKanban size={14} className="text-[#075fae]" /><span className="truncate font-semibold">{task.project_name || projectName || "Independent task"}</span></div><div className="flex items-center gap-2 text-slate-500"><UserRound size={14} className="text-[#075fae]" /><span className="truncate"><span className="font-semibold">Assignee:</span> {task.assigned_user_name || "No direct assignee"}</span></div><div className="flex items-center gap-2 text-slate-500"><Users size={14} className="text-[#20a91e]" /><span className="truncate"><span className="font-semibold">Intern pod:</span> {task.assigned_intern_pod_name || "No intern pod"}</span></div><div className={`flex items-center gap-2 ${overdue ? "font-bold text-rose-600" : "text-slate-500"}`}><CalendarClock size={14} /><span>{formatDate(task.due_date)}</span></div><div className="flex items-center gap-2 text-slate-500"><Clock3 size={14} className="text-[#20a91e]" /><span className="capitalize">{task.status || "Not started"}</span></div></div>
    {task.progress_note && <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">{task.progress_note}</div>}
    {task.completion_evidence_link && <a className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#075fae] hover:underline" href={task.completion_evidence_link} target="_blank" rel="noreferrer">View evidence <ExternalLink size={13} /></a>}
    {isIntern && <SubmissionForm task={task} onSubmitted={onSubmitted} />}
  </article>;
}

function TaskColumn({ title, accent, tasks, projectsById, isIntern, onSubmitted, empty }) {
  return <section className="rounded-[28px] bg-slate-100/70 p-3 sm:p-4"><div className="mb-4 flex items-center justify-between px-2"><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${accent}`} /><h3 className="text-sm font-black text-[#10233f]">{title}</h3></div><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500">{tasks.length}</span></div><div className="space-y-3">{tasks.length ? tasks.map((task) => <TaskCard key={task.id} task={task} projectName={projectsById.get(task.project_id)} isIntern={isIntern} onSubmitted={onSubmitted} />) : <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-10 text-center text-xs text-slate-400">{empty}</div>}</div></section>;
}

export default function Tasks() {
  const { user } = useAuth();
  const canCreate = canCreateTasks(user?.role);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState({ projects: [], assignees: [], interns: [], pods: [] });

  async function load() {
    setLoading(true); setError("");
    try {
      const requests = [listTasks(), listProjects()];
      if (canCreate) requests.push(getTaskOptions());
      const [taskData, projectData, optionData] = await Promise.all(requests);
      setTasks(taskData); setProjects(projectData);
      if (optionData) setOptions(optionData);
    }
    catch (requestError) { setError(requestError.message || "Unable to load tasks."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [canCreate]);
  const isIntern = user?.role === "intern";
  const projectsById = useMemo(() => new Map(projects.map((project) => [project.id, project.project_name])), [projects]);
  const priorities = useMemo(() => [...new Set(tasks.map((task) => task.priority).filter(Boolean))], [tasks]);
  const visible = useMemo(() => tasks.filter((task) => {
    const haystack = [task.task_title, task.description, task.status, projectsById.get(task.project_id)].join(" ").toLowerCase();
    return (priority === "all" || normalized(task.priority) === normalized(priority)) && haystack.includes(query.trim().toLowerCase());
  }), [tasks, priority, query, projectsById]);
  const todo = visible.filter((task) => !isDone(task) && !DOING.has(normalized(task.status)));
  const doing = visible.filter((task) => DOING.has(normalized(task.status)));
  const done = visible.filter(isDone);
  const overdue = tasks.filter(isOverdue).length;
  const dueSoon = tasks.filter((task) => { if (!task.due_date || isDone(task)) return false; const days = (new Date(`${task.due_date}T23:59:59`) - new Date()) / 86400000; return days >= 0 && days <= 7; }).length;
  const highPriority = tasks.filter((task) => ["urgent", "critical", "high"].includes(normalized(task.priority)) && !isDone(task)).length;

  function replaceTask(updated) { setTasks((current) => current.map((task) => task.id === updated.id ? updated : task)); }
  async function saveTask(payload) {
    setSaving(true); setError(""); setSuccess("");
    try {
      const created = await createTask(payload);
      setFormOpen(false);
      await load();
      setSuccess(`Task “${created.task_title}” created successfully.`);
    } catch (requestError) {
      setError(requestError.message || "Unable to create the task.");
    } finally {
      setSaving(false);
    }
  }
  const roleMessage = user?.role === "management" ? "See execution pressure across the lab and spot work that needs intervention." : user?.role === "employee" ? "Turn project commitments into a clear, prioritized delivery queue." : "Focus on assigned work, evidence, and supervisor feedback.";

  return <div className="space-y-6">
    <section className="subpage-hero"><div className="relative z-10 max-w-2xl"><div className="inline-flex items-center gap-2 rounded-full bg-[#edfbed] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.15em] text-[#168f18]"><Sparkles size={13} /> {user?.role} execution desk</div><h2 className="mt-4 text-4xl font-black tracking-[-.045em] text-[#10233f] sm:text-5xl">Work, clearly in motion.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">{roleMessage}</p>{canCreate && <button className="primary-button mt-6" onClick={() => setFormOpen(true)}><Plus size={17} /> Add Task</button>}</div><div className="subpage-ring" /></section>
    {canCreate && formOpen && <TaskForm options={options} assignedUserId={user.id} submitting={saving} onSubmit={saveTask} onClose={() => setFormOpen(false)} />}
    {success && <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700" role="status"><span>{success}</span><button onClick={() => setSuccess("")} aria-label="Dismiss success message"><X size={16} /></button></div>}
    <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4"><Metric icon={LayoutList} label="Total work" value={tasks.length} detail="Tasks in the current scope" /><Metric icon={AlertCircle} label="Overdue" value={overdue} detail="Open tasks past due" tone="rose" /><Metric icon={CalendarClock} label="Due this week" value={dueSoon} detail="Next seven days" tone="amber" /><Metric icon={CheckCircle2} label="Completed" value={tasks.filter(isDone).length} detail={`${highPriority} high-priority open`} tone="green" /></section>
    <section className="content-card"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="eyebrow text-[#0871c6]">Delivery board</p><h3 className="section-title">Task flow <span className="ml-2 text-sm text-slate-400">{visible.length}</span></h3></div><div className="flex flex-col gap-3 sm:flex-row"><label className="flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-400 focus-within:border-blue-300 focus-within:bg-white"><Search size={16} /><input className="w-full bg-transparent text-sm text-slate-700 outline-none sm:w-56" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search task or project" aria-label="Search tasks" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}</label><label className="flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600"><SlidersHorizontal size={16} /><select className="bg-transparent outline-none" value={priority} onChange={(event) => setPriority(event.target.value)} aria-label="Filter by priority"><option value="all">All priorities</option>{priorities.map((item) => <option key={item}>{item}</option>)}</select></label><button className="icon-button" onClick={load} aria-label="Refresh tasks"><RefreshCw size={17} /></button></div></div>
      {error && <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      {loading ? <div className="flex items-center justify-center gap-2 py-20 text-sm font-semibold text-slate-400"><LoaderCircle className="animate-spin" size={19} /> Loading delivery board...</div> : <div className="mt-6 grid items-start gap-4 xl:grid-cols-3"><TaskColumn title="To do" accent="bg-slate-400" tasks={todo} projectsById={projectsById} isIntern={isIntern} onSubmitted={replaceTask} empty="No queued work" /><TaskColumn title="In progress" accent="bg-[#0871c6]" tasks={doing} projectsById={projectsById} isIntern={isIntern} onSubmitted={replaceTask} empty="Nothing in motion" /><TaskColumn title="Done" accent="bg-[#20b51d]" tasks={done} projectsById={projectsById} isIntern={isIntern} onSubmitted={replaceTask} empty="No completed work yet" /></div>}
    </section>
  </div>;
}
