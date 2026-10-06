import { apiRequest } from "./authApi";

export function listTasks() {
	return apiRequest("/tasks");
}

export const getTaskOptions = () => apiRequest("/tasks/options");
export const createTask = (payload) => apiRequest("/tasks", { method: "POST", body: JSON.stringify(payload) });
export const updateTask = (taskId, payload) => apiRequest(`/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify(payload) });

export function submitTask(taskId, payload) {
	return apiRequest(`/tasks/${taskId}/submission`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
}
