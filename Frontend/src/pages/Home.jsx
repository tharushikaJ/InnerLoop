
import { Link } from "react-router-dom";

const features = [
  {
    number: "01",
    title: "Project Management",
    description:
      "Manage Digital Lab projects from planning to completion with clear progress, ownership, blockers, and updates.",
  },
  {
    number: "02",
    title: "Task Tracking",
    description:
      "Assign work, monitor deadlines, track priorities, and keep every team member aligned with project goals.",
  },
  {
    number: "03",
    title: "Meetings & Decisions",
    description:
      "Organize meetings, manage rooms, capture minutes, and turn important decisions into actionable follow-ups.",
  },
  {
    number: "04",
    title: "Intern Pods",
    description:
      "Coordinate intern pod development, assignments, submissions, progress, and supervisor feedback in one place.",
  },
];

const workflow = [
  "Projects",
  "Tasks",
  "Meetings",
  "Intern Pods",
  "Reports",
];

function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#070711] text-white">
      {/* ==================== NAVBAR ==================== */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 pt-5 lg:px-8">
          <nav className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0c0c18]/80 px-5 py-3.5 shadow-2xl shadow-black/20 backdrop-blur-xl">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
                <div className="absolute inset-0 bg-white/10" />

                <span className="relative text-lg font-black">
                  I
                </span>
              </div>

              <div>
                <p className="text-base font-bold tracking-tight">
                  Inner<span className="text-violet-400">Loop</span>
                </p>

                <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-slate-500">
                  Digital Lab
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-8 md:flex">
              <a
                href="#features"
                className="text-sm text-slate-400 transition hover:text-white"
              >
                Platform
              </a>

              <a
                href="#workflow"
                className="text-sm text-slate-400 transition hover:text-white"
              >
                Workflow
              </a>

              <a
                href="#about"
                className="text-sm text-slate-400 transition hover:text-white"
              >
                About
              </a>

              <Link
                to="/login"
                className="rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white transition hover:border-violet-400/30 hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>

            {/* Mobile CTA */}
            <Link
              to="/login"
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold md:hidden"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* ==================== HERO ==================== */}
      <main>
        <section className="relative min-h-screen">

          {/* Background Glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-[-250px] h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-violet-700/20 blur-[140px]" />

            <div className="absolute right-[-150px] top-[35%] h-[450px] w-[450px] rounded-full bg-indigo-700/10 blur-[130px]" />

            <div className="absolute left-[-200px] top-[60%] h-[400px] w-[400px] rounded-full bg-purple-700/10 blur-[130px]" />
          </div>

          {/* Grid Background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-44 lg:px-8 lg:pb-32 lg:pt-52">

            <div className="grid items-center gap-20 lg:grid-cols-[1fr_0.85fr]">

              {/* Hero Left */}
              <div>

                {/* Badge */}
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-4 py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
                  </span>

                  <span className="text-xs font-medium tracking-wide text-violet-300">
                    Digital Lab Internal Platform
                  </span>
                </div>

                {/* Heading */}
                <h1 className="max-w-4xl text-5xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                  Keep your work
                  <br />

                  <span className="bg-gradient-to-r from-violet-300 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    in the loop.
                  </span>
                </h1>

                {/* Description */}
                <p className="mt-8 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                  InnerLoop is the centralized workspace for Digital Lab
                  projects, tasks, meetings, intern pods, decisions, and
                  progress — giving every team member a clearer view of what
                  happens next.
                </p>

                {/* Buttons */}
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                  <Link
                    to="/login"
                    className="group inline-flex items-center justify-center gap-3 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold shadow-xl shadow-violet-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-500"
                  >
                    Enter InnerLoop

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                  <a
                    href="#features"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Explore platform
                  </a>
                </div>

                {/* Stats */}
                <div className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/10 pt-7">

                  <div>
                    <p className="text-xl font-bold">01</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Unified workspace
                    </p>
                  </div>

                  <div>
                    <p className="text-xl font-bold">04</p>
                    <p className="mt-1 text-xs text-slate-500">
                      User roles
                    </p>
                  </div>

                  <div>
                    <p className="text-xl font-bold">∞</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Connected workflows
                    </p>
                  </div>

                </div>
              </div>

              {/* Dashboard Preview */}
              <div className="relative">

                <div className="absolute -inset-10 rounded-full bg-violet-600/10 blur-3xl" />

                <div className="relative rounded-[1.75rem] border border-white/10 bg-[#0d0d18]/90 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">

                  {/* Browser Header */}
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">

                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                    </div>

                    <div className="rounded-md bg-white/[0.04] px-8 py-1 text-[9px] text-slate-600">
                      innerloop / dashboard
                    </div>

                    <div className="w-8" />
                  </div>

                  {/* Dashboard */}
                  <div className="grid grid-cols-[58px_1fr]">

                    {/* Sidebar */}
                    <div className="border-r border-white/10 px-3 py-5">

                      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-xs font-bold text-violet-300">
                        I
                      </div>

                      <div className="mt-7 space-y-4">
                        {[1, 2, 3, 4, 5].map((item) => (
                          <div
                            key={item}
                            className={`mx-auto h-7 w-7 rounded-lg ${
                              item === 1
                                ? "bg-violet-500/20"
                                : "bg-white/[0.03]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="min-w-0 p-5">

                      <div className="flex items-center justify-between">

                        <div>
                          <p className="text-[9px] text-slate-500">
                            Monday, September 21
                          </p>

                          <p className="mt-1 text-sm font-semibold">
                            Good morning, Team
                          </p>
                        </div>

                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500" />
                      </div>

                      {/* Statistics */}
                      <div className="mt-5 grid grid-cols-2 gap-2.5">

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          <p className="text-[9px] text-slate-500">
                            Active Projects
                          </p>

                          <p className="mt-1.5 text-lg font-bold">
                            12
                          </p>

                          <div className="mt-2 h-1 rounded-full bg-white/5">
                            <div className="h-full w-[72%] rounded-full bg-violet-500" />
                          </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          <p className="text-[9px] text-slate-500">
                            Pending Tasks
                          </p>

                          <p className="mt-1.5 text-lg font-bold">
                            28
                          </p>

                          <div className="mt-2 h-1 rounded-full bg-white/5">
                            <div className="h-full w-[48%] rounded-full bg-indigo-500" />
                          </div>
                        </div>

                      </div>

                      {/* Project */}
                      <div className="mt-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">

                        <div className="flex items-center justify-between">

                          <div>
                            <p className="text-[9px] text-slate-500">
                              Project progress
                            </p>

                            <p className="mt-1 text-xs font-semibold">
                              AI Research Platform
                            </p>
                          </div>

                          <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[8px] font-medium text-emerald-400">
                            On Track
                          </span>
                        </div>

                        <div className="mt-4 h-1.5 rounded-full bg-white/5">
                          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
                        </div>

                        <div className="mt-2 flex justify-between text-[8px] text-slate-600">
                          <span>72% completed</span>
                          <span>Next review · Friday</span>
                        </div>
                      </div>

                      {/* Activity */}
                      <div className="mt-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">

                        <p className="text-[9px] text-slate-500">
                          Upcoming activity
                        </p>

                        <div className="mt-3 flex items-center gap-3">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-xs">
                            ◷
                          </div>

                          <div>
                            <p className="text-[10px] font-medium">
                              Project Review Meeting
                            </p>

                            <p className="mt-0.5 text-[8px] text-slate-600">
                              Tomorrow · Meeting Room 02
                            </p>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Floating Status */}
                <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-white/10 bg-[#11111d]/95 p-3 shadow-2xl backdrop-blur-xl sm:block">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold">
                        Team visibility
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-500">
                        Everything is connected
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ==================== FEATURES ==================== */}
        <section
          id="features"
          className="relative border-y border-white/10 bg-[#090914]"
        >
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">

            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
                  One connected workspace
                </p>

                <h2 className="mt-5 max-w-md text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                  Everything your team needs, in one loop.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
                  InnerLoop brings the daily operations of Digital Lab
                  projects into a single, structured workspace.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                {features.map((feature) => (
                  <div
                    key={feature.number}
                    className="group rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-violet-500/[0.04]"
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-xs font-medium text-violet-400">
                        {feature.number}
                      </span>

                      <span className="text-slate-700 transition group-hover:text-violet-400">
                        ↗
                      </span>

                    </div>

                    <h3 className="mt-8 text-base font-semibold">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {feature.description}
                    </p>

                  </div>
                ))}

              </div>
            </div>
          </div>
        </section>

        {/* ==================== WORKFLOW ==================== */}
        <section id="workflow" className="relative">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">

            <div className="text-center">

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
                Connected workflow
              </p>

              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                From an idea to a completed project.
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-500">
                Every part of the project lifecycle stays connected, giving
                teams a consistent view of progress and what comes next.
              </p>
            </div>

            <div className="mx-auto mt-14 flex max-w-5xl flex-col items-center justify-between gap-3 md:flex-row">

              {workflow.map((item, index) => (
                <div
                  key={item}
                  className="flex w-full items-center md:w-auto"
                >

                  <div className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4 md:w-auto">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-400">
                      0{index + 1}
                    </div>

                    <span className="whitespace-nowrap text-xs font-medium text-slate-300">
                      {item}
                    </span>

                  </div>

                  {index !== workflow.length - 1 && (
                    <span className="mx-2 hidden text-slate-700 md:block">
                      →
                    </span>
                  )}

                </div>
              ))}

            </div>
          </div>
        </section>

        {/* ==================== CTA ==================== */}
        <section id="about" className="px-6 pb-24 lg:px-8">

          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-violet-400/20 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-[#0c0c18] px-7 py-16 sm:px-12 lg:px-16">

            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-violet-500/20 blur-[100px]" />

            <div className="relative max-w-2xl">

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">
                Stay connected
              </p>

              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Keep every project,
                <br />
                task and decision in the loop.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
                A shared workspace for the people behind Digital Lab's
                projects — from management and employees to interns and
                administrators.
              </p>

              <Link
                to="/login"
                className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Access InnerLoop
                <span>→</span>
              </Link>

            </div>
          </div>
        </section>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-white/10 bg-[#05050b]">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-400">
              I
            </div>

            <div>

              <p className="text-sm font-semibold">
                Inner<span className="text-violet-400">Loop</span>
              </p>

              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-600">
                Digital Lab
              </p>

            </div>
          </div>

          <p className="text-xs text-slate-600">
            Internal Project & Management Platform
          </p>

          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} InnerLoop
          </p>

        </div>
      </footer>
    </div>
  );
}

export default Home;
