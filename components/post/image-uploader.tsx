"use client";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import {
  uploadImageToCloudflare,
  uploadMultipleImagesToLocal,
} from "@/app/actions/uploadImageToCloudflare";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { LucideImage } from "lucide-react";
import { Label } from "../ui/label";

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-primary"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const ImageUploader = ({
  setImg,
  cover,
}: {
  setImg: (url: string) => void;
  cover?: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
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
      const imageUrl = await uploadMultipleImagesToLocal([file], "blogCover");
      setImg(imageUrl);
      // Only show preview after successful upload
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      toast.success("Image uploaded successfully");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Auto-triggers upload as soon as a file is selected
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleButtonClick = () => fileInputRef.current?.click();

  if (cover) {
    return (
      <div className="flex flex-col gap-1 flex-start border p-4 rounded-md">
        {/* Hidden input — auto-uploads on change, no Upload button needed */}
        <Input
          id="coverImage"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Click area */}
        <div
          onClick={!loading ? handleButtonClick : undefined}
          className={`border border-dashed p-8 w-full rounded-sm flex flex-col items-center justify-center gap-4 transition-all delay-0 duration-200 ${
            loading
              ? "cursor-not-allowed opacity-70"
              : "hover:border-primary cursor-pointer hover:underline"
          }`}
        >
          {loading ? (
            <>
              <Spinner />
              <span className="text-sm text-muted-foreground">Uploading…</span>
            </>
          ) : (
            <>
              <LucideImage />
              <span>Browse</span>
            </>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div className="relative mt-2 rounded-md overflow-hidden border">
            <img
              src={preview}
              alt="Preview"
              className={`w-full object-cover max-h-48 transition-opacity duration-300 ${
                loading ? "opacity-50 animate-pulse" : "opacity-100"
              }`}
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                <Spinner />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Inline (non-cover) variant
  return (
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
          {loading ? <Spinner /> : <LucideImage className="h-6 w-6" />}
        </Button>

        {/* Inline preview */}
        {preview && (
          <div className="relative rounded-md overflow-hidden border h-10 w-10 flex-shrink-0">
            <img
              src={preview}
              alt="Preview"
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                loading ? "opacity-50 animate-pulse" : "opacity-100"
              }`}
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                <Spinner />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
