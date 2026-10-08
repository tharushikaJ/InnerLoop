import { apiRequest } from "./authApi";

export const listProjects = () => apiRequest("/projects");
export const getProjectOptions = () => apiRequest("/projects/options");
export const createProject = (payload) => apiRequest("/projects", { method: "POST", body: JSON.stringify(payload) });
export const updateProject = (projectId, payload) => apiRequest(`/projects/${projectId}`, { method: "PATCH", body: JSON.stringify(payload) });
export const deleteProject = (projectId) => apiRequest(`/projects/${projectId}`, { method: "DELETE" });
