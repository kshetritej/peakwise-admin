"use client";

import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadImageToCloudflare } from "@/app/actions/uploadImageToCloudflare";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { LucideImage } from "lucide-react";

const ImageUploader = ({
  setImg,
  cover,
}: {
  setImg: (url: string) => void;
  cover?: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (fileToUpload?: File) => {
    let file: File | undefined = fileToUpload;

    if (!file) {
      const el = fileInputRef.current;
      if (!el || !el.files || el.files.length === 0) {
        toast.error("Please select a file to upload.");
        return;
      }
      file = el.files[0];
    }

    setLoading(true);
    try {
      // ✅ Use predefined Cloudflare upload method
      const imageUrl = await uploadImageToCloudflare(file);

      // ✅ Stop here after receiving URL
      setImg(imageUrl);

      toast.success("Image uploaded successfully");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleButtonClick = () => fileInputRef.current?.click();

  return cover ? (
    <div className="flex flex-col gap-1 flex-start border p-4 rounded-md">
      <Input type="file" ref={fileInputRef} />
      <Button
        type="button"
        onClick={() => handleUpload()}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload file"}
      </Button>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <Input
          accept="image/*"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          type="button"
          onClick={handleButtonClick}
          variant="ghost"
          size="icon"
          title="Add Image"
          disabled={loading}
        >
          {loading ? "..." : <LucideImage className="h-6 w-6" />}
        </Button>
      </div>
    </div>
  );
};

export default ImageUploader;
