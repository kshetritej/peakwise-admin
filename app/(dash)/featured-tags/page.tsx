"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type FeaturedTagForm = {
  name: string;
  slug: string;
  description?: string;
};

export default function FeaturedTags() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [featuredTags, setFeaturedTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page") ?? "1")
  );
  const [limit, setLimit] = useState<number>(
    Number(searchParams.get("limit") ?? "10")
  );
  const [pagination, setPagination] = useState<TPagination>();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentTagSlug, setCurrentTagSlug] = useState<string | null>(null);
  const [currentTagId, setCurrentTagId] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<FeaturedTagForm>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const fetchFeaturedTags = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/featured?page=${page}&limit=${limit}`,
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error();
      const data = await res.json();

      setFeaturedTags(data.data.featuredTags);
      setPagination(data.data.pagination);
    } catch {
      toast.error("Failed to load featured tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedTags();
  }, [page, limit]);

  const openCreateDialog = () => {
    setIsEdit(false);
    setCurrentTagSlug(null);
    setCurrentTagId(null);
    reset({ name: "", slug: "", description: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (tag: any) => {
    setIsEdit(true);
    setCurrentTagSlug(tag.slug);
    setCurrentTagId(tag.id);
    reset({
      name: tag.name,
      slug: tag.slug,
      description: tag.description ?? "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: FeaturedTagForm) => {
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/featured/${currentTagSlug}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/featured`;

    const method = isEdit ? "PATCH" : "POST";

    const payload: any = {
      ...data,
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const resJson = await res.json();

    if (res.ok) {
      toast.success(
        isEdit
          ? "Featured tag updated successfully"
          : "Featured tag added successfully"
      );
      setIsDialogOpen(false);
      fetchFeaturedTags();
    } else {
      toast.error(resJson?.message || "Something went wrong");
    }
  };

  const deleteFeaturedTag = async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/featured/${id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    const data = await res.json();

    if (res.ok) {
      toast.success(data?.message || "Featured tag deleted");
      fetchFeaturedTags();
    } else {
      toast.error(data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-semibold text-xl">Featured Tags</h4>
        <Button size="lg" onClick={openCreateDialog}>
          <LucidePlus className="mr-2" size={18} />
          Add New Tag
        </Button>
      </div>

      <Table>
        <TableCaption>A list of featured tags.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>S.N</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {featuredTags.map((tag, index) => (
            <TableRow key={tag.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium">{tag.name}</TableCell>
              <TableCell>{tag.slug}</TableCell>
              <TableCell className="max-w-xs truncate">
                {tag.description || "—"}
              </TableCell>
              <TableCell>
                {new Date(tag.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex gap-4">
                <Button size="lg" onClick={() => openEditDialog(tag)}>
                  <Edit3 size={12} />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    setCurrentTagId(tag.id);
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
            size="lg"
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
            size="lg"
            onClick={() => setPage(page + 1)}
            disabled={page === pagination?.totalPages}
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Featured Tag" : "Add New Featured Tag"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the featured tag details."
                : "Create a new featured tag."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-2">
              <Label>Tag Name</Label>
              <Input {...register("name")} required />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input {...register("slug")} required />
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                {...register("description")}
                placeholder="Add a description for this tag..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="submit" size="lg">
                {isEdit ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (currentTagId) deleteFeaturedTag(currentTagId);
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