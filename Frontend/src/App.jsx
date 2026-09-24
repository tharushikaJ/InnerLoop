import { useMemo, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import {
  Activity, ArrowRight, BarChart3, Bell, CalendarDays, CheckCircle2,
  CheckSquare, ChevronRight, DoorOpen, FolderKanban, LayoutDashboard,
  LogOut, Menu, Plus, Search, Settings, ShieldCheck, Sparkles, Users, X,
} from "lucide-react";

const navigation = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", path: "/projects", icon: FolderKanban },
  { label: "Tasks", path: "/tasks", icon: CheckSquare },
  { label: "Meetings", path: "/meetings", icon: CalendarDays },
  { label: "Intern pods", path: "/intern-pods", icon: Users },
];

const secondaryNavigation = [
  { label: "Meeting rooms", path: "/meeting-room", icon: DoorOpen },
  { label: "Users", path: "/users", icon: Users },
  { label: "Audit logs", path: "/audit-logs", icon: ShieldCheck },
  { label: "Settings", path: "/settings", icon: Settings },
];

const pageNames = [...navigation, ...secondaryNavigation];

function Brand({ compact = false }) {
  return (
    <Link to="/dashboard" className="group flex items-center gap-3" aria-label="InnerLoop home">
      <span className="relative block h-11 w-11 shrink-0" aria-hidden="true">
        <span className="absolute left-1 top-0 h-7 w-2 -rotate-[30deg] rounded-full bg-sky-500 transition group-hover:-translate-y-0.5" />
        <span className="absolute left-3.5 top-5 h-7 w-2 -rotate-[30deg] rounded-full bg-[#075fae] transition group-hover:translate-y-0.5" />
        <span className="absolute right-1 top-4 h-5 w-2 -rotate-[30deg] rounded-full bg-[#23b51f]" />
        <span className="absolute left-[21px] top-[21px] h-2 w-2 rounded-full bg-[#23b51f]" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[22px] font-extrabold tracking-[-0.055em] text-[#075fae]">INNER<span className="text-[#20b51d]">LOOP</span></span>
          <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.33em] text-slate-500">The connection</span>
        </span>
      )}
    </Link>
  );
}

