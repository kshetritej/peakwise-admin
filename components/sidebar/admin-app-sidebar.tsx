"use client";

import * as React from "react";
import { NavUser } from "./nav-user";
import { NavMain } from "./nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUtils } from "./nav-utils";
import { TNavData } from "@/app/(dash)/types/navItems";
import Link from "next/link";
import {
  LucideColumnsSettings,
  LucideContact2,
  LucideCopyX,
  LucideFlower,
  LucideFootprints,
  LucideForm,
  LucideGaugeCircle,
  LucideLayers2,
  LucideMapPinCheck,
  LucideMapPinHouse,
  LucideMountainSnow,
  LucideNewspaper,
  LucideNotebookPen,
  LucidePyramid,
  LucideRedo,
  LucideRoute,
  LucideSettings,
  LucideSquareActivity,
  LucideStar,
  LucideTag,
  LucideUsers2,
} from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

const data: TNavData = {
  user: {
    name: "Admin",
    email: siteConfig.adminEmail,
    isVerified: true,
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LucideGaugeCircle,
    },
    {
      title: "Featured Trips",
      url: "/featured-trips",
      icon: LucideMapPinCheck,
    },
    {
      title: "Trips",
      url: "/trips",
      icon: LucideMapPinHouse,
    },
    {
      title: "Pages",
      url: "/info-pages",
      icon: LucideLayers2,
    },
    {
      title: "Posts",
      url: "/posts",
      icon: LucideNewspaper,
    },
    {
      title: "Authors",
      url: "/authors",
      icon: LucideNotebookPen,
    },
    {
      title: "Testimonials",
      url: "/testimonials",
      icon: LucideStar,
    },
    {
      title: "Navbar",
      url: "/navbar",
      icon: LucideRoute,
    },
    {
      title: "Footer",
      url: "/footer",
      icon: LucideFootprints,
    },
    {
      title: "Redirects",
      url: "/redirects",
      icon: LucideRedo,
    },
  ],

  navUtils: [
    {
      name: "Blog Categories",
      url: "/modules",
      icon: LucideForm,
    },
    {
      name: "Page Categories",
      url: "/info-page-category",
      icon: LucideColumnsSettings,
    },
    {
      name: "Trip Categories",
      url: "/trip-categories",
      icon: LucideCopyX,
    },
    {
      name: "Activity Types",
      url: "/activity-types",
      icon: LucideSquareActivity,
    },
    {
      name: "Regions",
      url: "/regions",
      icon: LucideMountainSnow,
    },
    {
      name: "Destinations",
      url: "/destinations",
      icon: LucidePyramid,
    },
    {
      name: "Featured Tags",
      url: "/featured-tags",
      icon: LucideTag,
    },
    {
      name: "Departments",
      url: "/departments",
      icon: LucideContact2,
    },
    {
      name: "Team Members",
      url: "/team",
      icon: LucideUsers2,
    },
    {
      name: "Settings",
      url: "/site-config",
      icon: LucideSettings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex gap-1 items-center">
                <LucideFlower className="w-8 h-8" />
                <span className="text-base font-semibold">
                  {siteConfig.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavUtils items={data.navUtils} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
