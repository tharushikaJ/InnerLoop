import { apiRequest } from "./authApi";

export const listProjects = () => apiRequest("/projects");
export const getProjectOptions = () => apiRequest("/projects/options");
export const createProject = (payload) => apiRequest("/projects", { method: "POST", body: JSON.stringify(payload) });
