import { AppUser } from "@/components/app-sidebar";
import { DataTableDemo } from "@/components/table";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <SidebarInset>
        <header className="justify-between bg-background sticky top-0 h-16 shrink-0 flex items-center gap-2 border-b px-4">
          <p>EventHub</p>
          <div className="w-50">
            <AppUser />
          </div>
        </header>
        <DataTableDemo />
      </SidebarInset>
    </SidebarProvider>
  );
}
