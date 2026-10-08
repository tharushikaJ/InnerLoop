import { useEffect, useState } from "react";
import { Building2, Check, LoaderCircle, Pencil, Plus, RefreshCw, Trash2, Users, X } from "lucide-react";

import { createRoom, deleteRoom, listRoomCalendar, listRooms, updateRoom } from "../api/roomApi";
import RoomCalendar from "../components/RoomCalendar";
import { useAuth } from "../context/AuthContext";
import { canManageOperations } from "../utils/rolePermissions";

const roomStatuses = ["Available", "Maintenance", "Unavailable"];
const emptyForm = { room_name: "", location: "", capacity: "", status: "Available" };

function RoomForm({ initialValues, submitting, onSubmit, onClose }) {
	const [form, setForm] = useState(initialValues);
	const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
	return <form className="content-card space-y-5" onSubmit={(event) => { event.preventDefault(); onSubmit({ ...form, capacity: form.capacity ? Number(form.capacity) : null }); }}><div className="flex items-center justify-between"><div><p className="eyebrow text-[#0871c6]">Workspace setup</p><h3 className="section-title">{initialValues.id ? "Edit meeting room" : "Add meeting room"}</h3></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close form"><X size={18} /></button></div><div className="grid gap-4 sm:grid-cols-2"><label className="field-label">Room name<input className="field-input" value={form.room_name} onChange={update("room_name")} placeholder="e.g. Blue Room" required /></label><label className="field-label">Capacity<input className="field-input" type="number" min="1" value={form.capacity} onChange={update("capacity")} placeholder="Number of seats" /></label><label className="field-label">Location<input className="field-input" value={form.location} onChange={update("location")} placeholder="Floor or building" /></label><label className="field-label">Status<select className="field-input" value={form.status} onChange={update("status")}>{roomStatuses.map((status) => <option key={status}>{status}</option>)}</select></label></div><button className="primary-button w-full justify-center" disabled={submitting}>{submitting ? <LoaderCircle className="animate-spin" size={17} /> : <Check size={17} />} {submitting ? "Saving..." : "Save room"}</button></form>;
}

function RoomCard({ room, bookingCount, canManage, onEdit, onDelete }) {
	const statusClass = room.status === "Available" ? "bg-[#e5f8e3] text-[#189b1b]" : room.status === "Maintenance" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500";
	return <article className="rounded-2xl border border-slate-100 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-900/5"><div className="flex items-start justify-between gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e5f3ff] text-[#0769ba]"><Building2 size={19} /></div>{canManage && <div className="flex gap-1"><button className="icon-button" onClick={() => onEdit(room)} aria-label="Edit room"><Pencil size={15} /></button><button className="icon-button hover:border-red-200 hover:bg-red-50 hover:text-red-600" onClick={() => onDelete(room)} aria-label="Delete room"><Trash2 size={15} /></button></div>}</div><div className="mt-5 flex items-start justify-between gap-3"><div><h3 className="text-base font-extrabold text-slate-800">{room.room_name}</h3><p className="mt-1 text-xs text-slate-400">{room.location || "Location not set"}</p></div><span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${statusClass}`}>{room.status || "Unspecified"}</span></div><div className="mt-5 flex items-center gap-5 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500"><span className="flex items-center gap-1.5"><Users size={14} />{room.capacity || "-"} seats</span><span>{bookingCount} {bookingCount === 1 ? "booking" : "bookings"}</span></div></article>;
}

export default function MeetingRoom() {
	const { user } = useAuth();
	const canManage = canManageOperations(user?.role);
	const [rooms, setRooms] = useState([]);
	const [calendar, setCalendar] = useState([]);
	const [form, setForm] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	async function loadData() { setLoading(true); setError(""); try { const [roomData, calendarData] = await Promise.all([listRooms(), listRoomCalendar()]); setRooms(roomData); setCalendar(calendarData); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } }
	useEffect(() => { loadData(); }, []);
	async function saveRoom(payload) { setSubmitting(true); setError(""); try { if (form.id) await updateRoom(form.id, payload); else await createRoom(payload); setForm(null); await loadData(); } catch (requestError) { setError(requestError.message); } finally { setSubmitting(false); } }
	async function removeRoom(room) { if (!window.confirm(`Delete ${room.room_name}?`)) return; try { await deleteRoom(room.id); await loadData(); } catch (requestError) { setError(requestError.message); } }

	return <div className="space-y-7"><section className="subpage-hero"><div className="relative z-10 max-w-xl"><p className="eyebrow text-[#199d1c]">Workspace operations</p><h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-[#10233f]">Meeting rooms</h2><p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">Keep room capacity, availability and the shared calendar in sync.</p>{canManage && <button className="primary-button mt-6" onClick={() => setForm({ ...emptyForm })}><Plus size={17} /> Add room</button>}</div><div className="subpage-ring" /></section>{canManage && form && <RoomForm initialValues={form} submitting={submitting} onSubmit={saveRoom} onClose={() => setForm(null)} />}{error && <div className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button></div>}{loading ? <div className="content-card flex items-center justify-center gap-2 py-14 text-sm font-semibold text-slate-400"><LoaderCircle className="animate-spin" size={18} /> Loading rooms...</div> : <><section className="content-card"><div className="mb-5 flex items-center justify-between"><div><p className="eyebrow text-[#0871c6]">Room directory</p><h3 className="section-title">All rooms <span className="ml-2 text-sm font-bold text-slate-400">{rooms.length}</span></h3></div><button className="icon-button" onClick={loadData} aria-label="Refresh rooms"><RefreshCw size={16} /></button></div>{rooms.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rooms.map((room) => <RoomCard key={room.id} room={room} bookingCount={calendar.filter((entry) => entry.room_id === room.id).length} canManage={canManage} onEdit={(item) => setForm({ ...item, capacity: item.capacity || "" })} onDelete={removeRoom} />)}</div> : <div className="py-10 text-center text-sm text-slate-400">No meeting rooms configured yet.</div>}</section><section className="content-card"><div className="mb-5"><p className="eyebrow text-[#0871c6]">Shared schedule</p><h3 className="section-title">Room calendar</h3></div><RoomCalendar rooms={rooms} entries={calendar} /></section></>}</div>;
}
