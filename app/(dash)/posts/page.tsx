"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { Plus } from "lucide-react";
import { blogsColumns } from "./columns";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

type Pagination = {
  page?: number;
  totalPages: number;
};

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
};

export default function Blogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<Pagination>({ totalPages: 1 });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  // "all" | "trash"
  const [view, setView] = useState<"all" | "trash">("all");

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        let url: string;
        if (view === "trash") {
          params.set("trash", "true");
          url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs?${params.toString()}`;
        } else if (selectedCategory !== "all") {
          url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/category/${selectedCategory}?${params.toString()}`;
        } else {
          url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs?${params.toString()}`;
        }

        const response = await fetch(url, {
          cache: "no-store",
          credentials: "include",
        });
        const data = await response.json();
        setPagination(data?.pagination ?? { totalPages: 1 });
        setBlogs(data?.data ?? []);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
        setBlogs([]);
        setPagination({ totalPages: 1 });
      }
    }
    fetchBlogs();
  }, [view, selectedCategory, page, limit]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/blog-category`,
          {
            cache: "no-store",
            credentials: "include",
          },
        );
        const data = await res.json();
        setCategories(data?.categories ?? []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategories();
  }, []);

  const totalPages: number = pagination?.totalPages ?? 1;

  const handleViewChange = (next: "all" | "trash") => {
    setView(next);
    setSelectedCategory("all");
    setPage(1);
  };

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setView("all");
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-col pb-4">
        <div className="flex justify-between gap-12">
          <h3 className="font-bold text-lg">Posts</h3>
          <Link href={"/posts/edit"}>
            <Button size={"lg"}>
              <Plus /> Create New
            </Button>
          </Link>
        </div>

        <div className="flex justify-between items-center py-4">
          {/* Status + Category filters */}
          <div className="flex items-center gap-2">
            {(["all", "trash"] as const).map((v) => (
              <Button
                key={v}
                onClick={() => handleViewChange(v)}
                variant={
                  view === v && selectedCategory === "all"
                    ? "default"
                    : "secondary"
                }
                className={cn(
                  view === v && selectedCategory === "all"
                    ? ""
                    : "cursor-pointer hover:text-black!",
                )}
              >
                {v === "all" ? "All" : "Trash"}
              </Button>
            ))}
          </div>

          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-w-full">
        <ScrollArea className="max-h-[60vh] overflow-y-scroll">
          <DataTable columns={blogsColumns} data={blogs} />
        </ScrollArea>
        <div className="flex justify-end gap-2 p-2 items-center">
          <Select
            onValueChange={(value) => {
              setLimit(Number(value));
              setPage(1);
            }}
          >
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
