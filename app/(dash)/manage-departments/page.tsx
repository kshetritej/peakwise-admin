"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
} from "lucide-react";

type DepartmentForm = {
  name: string;
  description?: string;
};

type Department = {
  id: string;
  name: string;
  description?: string;
  teams?: any[];
  createdAt?: string;
};

export default function DepartmentList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentDepartmentId, setCurrentDepartmentId] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<DepartmentForm>({
    defaultValues: { name: "", description: "" },
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/department`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDepartments(data.data);
    } catch {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // ================= DIALOGS =================
  const openCreateDialog = () => {
    setIsEdit(false);
    setCurrentDepartmentId(null);
    reset({ name: "", description: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (department: Department) => {
    setIsEdit(true);
    setCurrentDepartmentId(department.id);
    reset({
      name: department.name,
      description: department.description || "",
    });
    setIsDialogOpen(true);
  };

  // ================= SUBMIT =================
  const onSubmit = async (data: DepartmentForm) => {
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/department/${currentDepartmentId}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/department`;

    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const resJson = await res.json();

    if (res.ok) {
      toast.success(
        isEdit ? "Department updated successfully" : "Department added successfully"
      );
      setIsDialogOpen(false);
      fetchDepartments();
    } else {
      toast.error(resJson?.message || "Something went wrong");
    }
  };

  const deleteDepartment = async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/department/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await res.json();

    if (res.ok) {
      toast.success(data?.message || "Department deleted!");
      fetchDepartments();
    } else {
      toast.error(data?.message || "Delete failed");
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-semibold text-xl">Departments</h4>
        <Button size="lg" onClick={openCreateDialog}>
          <LucidePlus className="mr-2" size={18} />
          Add New Department
        </Button>
      </div>

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>S.N</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Team Members</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))
          ) : departments.length > 0 ? (
            departments.map((department, index) => (
              <TableRow key={department.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell>
                  {department.description || <span className="text-gray-400">—</span>}
                </TableCell>
                <TableCell>
                  {department.teams?.length || 0}
                </TableCell>
                <TableCell className="flex gap-4">
                  <Button size="lg" onClick={() => openEditDialog(department)}>
                    <Edit3 size={12} />
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => {
                      setCurrentDepartmentId(department.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2Icon size={12} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                No departments found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Department" : "Add New Department"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Update the department details." : "Create a new department."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-2">
              <Label>Department Name</Label>
              <Input {...register("name")} required />
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea 
                {...register("description")} 
                placeholder="Enter department description..."
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

      {/* DELETE DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (currentDepartmentId) deleteDepartment(currentDepartmentId);
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