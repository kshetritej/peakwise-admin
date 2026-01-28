"use client";

import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ImageUp, LucideGitGraph } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  Suspense,
} from "react";
import { Controller, useForm } from "react-hook-form";
import dynamic from "next/dynamic";
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
import ImageUploader from "@/components/post/image-uploader";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

import "react-quill-new/dist/quill.snow.css";

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
  const [contentValue, setContentValue] = useState("");
  const [categories, setCategories] = useState<BlogCategoryType[]>([]);
  const [authors, setAuthors] = useState<AuthorType[]>([]);
  const [countries, setCountries] = useState([
    { id: "us", name: "United States", handle: "usa" },
    { id: "np", name: "Nepal", handle: "nepal" },
  ]);
  const [showSEOFields, setShowSEOFields] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [contentImg, setContentImg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [publish, setPublish] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [selectedCountry, setSelectedCountry] = useState("");

  const quillRef = useRef<any>(null);

  const { register, handleSubmit, formState, reset, getValues, control } =
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
        content: contentValue || "",
        published: "",
        publishedAt: "",
      },
    });

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/blog-category?limit=99`
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/author?page=1&limit=999`);
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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/${slug}`
        );
        if (!res.ok) throw new Error("Failed to fetch blog data");

        const blog = await res.json();

        reset({
          title: blog.title || "",
          slug: blog.slug || "",
          category: blog.category || "",
          writerId: blog.writerId || "",
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          tags: blog.tags || "",
        });
        setSelectedCategory(blog.category || "");
        setSelectedAuthor(blog.writerId || "");

        if (blog.content) setContentValue(blog.content);
        if (blog.coverImage) setCoverImage(blog.coverImage);

        // setPublish(blog.published || true);
        setSelectedCategory(blog.category || "");
        setSelectedAuthor(blog.writerId || "");
        setSelectedCountry(blog.country || "");

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
    [reset]
  );

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
    if (slug) fetchBlogData(slug);
  }, [fetchCategories, fetchAuthors, fetchBlogData, slug]);

  // Insert image into ReactQuill editor
  useEffect(() => {
    if (!contentImg || !quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);

    if (range) {
      editor.insertEmbed(range.index, "image", contentImg);
      editor.setSelection(range.index + 1);
    } else {
      editor.insertEmbed(editor.getLength(), "image", contentImg);
    }

    setContentImg("");
  }, [contentImg]);

  // Submit blog
  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const payload = {
        ...data,
        content: contentValue,
        coverImage,
        category: data.category, // fixed: send ID
        writerId: data.writerId,
        // published: true, //fixed publish true
        // publishedAt: new Date().toISOString(),
      };

      const endpoint = slug
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/update/${slug}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/`;

      const response = await fetch(endpoint, {
        method: slug ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          content: contentValue,
          coverImage,
          category: selectedCategory,
          writerId: selectedAuthor,
          country: selectedCountry,
          // publishedAt: publish ? new Date().toISOString() : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to save blog");
      }

      toast.success(
        slug ? "Post updated successfully!" : "Post created successfully!"
      );
      router.push("/admin/posts");
    } catch (error: any) {
      console.error("Error saving blog:", error);
      toast.error(
        error.message || "Something went wrong while saving the blog"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        {/* Header and action buttons */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl">
            {slug ? "Edit Post" : "Add New Post"}
          </h2>
          <div className="btn-group flex gap-1 justify-center items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => setShowSEOFields(!showSEOFields)}
                >
                  <LucideGitGraph/>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle SEO Configuration</TooltipContent>
            </Tooltip>
            {slug && (
              <Button
                size="lg"
                variant="ghost"
                type="button"
                onClick={() => router.push("/admin/blogs")}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="lg"
              variant="secondary"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
            {!slug && (
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                onClick={() => {
                  handleSubmit(onSubmit)();
                }}
              >
                Publish
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[100vh] p-4">
          {/* SEO Fields */}
          <fieldset
            className={cn(
              showSEOFields ? "flex flex-col gap-1" : "hidden",
              "border p-4 rounded-md mb-4"
            )}
          >
            <legend className="font-bold text-lg">SEO</legend>
            <div className="flex flex-col gap-1">
              <Label htmlFor="coverImage" className="font-bold text-sm">
                Cover Image (Featured)
              </Label>
              <ImageUploader cover setImg={setCoverImage} />
              {coverImage && (
                <Image height={400} width={400} alt="" src={coverImage} />
              )}
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
            <div className="flex flex-col gap-1">
              <Label htmlFor="tags" className="font-bold text-sm">
                Keywords <span className="text-xs">(Comma separated)</span>
              </Label>
              <Input {...register("tags")} />
            </div>
          </fieldset>

          {/* Blog Title */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="title" className="font-bold text-sm">
              Title
            </Label>
            <Input {...register("title")} />
          </div>

          {/* Slug, Category, Author */}
          <div className="flex gap-1 w-full my-4">
            <div className="flex flex-col gap-1 w-full">
              <Label htmlFor="slug" className="font-bold text-sm">
                Slug
              </Label>
              <Input {...register("slug")} />
            </div>

            {/* City Dropdown */}
            <div className="flex flex-col gap-1 w-full">
              <Label htmlFor="cityId" className="font-bold text-sm">
                Country
              </Label>
              <Controller
                control={control}
                name="country"
                defaultValue=""
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCountry(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Cities</SelectLabel>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.handle}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-1 w-full">
              <Label htmlFor="category" className="font-bold text-sm">
                Category
              </Label>
              <Controller
                control={control}
                name="category"
                defaultValue=""
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCategory(value); // always ID
                    }}
                  >
                    <SelectTrigger>
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
                defaultValue=""
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedAuthor(value);
                    }}
                  >
                    <SelectTrigger>
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
            <div className="flex">
              <ImageUploader setImg={setContentImg} cover={false} />
              <ReactQuill
                // @ts-expect-error types
                ref={quillRef}
                className="flex-1 h-[70vh]"
                theme="snow"
                value={contentValue}
                onChange={setContentValue}
              />
            </div>
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
