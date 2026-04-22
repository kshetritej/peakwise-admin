"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Copy,
  Edit,
  LucideExternalLink,
  LucideRefreshCcw,
  LucideTrash,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getFullImageUrl } from "@/lib/getFullImageUrl";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
};

type Blog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  category: BlogCategory;
  metaTitle: string;
  metaDescription: string;
  tags: string;
  publishedAt: string;
  updatedAt: string;
  authorId: number;
  inTrash: boolean;
  writer: {
    name: string;
    username: string;
  };
  author: {
    id: number;
    username: string;
    email: string;
  };
};

const deleteBlog = async (id: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/${id}`,
    {
      method: "DELETE",
      cache: "no-store",
    },
  );
  const data = await response.json();
  if (response.ok) {
    toast.success(data?.message || "Item deleted successfully");
  } else {
    toast.error(
      data?.message ||
        "Something went wrong, please try again after some time!",
    );
  }
};
const permanentlyDeleteBlog = async (id: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/${id}?permanent=true`,
    {
      method: "DELETE",
      cache: "no-store",
    },
  );

  const data = await res.json();
  if (res.ok) {
    toast.success(data?.message || "Item deleted successfully");
  } else {
    toast.error(
      data?.message ||
        "Something went wrong, please try again after some time!",
    );
  }
};

const restoreBlog = async (id: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/restore/${id}`,
    {
      method: "PATCH",
      cache: "no-store",
      credentials: "include",
    },
  );

  const data = await response.json();

  if (response.ok) {
    toast.success(data?.message || "Item Restored");
  } else {
    toast.error(
      data?.message ||
        "Something went wrong, please try again after some time!",
    );
  }
};

export const blogsColumns: ColumnDef<Blog>[] = [
  {
    accessorKey: "id",
    header: "SN",
    cell: ({ row }) => {
      return <div className="text-center flex flex-col">{row.index + 1}</div>;
    },
  },
  {
    accessorKey: "coverImage",
    header: "",
    cell: ({ row }) => {
      return row.getValue("coverImage") ? (
        <Image
          height={100}
          width={100}
          className="min-w-12 size-12 object-cover"
          src={getFullImageUrl(row.getValue("coverImage"))}
          alt={row.original.metaTitle}
        />
      ) : (
        <div className="size-24 border flex flex-col items-center justify-center p-2 text-center">
          No <br /> Image.{" "}
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return <p>{row.original.title.substring(0, 50) + "..."}</p>;
    },
  },
  {
    accessorKey: "authorId",
    header: "Author",
    cell: ({ row }) => {
      return (
        <p> {row.original?.writer?.name ?? row.original.author?.username}</p>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => {
      return (
        <Link
          className="flex gap-1 items-center text-white bg-primary w-fit rounded-full py-0.5 px-2"
          href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/blogs/${row.getValue("slug")}`}
        >
          <Tooltip>
            <TooltipTrigger className="flex gap-2 items-center">
              {/*// @ts-expect-error some type issues*/}
              {row.getValue("slug")?.substring(0, 25) + "..."}
              <LucideExternalLink className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Visit Preview</TooltipContent>
          </Tooltip>
        </Link>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return <Badge variant={"secondary"}>{row.original.category?.name}</Badge>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Modified",
    cell: ({ row }) => {
      return (
        <div>
          {new Date(row.getValue("updatedAt")).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const blog = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {!row.original.inTrash && (
              <DropdownMenuItem
                className="group"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/${blog.slug}`,
                  )
                }
              >
                <Copy className="group-hover:text-white" /> Copy Blog URL
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {!row.original.inTrash && (
              <Link href={`/posts/edit?slug=${row.original.slug}`}>
                <DropdownMenuItem className="group">
                  <Edit className="group-hover:text-white" /> Edit
                </DropdownMenuItem>
              </Link>
            )}
            {!row.original.inTrash && (
              <DropdownMenuItem
                className="group text-gray-500 hover:text-red-500! hover:bg-red-200!"
                onClick={() => deleteBlog(row.original.id)}
              >
                <Trash className="group-hover:text-red-500" /> Delete
              </DropdownMenuItem>
            )}
            {row.original.inTrash && (
              <DropdownMenuItem
                className="text-gray-500 hover:text-gray-500! hover:bg-gray-200!"
                onClick={() => restoreBlog(row.original.id)}
              >
                <LucideRefreshCcw /> Restore
              </DropdownMenuItem>
            )}
            {row.original.inTrash && (
              <DropdownMenuItem
                className="group text-gray-500 hover:text-red-500! hover:bg-red-200!"
                onClick={() => permanentlyDeleteBlog(row.original.id)}
              >
                <LucideTrash className="group-hover:text-red-500" /> Permanently
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
