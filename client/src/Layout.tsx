import { createBrowserRouter, Navigate, Outlet } from "react-router";
import ProtectRouter from "./components/protected-route";
import { LoginForm } from "./components/login-form";
import NavigationLayout from "./components/navigation-layout";
import { RegisterForm } from "./components/register-form";
import DashboardLayout from "./app/dashboard/page";

export const layout = createBrowserRouter([
  {
    element: <ProtectRouter />,
    children: [
      {
        path: "/login",
        element: (
          <div className="md:max-w-base-400 w-full">
            <LoginForm />
          </div>
        ),

        children: [
          {
            path: "/login/*",
            element: <Outlet />,
          },
        ],
      },
      {
        path: "/register",
        element: (
          <div className="md:max-w-base-400 w-full">
            <RegisterForm />
          </div>
        ),

        children: [
          {
            path: "/register/*",
            element: <Outlet />,
          },
        ],
      },
    ],
  },

  {
    path: "/",
    Component: NavigationLayout,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "/dashboard",
        // Each dashboard component gets its OWN route for proper navigation
        element: <DashboardLayout />,
      },
      {
        path: "*",
        element: <div>Page Not Found</div>,
      },
    ],
  },
  {
    path: "*",
    element: <div>Page Not Found</div>,
  },
]);
