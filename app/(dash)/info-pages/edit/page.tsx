"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import UploadExample from "@/components/upload-example";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ScanSearch } from "lucide-react";
import { useCallback, useEffect, useState, Suspense } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuillField } from "@/lib/quill/quill-field";
import "react-quill-new/dist/quill.snow.css";
import { generateSlug } from "@/lib/generateSlug";

type InfoPageCategory = {
  id: string;
  categoryHandle: string;
  categoryName: string | null;
};

const InfoPageFormInner = () => {
  const [categories, setCategories] = useState<InfoPageCategory[]>([]);
  const [showSEOFields, setShowSEOFields] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { register, handleSubmit, reset, getValues, setValue, control } =
    useForm({
      defaultValues: {
        title: "",
        slug: "",
        content: "",
        coverImage: "",
        metaTitle: "",
        metaDescription: "",
        published: false,
        infoPageCategoryId: "",
      },
    });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/info-page/categories?limit=99`,
      );
      const data = await res.json();
      setCategories(data?.categories ?? []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  const fetchInfoPageData = useCallback(
    async (pageId: string) => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/info-page/${pageId}`,
        );
        if (!res.ok) throw new Error("Failed to fetch info page data");

        const data = await res.json();
        const infoPage = data.infoPage;

        reset({
          title: infoPage.title ?? "",
          slug: infoPage.slug ?? "",
          content: infoPage.content ?? "",
          coverImage: infoPage.coverImage ?? "",
          metaTitle: infoPage.metaTitle ?? "",
          metaDescription: infoPage.metaDescription ?? "",
          published: infoPage.published ?? false,
          infoPageCategoryId: infoPage.infoPageCategoryId ?? "",
        });

        if (infoPage.coverImage) setCoverImage(infoPage.coverImage);
        if (infoPage.metaTitle || infoPage.metaDescription)
          setShowSEOFields(true);
      } catch (error) {
        console.error("Failed to fetch info page:", error);
        toast.error("Failed to load info page data");
      } finally {
        setIsLoading(false);
      }
    },
    [reset],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (id && categories.length > 0) {
      fetchInfoPageData(id);
    }
  }, [id, categories.length, fetchInfoPageData]);

  const onSubmit = async (data: any, shouldPublish: boolean = false) => {
    try {
      setIsLoading(true);

      const endpoint = id
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/info-page/${id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/info-page/`;
      const method = id ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          coverImage,
          published: shouldPublish,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to save info page");
      }

      toast.success(
        shouldPublish
          ? "Info page published successfully!"
          : id
            ? "Info page updated successfully!"
            : "Info page saved as draft!",
      );
      router.back();
    } catch (error: any) {
      console.error("Error saving info page:", error);
      toast.error(
        error.message || "Something went wrong while saving the page",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl">
            {id ? "Edit Info Page" : "Add New Info Page"}
          </h2>
          <div className="btn-group flex gap-1 justify-center items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => setShowSEOFields(!showSEOFields)}
                >
                  <ScanSearch />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle SEO Configuration</TooltipContent>
            </Tooltip>
            <Button
              size="lg"
              variant="ghost"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              variant="secondary"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save as Draft"}
            </Button>
            <Button
              type="button"
              size="lg"
              disabled={isLoading}
              onClick={handleSubmit((data) => onSubmit(data, true))}
            >
              {isLoading ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>

        <ScrollArea className="h-screen p-4">
          {/* SEO Fields */}
          <fieldset
            className={cn(
              showSEOFields ? "flex flex-col gap-1" : "hidden",
              "border p-4 rounded-md mb-4",
            )}
          >
            <legend className="font-bold text-lg">SEO</legend>
            <div className="flex flex-col gap-1">
              <Label htmlFor="coverImage" className="font-bold text-sm">
                Cover Image (Featured)
              </Label>
              <UploadExample
                cover
                setImg={setCoverImage}
                existingImage={coverImage || ""}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="metaTitle" className="font-bold text-sm">
                Meta Title
              </Label>
              <Input {...register("metaTitle")} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="metaDescription" className="font-bold text-sm">
                Meta Description
              </Label>
              <Input {...register("metaDescription")} />
            </div>
          </fieldset>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="title" className="font-bold text-sm">
              Title
            </Label>
            <Input {...register("title")} />
          </div>

          {/* Slug + Category */}
          <div className="grid grid-cols-2 gap-1 w-full my-4">
            <div className="flex flex-col gap-1 w-full">
              <Label htmlFor="slug" className="font-bold text-sm">
                Slug
              </Label>
              <div className="flex gap-1 items-center">
                <Input {...register("slug")} />
                <Button
                  type="button"
                  onClick={() =>
                    setValue("slug", generateSlug(getValues("title")))
                  }
                >
                  Generate from Title
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <Label htmlFor="infoPageCategoryId" className="font-bold text-sm">
                Category
              </Label>
              <Controller
                control={control}
                name="infoPageCategoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categories</SelectLabel>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.categoryName ?? cat.categoryHandle}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content" className="font-bold text-sm">
              Content
            </Label>
            <QuillField minHeight={400} name="content" control={control} />
          </div>
        </ScrollArea>
      </div>
    </form>
  );
};

export default function InfoPageForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InfoPageFormInner />
    </Suspense>
  );
}
