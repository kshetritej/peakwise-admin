"use client";

import * as React from "react";
import { NavUser } from "./nav-user";
import { NavSecondary } from "./nav-secondary";
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
import { LucideCircle, LucideContact2, LucideCopyX, LucideForm, LucideGaugeCircle, LucideMapPinCheck, LucideMapPinHouse, LucideMountainSnow, LucideNewspaper, LucideNotebook, LucideNotebookPen, LucidePyramid, LucideRoute, LucideSettings2, LucideSquareActivity, LucideTag, SquareTerminal } from "lucide-react";

const data: TNavData = {
  user: {
    name: "Admin",
    email: "admin@bettertreks.com",
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
      title: "Posts",
      url: "/posts",
      icon: LucideNotebook,
    },
    {
      title: "Authors",
      url: "/authors",
      icon: LucideNotebookPen,
    },
    {
      title: "Navigation",
      url: "/navigation",
      icon: LucideRoute,
    },
  ],

  navUtils: [
    {
      name: "Manage Post Categories",
      url: "/post-categories",
      icon: LucideForm,
    },
    {
      name: "Manage Trip Categories",
      url: "/trip-categories",
      icon: LucideCopyX,
    },
    {
      name: "Manage Activity Types",
      url: "/activity-types",
      icon: LucideSquareActivity,
    },
    {
      name: "Manage Regions",
      url: "/manage-regions",
      icon: LucideMountainSnow,
    },
    {
      name: "Manage Destinations",
      url: "/manage-destinations",
      icon: LucidePyramid,
    },
    {
      name: "Manage Featured Tags",
      url: "/featured-tags",
      icon: LucideTag,
    },
    {
      name: "Manage Departments",
      url: "/manage-departments",
      icon: LucideContact2,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: LucideSettings2,
    },
    {
      title: "Terms and Conditions",
      url: "/TERMS_AND_CONDITIONS",
      icon: LucideNewspaper,
    },
    {
      title: "Privacy Policy",
      url: "/PRIVACY_POLICY",
      icon: LucideNewspaper,
    },
    {
      title: "Cancellation Policy",
      url: "/CANCELLATION_POLICY",
      icon: LucideNewspaper,
    },
    {
      title: "Supplier Agreement",
      url: "/SUPPLIER_AGREEMENT",
      icon: LucideNewspaper,
    },
    {
      title: "Community Guidelines",
      url: "/COMMUNITY_GUIDELINES",
      icon: LucideNewspaper,
    },
    {
      title: "Platform Terms of Service",
      url: "/PLATFORM_TERMS_OF_SERVICE",
      icon: LucideNewspaper,
    },
    {
      title: "Guest Terms and Conditions",
      url: "/GUEST_TERMS_AND_CONDITIONS",
      icon: LucideNewspaper,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <LucideCircle className="!size-5" />
                <span className="text-base font-semibold">
                  {"Better Treks"}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavUtils items={data.navUtils} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
