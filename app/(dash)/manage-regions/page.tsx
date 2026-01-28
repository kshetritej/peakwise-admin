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

type RegionForm = {
  regionName: string;
  regionHandle: string;
};

export default function Regions() {
  const router = useRouter();
  const searchParams = useSearchParams();

  Number(searchParams.get("limit") ?? "10")

  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TPagination>();
  const [page, setPage] = useState<number>(Number(searchParams.get("page") ?? "1"));
  const [limit, setLimit] = useState<number>(Number(searchParams.get("limit") ?? "10"));

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentRegionId, setCurrentRegionId] = useState<string | null>(null);

  const [regionImageLink, setRegionImageLink] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, reset } = useForm<RegionForm>({
    defaultValues: {
      regionName: "",
      regionHandle: "",
    },
  });

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/region?page=${page}&limit=${limit}`,
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error();
      const data = await res.json();

      setRegions(data.data.regions);
      setPagination(data.data.pagination);
    } catch {
      toast.error("Failed to load regions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, [page, limit]);

  const openCreateDialog = () => {
    setIsEdit(false);
    setCurrentRegionId(null);
    reset({ regionName: "", regionHandle: "" });
    setRegionImageLink(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (region: any) => {
    setIsEdit(true);
    setCurrentRegionId(region.id);
    reset({
      regionName: region.regionName,
      regionHandle: region.regionHandle,
    });
    setRegionImageLink(region.regionImage ?? null);
    setIsDialogOpen(true);
  };

  const handleImageChange = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    setRegionImageLink(null);

    try {
      const imageUrl = await uploadImageToCloudflare(file);
      setRegionImageLink(imageUrl);
      toast.success("Image uploaded successfully");
    } catch (err: any) {
      toast.error(err?.message || "Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: RegionForm) => {
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/region/${currentRegionId}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/region`;

    const method = isEdit ? "PATCH" : "POST";

    const payload: any = {
      ...data,
      ...(regionImageLink && { regionImage: regionImageLink }),
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
        isEdit ? "Region updated successfully" : "Region added successfully"
      );
      setIsDialogOpen(false);
      fetchRegions();
    } else {
      toast.error(resJson?.message || "Something went wrong");
    }
  };

  const deleteRegion = async (id: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/region/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(data?.message || "Region deleted");
      fetchRegions();
    } else {
      toast.error(data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-semibold text-xl">Regions</h4>
        <Button size="lg" onClick={openCreateDialog}>
          <LucidePlus className="mr-2" size={18} />
          Add New Region
        </Button>
      </div>

      <Table>
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
          {regions.map((region, index) => (
            <TableRow key={region.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {region.regionImage && (
                  <img
                    src={region.regionImage}
                    alt={region.regionName}
                    className="h-10 w-10 object-cover rounded-md"
                  />
                )}
              </TableCell>
              <TableCell className="font-medium">{region.regionName}</TableCell>
              <TableCell>{region.regionHandle}</TableCell>
              <TableCell>{new Date(region.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="flex gap-4">
                <Button size="lg" onClick={() => openEditDialog(region)}>
                  <Edit3 size={12} />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    setCurrentRegionId(region.id);
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Region" : "Add New Region"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Update region details." : "Create a new region."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-2">
              <Label>Region Name</Label>
              <Input {...register("regionName")} required />
            </div>

            <div className="space-y-2">
              <Label>Region Handle</Label>
              <Input {...register("regionHandle")} required />
            </div>

            <div className="space-y-2">
              <Label>Region Image</Label>
              {regionImageLink && (
                <img src={regionImageLink} className="h-20 w-20 object-cover rounded-md" />
              )}

              <Input
                type="file"
                disabled={isUploading}
                onChange={(e) => handleImageChange(e.target.files?.[0])}
              />

              {isUploading && <p className="text-sm text-blue-500">Uploading image...</p>}
            </div>

            <DialogFooter>
              <Button type="submit" size="lg">{isEdit ? "Update" : "Add"}</Button>
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
                if (currentRegionId) deleteRegion(currentRegionId);
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
