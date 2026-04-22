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

type BlogCategoryType = {
  id: string;
  name: string;
  slug: string;
};

type AuthorType = {
  id: string;
  name: string;
  username?: string;
};

const BlogFormInner = () => {
  const [categories, setCategories] = useState<BlogCategoryType[]>([]);
  const [authors, setAuthors] = useState<AuthorType[]>([]);
  const [showSEOFields, setShowSEOFields] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const { register, handleSubmit, reset, getValues, setValue, control } =
    useForm({
      defaultValues: {
        coverImage: "",
        title: "",
        slug: "",
        category: "",
        country: "",
        writerId: "",
        metaTitle: "",
        metaDescription: "",
        tags: "",
        content: "",
        published: false,
        publishedAt: "",
      },
    });

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/blog-category?limit=99`,
      );
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  // Fetch authors
  const fetchAuthors = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/author?page=1&limit=999`,
      );
      const data = await res.json();
      setAuthors(data?.data || []);
    } catch (error) {
      console.error("Failed to fetch authors:", error);
    }
  }, []);

  // Fetch blog for edit
  const fetchBlogData = useCallback(
    async (slug: string) => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/${slug}`,
        );
        if (!res.ok) throw new Error("Failed to fetch blog data");

        const blog = await res.json();

        // Extract IDs from nested objects
        const categoryId = blog.blogCategoryId || blog.category?.id || "";
        const authorId = blog.writerId || blog.writer?.id || "";

        // Reset all form fields including dropdowns
        reset({
          title: blog.title || "",
          slug: blog.slug || "",
          category: categoryId,
          writerId: authorId,
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          tags: blog.tags || "",
          coverImage: blog.coverImage || "",
          content: blog.content || "",
          published: blog.published || false,
          publishedAt: blog.publishedAt || "",
        });

        if (blog.coverImage) setCoverImage(blog.coverImage);

        if (blog.metaTitle || blog.metaDescription || blog.tags) {
          setShowSEOFields(true);
        }
      } catch (error) {
        console.error("Failed to fetch blog:", error);
        toast.error("Failed to load blog data");
      } finally {
        setIsLoading(false);
      }
    },
    [reset],
  );

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
  }, [fetchCategories, fetchAuthors]);

  // Fetch blog data after categories and authors are loaded
  useEffect(() => {
    if (slug && categories.length > 0 && authors.length > 0) {
      fetchBlogData(slug);
    }
  }, [slug, categories.length, authors.length, fetchBlogData]);

  // Submit blog with publish status
  const onSubmit = async (data: any, shouldPublish: boolean = false) => {
    try {
      setIsLoading(true);

      const endpoint = slug
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/update/${slug}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/`;

      const response = await fetch(endpoint, {
        method: slug ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          coverImage,
          blogCategoryId: data.category,
          writerId: data.writerId, // Include author ID
          published: shouldPublish,
          publishedAt: shouldPublish
            ? new Date().toISOString()
            : data.publishedAt,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to save blog");
      }

      toast.success(
        shouldPublish
          ? "Blog published successfully!"
          : slug
            ? "Blog updated successfully!"
            : "Blog saved as draft!",
      );
      router.back();
    } catch (error: any) {
      console.error("Error saving blog:", error);
      toast.error(
        error.message || "Something went wrong while saving the blog",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
      <div>
        {/* Header and action buttons */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl">
            {slug ? "Edit Blog" : "Add New Blog"}
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
              <Label htmlFor="tags" className="font-bold text-sm">
                Cover Image Alt
              </Label>
              <Input {...register("tags")} />
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
            {/* <div className="flex flex-col gap-1">
              <Label htmlFor="tags" className="font-bold text-sm">
                Keywords <span className="text-xs">(Comma separated)</span>
              </Label>
              <Input {...register("tags")} />
            </div> */}
          </fieldset>

          {/* Blog Title */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="title" className="font-bold text-sm">
              Title
            </Label>
            <Input {...register("title")} />
          </div>

          {/* Slug, Category, Author */}
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

            {/* Category Dropdown */}
            <div className="flex flex-col gap-1 w-full">
              <Label htmlFor="category" className="font-bold text-sm">
                Category
              </Label>
              <Controller
                control={control}
                name="category"
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
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Author Dropdown */}
            <div className="flex flex-col gap-1 w-full">
              <Label htmlFor="writerId" className="font-bold text-sm">
                Author
              </Label>
              <Controller
                control={control}
                name="writerId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Authors</SelectLabel>
                        {authors.map((author) => (
                          <SelectItem key={author.id} value={author.id}>
                            {author.name || author.username}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <Label htmlFor="content" className="font-bold text-sm">
              Content
            </Label>
            <QuillField minHeight={400} name="content" control={control} />
            {/* <div className="flex">
              <UploadExample setImg={setContentImg} cover={false} />
              <ReactQuill
                // @ts-expect-error types
                ref={quillRef}
                className="flex-1 h-[70vh]"
                theme="snow"
                value={contentValue}
                onChange={setContentValue}
              />
            </div> */}
          </div>
        </ScrollArea>
      </div>
    </form>
  );
};

export default function EnhancedBlogForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogFormInner />
    </Suspense>
  );
}
