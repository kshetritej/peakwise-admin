import { cookies } from "next/headers";
import { AppSidebar } from "@/components/sidebar/admin-app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { InstructionTooltip } from "@/components/atoms/instruction-tooltip";
import {redirect} from "next/navigation";
import { SessionGuard } from "@/components/session-guard";

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
    <SessionGuard>
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
        <div className="p-8 min-h-screen">
          {children}
          <div className="absolute bottom-4 right-4">
          <div className="flex items-center justify-center gap-1">
            ©Powered By{" "}
            <Link
              href={"https://growfore.com"}
              target="_blank"
              className="flex gap-1 items-center"
            >
              <Image
                src={
                  "https://growfore.com/wp-content/uploads/2025/08/cropped-growfore-rounded-blue-on-white.png"
                }
                alt="Growfore Solution Logo"
                width={20}
                height={20}
              />{" "}
              Growfore Solution <InstructionTooltip instruction="This software is licensed, not sold. All code, logic, and design remain the exclusive property of Growfore Solution."/> 
            </Link>
          </div>
          </div>
        </div>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
    </SessionGuard>
  );
};

export default AdminDashboardLayout;
