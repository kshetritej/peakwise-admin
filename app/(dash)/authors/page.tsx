"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideEdit3,
  LucidePlus,
  LucideTrash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

type Author = {
  id: string;
  name: string;
  email: string;
  image?: string;
  status?: string;
};

export default function Authors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [authorId, setAuthorId] = useState<string>("");
  const [pagination, setPagination] = useState<any>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const deleteAuthor = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/author/delete/${authorId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    if (!res.ok) {
      toast.error("Failed to delete author. Try again later.");
      return;
    }

    toast.success("Author removed successfully");
    setAuthors((prev) => prev.filter((a) => a.id !== authorId));
  };

  useEffect(() => {
    async function fetchAuthors() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/author?page=${page}&limit=${limit}`
      );
      const json = await res.json();
      setAuthors(json?.data ?? []);
      setPagination(json?.pagination);
    }

    fetchAuthors();
  }, [page, limit]);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Authors</h2>

          <Link href="/authors/create">
            <Button size="lg">
              <LucidePlus className="mr-2 size-4" />
              Add New Author
            </Button>
          </Link>
        </div>

        {/* Table */}
        <ScrollArea className="rounded-md bg-background h-[80vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {authors.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No authors found.
                  </TableCell>
                </TableRow>
              )}

              {authors.map((author) => (
                <TableRow key={author.id}>
                  {/* Author Image */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {author.image ? (
                        <Image
                          src={author.image}
                          width={40}
                          height={40}
                          alt={`${author.name}'s profile picture`}
                          className="rounded-sm object-cover size-12"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-sm border" />
                      )}
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell>{author.email}</TableCell>

                  {/* Name */}
                  <TableCell>{author.name}</TableCell>

                  {/* Status */}
                  <TableCell>
                    {author.status ?? (
                      <Badge className="bg-green-700">Active</Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/authors/create?authorId=${author.id}`}
                      >
                        <Button
                          size="icon"
                          variant="secondary"
                          className="rounded-sm"
                        >
                          <LucideEdit3 className="size-4" />
                        </Button>
                      </Link>

                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-sm"
                        onClick={() => {
                          setAuthorId(author.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <LucideTrash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="flex flex-col md:flex-row justify-between gap-1 items-center mt-8">
          <p className="text-sm">
            Page {pagination?.page} of {pagination?.totalPages}
          </p>
          <div className="flex gap-4 items-center justify-center">
            <Button disabled={page == 1} onClick={() => setPage(page - 1)}>
              <LucideChevronLeft /> Prev
            </Button>

            <Select
              value={String(limit)}
              onValueChange={(value) => setLimit(Number(value))}
            >
              <SelectTrigger className="p-6 w-[100px]">
                <SelectValue placeholder={"Items per page"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="40">40</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setPage(page + 1)}
              disabled={page == pagination?.totalPages}
            >
              Next
              <LucideChevronRight />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteAuthor();
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
