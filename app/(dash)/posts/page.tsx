"use client";

import { Button } from "@/components/ui/button";
import { LucidePlus } from "lucide-react";
import { DataTable } from "./data-table";
import { blogsColumns } from "./columns";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Inbox, LucideTrash2 } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

type Pagination = {
  page?: number;
  totalPages: number;
};

export default function BlogsPage() {
  const [status, setStatus] = useState("all");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState<{ pagination?: Pagination; blogs?: any[] }>(
    {},
  );

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs?status=${status}&page=${page}&limit=${limit}`,
          { cache: "no-store", credentials: "include" },
        );
        const blogs = await response.json();
        setData(blogs);
        setBlogs(blogs?.blogs);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
        setBlogs([]);
        setData({});
      }
    }
    fetchBlogs();
  }, [status, page, limit]);

  const totalPages: number = data?.pagination?.totalPages ?? 1;

  return (
    <div>
      <div className="flex flex-col pb-4 space-y-6">
        <div className="flex justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold">Posts</h1>
            <p className="text-muted-foreground">
              Explore our curated collections of amazing travel experiences guides
            </p>
          </div>
          <Link href={"/posts/edit"}>
            <Button size={"lg"}>
              <LucidePlus /> Create New
            </Button>
          </Link>
        </div>
        <div className="flex justify-between">
          <div className="flex gap-1 items-center justify-center">
            <Button
              size={"sm"}
              onClick={() => setStatus("all")}
              variant={status == "all" ? "default" : "secondary"}
            >
              <p
                className={cn(
                  status == "all" ? "underline" : "null",
                  "flex gap-1 items-center",
                )}
              >
                <Inbox />
                All
              </p>
            </Button>
            <Button
              size={"sm"}
              variant={status == "all" ? "secondary" : "default"}
              onClick={() => setStatus("trash")}
            >
              <p
                className={cn(
                  status == "all" ? "null" : "underline",
                  "flex gap-1 items-center",
                )}
              >
                <LucideTrash2 />
                Trash
              </p>
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-full">
        <ScrollArea className="max-h-[60vh] overflow-y-scroll">
          <DataTable columns={blogsColumns} data={blogs} />
        </ScrollArea>
        <div className="flex justify-end gap-2 p-2 items-center">
          <Select onValueChange={(value) => setLimit(Number(value))}>
            <SelectTrigger className="w-[120px] p-2">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"10"}>10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            size={"lg"}
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Prev
          </Button>
          <Button
            size={"lg"}
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}