"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Edit3,
  LucidePlus,
  Trash2Icon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { TPagination } from "@/app/(dash)/types/pagination";
import { uploadImageToCloudflare } from "@/app/actions/uploadImageToCloudflare";

type Category = {
  id: string;
  categoryName: string;
  categoryHandle: string;
};

export default function TripCategories() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCatId, setCurrentCatId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<TPagination>();
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page")) || 1
  );
  const [limit, setLimit] = useState<number>(
    Number(searchParams.get("limit")) || 10
  );

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { categoryName: "", categoryHandle: "" },
  });
  const [categoryImageLink, setCategoryImageLink] = useState<string | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/trip-category?page=${page}&limit=${limit}`,
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();

      setCategories(data.data.tripCategories);
      setPagination(data.data.pagination);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, limit]);

  // Open dialog for creating
  const openCreateDialog = () => {
    setIsEdit(false);
    setCurrentCatId(null);
    reset({ categoryName: "", categoryHandle: "" });
    setCategoryImageLink(null);
    setIsDialogOpen(true);
  };

  // Open dialog for editing
  const openEditDialog = (category: any) => {
    setIsEdit(true);
    setCurrentCatId(category.id);
    reset({
      categoryName: category.categoryName,
      categoryHandle: category.categoryHandle,
    });
    setCategoryImageLink(null);
    setIsDialogOpen(true);
  };

  const handleImageChange = async (file: any) => {
    if (!file) return;
    setIsUploading(true);
    setCategoryImageLink(null);
    try {
      const imageUrl = await uploadImageToCloudflare(file);
      setCategoryImageLink(imageUrl);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle create/update submit
  const onSubmit = async (data: any) => {
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/trip-category/${currentCatId}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/trip-category`;
    const method = isEdit ? "PATCH" : "POST";

    const payload: any = { ...data };
    if (categoryImageLink) payload.categoryImage = categoryImageLink;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const resJson = await res.json();

    if (res.ok) {
      toast.success(
        resJson.message || isEdit
          ? "Category updated successfully!"
          : "Category added successfully!"
      );
      setIsDialogOpen(false);
      fetchCategories();
    } else {
      const err = await res.json();
      toast.error(err?.message || "Something went wrong!");
    }
  };

  // Handle delete
  const deleteCategory = async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/trip-category/${id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    const data = await res.json();
    if (res.ok) {
      toast.success(data?.message || "Category deleted successfully!");
      fetchCategories();
    } else {
      toast.error(data?.message || "Something went wrong!");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-semibold text-xl">Trip Categories</h4>
        <Button size={"lg"} onClick={openCreateDialog}>
          <LucidePlus className="mr-2" size={18} />
          Add New Category
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableCaption>A list of trip categories.</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>S.N</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Handle</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.map((category, index) => (
            <TableRow key={category.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {category.categoryImage && (
                  <img
                    src={category.categoryImage}
                    alt={category.categoryName}
                    className="h-10 w-10 object-cover rounded-md"
                  />
                )}
              </TableCell>
              <TableCell className="font-medium">
                {category.categoryName}
              </TableCell>
              <TableCell>{category.categoryHandle}</TableCell>
              <TableCell>
                {new Date(category.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex gap-4">
                <Button size={"lg"} onClick={() => openEditDialog(category)}>
                  <Edit3 size={12} />
                </Button>
                <Button
                  size={"lg"}
                  variant="secondary"
                  onClick={() => {
                    setCurrentCatId(category.id);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2Icon size={12} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end items-center mt-6">
        <div className="flex items-center gap-3">
          <Button
            size={"lg"}
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft size={16} /> Prev
          </Button>

          <Select
            value={String(limit)}
            onValueChange={(v) => setLimit(Number(v))}
          >
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
            size={"lg"}
            disabled={page === pagination?.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isEdit
                ? "Update the category details."
                : "Add a new category for grouping activities."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input {...register("categoryName")} type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryHandle">Category Handle (Unique)</Label>
              <Input {...register("categoryHandle")} type="text" required />
            </div>
            <div className="space-y-2">
              <Label>Category Image</Label>
              {categoryImageLink && (
                <div className="mb-2">
                  <img
                    src={categoryImageLink}
                    className="h-20 w-20 object-cover rounded-md mt-1"
                    alt="Category Preview"
                  />
                </div>
              )}
              <Input
                type="file"
                onChange={(e) => handleImageChange(e.target.files?.[0])}
                disabled={isUploading}
              />
              {isUploading && (
                <p className="text-sm text-orange-500">
                  Uploading image, please wait...
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" size="lg">
                {isEdit ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader className="p-4">
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              This will permanently delete the category. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (currentCatId) deleteCategory(currentCatId);
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
