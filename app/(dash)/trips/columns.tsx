"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { formatStatus } from "@/components/atoms/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Edit3,
  LucideArrowRight,
  LucideGlobe,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getFullImageUrl } from "@/lib/getFullImageUrl";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "SN",
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center">{row.index + 1}</div>
      );
    },
  },
  {
    accessorKey: "thumbnail",
    header: "Thumbnail",
    cell: ({ row }) => {
      return (
        <div>
          {row?.original?.thumbnail ? (
            <img alt="" className="size-16 object-cover" src={getFullImageUrl(row?.original?.thumbnail)} />
          ) : (
            <div className="size-16 border"> </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "duration",
    header: "Duration",
  },
  {
    accessorKey: "guestCapacity",
    header: "Capacity",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-left">Price</div>,
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-left font-medium">{formatted}/person</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <Badge
          variant={"outline"}
          className={cn(
            // @ts-expect-error it's unknown
            formatStatus(status)?.color ? formatStatus(status)?.color : "",
            "text-white",
          )}
        >
          {/* @ts-expect-error it's unknown */}
          {formatStatus(status)?.icon} {formatStatus(status)?.text}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: function ActionCell({ row }) {
      const [showDeleteDialog, setShowDeleteDialog] = useState(false);
      const router = useRouter();

      const deleteItem = async (id: string) => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/activity/${id}`,
          {
            method: "DELETE",
          },
        );

        if (response.ok) {
          toast.success("Item deleted Successfully!");
          router.refresh();
        } else {
          toast.error("Something went wrong!");
        }
      };

      return (
        <Suspense fallback={<div>Loading...</div>}>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(row.getValue("id"))
                }
              >
                Copy Trip ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  className="flex gap-1 items-center p-0!"
                  onClick={() =>
                    router.push(
                      `${
                        process.env.NEXT_PUBLIC_FRONTEND_BASE_URL
                      }/trips/edit?id=${row.getValue("id")}`,
                    )
                  }
                >
                  <Edit3 />
                  Edit Tour
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Button
                  className="flex gap-1 items-center p-0!"
                  variant={"ghost"}
                  onClick={() => approveListing(row.original.id, false)}
                  disabled={row.original.status == "PUBLISHED"}
                >
                  <LucideGlobe />
                  Publish
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Button
                  className="flex gap-1 items-center p-0!"
                  variant={"ghost"}
                  onClick={() => approveListing(row.original.id, true)}
                  disabled={row.original.status == "DRAFT"}
                >
                  <LucideArrowRight />
                  Move to Drafts
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant={"ghost"}
                  className="group flex gap-1 items-center p-0! text-gray-500 hover:text-rose-500"
                  // className="group flex gap-1 items-center text-gray-500 hover:text-rose-500"
                >
                  <Trash2 className="text-gray-500 group-hover:text-rose-500" />
                  Delete
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently remove
                  your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    (deleteItem(row.getValue("id")), router.refresh());
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Suspense>
      );
    },
  },
];

async function approveListing(id: string, reject?: boolean) {
  const bodyData = reject
    ? { activityId: Number(id), reject: true }
    : { activityId: Number(id) };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/approve-listing`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
      cache: "no-store",
      credentials: "include",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    toast(data.message || "Something went wrong!");
    window.location.href = "/trips";
  } else {
    toast.success(data.message || "Status updated successfully!");
    window.location.href = "/trips";
  }
}
