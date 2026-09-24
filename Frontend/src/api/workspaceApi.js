import { apiRequest } from "./authApi";

export const workspaceApi = {
  dashboard: () => apiRequest("/dashboard"),
  projects: () => apiRequest("/projects"),
  tasks: () => apiRequest("/tasks"),
  meetings: () => apiRequest("/meetings"),
  internPods: () => apiRequest("/intern-pods"),
  meetingRooms: () => apiRequest("/meeting-rooms"),
  reportSummary: () => apiRequest("/reports/summary"),
  users: () => apiRequest("/users"),
  auditLogs: () => apiRequest("/audit-logs"),
  settings: () => apiRequest("/settings"),
};
