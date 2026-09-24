const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		headers: { "Content-Type": "application/json", ...(options.headers || {}) },
		...options,
	});

	if (!response.ok) {
		let message = `Request failed (${response.status})`;
		try {
			const body = await response.json();
			message = body.detail || message;
		} catch {
			// Keep the HTTP error when the response is not JSON.
		}
		throw new Error(message);
	}

	return response.status === 204 ? null : response.json();
}

export function listInternPods(projectId) {
	const query = projectId ? `?project_id=${encodeURIComponent(projectId)}` : "";
	return request(`/api/intern-pods${query}`);
}

export function createInternPod(payload) {
	return request("/api/intern-pods", { method: "POST", body: JSON.stringify(payload) });
}

export function updateInternPod(podId, payload) {
	return request(`/api/intern-pods/${podId}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteInternPod(podId) {
	return request(`/api/intern-pods/${podId}`, { method: "DELETE" });
}

export function addInternPodMember(podId, payload) {
	return request(`/api/intern-pods/${podId}/members`, { method: "POST", body: JSON.stringify(payload) });
}

export function deleteInternPodMember(podId, memberId) {
	return request(`/api/intern-pods/${podId}/members/${memberId}`, { method: "DELETE" });
}
