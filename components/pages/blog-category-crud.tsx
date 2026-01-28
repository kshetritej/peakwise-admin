"use client";

import { TPagination } from "@/app/(dash)/types/pagination";
import AddNewCategoryForm from "../forms/add-new-category";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Edit3, LucidePlus, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

async function deleteBlogCategory(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/blog-category/${id}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const data = await res.json();
  if (res.ok) {
    toast.success(data?.message || "Category deleted successfully");
  } else {
    toast.error(data?.message || "Something went wrong! We are working on it.");
  }
}

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [catId, setCatId] = useState("");
  const [pagination, setPagination] = useState<TPagination>();
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const fetchCategories = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/blog-category?page=${page}&limit=${limit}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    setCategories(data?.categories || []);
    setPagination(data?.pagination);
  };

  useEffect(() => {
    fetchCategories();
  }, [page, limit, fetchCategories]);

  return (
    <div>
      <div className="flex justify-between items-center pb-4">
        <p className="font-bold text-xl py-2">List of Categories</p>

        {/* ADD BUTTON */}
        <Button
          size="lg"
          onClick={() => {
            setEditCategory(null);
            setIsDialogOpen(true);
          }}
          className="flex gap-1 items-center"
        >
          <LucidePlus /> Add New Category
        </Button>
      </div>

      <Table>
        <TableCaption>A list of categories.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>S.N</TableHead>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Handle</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.map((category, index) => (
            <TableRow key={category.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>{category.slug}</TableCell>
              <TableCell>
                {new Date(category.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex gap-4">
                {/* EDIT BUTTON */}
                <Button
                  onClick={() => {
                    setEditCategory(category);
                    setIsDialogOpen(true);
                  }}
                  className="rounded-sm"
                >
                  <Edit3 size={16} />
                </Button>

                {/* DELETE BUTTON */}
                <Button
                  variant="secondary"
                  className="rounded-sm"
                  onClick={() => {
                    setIsDeleteDialogOpen(true);
                    setCatId(category.id);
                  }}
                >
                  <Trash2Icon size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
       <div className="flex justify-between items-center mt-6">
        <p className="text-sm">
        Page {page} of {pagination?.totalPages}
        </p>
        <div className="flex items-center gap-3">
          <Button
            size="lg"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft size={16} /> Prev
          </Button>

          <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
            <SelectTrigger className="w-24 p-6">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>

          <Button
            size="lg"
            onClick={() => setPage(page + 1)}
            disabled={page === pagination?.totalPages}
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader className="p-4">
            <DialogTitle>
              {editCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Categories are used to categorize the content in bundles.
            </DialogDescription>
          </DialogHeader>

          <AddNewCategoryForm
            setIsDialogOpen={setIsDialogOpen}
            editCategory={editCategory}
            refreshCategories={fetchCategories}
          />
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader className="p-4">
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              This will permanently delete the item and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="secondary"
              onClick={async () => {
                await deleteBlogCategory(catId);
                fetchCategories();
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}