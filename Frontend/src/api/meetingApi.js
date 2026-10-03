import { apiRequest } from "./authApi";

export const listMeetings = () => apiRequest("/meetings");
export const getMeetingOptions = () => apiRequest("/meetings/options");
export const createMeeting = (payload) => apiRequest("/meetings", { method: "POST", body: JSON.stringify(payload) });
export const updateMeeting = (meetingId, payload) => apiRequest(`/meetings/${meetingId}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteMeeting = (meetingId) => apiRequest(`/meetings/${meetingId}`, { method: "DELETE" });
