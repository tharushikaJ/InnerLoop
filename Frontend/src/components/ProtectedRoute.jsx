import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f8fb]">
        <div className="text-center" role="status" aria-live="polite">
          <span className="mx-auto block h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-[#075fae]" />
          <p className="mt-4 text-sm font-bold text-slate-500">Connecting to InnerLoop…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
