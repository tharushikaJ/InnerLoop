import { apiRequest } from "./authApi";

export function listTasks() {
	return apiRequest("/tasks");
}

export function submitTask(taskId, payload) {
	return apiRequest(`/tasks/${taskId}/submission`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
}
