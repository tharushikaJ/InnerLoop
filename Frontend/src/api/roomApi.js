import { apiRequest } from "./authApi";

export const listRooms = () => apiRequest("/meeting-rooms");
export const listRoomCalendar = () => apiRequest("/meeting-rooms/calendar");
export const createRoom = (payload) => apiRequest("/meeting-rooms", { method: "POST", body: JSON.stringify(payload) });
export const updateRoom = (roomId, payload) => apiRequest(`/meeting-rooms/${roomId}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteRoom = (roomId) => apiRequest(`/meeting-rooms/${roomId}`, { method: "DELETE" });