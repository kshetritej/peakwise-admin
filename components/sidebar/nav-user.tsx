"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logout } from "@/lib/logout";
import { LucideLogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function NavUser({
  user,
}: Readonly<{
  user: {
    name: string;
    email: string;
    isVerified: boolean;
  };
}>) {
  const router = useRouter();
  const message =
    "You are not verified, and won't be able to publish any trips. Wait for the verification or contact the support if you haven't heard from us for a long time.";
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size={"lg"}
          className="border border-gray-300 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
          onClick={async () => {
            await logout();
            router.push("/");
          }}
        >
          <LucideLogOut className="mr-2" />
          Logout
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg grayscale">
            <AvatarImage src={""} alt={user.name} />
            <AvatarFallback className="rounded-lg">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {user.email}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
