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
} from "lucide-react";

import { uploadImageToCloudflare } from "@/app/actions/uploadImageToCloudflare";
import { getFullImageUrl } from "@/lib/getFullImageUrl";

type TeamMemberForm = {
  name: string;
  designation: string;
  about: string;
  departmentId: string;
};

type Department = {
  id: string;
  name: string;
};

type TeamMember = {
  id: string;
  name: string;
  designation: string;
  about: string;
  image?: string;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
  };
};

export default function TeamMemberList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<TeamMemberForm>({
    defaultValues: { 
      name: "", 
      designation: "", 
      about: "",
      departmentId: ""
    },
  });

  const [memberImageLink, setMemberImageLink] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const selectedDepartmentId = watch("departmentId");

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/department`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDepartments(data.data);
    } catch {
      toast.error("Failed to load departments");
    }
  };

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/team`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      // Convert grouped data to flat array
      const grouped = data.data;
      const flatArray: TeamMember[] = [];
      
      Object.keys(grouped).forEach((deptId) => {
        flatArray.push(...grouped[deptId]);
      });
      
      setTeamMembers(flatArray);
    } catch {
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchTeamMembers();
  }, []);

  // ================= DIALOGS =================
  const openCreateDialog = () => {
    setIsEdit(false);
    setCurrentMemberId(null);
    reset({ 
      name: "", 
      designation: "", 
      about: "",
      departmentId: ""
    });
    setMemberImageLink(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (member: TeamMember) => {
    setIsEdit(true);
    setCurrentMemberId(member.id);
    reset({
      name: member.name,
      designation: member.designation,
      about: member.about,
      departmentId: member.departmentId || "",
    });
    setMemberImageLink(member.image ?? null);
    setIsDialogOpen(true);
  };

  const handleImageChange = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    setMemberImageLink(null);

    try {
      const imageUrl = await uploadImageToCloudflare(file);
      setMemberImageLink(imageUrl);
      toast.success("Image uploaded successfully");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: TeamMemberForm) => {
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/team/${currentMemberId}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/team`;

    const method = isEdit ? "PATCH" : "POST";

    const payload: any = { ...data };
    if (memberImageLink) payload.image = memberImageLink;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const resJson = await res.json();

    if (res.ok) {
      toast.success(
        isEdit ? "Team member updated successfully" : "Team member added successfully"
      );
      setIsDialogOpen(false);
      fetchTeamMembers();
    } else {
      toast.error(resJson?.message || "Something went wrong");
    }
  };

  const deleteTeamMember = async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/team/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await res.json();

    if (res.ok) {
      toast.success(data?.message || "Team member deleted!");
      fetchTeamMembers();
    } else {
      toast.error(data?.message || "Delete failed");
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-semibold text-xl">Team Members</h4>
        <Button size="lg" onClick={openCreateDialog}>
          <LucidePlus className="mr-2" size={18} />
          Add New Team Member
        </Button>
      </div>

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>S.N</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>About</TableHead>
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
                  <Skeleton className="h-10 w-10 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))
          ) : teamMembers.length > 0 ? (
            teamMembers.map((member, index) => (
              <TableRow key={member.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {member.image ? (
                    <img
                      src={getFullImageUrl(member.image)}
                      className="h-10 w-10 object-cover rounded-md"
                      alt={member.name}
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-500">NoImg</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.designation}</TableCell>
                <TableCell>
                  {member.department?.name || <span className="text-gray-400">—</span>}
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">
                    {member.about}
                  </div>
                </TableCell>
                <TableCell className="flex gap-4">
                  <Button size="lg" onClick={() => openEditDialog(member)}>
                    <Edit3 size={12} />
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => {
                      setCurrentMemberId(member.id);
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
              <TableCell colSpan={7} className="text-center py-10">
                No team members found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Team Member" : "Add New Team Member"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Update the team member details." : "Create a new team member."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Member Image</Label>

              {memberImageLink && (
                <img
                  src={getFullImageUrl(memberImageLink)}
                  className="h-24 w-24 object-cover rounded-md"
                  alt="Member Preview"
                />
              )}

              <Input
                type="file"
                disabled={isUploading}
                onChange={(e) => handleImageChange(e.target.files?.[0])}
                accept="image/*"
              />

              {isUploading && (
                <p className="text-sm text-blue-500">Uploading image...</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...register("name")} required />
            </div>

            <div className="space-y-2">
              <Label>Designation</Label>
              <Input {...register("designation")} required />
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={selectedDepartmentId}
                onValueChange={(value) => setValue("departmentId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>About</Label>
              <Textarea 
                {...register("about")} 
                required
                placeholder="Tell us about this team member..."
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button type="submit" size="lg" disabled={isUploading}>
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
                if (currentMemberId) deleteTeamMember(currentMemberId);
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