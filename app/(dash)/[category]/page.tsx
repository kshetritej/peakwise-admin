"use client";

import dynamic from "next/dynamic";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function LegalEditor({ params }: any) {
  const resolvedObject = use(params);

  // @ts-expect-error category doesn't exist in resolvedObject 
  const category = resolvedObject?.category

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchDoc() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/legal/${category}`,
          { cache: "no-store", credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          setTitle(data?.data?.title || "");
          setContent(data?.data?.content || "");
        } else {
          setTitle("");
          setContent("");
        }
      } catch (err) {
        console.error("Failed to fetch legal doc", err);
      }
    }
    fetchDoc();
  }, [category]);

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/legal/${category}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, slug: category }),
        }
      );

      if (res.ok) {
        router.refresh();
        toast.success("Saved");
      } else {
        const err = await res.json();
        console.error(err);
        toast.error(err?.message || "Failed to save");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">
          Edit{" "}
          {category
            .split("_")
            .map(
              (word: any) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ")}
        </h3>
        <div className="flex gap-2">
          <Button onClick={onSave} disabled={saving} size="lg">
            Save
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <Label>Content</Label>
        <div className="min-h-[360px]">
          <ReactQuill theme="snow" value={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}
