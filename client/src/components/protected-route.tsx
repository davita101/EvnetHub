import { Navigate, Outlet } from "react-router";

export default function ProtectRouter() {

  const user = null; // or loader

  // 🔁 logged-in user should NOT see login/register
  return !user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
