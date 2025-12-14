import { createRoot } from "react-dom/client";
import "./index.css";
import { layout } from "./Layout";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";

const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={layout} />
    <Toaster />
  </QueryClientProvider>
);
