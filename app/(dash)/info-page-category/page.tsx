"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface InfoPageCategory {
  id: string;
  categoryHandle: string;
  categoryName: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { infoPages: number };
}

interface FormState {
  categoryHandle: string;
  categoryName: string;
}

export default function InfoPageCategories() {
  const [categories, setCategories] = useState<InfoPageCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    categoryHandle: "",
    categoryName: "",
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/info-page/categories?${params.toString()}`,
        {
          cache: "no-store",
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data?.categories ?? []);
      setTotalPages(data?.pagination?.totalPages ?? 1);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, limit]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ categoryHandle: "", categoryName: "" });
    setDialogOpen(true);
  };

  const openEdit = (cat: InfoPageCategory) => {
    setEditingId(cat.id);
    setForm({
      categoryHandle: cat.categoryHandle,
      categoryName: cat.categoryName ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.categoryHandle.trim()) {
      toast.error("Handle is required");
      return;
    }
    try {
      setFormLoading(true);
      const endpoint = editingId
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/info-page/categories/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/info-page/categories`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save");

      toast.success(editingId ? "Category updated!" : "Category created!");
      setDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (cat: InfoPageCategory) => {
    if (
      !confirm(
        `Delete "${cat.categoryName ?? cat.categoryHandle}"?${
          (cat._count?.infoPages ?? 0) > 0
            ? ` It has ${cat._count!.infoPages} page(s) assigned.`
            : ""
        }`,
      )
    )
      return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/info-page/categories/${cat.id}`,
      {
        method: "DELETE",
        cache: "no-store",
      },
    );
    const data = await res.json();
    if (res.ok) {
      toast.success(data?.message || "Category deleted");
      fetchCategories();
    } else {
      toast.error(data?.message || "Something went wrong");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold">Info Page Categories</h1>
          <p className="text-muted-foreground">
            Manage categories for your info pages
          </p>
        </div>
        <Button size="lg" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Create New
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Card className="rounded-sm">
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-sm">
          <CardContent>
            <Table>
              <TableCaption>
                {categories.length === 0
                  ? "No categories found"
                  : `Showing ${categories.length} categor${categories.length === 1 ? "y" : "ies"}`}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">S.N</TableHead>
                  <TableHead>Handle</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Pages</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FolderOpen className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No categories yet. Create one to get started.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat, index) => (
                    <TableRow key={cat.id}>
                      <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                          {cat.categoryHandle}
                        </span>
                      </TableCell>
                      <TableCell>
                        {cat.categoryName ?? (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {cat._count?.infoPages ?? 0} pages
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(cat.createdAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(cat)}
                        >
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(cat)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {categories.length > 0 && (
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft size={16} /> Prev
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>

            <Select
              value={String(limit)}
              onValueChange={(v) => {
                setLimit(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages || loading}
            >
              Next <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="font-bold text-sm">
                Handle{" "}
                <span className="text-muted-foreground font-normal text-xs">
                  (unique, lowercase, hyphenated)
                </span>
              </Label>
              <Input
                value={form.categoryHandle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryHandle: e.target.value }))
                }
                placeholder="e.g. getting-started"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="font-bold text-sm">Name</Label>
              <Input
                value={form.categoryName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryName: e.target.value }))
                }
                placeholder="Display name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={formLoading}>
              {formLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
