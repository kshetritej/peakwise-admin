"use client";

import { LucideCirclePlus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function NavMain({
  items,
}: Readonly<{
  items: {
    title?: string;
    name?: string;
    url: string;
    icon?: any;
  }[];
}>) {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <Link
                href={"/trips/edit"}
                className="flex items-center justify-center gap-1"
              >
                <LucideCirclePlus size={12} />
                <span>Quick Create</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;

            return (
              <SidebarMenuItem key={item.title}>
                <Link
                  href={item.url}
                  className="flex items-center gap-2 w-full"
                >
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={clsx(
                      "w-full flex items-center gap-2",
                      isActive ? "border text-primary" : "",
                    )}
                  >
                    {item.icon && (
                      <item.icon
                        className={clsx(
                          "size-4",
                          isActive ? "text-primary" : "",
                        )}
                      />
                    )}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
