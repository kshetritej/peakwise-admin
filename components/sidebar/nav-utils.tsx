"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function NavUtils({
  items,
}: Readonly<{
  items: {
    name?: string;
    title?: string;
    url: string;
    icon: any;
  }[];
}>) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Tools</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url;

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                className={clsx(
                  "flex items-center gap-2",
                  isActive ? "bg-accent border text-primary" : ""
                )}
              >
                <Link href={item.url}>
                  <item.icon
                    className={clsx(
                      "size-4",
                      isActive ? "text-primary" : ""
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
