"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "./data-table";
import { Plus } from "lucide-react";
import { infoPagesColumns } from "./columns";
import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";

type Pagination = {
  page?: number;
  totalPages: number;
};

type InfoPageCategory = {
  id: string;
  categoryHandle: string;
  categoryName: string | null;
};

export default function InfoPages() {
  const [status, setStatus] = useState("all");
  const [infoPages, setInfoPages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<Pagination>({ totalPages: 1 });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<InfoPageCategory[]>([]);

  useEffect(() => {
    async function fetchInfoPages() {
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (status !== "all")
          params.set("published", String(status === "published"));
        if (selectedCategory !== "all")
          params.set("categoryId", selectedCategory);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/info-page?${params.toString()}`,
          {
            cache: "no-store",
            credentials: "include",
          },
        );
        const data = await response.json();
        setPagination(data?.pagination ?? { totalPages: 1 });
        setInfoPages(data?.infoPages ?? []);
      } catch (error) {
        console.error("Failed to fetch info pages:", error);
        setInfoPages([]);
        setPagination({ totalPages: 1 });
      }
    }
    fetchInfoPages();
  }, [selectedCategory, status, page, limit]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/info-page/categories?limit=99`,
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

  return (
    <div>
      <div className="flex flex-col pb-4">
        <div className="flex justify-between gap-12">
          <h3 className="font-bold text-lg">Info Pages</h3>
          <Link href={"/info-pages/edit"}>
            <Button size={"lg"}>
              <Plus /> Create New
            </Button>
          </Link>
        </div>

        <div className="flex justify-between">
          {/* Status filter */}
          <div className="py-4 flex items-center gap-2">
            {["all", "published", "draft"].map((s) => (
              <Button
                key={s}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
                variant={"secondary"}
                className={cn(
                  s === status
                    ? "bg-primary text-primary-foreground hover:text-black! hover:bg-primary/80!"
                    : "cursor-pointer hover:text-black!",
                )}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.categoryName ?? cat.categoryHandle}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-full">
        <ScrollArea className="max-h-[60vh] overflow-y-scroll">
          <DataTable columns={infoPagesColumns} data={infoPages} />
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
