import { useEffect, useState } from "react";
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, LoaderCircle, MapPin, Pencil, Plus, Trash2, Users, X } from "lucide-react";

import { createMeeting, deleteMeeting, getMeetingOptions, listMeetings, updateMeeting } from "../api/meetingApi";

const meetingTypes = ["Team sync", "Project review", "One-on-one", "Client meeting", "Workshop", "Other"];
const meetingStatuses = ["Scheduled", "In progress", "Completed", "Cancelled"];
const emptyForm = {
	meeting_title: "",
	meeting_type: "Team sync",
	start_datetime: "",
	end_datetime: "",
	meeting_room_id: "",
	status: "Scheduled",
	meeting_minutes: "",
	attendee_user_ids: [],
	project_ids: [],
};

function formFromMeeting(meeting) {
	return {
		...meeting,
		start_datetime: meeting.start_datetime?.slice(0, 16) || "",
		end_datetime: meeting.end_datetime?.slice(0, 16) || "",
		meeting_room_id: meeting.meeting_room_id || "",
		attendee_user_ids: meeting.attendee_user_ids || [],
		project_ids: meeting.project_ids || [],
		meeting_minutes: meeting.meeting_minutes || "",
	};
}

function AttendeeDropdown({ title, attendees, selectedIds, onChange }) {
	const selected = attendees.filter((attendee) => selectedIds.includes(attendee.id));
	return <details className="group relative"><summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-[#0871c6] hover:bg-white [&::-webkit-details-marker]:hidden"><div className="min-w-0 flex-1"><span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{title}</span><span className="mt-1 block truncate text-sm font-semibold text-slate-700">{selected.length ? selected.map((attendee) => attendee.name).join(", ") : `Choose ${title.toLowerCase()}`}</span></div><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-slate-400 shadow-sm transition group-open:rotate-180"><ChevronDown size={16} /></span></summary><div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">{attendees.length ? attendees.map((attendee) => <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-blue-50" key={attendee.id}><input className="h-4 w-4 accent-[#0871c6]" type="checkbox" checked={selectedIds.includes(attendee.id)} onChange={() => onChange(attendee.id)} /><span className="min-w-0"><span className="block truncate font-semibold">{attendee.name}</span><span className="block truncate text-xs text-slate-400">{attendee.email}</span></span></label>) : <p className="px-3 py-2 text-sm text-slate-400">No {title.toLowerCase()} available.</p>}</div></details>;
}

function MeetingForm({ initialValues, meetings, options, submitting, onSubmit, onClose }) {
	const [form, setForm] = useState(initialValues);
	const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
	const toggle = (field, id) => setForm((current) => ({ ...current, [field]: current[field].includes(id) ? current[field].filter((value) => value !== id) : [...current[field], id] }));
	const employeeAttendees = options.attendees.filter((attendee) => attendee.role === "employee");
	const internAttendees = options.attendees.filter((attendee) => attendee.role === "intern");
	const roomIsBooked = (roomId) => Boolean(form.start_datetime && form.end_datetime && meetings.some((meeting) => meeting.id !== initialValues.id && meeting.meeting_room_id === roomId && meeting.status !== "Cancelled" && new Date(meeting.start_datetime) < new Date(form.end_datetime) && new Date(meeting.end_datetime) > new Date(form.start_datetime)));

	return (
		<form className="content-card space-y-5" onSubmit={(event) => { event.preventDefault(); onSubmit({ ...form, meeting_room_id: form.meeting_room_id ? Number(form.meeting_room_id) : null, attendee_user_ids: form.attendee_user_ids.map(Number), project_ids: form.project_ids.map(Number) }); }}>
			<div className="flex items-center justify-between"><div><p className="eyebrow text-[#0871c6]">Calendar workspace</p><h3 className="section-title">{initialValues.id ? "Edit meeting" : "Create meeting"}</h3></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close form"><X size={18} /></button></div>
			<div className="grid gap-4 sm:grid-cols-2">
				<label className="field-label sm:col-span-2">Meeting title<input className="field-input" value={form.meeting_title} onChange={update("meeting_title")} required /></label>
				<label className="field-label">Meeting type<select className="field-input" value={form.meeting_type} onChange={update("meeting_type")}>{meetingTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
				<label className="field-label">Status<select className="field-input" value={form.status} onChange={update("status")}>{meetingStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
				<label className="field-label">Start<input className="field-input" type="datetime-local" value={form.start_datetime} onChange={update("start_datetime")} required /></label>
				<label className="field-label">End<input className="field-input" type="datetime-local" value={form.end_datetime} onChange={update("end_datetime")} required /></label>
				<label className="field-label sm:col-span-2">Meeting room<select className="field-input" value={form.meeting_room_id} onChange={update("meeting_room_id")}><option value="">No room selected</option>{options.rooms.map((room) => { const booked = roomIsBooked(room.id); return <option key={room.id} value={room.id} disabled={booked}>{room.room_name}{room.location ? ` - ${room.location}` : ""}{booked ? " - Booked" : ""}</option>; })}</select>{form.start_datetime && form.end_datetime && <span className="mt-1 block text-xs font-semibold text-slate-400">Rooms booked during this time are unavailable.</span>}</label>
			</div>
			<div className="grid gap-5 lg:grid-cols-2">
				<fieldset><legend className="field-label">Attendees</legend><div className="mt-2 space-y-3">{options.attendees.length ? <><AttendeeDropdown title="Employees" attendees={employeeAttendees} selectedIds={form.attendee_user_ids} onChange={(id) => toggle("attendee_user_ids", id)} /><AttendeeDropdown title="Interns" attendees={internAttendees} selectedIds={form.attendee_user_ids} onChange={(id) => toggle("attendee_user_ids", id)} /></> : <p className="text-sm text-slate-400">No attendees available.</p>}</div></fieldset>
				<fieldset><legend className="field-label">Selected projects</legend><div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">{options.projects.length ? options.projects.map((project) => <label className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50" key={project.id}><input type="checkbox" checked={form.project_ids.includes(project.id)} onChange={() => toggle("project_ids", project.id)} /><span>{project.project_name}</span></label>) : <p className="text-sm text-slate-400">No projects available.</p>}</div></fieldset>
			</div>
			<label className="field-label">Meeting minutes<textarea className="field-input min-h-24 resize-y" value={form.meeting_minutes} onChange={update("meeting_minutes")} placeholder="Add notes or decisions after the meeting" /></label>
			<button className="primary-button w-full justify-center" disabled={submitting}>{submitting ? <LoaderCircle className="animate-spin" size={17} /> : <Check size={17} />} {submitting ? "Saving..." : "Save meeting"}</button>
		</form>
	);
}

function MeetingCard({ meeting, options, onEdit, onDelete }) {
	const attendeeNames = meeting.attendee_user_ids.map((id) => options.attendees.find((item) => item.id === id)?.name).filter(Boolean);
	const projectNames = meeting.project_ids.map((id) => options.projects.find((item) => item.id === id)?.project_name).filter(Boolean);
	return <article className="rounded-2xl border border-slate-100 bg-white p-5 transition hover:border-blue-100"><div className="flex flex-wrap items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e5f3ff] text-[#0769ba]"><CalendarDays size={19} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-extrabold text-slate-800">{meeting.meeting_title}</h3><span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold text-slate-600">{meeting.status}</span></div><p className="mt-1 text-xs text-slate-400">{meeting.meeting_type || "Meeting"}{meeting.meeting_room_id ? ` · ${options.rooms.find((room) => room.id === meeting.meeting_room_id)?.room_name || "Room selected"}` : ""}</p></div><div className="flex gap-2"><button className="icon-button" onClick={() => onEdit(meeting)} aria-label="Edit meeting"><Pencil size={16} /></button><button className="icon-button hover:border-red-200 hover:bg-red-50 hover:text-red-600" onClick={() => onDelete(meeting)} aria-label="Delete meeting"><Trash2 size={16} /></button></div></div><div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:grid-cols-3"><span className="flex items-center gap-2"><Clock3 size={14} />{new Date(meeting.start_datetime).toLocaleString()}</span><span className="flex items-center gap-2"><Users size={14} />{attendeeNames.length ? attendeeNames.join(", ") : "No attendees"}</span><span>{projectNames.length ? `Projects: ${projectNames.join(", ")}` : "No projects selected"}</span></div></article>;
}

const HOUR_START = 8;
const HOUR_END = 19;
const HOUR_HEIGHT = 84;

function dateKey(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfWeek(date) {
	const value = new Date(date);
	const day = value.getDay();
	value.setDate(value.getDate() - (day === 0 ? 6 : day - 1));
	value.setHours(0, 0, 0, 0);
	return value;
}

function addDays(date, amount) {
	const value = new Date(date);
	value.setDate(value.getDate() + amount);
	return value;
}

function monthDays(date) {
	const first = new Date(date.getFullYear(), date.getMonth(), 1);
	const mondayOffset = (first.getDay() + 6) % 7;
	const start = addDays(first, -mondayOffset);
	return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function formatRange(days) {
	const first = days[0];
	const last = days[6];
	const sameMonth = first.getMonth() === last.getMonth();
	const month = new Intl.DateTimeFormat("en", { month: "long" }).format(last);
	const firstMonth = new Intl.DateTimeFormat("en", { month: "short" }).format(first);
	return sameMonth
		? `${month} ${first.getDate()}–${last.getDate()}, ${last.getFullYear()}`
		: `${firstMonth} ${first.getDate()} – ${new Intl.DateTimeFormat("en", { month: "short" }).format(last)} ${last.getDate()}, ${last.getFullYear()}`;
}

function formatHour(hour) {
	const value = new Date(2026, 0, 1, hour);
	return value.toLocaleTimeString([], { hour: "numeric" });
}

function CalendarEvent({ meeting, day, options, onEdit }) {
	const start = new Date(meeting.start_datetime);
	const end = new Date(meeting.end_datetime);
	const startMinutes = start.getHours() * 60 + start.getMinutes();
	const endMinutes = end.getHours() * 60 + end.getMinutes();
	const top = Math.max(0, (startMinutes - HOUR_START * 60) / 60 * HOUR_HEIGHT);
	const height = Math.max(42, (endMinutes - startMinutes) / 60 * HOUR_HEIGHT);
	const room = options.rooms.find((item) => item.id === meeting.meeting_room_id);
	const tones = {
		"In progress": "border-[#20b51d]/30 bg-[#effbef] text-[#167c18] hover:border-[#20a91e] hover:bg-[#e2f7e2]",
		Completed: "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100",
		Cancelled: "border-rose-100 bg-rose-50 text-rose-500 hover:border-rose-200 hover:bg-rose-100",
	};
	const tone = tones[meeting.status] || "border-[#0871c6]/20 bg-[#eaf6ff] text-[#075fae] hover:border-[#0871c6]/45 hover:bg-[#dff1ff]";
	return <button type="button" className={`absolute left-1.5 right-1.5 z-10 overflow-hidden rounded-xl border px-2.5 py-2 text-left shadow-sm transition hover:z-20 hover:-translate-y-px hover:shadow-md ${tone}`} style={{ top: top + 2, height: height - 4 }} onClick={() => onEdit(meeting)} title={`Edit ${meeting.meeting_title}`}>
		<span className="block truncate text-xs font-extrabold">{meeting.meeting_title}</span>
		<span className="mt-1 flex items-center gap-1 truncate text-[10px] font-semibold"><Clock3 size={11} />{start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}–{end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
		{height > 70 && room && <span className="mt-1 flex items-center gap-1 truncate text-[10px] font-semibold"><MapPin size={11} />{room.room_name}</span>}
	</button>;
}

function MiniCalendar({ value, onChange }) {
	const days = monthDays(value);
	const today = new Date();
	return <section className="border-b border-slate-200 bg-[#f8fbfe] p-4 text-[#10233f] sm:p-5 lg:border-b-0 lg:border-r">
		<div className="mb-5 rounded-2xl bg-gradient-to-br from-[#075fae] to-[#087bcf] p-4 text-white shadow-lg shadow-blue-900/10"><div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-100">Navigate</p><h3 className="mt-1 text-sm font-extrabold">{new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(value)}</h3></div><div className="flex gap-1"><button className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20" onClick={() => onChange(new Date(value.getFullYear(), value.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={16} /></button><button className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20" onClick={() => onChange(new Date(value.getFullYear(), value.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={16} /></button></div></div></div>
		<div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400">{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}{days.map((day) => { const selected = dateKey(day) === dateKey(value); const isToday = dateKey(day) === dateKey(today); const outside = day.getMonth() !== value.getMonth(); return <button type="button" key={dateKey(day)} onClick={() => onChange(day)} className={`grid aspect-square place-items-center rounded-xl text-xs transition ${outside ? "text-slate-300" : "text-slate-600"} ${isToday && !selected ? "font-black text-[#20a91e] ring-1 ring-[#20b51d]/40" : ""} ${selected ? "bg-[#075fae] font-black text-white shadow-md shadow-blue-900/15" : "hover:bg-[#eaf6ff] hover:text-[#075fae]"}`}>{day.getDate()}</button>; })}</div>
		<button type="button" onClick={() => onChange(new Date())} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-[#20b51d]/20 bg-white px-3 py-2.5 text-xs font-extrabold text-[#159c18] transition hover:border-[#20b51d]/45 hover:bg-[#effbef]"><CalendarDays size={14} /> Back to today</button>
	</section>;
}

function WeekCalendar({ meetings, options, value, onChange, onEdit, onCreate }) {
	const week = Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(value), index));
	const todayKey = dateKey(new Date());
	return <section className="overflow-hidden bg-white">
		<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 text-[#10233f] sm:px-6"><div className="flex items-center gap-2"><button className="rounded-xl border border-[#075fae]/15 bg-[#eef8ff] px-3 py-2 text-xs font-extrabold text-[#075fae] transition hover:bg-[#dff1ff]" onClick={() => onChange(new Date())}>Today</button><button className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#075fae]" onClick={() => onChange(addDays(value, -7))} aria-label="Previous week"><ChevronLeft size={17} /></button><button className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#075fae]" onClick={() => onChange(addDays(value, 7))} aria-label="Next week"><ChevronRight size={17} /></button><h3 className="ml-1 text-sm font-extrabold sm:text-base">{formatRange(week)}</h3></div><button className="primary-button min-h-10 px-4 text-xs" onClick={() => onCreate(value)}><Plus size={15} /> New meeting</button></div>
		<div className="overflow-x-auto"><div className="min-w-[780px]"><div className="grid grid-cols-[62px_repeat(7,minmax(100px,1fr))] border-b border-slate-200"><div className="bg-[#eef4f8]" /><div className="col-span-7 grid grid-cols-7">{week.map((day, dayIndex) => <button type="button" key={dateKey(day)} onClick={() => onChange(day)} className={`border-l border-slate-200 px-2 py-3 text-center transition hover:bg-[#eaf6ff] ${dateKey(day) === todayKey ? "bg-[#dff1ff]" : dayIndex % 2 ? "bg-[#f7fbfe]" : "bg-white"}`}><span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">{new Intl.DateTimeFormat("en", { weekday: "short" }).format(day)}</span><span className={`mt-1 inline-grid h-8 w-8 place-items-center rounded-xl text-lg font-black ${dateKey(day) === todayKey ? "bg-[#075fae] text-white shadow-md shadow-blue-900/15" : "text-[#10233f]"}`}>{day.getDate()}</span></button>)}</div></div><div className="grid grid-cols-[62px_repeat(7,minmax(100px,1fr))]"><div className="relative bg-[#eef4f8]">{Array.from({ length: HOUR_END - HOUR_START }, (_, index) => <div key={index} className="h-[84px] border-b border-slate-200 pr-2 pt-1 text-right text-[10px] font-bold text-slate-400">{formatHour(HOUR_START + index)}</div>)}</div><div className="col-span-7 grid grid-cols-7">{week.map((day, dayIndex) => <div className={`relative border-l border-slate-200 ${dateKey(day) === todayKey ? "bg-[#edf8ff]" : dayIndex % 2 ? "bg-[#f7fbfe]" : "bg-white"}`} key={dateKey(day)} onDoubleClick={() => onCreate(day)}>{Array.from({ length: HOUR_END - HOUR_START }, (_, index) => <div className="h-[84px] border-b border-slate-200 transition hover:bg-[#eaf6ff]" key={index} />)}{meetings.filter((meeting) => dateKey(new Date(meeting.start_datetime)) === dateKey(day)).map((meeting) => <CalendarEvent key={meeting.id} meeting={meeting} day={day} options={options} onEdit={onEdit} />)}</div>)}</div></div></div></div>
	</section>;
}

export default function Meetings({ calendarOnly = false }) {
	const [meetings, setMeetings] = useState([]);
	const [options, setOptions] = useState({ attendees: [], projects: [], rooms: [] });
	const [form, setForm] = useState(null);
	const [calendarDate, setCalendarDate] = useState(new Date());
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	async function loadData() {
		setLoading(true); setError("");
		try { const [meetingData, optionData] = await Promise.all([listMeetings(), getMeetingOptions()]); setMeetings(meetingData); setOptions(optionData); }
		catch (requestError) { setError(requestError.message); }
		finally { setLoading(false); }
	}

	useEffect(() => { loadData(); }, []);

	async function saveMeeting(payload) {
		setSubmitting(true); setError("");
		try { if (form.id) await updateMeeting(form.id, payload); else await createMeeting(payload); setForm(null); await loadData(); }
		catch (requestError) { setError(requestError.message); }
		finally { setSubmitting(false); }
	}

	async function removeMeeting(meeting) {
		if (!window.confirm(`Delete ${meeting.meeting_title}?`)) return;
		try { await deleteMeeting(meeting.id); await loadData(); } catch (requestError) { setError(requestError.message); }
	}

	const openNewMeeting = (day = calendarDate) => {
		const selected = new Date(day);
		selected.setHours(9, 0, 0, 0);
		const end = new Date(selected);
		end.setHours(10);
		const localValue = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
		setForm({ ...emptyForm, start_datetime: localValue(selected), end_datetime: localValue(end) });
	};

	const calendarPanel = <section className="overflow-hidden rounded-[30px] border border-slate-200/90 bg-white shadow-[0_18px_55px_rgba(15,45,75,.08)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-[#f8fbfe] px-5 py-3.5 sm:px-6"><div className="flex items-center gap-2 text-xs font-bold text-slate-500"><span className="h-2 w-2 rounded-full bg-[#0871c6]" /> Scheduled <span className="ml-2 h-2 w-2 rounded-full bg-[#20b51d]" /> In progress</div><p className="text-xs font-semibold text-slate-400">Double-click a time slot to schedule</p></div><div className="grid lg:grid-cols-[235px_1fr]"><MiniCalendar value={calendarDate} onChange={setCalendarDate} /><WeekCalendar meetings={meetings} options={options} value={calendarDate} onChange={setCalendarDate} onEdit={(item) => setForm(formFromMeeting(item))} onCreate={openNewMeeting} /></div></section>;
	const meetingsPanel = <section className="content-card"><div className="mb-5 flex items-center justify-between"><div><p className="eyebrow text-[#0871c6]">Live data</p><h3 className="section-title">All meetings <span className="ml-2 text-sm font-bold text-slate-400">{meetings.length}</span></h3></div><button className="primary-button min-h-10 px-4 text-xs" onClick={() => openNewMeeting()}><Plus size={15} /> New meeting</button></div>{meetings.length ? <div className="space-y-3">{meetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} options={options} onEdit={(item) => setForm(formFromMeeting(item))} onDelete={removeMeeting} />)}</div> : <div className="py-10 text-center"><CalendarDays className="mx-auto text-slate-300" size={36} /><p className="mt-3 text-sm font-extrabold text-slate-600">No meetings yet</p><p className="mt-1 text-sm text-slate-400">Create the first meeting to coordinate your workspace.</p></div>}</section>;
	const title = calendarOnly ? "Calendar" : "Meetings";
	const description = calendarOnly ? "Plan the week, navigate dates, and open scheduled meetings directly from the calendar." : "Create, edit, and manage scheduled meetings, attendees, rooms, and follow-up.";

	return <div className="space-y-7"><section className="subpage-hero"><div className="relative z-10 max-w-xl"><p className="eyebrow text-[#199d1c]">{calendarOnly ? "Schedule workspace" : "Meeting workspace"}</p><h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#10233f]">{title}</h2><p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">{description}</p></div><div className="subpage-ring" /></section>{form && <MeetingForm initialValues={form} meetings={meetings} options={options} submitting={submitting} onSubmit={saveMeeting} onClose={() => setForm(null)} />}{error && <div className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button></div>}{loading ? <div className="content-card flex items-center justify-center gap-2 py-14 text-sm font-semibold text-slate-400"><LoaderCircle className="animate-spin" size={18} /> Loading meetings...</div> : calendarOnly ? calendarPanel : meetingsPanel}</div>;
}
