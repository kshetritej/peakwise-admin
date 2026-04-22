"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

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

type Testimonial = {
  id: string;
  author: string;
  content: string;
  rating: number;
  createdAt: string;
};

type TestimonialFormValues = {
  author: string;
  content: string;
  rating: string;
};

export default function Testimonials() {
  const searchParams = useSearchParams();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentTestimonialId, setCurrentTestimonialId] = useState<
    string | null
  >(null);
  const [pagination, setPagination] = useState<TPagination>();
  const [page, setPage] = useState<number>(
    Number(searchParams.get("page")) || 1,
  );
  const [limit, setLimit] = useState<number>(
    Number(searchParams.get("limit")) || 10,
  );

  const { register, handleSubmit, reset } = useForm<TestimonialFormValues>({
    defaultValues: { author: "", content: "", rating: "" },
  });

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/testimonial`,
        {
          cache: "no-store",
        },
      );

      if (!res.ok) throw new Error();
      const data = await res.json();
      setTestimonials(data);
      setPagination(data);
    } catch {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [page, limit, searchParams]);

  const openCreateDialog = () => {
    setIsEdit(false);
    setCurrentTestimonialId(null);
    reset({ author: "", content: "", rating: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setIsEdit(true);
    setCurrentTestimonialId(testimonial.id);
    reset({
      author: testimonial.author,
      content: testimonial.content,
      rating: String(testimonial.rating),
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: TestimonialFormValues) => {
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/testimonial/${currentTestimonialId}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/testimonial`;
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...data, rating: Number(data.rating) }),
    });
    const resJson = await res.json();

    if (res.ok) {
      toast.success(
        resJson.message ||
          (isEdit
            ? "Testimonial updated successfully!"
            : "Testimonial added successfully!"),
      );
      setIsDialogOpen(false);
      fetchTestimonials();
    } else {
      toast.error(resJson?.message || "Something went wrong!");
    }
  };

  const deleteTestimonial = async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/testimonial/${id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      },
    );
    const data = await res.json();
    if (res.ok) {
      toast.success(data?.message || "Testimonial deleted successfully!");
      fetchTestimonials();
    } else {
      toast.error(data?.message || "Something went wrong!");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground">
            Manage your testimonials here.
          </p>
        </div>
        <Button size="lg" onClick={openCreateDialog}>
          <LucidePlus className="mr-2" size={18} />
          Add New Testimonial
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableCaption>A list of testimonials.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>S.N</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : testimonials.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No testimonials found.
              </TableCell>
            </TableRow>
          ) : (
            testimonials.map((testimonial, index) => (
              <TableRow key={testimonial.id}>
                <TableCell>{(page - 1) * limit + index + 1}</TableCell>
                <TableCell className="font-medium">
                  {testimonial.author}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {testimonial.content}
                </TableCell>
                <TableCell>{testimonial.rating} / 5</TableCell>
                <TableCell>
                  {new Date(testimonial.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="flex gap-4">
                  <Button size="lg" onClick={() => openEditDialog(testimonial)}>
                    <Edit3 size={12} />
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => {
                      setCurrentTestimonialId(testimonial.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2Icon size={12} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
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
            onValueChange={(v) => {
              setLimit(Number(v));
              setPage(1);
            }}
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
              {isEdit ? "Edit Testimonial" : "Add New Testimonial"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isEdit
                ? "Update the testimonial details."
                : "Add a new testimonial from a customer."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input {...register("author")} type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea {...register("content")} rows={4} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1–5)</Label>
              <Input
                {...register("rating")}
                type="number"
                min={1}
                max={5}
                required
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader className="p-4">
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              This will permanently delete the testimonial. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (currentTestimonialId)
                  deleteTestimonial(currentTestimonialId);
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
