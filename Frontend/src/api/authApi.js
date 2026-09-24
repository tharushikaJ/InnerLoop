const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function errorMessage(detail) {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length) return detail[0].msg || "Please check the form and try again.";
  return "Something went wrong. Please try again.";
}

export async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    const apiOrigin = new URL(API_BASE_URL, window.location.origin).origin;
    throw new ApiError(`Cannot reach the InnerLoop API at ${apiOrigin}. Confirm the backend is running and try again.`, 0);
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(errorMessage(data?.detail), response.status);
  return data;
}

export const authApi = {
  login: (credentials) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (details) => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(details) }),
  me: () => apiRequest("/auth/me"),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
};
