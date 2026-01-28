import { cookies } from "next/headers";
import { AppSidebar } from "@/components/sidebar/admin-app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { redirect } from "next/navigation";

const AdminDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const cookieStore = await cookies();

  const adminCookie =
    cookieStore.get("admin_auth_token")?.value ||
    cookieStore.get("admin_token")?.value;

  if (!adminCookie) {
    redirect("/admin");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-8">{children}</div>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminDashboardLayout;
