import { NavUser } from "./nav-user";

type User = {
  status: boolean;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
};

export function AppUser() {
  const user: User = {
    status: true,
    user: {
      name: "student1",
      email: "grdzelishvilidaivit@gmail.com",
      avatar:
        "https://upload.wikimedia.org/wikipedia/en/0/03/Walter_White_S5B.png",
    },
  };
  

  return <NavUser user={user?.user} />;
}
