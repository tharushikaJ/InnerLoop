import { CalendarDays, Clock3, MapPin } from "lucide-react";

function formatDate(value) {
	return new Date(value).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(value) {
	return new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function RoomCalendar({ rooms, entries }) {
	if (!entries.length) return <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-12 text-center"><CalendarDays className="mx-auto text-slate-300" size={30} /><p className="mt-3 text-sm font-extrabold text-slate-600">No room bookings yet</p><p className="mt-1 text-sm text-slate-400">Meetings assigned to rooms will appear here.</p></div>;
	return <div className="space-y-3">{entries.map((entry) => { const room = rooms.find((item) => item.id === entry.room_id); return <article className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-blue-100 hover:bg-white" key={entry.meeting_id}><div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-white px-2 py-2 text-center shadow-sm"><span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0871c6]">{formatDate(entry.start_datetime).split(" ")[0]}</span><strong className="mt-1 text-lg font-black text-[#10233f]">{formatDate(entry.start_datetime).split(" ")[2]}</strong><span className="text-[10px] font-semibold text-slate-400">{formatDate(entry.start_datetime).split(" ")[1]}</span></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h4 className="text-sm font-extrabold text-slate-800">{entry.meeting_title}</h4><p className="mt-1 text-xs font-semibold text-slate-400">{entry.meeting_type || "Meeting"}</p></div><span className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold text-slate-600">{entry.status || "Scheduled"}</span></div><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500"><span className="flex items-center gap-1.5"><Clock3 size={13} />{formatTime(entry.start_datetime)} - {formatTime(entry.end_datetime)}</span><span className="flex items-center gap-1.5"><MapPin size={13} />{room?.room_name || "Room unavailable"}</span></div></div></article>; })}</div>;
}
