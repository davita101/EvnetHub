import { Navigate, Outlet } from "react-router";
export default function NavigationLayout() {
  const user = null
  return !user ? <Outlet /> : <Navigate to="/login" replace />;
}
