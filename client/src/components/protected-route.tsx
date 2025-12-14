import { Navigate, Outlet } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProtectRouter() {
  const [user, setUser] = useState<null | object>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/auth/me", {
        withCredentials: true, // if using cookies
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return null; // or loader

  // 🔁 logged-in user should NOT see login/register
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
