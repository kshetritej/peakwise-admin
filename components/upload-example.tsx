"use client";
import React, { useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { ImageIcon, X } from "lucide-react";
import { uploadImageToCloudflare } from "@/app/actions/uploadImageToCloudflare";
import { Label } from "./ui/label";
import { LucideUpload } from "lucide-react";
import Image from "next/image";
import { getFullImageUrl } from "@/lib/getFullImageUrl";

const UploadExample = ({
  setImg,
  cover,
  existingImage,
}: {
  setImg: (url: string) => void;
  cover?: boolean;
  existingImage?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>(existingImage || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Upload to Cloudflare
      const imageUrl = await uploadImageToCloudflare(file);
      setImg(imageUrl);
      toast.success("Image uploaded successfully");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed");
      setPreview(""); // Clear preview on error
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    e.target.value = "";
  };

  const handleButtonClick = () => fileInputRef.current?.click();

  const clearPreview = () => {
    setPreview("");
    setImg("");
  };

  return cover ? (
    <div className="flex flex-col gap-2">
      <Input
        id="coverImage"
        hidden
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {preview || existingImage ? (
        <div className="relative w-fit border rounded-md overflow-hidden">
          <Image
            // @ts-expect-error dynamic src
            src={getFullImageUrl(preview || existingImage)}
            alt="Preview"
            width={400}
            height={300}
            className="w-100 h-auto object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={clearPreview}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
          {loading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white">Uploading...</span>
            </div>
          )}
        </div>
      ) : (
        <Label
          htmlFor="coverImage"
          className="p-8 bg-primary/10 border-dotted border-2 border-secondary hover:border-sky-900 flex flex-col items-center justify-center rounded-md cursor-pointer transition-colors"
        >
          <LucideUpload className="h-8 w-8 mb-2" />
          <span className="text-sm text-muted-foreground">
            Click to upload cover image
          </span>
        </Label>
      )}
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <Input
        accept="image/*"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={handleButtonClick}
          variant="ghost"
          size="icon"
          title="Add Image"
          disabled={loading}
        >
          {loading ? "..." : <ImageIcon className="h-6 w-6" />}
        </Button>

        {preview && (
          <div className="relative inline-block">
            <Image
              src={preview}
              alt="Preview"
              width={60}
              height={60}
              className="rounded border object-cover"
            />
            {loading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                <span className="text-white text-xs">...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadExample;