function Sidebar({ open, onClose }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link to={item.path} onClick={onClose} className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}>
        <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />
        <span>{item.label}</span>
        {active && <ChevronRight size={15} className="ml-auto" />}
      </Link>
    );
  };

  return (
    <>
      {open && <button className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[278px] flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[94px] items-center justify-between px-7">
          <Brand />
          <button onClick={onClose} className="icon-button lg:hidden" aria-label="Close menu"><X size={20} /></button>
        </div>
        <div className="mx-5 mb-6 rounded-[22px] bg-gradient-to-br from-[#075fae] to-[#087bd1] p-4 text-white shadow-lg shadow-blue-900/10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15"><Sparkles size={19} /></div>
            <div><p className="text-sm font-bold">Digital Lab</p><p className="text-[11px] text-blue-100">Workspace is healthy</p></div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full w-[82%] rounded-full bg-[#49d34a]" /></div>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto px-4 pb-5">
          <p className="nav-label">Workspace</p>
          <div className="space-y-1">{navigation.map((item) => <NavItem item={item} key={item.path} />)}</div>
          <p className="nav-label mt-7">Management</p>
          <div className="space-y-1">{secondaryNavigation.map((item) => <NavItem item={item} key={item.path} />)}</div>
        </nav>
        <div className="border-t border-slate-100 p-5">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#daf3d8] text-sm font-extrabold text-[#159c18]">DL</div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">Digital Lab</p><p className="text-xs text-slate-400">Administrator</p></div>
            <button className="text-slate-400 transition hover:text-red-500" aria-label="Log out"><LogOut size={17} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenu, onNotifications, notificationsOpen }) {
  const location = useLocation();
  const current = pageNames.find((item) => location.pathname.startsWith(item.path));
  return (
    <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-slate-200/70 bg-white/90 px-5 backdrop-blur-xl sm:px-8 lg:ml-[278px] lg:px-10">
      <div className="flex items-center gap-4">
        <button onClick={onMenu} className="icon-button lg:hidden" aria-label="Open menu"><Menu size={21} /></button>
        <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#20a91e]">InnerLoop workspace</p><h1 className="mt-0.5 text-xl font-extrabold tracking-tight text-[#10233f]">{current?.label || "Overview"}</h1></div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="header-search"><Search size={17} /><input aria-label="Search workspace" placeholder="Search workspace…" /></div>
        <button onClick={onNotifications} className={`icon-button relative ${notificationsOpen ? "text-[#075fae]" : ""}`} aria-label="Notifications"><Bell size={19} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#24b721] ring-2 ring-white" /></button>
        <div className="hidden h-9 w-px bg-slate-200 sm:block" />
        <div className="hidden items-center gap-2.5 sm:flex"><div className="grid h-10 w-10 place-items-center rounded-full bg-[#e7f3ff] text-sm font-extrabold text-[#075fae]">AK</div><div className="hidden xl:block"><p className="text-xs font-bold text-slate-800">Akila Kumara</p><p className="text-[10px] text-slate-400">Product lead</p></div></div>
      </div>
    </header>
  );
}

function NotificationPanel({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed right-5 top-[88px] z-40 w-[min(360px,calc(100vw-40px))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 sm:right-8 lg:right-10">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><p className="font-extrabold text-slate-900">Notifications</p><p className="text-xs text-slate-400">Three new updates</p></div><button onClick={onClose} className="icon-button"><X size={18} /></button></div>
      <div className="space-y-1 p-2">
        {["Design review begins in 20 minutes", "Portal API moved to testing", "Nimali completed 3 tasks"].map((item, index) => (
          <button key={item} className="flex w-full gap-3 rounded-2xl p-3 text-left transition hover:bg-slate-50"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${index === 1 ? "bg-[#20b51d]" : "bg-[#0780dc]"}`} /><span><span className="block text-sm font-semibold text-slate-700">{item}</span><span className="mt-1 block text-[11px] text-slate-400">{index + 1} hour{index ? "s" : ""} ago</span></span></button>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, note, color }) {
  return (
    <article className="stat-card group">
      <div className={`grid h-12 w-12 place-items-center rounded-full ${color === "green" ? "bg-[#def5dc] text-[#1aaa1c]" : "bg-[#e3f2ff] text-[#0765b8]"}`}><Icon size={21} /></div>
      <div className="min-w-0"><p className="text-sm font-semibold text-slate-500">{label}</p><div className="mt-1 flex items-end gap-2"><p className="text-[30px] font-black leading-none tracking-tight text-[#10233f]">{value}</p><span className="mb-0.5 text-[11px] font-bold text-[#21a91e]">{note}</span></div></div>
      <ArrowRight size={18} className={`ml-auto transition group-hover:translate-x-1 ${color === "green" ? "text-[#21af21]" : "text-[#0968bc]"}`} />
    </article>
  );
}

function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All projects");
  const projects = [
    { name: "InnerLoop Platform", team: "Core product", progress: 82, color: "blue", initials: ["AK", "NS", "TM"] },
    { name: "AI Automation", team: "Innovation pod", progress: 64, color: "green", initials: ["MD", "RS"] },
    { name: "Digital Lab Portal", team: "Experience team", progress: 47, color: "blue", initials: ["NK", "ID", "PW"] },
  ];
  return (
    <div className="space-y-7">
      <section className="hero-panel">
        <div className="hero-loop hero-loop-green" aria-hidden="true" /><div className="hero-loop hero-loop-blue" aria-hidden="true" />
        <div className="relative z-10 max-w-[620px]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#20b51d]/20 bg-[#edfbed] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#168f18]"><span className="h-2 w-2 rounded-full bg-[#23b51f]" /> Digital Lab connected</div>
          <h2 className="max-w-[560px] text-[38px] font-black leading-[1.08] tracking-[-0.045em] text-[#10233f] sm:text-[50px]">Keep every project <span className="text-[#0767b7]">moving</span> together.</h2>
          <p className="mt-5 max-w-[540px] text-sm leading-7 text-slate-500 sm:text-base">One shared space for your teams, tasks, meetings and progress. Clear work. Stronger connections.</p>
          <div className="mt-7 flex flex-wrap gap-3"><button onClick={() => setModalOpen(true)} className="primary-button"><Plus size={18} /> Start a project</button><Link to="/projects" className="secondary-button">Explore workspace <ArrowRight size={17} /></Link></div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="person-card person-card-one"><div className="avatar-illustration"><span className="avatar-head" /><span className="avatar-body bg-[#21ae22]" /></div><div><p>Nimali</p><span>Design lead</span></div><span className="status-dot" /></div>
          <div className="person-card person-card-two"><div className="avatar-illustration"><span className="avatar-head" /><span className="avatar-body bg-[#0780d5]" /></div><div><p>Tharindu</p><span>Developer</span></div><span className="status-dot" /></div>
          <div className="connection-badge"><Activity size={17} /><span><b>94%</b> team pulse</span></div>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <StatCard icon={FolderKanban} label="Active projects" value="12" note="+2 this month" color="green" />
        <StatCard icon={CheckSquare} label="Open tasks" value="28" note="8 due soon" color="blue" />
        <StatCard icon={CalendarDays} label="Meetings" value="06" note="Next at 2 PM" color="green" />
        <StatCard icon={Users} label="Team members" value="18" note="5 active pods" color="blue" />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.45fr_.75fr]">
        <div className="content-card">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow text-[#0871c6]">Live workspace</p><h3 className="section-title">Project momentum</h3></div><div className="flex rounded-full bg-slate-100 p-1">{["All projects", "My work"].map((tab) => <button onClick={() => setActiveTab(tab)} className={`rounded-full px-3 py-2 text-xs font-bold transition ${activeTab === tab ? "bg-white text-[#075fae] shadow-sm" : "text-slate-400"}`} key={tab}>{tab}</button>)}</div></div>
          <div className="space-y-3">{projects.map((project) => (
            <Link to="/projects/1" key={project.name} className="project-row group">
              <div className={`project-mark ${project.color === "green" ? "bg-[#21b325]" : "bg-[#0871c6]"}`}><FolderKanban size={18} /></div>
              <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-4"><div><p className="truncate text-sm font-extrabold text-slate-800">{project.name}</p><p className="mt-0.5 text-[11px] text-slate-400">{project.team}</p></div><span className="text-xs font-extrabold text-slate-500">{project.progress}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${project.color === "green" ? "bg-[#22b624]" : "bg-[#0874c8]"}`} style={{ width: `${project.progress}%` }} /></div></div>
              <div className="hidden -space-x-2 sm:flex">{project.initials.map((initial) => <span key={initial} className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#eef5fb] text-[9px] font-black text-slate-600">{initial}</span>)}</div><ChevronRight size={18} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0871c6]" />
            </Link>))}</div>
          <Link to="/projects" className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-[#0769ba] hover:gap-3">View all projects <ArrowRight size={15} /></Link>
        </div>
        <div className="content-card">
          <div className="mb-6 flex items-center justify-between"><div><p className="eyebrow text-[#1a9e1c]">Today</p><h3 className="section-title">Coming up</h3></div><Link to="/meetings" className="grid h-9 w-9 place-items-center rounded-full bg-[#e3f2ff] text-[#0768b9]"><CalendarDays size={17} /></Link></div>
          <div className="timeline"><TimelineItem time="10:30" title="Product stand-up" meta="Conference room A" color="green" /><TimelineItem time="14:00" title="Design review" meta="Online · 8 attendees" color="blue" /><TimelineItem time="16:30" title="Intern pod sync" meta="Digital Lab" color="green" last /></div>
          <Link to="/meetings/create" className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0a73c6]/30 bg-[#f3f9ff] py-3 text-xs font-extrabold text-[#0766b5] transition hover:border-solid hover:bg-[#eaf5ff]"><Plus size={15} /> Schedule meeting</Link>
        </div>
      </section>
      {modalOpen && <CreateProjectModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

function TimelineItem({ time, title, meta, color, last }) {
  return <div className="relative flex gap-4 pb-6"><div className="w-11 shrink-0 pt-0.5 text-[11px] font-extrabold text-slate-400">{time}</div><div className="relative"><span className={`relative z-10 mt-1 block h-3 w-3 rounded-full ring-4 ring-white ${color === "green" ? "bg-[#21b225]" : "bg-[#0872c5]"}`} />{!last && <span className="absolute left-[5px] top-3 h-[54px] w-px bg-slate-200" />}</div><div><p className="text-sm font-extrabold text-slate-800">{title}</p><p className="mt-1 text-[11px] text-slate-400">{meta}</p></div></div>;
}

function CreateProjectModal({ onClose }) {
  const [created, setCreated] = useState(false);
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#07182c]/45 p-5 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="w-full max-w-md rounded-[30px] bg-white p-6 shadow-2xl sm:p-8" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between"><div className="grid h-12 w-12 place-items-center rounded-full bg-[#e4f6e2] text-[#1aa51c]"><FolderKanban size={21} /></div><button onClick={onClose} className="icon-button"><X size={19} /></button></div>
        {created ? <div className="py-8 text-center"><CheckCircle2 className="mx-auto text-[#20b421]" size={48} /><h3 className="mt-4 text-2xl font-black text-[#10233f]">Project ready!</h3><p className="mt-2 text-sm text-slate-500">Your new workspace has been created.</p><button onClick={onClose} className="primary-button mt-6">Done</button></div> : <><h3 className="mt-5 text-2xl font-black text-[#10233f]">Start something great</h3><p className="mt-1 text-sm text-slate-500">Create a connected space for your team.</p><form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); setCreated(true); }}><label className="field-label">Project name<input required autoFocus placeholder="e.g. Customer experience portal" className="field-input" /></label><label className="field-label">Team<select className="field-input"><option>Core product</option><option>Innovation pod</option><option>Experience team</option></select></label><button className="primary-button w-full justify-center" type="submit">Create project <ArrowRight size={17} /></button></form></>}
      </div>
    </div>
  );
}

const pageDescriptions = {
  Projects: "Plan initiatives, follow progress and keep every team moving in the same direction.",
  Tasks: "Turn plans into clear, achievable actions for everyone.",
  Meetings: "Bring the right people together at the right time.",
  "Intern Pods": "Support emerging talent through connected team spaces.",
};

function GenericPage({ name }) {
  const items = useMemo(() => ["Planning and discovery", "Design and validation", "Build and integration", "Review and launch"], []);
  return (
    <div className="space-y-7">
      <section className="subpage-hero"><div className="relative z-10 max-w-xl"><p className="eyebrow text-[#199d1c]">Digital Lab workspace</p><h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#10233f]">{name}</h2><p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">{pageDescriptions[name] || `Manage ${name.toLowerCase()} with a clearer, more connected workspace.`}</p><button className="primary-button mt-6"><Plus size={17} /> Add new</button></div><div className="subpage-ring" /></section>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_.7fr]">
        <section className="content-card"><div className="mb-5 flex items-center justify-between"><h3 className="section-title">Recent {name.toLowerCase()}</h3><button className="icon-button"><Search size={18} /></button></div><div className="divide-y divide-slate-100">{items.map((item, index) => <div className="flex items-center gap-4 py-4" key={item}><span className={`grid h-10 w-10 place-items-center rounded-full text-xs font-black ${index % 2 ? "bg-[#e5f3ff] text-[#0969b9]" : "bg-[#e4f7e2] text-[#1b9f1c]"}`}>0{index + 1}</span><div className="min-w-0 flex-1"><p className="text-sm font-extrabold text-slate-800">{item}</p><p className="mt-0.5 text-xs text-slate-400">Updated {index + 1} day{index ? "s" : ""} ago</p></div><ChevronRight size={18} className="text-slate-300" /></div>)}</div></section>
        <section className="content-card bg-gradient-to-br from-[#075fae] to-[#0781d4] text-white"><div className="grid h-12 w-12 place-items-center rounded-full bg-white/15"><Sparkles size={21} /></div><h3 className="mt-5 text-2xl font-black">Stay connected.</h3><p className="mt-3 text-sm leading-6 text-blue-100">Everything your team needs is one click away. Simple, visible and always in the loop.</p><div className="mt-8 rounded-2xl bg-white/10 p-4"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-200">Workspace health</p><div className="mt-3 flex items-end gap-2"><span className="text-3xl font-black">94%</span><span className="mb-1 text-xs text-[#79e478]">Excellent</span></div></div></section>
      </div>
    </div>
  );
}

function Login() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-white p-5"><div className="login-loop login-loop-one" /><div className="login-loop login-loop-two" /><div className="relative z-10 w-full max-w-md rounded-[34px] border border-slate-100 bg-white/90 p-8 shadow-2xl shadow-blue-950/10 backdrop-blur sm:p-10"><Brand /><h1 className="mt-10 text-3xl font-black tracking-tight text-[#10233f]">Welcome back.</h1><p className="mt-2 text-sm text-slate-500">Connect to your Digital Lab workspace.</p><div className="mt-7 space-y-4"><label className="field-label">Email<input type="email" className="field-input" placeholder="name@company.lk" /></label><label className="field-label">Password<input type="password" className="field-input" placeholder="Enter your password" /></label><Link to="/dashboard" className="primary-button w-full justify-center">Sign in <ArrowRight size={17} /></Link></div><p className="mt-7 text-center text-xs text-slate-400">A secure InnerLoop connection</p></div></div>
  );
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
      <Route path="/" element={<WrappedPage><Dashboard /></WrappedPage>} />
      <Route path="/dashboard" element={<WrappedPage><Dashboard /></WrappedPage>} />
      <Route path="/projects/*" element={<WrappedPage><GenericPage name="Projects" /></WrappedPage>} />
      <Route path="/tasks/*" element={<WrappedPage><GenericPage name="Tasks" /></WrappedPage>} />
      <Route path="/meetings/*" element={<WrappedPage><GenericPage name="Meetings" /></WrappedPage>} />
      <Route path="/intern-pods/*" element={<WrappedPage><GenericPage name="Intern Pods" /></WrappedPage>} />
      
      <Route path="/meeting-room/*" element={<WrappedPage><GenericPage name="Meeting Rooms" /></WrappedPage>} />
      <Route path="/users/*" element={<WrappedPage><GenericPage name="Users" /></WrappedPage>} />
      <Route path="/audit-logs/*" element={<WrappedPage><GenericPage name="Audit Logs" /></WrappedPage>} />
      <Route path="/settings/*" element={<WrappedPage><GenericPage name="Settings" /></WrappedPage>} />
      <Route path="*" element={<WrappedPage><Dashboard /></WrappedPage>} />
    </Routes>
  );
}
