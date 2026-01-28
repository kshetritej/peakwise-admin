"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

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

type CityForm = {
  cityName: string;
  cityHandle: string;
};

export default function CityList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [page, setPage] = useState<number>(
    Number(searchParams.get("page") ?? "1")
  );
  const [limit, setLimit] = useState<number>(
    Number(searchParams.get("limit") ?? "10")
  );
  const [pagination, setPagination] = useState<TPagination>();

  const [cities, setCities] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCityId, setCurrentCityId] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<CityForm>({
    defaultValues: { cityName: "", cityHandle: "" },
  });

  const [cityImageLink, setCityImageLink] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/city?page=${page}&limit=${limit}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCities(data.data.cities);
      setPagination(data.data.pagination);
    } catch {
      toast.error("Failed to load cities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [page, limit]);


  // ================= DIALOGS =================
  const openCreateDialog = () => {
    setIsEdit(false);
    setCurrentCityId(null);
    reset({ cityName: "", cityHandle: "" });
    setCityImageLink(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (city: any) => {
    setIsEdit(true);
    setCurrentCityId(city.id);
    reset({
      cityName: city.cityName,
      cityHandle: city.cityHandle,
    });
    setCityImageLink(city.cityImage ?? null);
    setIsDialogOpen(true);
  };

  const handleImageChange = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    setCityImageLink(null);

    try {
      const imageUrl = await uploadImageToCloudflare(file);
      setCityImageLink(imageUrl);
      toast.success("Image uploaded successfully");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // ================= SUBMIT =================
  const onSubmit = async (data: CityForm) => {
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/city/${currentCityId}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/city`;

    const method = isEdit ? "PATCH" : "POST";

    const payload: any = { ...data };
    if (cityImageLink) payload.cityImage = cityImageLink;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const resJson = await res.json();

    if (res.ok) {
      toast.success(
        isEdit ? "Destination updated successfully" : "Destination added successfully"
      );
      setIsDialogOpen(false);
      fetchCities();
    } else {
      toast.error(resJson?.message || "Something went wrong");
    }
  };

  const deleteCity = async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/city/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await res.json();

    if (res.ok) {
      toast.success(data?.message || "Destination deleted!");
      fetchCities();
    } else {
      toast.error(data?.message || "Delete failed");
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-semibold text-xl">Cities</h4>
        <Button size="lg" onClick={openCreateDialog}>
          <LucidePlus className="mr-2" size={18} />
          Add New Destination 
        </Button>
      </div>

      {/* TABLE */}
      <Table>
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
          {loading ? (
            Array.from({ length: limit }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-10 w-10 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))
          ) : cities.length > 0 ? (
            cities.map((city, index) => (
              <TableRow key={city.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {city.cityImage && (
                    <img
                      src={city.cityImage}
                      className="h-10 w-10 object-cover rounded-md"
                      alt={city.cityName}
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">{city.cityName}</TableCell>
                <TableCell>{city.cityHandle}</TableCell>
                <TableCell>
                  {new Date(city.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="flex gap-4">
                  <Button size="lg" onClick={() => openEditDialog(city)}>
                    <Edit3 size={12} />
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => {
                      setCurrentCityId(city.id);
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
              <TableCell colSpan={6} className="text-center py-10">
                No cities found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* PAGINATION */}
      <div className="flex justify-end items-center mt-6 gap-3">
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

      {/* ADD / EDIT DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Destination" : "Add New Destination"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Update the city details." : "Create a new city."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-2">
              <Label>Destination Name</Label>
              <Input {...register("cityName")} required />
            </div>

            <div className="space-y-2">
              <Label>Destination Handle</Label>
              <Input {...register("cityHandle")} required />
            </div>

            <div className="space-y-2">
              <Label>Destination Image</Label>

              {cityImageLink && (
                <img
                  src={cityImageLink}
                  className="h-20 w-20 object-cover rounded-md"
                  alt="Destination Preview"
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
                if (currentCityId) deleteCity(currentCityId);
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
