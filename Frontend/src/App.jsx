import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight, BarChart3, Bell, CalendarDays, CheckSquare, ChevronRight,
  DoorOpen, FolderKanban, LayoutDashboard, LogOut, Menu, Search, Settings,
  ShieldCheck, Sparkles, Users, X,
} from "lucide-react";

import { workspaceApi } from "./api/workspaceApi";
import Brand from "./components/Brand";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

const commonItems = {
  overview: { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  projects: { label: "Projects", path: "/projects", icon: FolderKanban },
  tasks: { label: "Tasks", path: "/tasks", icon: CheckSquare },
  meetings: { label: "Meetings", path: "/meetings", icon: CalendarDays },
  pods: { label: "Intern pods", path: "/intern-pods", icon: Users },
  rooms: { label: "Meeting rooms", path: "/meeting-room", icon: DoorOpen },
  reports: { label: "Reports", path: "/reports", icon: BarChart3 },
  users: { label: "Users", path: "/users", icon: Users },
  audit: { label: "Audit logs", path: "/audit-logs", icon: ShieldCheck },
  settings: { label: "Settings", path: "/settings", icon: Settings },
};

const navigationByRole = {
  intern: [{ section: "MAIN", items: [commonItems.overview, { ...commonItems.projects, label: "Assigned Projects" }, { ...commonItems.tasks, label: "Assigned Tasks" }] }],
  employee: [
    { section: "MAIN", items: [commonItems.overview, commonItems.projects, commonItems.tasks, commonItems.meetings] },
    { section: "MANAGEMENT", items: [commonItems.pods, commonItems.rooms, commonItems.reports] },
  ],
  management: [
    { section: "MAIN", items: [commonItems.overview, commonItems.projects, commonItems.tasks, commonItems.meetings] },
    { section: "MANAGEMENT", items: [commonItems.pods, commonItems.rooms, commonItems.reports] },
    { section: "ADMINISTRATION", items: [commonItems.users, commonItems.settings, commonItems.audit] },
  ],
};

const pageNames = [...Object.values(commonItems), { label: "Profile", path: "/profile" }];

function Sidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const roleNavigation = navigationByRole[user?.role] || [];
  const isActive = (path) => location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
  const initials = user?.name?.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "IL";

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {open && <button className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[278px] flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[94px] items-center justify-between px-7"><Brand /><button onClick={onClose} className="icon-button lg:hidden" aria-label="Close menu"><X size={20} /></button></div>
        <div className="mx-5 mb-6 rounded-[22px] bg-gradient-to-br from-[#075fae] to-[#087bd1] p-4 text-white shadow-lg shadow-blue-900/10">
          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-white/15"><Sparkles size={19} /></div><div><p className="text-sm font-bold">Digital Lab</p><p className="text-[11px] text-blue-100">Role-secured workspace</p></div></div>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto px-4 pb-5">
          {roleNavigation.map((group, index) => <div className={index ? "mt-7" : ""} key={group.section}><p className="nav-label">{group.section}</p><div className="space-y-1">{group.items.map((item) => { const Icon = item.icon; const active = isActive(item.path); return <Link to={item.path} onClick={onClose} className={`sidebar-link ${active ? "sidebar-link-active" : ""}`} key={item.path}><Icon size={18} strokeWidth={active ? 2.4 : 1.8} /><span>{item.label}</span>{active && <ChevronRight size={15} className="ml-auto" />}</Link>; })}</div></div>)}
        </nav>
        <div className="border-t border-slate-100 p-5"><div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><Link to="/profile" onClick={onClose} className="contents"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#daf3d8] text-sm font-extrabold text-[#159c18]">{initials}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{user?.name}</p><p className="truncate text-xs capitalize text-slate-400">{user?.role}</p></div></Link><button onClick={handleLogout} className="text-slate-400 transition hover:text-red-500" aria-label="Log out"><LogOut size={17} /></button></div></div>
      </aside>
    </>
  );
}

function Header({ onMenu, onNotifications, notificationsOpen }) {
  const location = useLocation();
  const { user } = useAuth();
  const current = pageNames.find((item) => location.pathname.startsWith(item.path));
  const initials = user?.name?.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "IL";
  return (
    <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-slate-200/70 bg-white/90 px-5 backdrop-blur-xl sm:px-8 lg:ml-[278px] lg:px-10">
      <div className="flex items-center gap-4"><button onClick={onMenu} className="icon-button lg:hidden" aria-label="Open menu"><Menu size={21} /></button><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#20a91e]">InnerLoop workspace</p><h1 className="mt-0.5 text-xl font-extrabold tracking-tight text-[#10233f]">{current?.label || "Overview"}</h1></div></div>
      <div className="flex items-center gap-2 sm:gap-3"><div className="header-search"><Search size={17} /><input aria-label="Search workspace" placeholder="Search workspace…" /></div><button onClick={onNotifications} className={`icon-button relative ${notificationsOpen ? "text-[#075fae]" : ""}`} aria-label="Notifications"><Bell size={19} /></button><Link to="/profile" className="hidden items-center gap-2.5 rounded-full p-1 pr-2 transition hover:bg-slate-50 sm:flex"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#e7f3ff] text-sm font-extrabold text-[#075fae]">{initials}</div><div className="hidden text-left xl:block"><p className="max-w-32 truncate text-xs font-bold text-slate-800">{user?.name}</p><p className="text-[10px] capitalize text-slate-400">{user?.role}</p></div></Link></div>
    </header>
  );
}

