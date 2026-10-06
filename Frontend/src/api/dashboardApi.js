import { apiRequest } from "./authApi";

export const getDashboard = () => apiRequest("/dashboard");
