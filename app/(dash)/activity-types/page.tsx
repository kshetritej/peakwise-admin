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

type TripTypeForm = {
  tripTypeName: string;
  tripTypeHandle: string;
};

export default function TripTypes() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tripTypes, setTripTypes] = useState<any[]>([]);
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
  const [currentTripTypeId, setCurrentTripTypeId] = useState<string | null>(
    null
  );

  const [tripTypeImageLink, setTripTypeImageLink] = useState<string | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, reset } = useForm<TripTypeForm>({
    defaultValues: {
      tripTypeName: "",
      tripTypeHandle: "",
    },
  });

  const fetchTripTypes = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/trip-type?page=${page}&limit=${limit}`,
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error();
      const data = await res.json();

      setTripTypes(data.data.tripTypes);
      setPagination(data.data.pagination);
    } catch {
      toast.error("Failed to load trip types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripTypes();
  }, [page, limit]);

  const openCreateDialog = () => {
    setIsEdit(false);
    setCurrentTripTypeId(null);
    reset({ tripTypeName: "", tripTypeHandle: "" });
    setTripTypeImageLink(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (tripType: any) => {
    setIsEdit(true);
    setCurrentTripTypeId(tripType.id);
    reset({
      tripTypeName: tripType.tripTypeName,
      tripTypeHandle: tripType.tripTypeHandle,
    });
    setTripTypeImageLink(tripType.tripTypeImage ?? null);
    setIsDialogOpen(true);
  };

  const handleImageChange = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    setTripTypeImageLink(null);

    try {
      const imageUrl = await uploadImageToCloudflare(file);
      setTripTypeImageLink(imageUrl);
      toast.success("Image uploaded successfully");
    } catch (err: any) {
      toast.error(err?.message || "Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: TripTypeForm) => {
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/trip-type/${currentTripTypeId}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/trip-type`;

    const method = isEdit ? "PATCH" : "POST";

    const payload: any = {
      ...data,
      ...(tripTypeImageLink && { tripTypeImage: tripTypeImageLink }),
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
          ? "Trip type updated successfully"
          : "Trip type added successfully"
      );
      setIsDialogOpen(false);
      fetchTripTypes();
    } else {
      toast.error(resJson?.message || "Something went wrong");
    }
  };

  const deleteTripType = async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/trip-type/${id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    const data = await res.json();

    if (res.ok) {
      toast.success(data?.message || "Trip type deleted");
      fetchTripTypes();
    } else {
      toast.error(data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-semibold text-xl">Trip Types</h4>
        <Button size="lg" onClick={openCreateDialog}>
          <LucidePlus className="mr-2" size={18} />
          Add New Type
        </Button>
      </div>

      <Table>
        <TableCaption>A list of trip types.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>S.N</TableHead>
            <TableHead>Thumbnail</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Handle</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tripTypes.map((tripType, index) => (
            <TableRow key={tripType.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {tripType.tripTypeImage && (
                  <img
                    src={tripType.tripTypeImage}
                    alt={tripType.tripTypeName}
                    className="h-10 w-10 object-cover rounded-md"
                  />
                )}
              </TableCell>
              <TableCell className="font-medium">
                {tripType.tripTypeName}
              </TableCell>
              <TableCell>{tripType.tripTypeHandle}</TableCell>
              <TableCell>
                {new Date(tripType.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex gap-4">
                <Button size="lg" onClick={() => openEditDialog(tripType)}>
                  <Edit3 size={12} />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    setCurrentTripTypeId(tripType.id);
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
              {isEdit ? "Edit Trip Type" : "Add New Trip Type"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the trip type details."
                : "Create a new trip type."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-2">
              <Label>Trip Type Name</Label>
              <Input {...register("tripTypeName")} required />
            </div>

            <div className="space-y-2">
              <Label>Trip Type Handle</Label>
              <Input {...register("tripTypeHandle")} required />
            </div>

            <div className="space-y-2">
              <Label>Trip Type Image</Label>

              {tripTypeImageLink && (
                <img
                  src={tripTypeImageLink}
                  className="h-20 w-20 object-cover rounded-md"
                />
              )}

              <Input
                type="file"
                disabled={isUploading}
                onChange={(e) => handleImageChange(e.target.files?.[0])}
              />

              {isUploading && (
                <p className="text-sm text-blue-500">Uploading image...</p>
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
                if (currentTripTypeId) deleteTripType(currentTripTypeId);
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