function NotificationPanel({ open, onClose }) {
  if (!open) return null;
  return <div className="fixed right-5 top-[88px] z-40 w-[min(360px,calc(100vw-40px))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 sm:right-8 lg:right-10"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><p className="font-extrabold text-slate-900">Notifications</p><p className="text-xs text-slate-400">Workspace activity</p></div><button onClick={onClose} className="icon-button"><X size={18} /></button></div><div className="p-6 text-center"><Bell className="mx-auto text-slate-300" size={24} /><p className="mt-3 text-sm font-bold text-slate-600">You’re all caught up</p><p className="mt-1 text-xs text-slate-400">New activity will appear here.</p></div></div>;
}

function StatCard({ icon: Icon, label, value, color }) {
  return <article className="stat-card group"><div className={`grid h-12 w-12 place-items-center rounded-full ${color === "green" ? "bg-[#def5dc] text-[#1aaa1c]" : "bg-[#e3f2ff] text-[#0765b8]"}`}><Icon size={21} /></div><div className="min-w-0"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-[30px] font-black leading-none tracking-tight text-[#10233f]">{value}</p></div><span className="ml-auto text-[10px] font-extrabold uppercase tracking-wider text-[#21a91e]">Live</span></article>;
}

function LoadingPanel() { return <div className="content-card animate-pulse text-sm font-semibold text-slate-400">Loading workspace data...</div>; }
function ErrorPanel({ message }) { return <div className="content-card border border-red-100 bg-red-50 text-sm font-semibold text-red-700">{message}</div>; }
function EmptyPanel({ label }) { return <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-400">No {label.toLowerCase()} are available.</div>; }

function DataList({ title, items = [], emptyLabel, type }) {
  return (
    <section className="content-card">
      <h3 className="section-title mb-5">{title}</h3>
      {!items.length ? <EmptyPanel label={emptyLabel} /> : <div className="divide-y divide-slate-100">{items.map((item) => {
        const itemTitle = item.project_name || item.task_title || item.meeting_title || item.pod_name || item.room_name || item.name || item.action || `Record ${item.id}`;
        const status = item.current_status || item.status || item.role;
        const detail = item.project_category || item.description || item.meeting_type || item.assigned_feature_module || item.email || item.module || item.location;
        const progress = item.progress_percentage ?? item.progress;
        return <div className="flex items-center gap-4 py-4" key={`${type}-${item.id ?? itemTitle}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e5f3ff] text-[#0969b9]"><ChevronRight size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold text-slate-800">{itemTitle}</p><p className="mt-1 truncate text-xs text-slate-400">{detail || status || "No additional details"}</p>{progress !== undefined && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#20ac22]" style={{ width: `${Math.min(Number(progress) || 0, 100)}%` }} /></div>}</div>{status && <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-extrabold capitalize text-slate-600">{status}</span>}</div>;
      })}</div>}
    </section>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    workspaceApi.dashboard().then((result) => active && setData(result)).catch((requestError) => active && setError(requestError.message || "Unable to load the dashboard."));
    return () => { active = false; };
  }, []);

  if (error) return <ErrorPanel message={error} />;
  if (!data) return <LoadingPanel />;

  const role = user?.role || data.role;
  const metricConfig = role === "management"
    ? [[FolderKanban, "Active projects", "active_projects", "green"], [BarChart3, "Delayed projects", "delayed_projects", "blue"], [ShieldCheck, "Blocked projects", "blocked_projects", "green"], [CheckSquare, "Overdue tasks", "overdue_tasks", "blue"]]
    : role === "employee"
      ? [[FolderKanban, "Projects", "projects", "green"], [CheckSquare, "Open tasks", "open_tasks", "blue"], [CalendarDays, "Upcoming meetings", "upcoming_meetings", "green"], [ShieldCheck, "Overdue tasks", "overdue_tasks", "blue"]]
      : [[FolderKanban, "Assigned projects", "projects", "green"], [CheckSquare, "Open tasks", "open_tasks", "blue"], [ShieldCheck, "Overdue tasks", "overdue_tasks", "green"], [CheckSquare, "Completed tasks", "completed_tasks", "blue"]];

  return (
    <div className="space-y-7">
      <section className="hero-panel"><div className="hero-loop hero-loop-green" aria-hidden="true" /><div className="hero-loop hero-loop-blue" aria-hidden="true" /><div className="relative z-10 max-w-[680px]"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#20b51d]/20 bg-[#edfbed] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#168f18]"><span className="h-2 w-2 rounded-full bg-[#23b51f]" /> {role} workspace</div><h2 className="text-[38px] font-black leading-[1.08] tracking-[-0.045em] text-[#10233f] sm:text-[50px]">Welcome back, <span className="text-[#0767b7]">{user?.name}</span>.</h2><p className="mt-5 max-w-[580px] text-sm leading-7 text-slate-500 sm:text-base">Your dashboard is built from the work and permissions assigned to your role.</p><Link to="/projects" className="secondary-button mt-7 inline-flex">Open projects <ArrowRight size={17} /></Link></div></section>
      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">{metricConfig.map(([Icon, label, key, color]) => <StatCard key={key} icon={Icon} label={label} value={data.metrics[key] ?? 0} color={color} />)}</section>
      <section className="grid gap-6 xl:grid-cols-2"><DataList title={role === "intern" ? "Assigned projects" : "Recent projects"} items={data.projects} emptyLabel="projects" type="project" /><DataList title={role === "intern" ? "Assigned tasks" : "Current tasks"} items={data.tasks} emptyLabel="tasks" type="task" />{role !== "intern" && <DataList title="Upcoming meetings" items={data.meetings} emptyLabel="meetings" type="meeting" />}{role === "management" && <DataList title="Intern pod progress" items={data.pod_progress} emptyLabel="intern pods" type="pod" />}</section>
    </div>
  );
}

function displayValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined || value === "") return "Not set";
  return String(value).replace("T", " ");
}

function ApiPage({ name, load }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    load().then((result) => active && setData(result)).catch((requestError) => active && setError(requestError.message || `Unable to load ${name.toLowerCase()}.`));
    return () => { active = false; };
  }, [load, name]);
  return <div className="space-y-7"><section className="subpage-hero"><div className="relative z-10 max-w-xl"><p className="eyebrow text-[#199d1c]">Role-authorized workspace</p><h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#10233f]">{name}</h2><p className="mt-3 text-sm leading-6 text-slate-500">Live information from InnerLoop, limited by your account permissions.</p></div><div className="subpage-ring" /></section>{error ? <ErrorPanel message={error} /> : data === null ? <LoadingPanel /> : Array.isArray(data) ? <DataList title={name} items={data} emptyLabel={name} type={name} /> : <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Object.entries(data).map(([key, value]) => <article className="content-card" key={key}><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{key.replaceAll("_", " ")}</p><p className="mt-3 break-words text-lg font-black capitalize text-[#10233f]">{displayValue(value)}</p></article>)}</section>}</div>;
}

function AppShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  return <div className="min-h-screen bg-[#f5f8fb]"><Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} /><Header onMenu={() => setMenuOpen(true)} notificationsOpen={notificationsOpen} onNotifications={() => setNotificationsOpen((value) => !value)} /><NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} /><main className="lg:ml-[278px]"><div className="mx-auto max-w-[1540px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">{children}</div></main></div>;
}

function WrappedPage({ children }) { return <AppShell>{children}</AppShell>; }

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<WrappedPage><Dashboard /></WrappedPage>} />
        <Route path="/projects/*" element={<WrappedPage><ApiPage name="Projects" load={workspaceApi.projects} /></WrappedPage>} />
        <Route path="/tasks/*" element={<WrappedPage><ApiPage name="Tasks" load={workspaceApi.tasks} /></WrappedPage>} />
        <Route path="/profile" element={<WrappedPage><Profile /></WrappedPage>} />
        <Route element={<RoleProtectedRoute allowedRoles={["employee", "management"]} />}>
          <Route path="/meetings/*" element={<WrappedPage><ApiPage name="Meetings" load={workspaceApi.meetings} /></WrappedPage>} />
          <Route path="/intern-pods/*" element={<WrappedPage><ApiPage name="Intern Pods" load={workspaceApi.internPods} /></WrappedPage>} />
          <Route path="/reports/*" element={<WrappedPage><ApiPage name="Reports" load={workspaceApi.reportSummary} /></WrappedPage>} />
          <Route path="/meeting-room/*" element={<WrappedPage><ApiPage name="Meeting Rooms" load={workspaceApi.meetingRooms} /></WrappedPage>} />
        </Route>
        <Route element={<RoleProtectedRoute allowedRoles={["management"]} />}>
          <Route path="/users/*" element={<WrappedPage><ApiPage name="Users" load={workspaceApi.users} /></WrappedPage>} />
          <Route path="/audit-logs/*" element={<WrappedPage><ApiPage name="Audit Logs" load={workspaceApi.auditLogs} /></WrappedPage>} />
          <Route path="/settings/*" element={<WrappedPage><ApiPage name="Settings" load={workspaceApi.settings} /></WrappedPage>} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
