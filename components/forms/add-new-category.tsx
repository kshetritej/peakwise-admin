"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "sonner";

type AddNewCategoryFormProps = {
  setIsDialogOpen: (arg: boolean) => void;
  editCategory?: { id: string; name: string; slug: string }; // ✅ optional for edit
  refreshCategories?: () => void; // ✅ optional callback to refresh table
};

export default function AddNewCategoryForm({
  setIsDialogOpen,
  editCategory,
  refreshCategories,
}: AddNewCategoryFormProps) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  // ✅ Populate form if editing
  useEffect(() => {
    if (editCategory) {
      reset({
        name: editCategory.name,
        slug: editCategory.slug,
      });
    }
  }, [editCategory, reset]);

  async function onSubmit(data: any) {
    try {
      const endpoint = editCategory
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/blog-category/${editCategory.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/blog-category`;

      const method = editCategory ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result?.message || "Something went wrong");

      toast.success(editCategory ? "Category updated!" : "Category added!");
      setIsDialogOpen(false);
      if (refreshCategories) refreshCategories();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save category");
    }
  }

  return (
    <form
      className="space-y-4 max-w-xl p-4 rounded-sm -mt-8"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input {...register("name")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">
          Category Handle (Unique identifier for each category)
        </Label>
        <Input placeholder="" {...register("slug")} />
      </div>
      <Button size={"lg"} className="w-full">
        {editCategory ? "Update" : "Add"}
      </Button>
    </form>
  );
}
