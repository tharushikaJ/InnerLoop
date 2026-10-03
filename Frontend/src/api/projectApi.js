const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/$/, "");

export async function listProjects() {
	const response = await fetch(`${API_BASE_URL}/projects`, { credentials: "include", headers: { Accept: "application/json" } });
	if (!response.ok) throw new Error(`Request failed (${response.status})`);
	return response.json();
}
