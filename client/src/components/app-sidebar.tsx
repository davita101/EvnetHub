import axios from "axios";
import { NavUser } from "./nav-user";
import { useEffect, useState } from "react";

type User = {
  status: boolean;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
};

export function AppUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/auth/me", {
        withCredentials: true,
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);
  if (!user) return null; // or loading / skeleton

  return <NavUser user={user?.user} />;
}
