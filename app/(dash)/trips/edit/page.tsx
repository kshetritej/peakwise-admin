"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFullImageUrl } from "@/lib/getFullImageUrl";
import { useTripStore } from "@/store/useTripStore";
import {
    LucideCloudUpload,
    LucideEdit2,
    Plus,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { Combobox } from "@/components/organisms/combo-box";
import { cleanStringArray } from "@/lib/cleanStringArray";
import {
    getCities,
    getFeaturedTags,
    getRegions,
    getTripCategories,
    getTripTypes,
} from "@/app/actions";
import { createActivitySchema } from "@/lib/validationSchemas";
import { TripDifficulty } from "@/app/(dash)/enums/tripDifficulty.enum";
import { TripFormData } from "@/app/(dash)/types/tripFormData";
import { InstructionTooltip } from "@/components/atoms/instruction-tooltip";
import InfoCard from "@/components/atoms/info-card";
import LabelDescription from "@/components/atoms/label-description";
import ListBox from "@/components/atoms/list-box";
import { MultiSelect } from "@/components/organisms/multi-select";
import { QuillField } from "@/lib/quill/quill-field";
import "react-quill-new/dist/quill.snow.css";
import { Badge } from "@/components/ui/badge";

const STEP_FIELDS = {
    1: [
        "title",
        "tripCategoryId",
        "tripTypeId",
        "shortDescription",
        "fullDescription",
    ],
    2: ["duration", "guestCapacity", "locations"],
    3: ["itinerary"],
    4: ["inclusions", "exclusions"],
    5: ["meetingPoint", "dropOffPoint"],
    6: ["highlights", "keywords", "images"],
    7: ["price"],
    8: ["additionalInfo"],
    9: ["FAQs"],
    10: ["seo"],
    11: ["Feature"],
};

function TripForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams?.get("id") || null;
    const currStep = useTripStore((s) => s.currentStep);
    const setStep = useTripStore((s) => s.setStep);
    const maxStep = 11;

    const [isEditing, setIsEditing] = useState(false);
    const [isLoadingEdit, setIsLoadingEdit] = useState(false);

    const [cities, setCities] = useState<any[]>([]);
    const [regions, setRegions] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [activityTypes, setActivityTypes] = useState<any[]>([]);
    const [featuredTags, setFeaturedTags] = useState<any[]>([]);

    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedFeaturedTags, setSelectedFeaturedTags] = useState<string[]>([]);
    const [selectedActivityType, setSelectedActivityType] = useState<
        string | null
    >(null);

    const [difficulty, setDifficulty] = useState<TripDifficulty>(
        TripDifficulty.EASY,
    );

    const difficultyOptions = Object.values(TripDifficulty).map((level) => ({
        value: level,
        label: level.charAt(0).toUpperCase() + level.slice(1).toLowerCase(),
    }));

    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const [featuredMediaUrl, setFeaturedMediaUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        trigger,
        reset,
        getValues,
        formState: { errors },
    } = useForm<TripFormData>({
        mode: "onChange",
        // @ts-expect-error Types of parameters 'options' and 'options' are incompatible.
        resolver: zodResolver(createActivitySchema),
        defaultValues: {
            title: "",
            slug: "",
            tripCategoryId: "",
            tripTypeId: "",
            cityId: "",
            regionId: "",
            shortDescription: "",
            fullDescription: "",
            duration: "",
            difficultyLevel: TripDifficulty.EASY,
            guestCapacity: 1,
            locations: "",
            inclusions: "",
            exclusions: "",
            meetingPoint: "",
            dropOffPoint: "",
            price: 0,
            highlights: "",
            keywords: "",
            faqs: [{ question: "", answer: "" }],
            itinerary: [{ day: 1, title: "", description: "" }],
            additionalInfo: [{ title: "", description: "" }],
            seo: {
                metaTitle: "",
                metaDescription: "",
                featuredMedia: "",
                schema: "",
                metaKeywords: "",
                metaRobots: "",
                metaAuthor: "",
            },
        },
    });

    const {
        fields: itineraryFields,
        append: addItinerary,
        remove: removeItinerary,
    } = useFieldArray({ control, name: "itinerary" });
    const {
        fields: infoFields,
        append: addInfo,
        remove: removeInfo,
    } = useFieldArray({ control, name: "additionalInfo" });
    const {
        fields: faqFields,
        append: addFaq,
        remove: removeFaq,
    } = useFieldArray({ control, name: "faqs" });

    // Fetch options
    useEffect(() => {
        (async () => {
            try {
                const [catData, typeData, cityData, regionData, featuredTagsData] = await Promise.all([
                    getTripCategories(),
                    getTripTypes(),
                    getCities(),
                    getRegions(),
                    getFeaturedTags(),
                ]);
                setCategories(catData?.data?.tripCategories || []);
                setActivityTypes(typeData?.data?.tripTypes || []);
                setCities(cityData?.data?.cities || []);
                setRegions(regionData?.data?.regions || []);
                setFeaturedTags(featuredTagsData?.data?.featuredTags || [])
            } catch (e) {

                console.error("Failed to fetch options", e);
            }
        })();
    }, []);

    const categoryOptions = categories.map((c) => ({
        value: c.id,
        label: c.categoryName,
    }));

    const featuredTagsOptions = featuredTags.map((f) => ({
        value: f.id,
        label: f.name,
    }))

    const activityTypeOptions = activityTypes.map((a) => ({
        value: a.id,
        label: a.tripTypeName,
    }));
    const cityOptions = cities.map((c) => ({ value: c.id, label: c.cityName }));
    const regionOptions = regions.map((r) => ({
        value: r.id,
        label: r.regionName,
    }));

    // Edit mode
    useEffect(() => {
        if (!editId) return;
        setIsLoadingEdit(true);
        (async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/activity/${editId}`,
                );
                if (!res.ok) throw new Error("Failed to fetch activity");
                const activity = (await res.json()).data;
                const mapped = {
                    ...activity,
                    faqs: activity.faqs || [{ question: "", answer: "" }],
                    itinerary: activity.itinerary || [
                        { day: 1, title: "", description: "" },
                    ],
                    additionalInfo: activity.additionalInfo || [
                        { title: "", description: "" },
                    ],
                    highlights: Array.isArray(activity.highlights)
                        ? activity.highlights.join("\n")
                        : (activity.highlights ?? ""),
                    inclusions: Array.isArray(activity.inclusions)
                        ? activity.inclusions.join("\n")
                        : (activity.inclusions ?? ""),
                    exclusions: Array.isArray(activity.exclusions)
                        ? activity.exclusions.join("\n")
                        : (activity.exclusions ?? ""),
                    keywords: Array.isArray(activity.keywords)
                        ? activity.keywords.join(", ")
                        : (activity.keywords ?? ""),
                    locations: Array.isArray(activity.locations)
                        ? activity.locations.join(", ")
                        : (activity.locations ?? ""),
                    seo: activity.seo || {
                        metaTitle: "",
                        metaDescription: "",
                        featuredMedia: "",
                        schema: "",
                        metaKeywords: "",
                        metaRobots: "",
                        metaAuthor: "",
                    },
                };
                reset(mapped);
                setUploadedUrls(activity.images || []);
                setSelectedCategory(activity.tripCategoryId || "");
                setDifficulty(activity.difficultyLevel || TripDifficulty.EASY);
                setSelectedActivityType(activity.tripTypeId || "");
                setSelectedCity(activity.cityId || "");
                setSelectedRegion(activity.regionId || "");
                if (activity.featuredTags && Array.isArray(activity.featuredTags)) {
                    const tagIds = activity.featuredTags.map((tag: any) => tag.id);
                    setSelectedFeaturedTags(tagIds);
                }
                setFeaturedMediaUrl(activity.seo.featuredMedia);
                setIsEditing(true);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingEdit(false);
            }
        })();
    }, [editId, reset]);

    // Handle file upload immediately - FIXED VERSION
    const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
        e,
    ) => {
        const files = Array.from(e.target.files || []).filter(Boolean);
        if (!files.length) return;

        setIsUploading(true);
        const fd = new FormData();
        files.forEach((f) => fd.append("images", f));

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/local/multiple`,
                { method: "POST", body: fd },
            );
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();

            // Extract URLs from response - store them as returned
            const urls = (data.result || [])
                .map((r: any) => r.url)
                .filter(Boolean);

            console.log("Uploaded URLs:", urls); // Debug log

            setUploadedUrls((prev) => [...prev, ...urls]);
            toast.success(
                `Uploaded ${urls.length} image${urls.length > 1 ? "s" : ""}`,
            );
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Failed to upload images");
        } finally {
            setIsUploading(false);
        }
    };

    // method for handling seo media upload - FIXED VERSION
    const handleMediaChange = async (file: File) => {
        if (!file) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload/local`,
                {
                    method: "POST",
                    body: formData,
                },
            );

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            const data = await res.json();

            console.log("Featured media URL:", data.url); // Debug log

            setFeaturedMediaUrl(data.url);
            toast.success("Featured media uploaded successfully");
        } catch (error) {
            console.error("Media upload error:", error);
            toast.error("Failed to upload featured media");
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePreview = (index: number) => {
        setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleNextStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (isUploading) return;
        const stepFields = STEP_FIELDS[currStep as keyof typeof STEP_FIELDS] || [];
        const isStepValid = await trigger(stepFields as any);
        if (!isStepValid) return;
        if (currStep < maxStep) setStep(currStep + 1);
    };

    const handlePrevStep = () => {
        if (currStep > 1) setStep(currStep - 1);
    };

    const onSubmit = async (data: TripFormData) => {
        const payload = {
            ...data,
            tripCategoryId: selectedCategory ?? undefined,
            tripTypeId: selectedActivityType ?? undefined,
            cityId: selectedCity ?? undefined,
            regionId: selectedRegion ?? undefined,
            images: uploadedUrls,
            difficultyLevel: difficulty,
            keywords: cleanStringArray(data.keywords, ","),
            locations: cleanStringArray(data.locations, ","),
            highlights: cleanStringArray(data.highlights, "\n"),
            inclusions: cleanStringArray(data.inclusions, "\n"),
            exclusions: cleanStringArray(data.exclusions, "\n"),
            seo: { ...data.seo, featuredMedia: featuredMediaUrl },
            featuredTags: selectedFeaturedTags,
        };

        try {
            const endpoint = editId
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/activity/${editId}`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/activity/`;

            const res = await fetch(endpoint, {
                method: editId ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Submission failed");
            toast.success(
                editId ? "Trip updated successfully" : "Trip created successfully",
            );

            if (!editId) reset();
            router.push("/trips");
        } catch (err) {
            toast.error((err as any)?.message || "Submission failed");
            console.error(err);
        }
    };

    // FIXED: Use memoized previews with proper URL construction
    const renderedPreviews = useMemo(() => {
        return uploadedUrls.map(url => getFullImageUrl(url));
    }, [uploadedUrls]);

    return (
        // @ts-expect-error Argument of type '(data: TripFormData) => Promise<void>' is not assignable to parameter of type 'SubmitHandler<TFieldValues>'.
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* STEP 1 */}
            <div className={cn(currStep === 1 ? "flex flex-col gap-3" : "hidden")}>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="title">Trip Name</Label>
                    <Input
                        {...register("title", { required: "Title is required" })}
                        placeholder={"Short, descriptive, and attractive (e.g., Day Tour in Pokhara)."}
                    />
                    {errors.title && (
                        <p className="text-sm text-red-500">{errors.title.message}</p>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="slug">Slug/Trip Handle</Label>
                    <LabelDescription text="Keep it concise (under 60 characters is great, max ~250), short, simple and in kebab-case eg. annapurna-circuit-trek" />
                    <Input
                        {...register("slug", { required: "Slug is required" })}
                        placeholder="tour-title-slug"
                    />
                    {errors.title && (
                        <p className="text-sm text-red-500">{errors?.slug?.message}</p>
                    )}
                </div>

                <fieldset className="border-1 px-4 pb-4 rounded-md">
                    <legend>Trip Family</legend>
                    <div className="flex gap-1">
                        <LabelDescription text="Fields in this section can be omitted, choose the required fields to categorize them in any order." />
                        <InstructionTooltip instruction="If your trip only have category i.e. Trekking, it may not include activity type, destination or region, or it can only include region and not category, activity type or destination. This will reflect in the public facing design." />
                    </div>
                    <br />
                    <div className="flex items-start gap-8">
                        <div className="flex flex-col gap-2 w-full">
                            <Label htmlFor="category">Category</Label>
                            <LabelDescription text="Main high level type of the activity (Trekking, Luxury, Tours, Multi Country) that includes broad range of activities" />
                            <Combobox
                                options={categoryOptions}
                                value={selectedCategory ?? ""}
                                setValue={setSelectedCategory}
                                placeholder="Select Category"
                                notFoundPlaceholder="No category found."
                            />
                            {errors.tripCategoryId && (
                                <p className="text-sm text-red-500">
                                    {errors.tripCategoryId.message}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <Label htmlFor="activityType">Activity Type</Label>
                            <LabelDescription text="These are the activities travelers can expect to experience. Eg. Jungle Safari, Rafting, Hiking, etc." />
                            <Combobox
                                options={activityTypeOptions}
                                value={selectedActivityType ?? ""}
                                setValue={setSelectedActivityType}
                                placeholder="Select Activity Type"
                                notFoundPlaceholder="No activity type found."
                            />
                            {errors.tripTypeId && (
                                <p className="text-sm text-red-500">
                                    {errors.tripTypeId.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* City and Region */}
                    <div className="flex items-start gap-8">
                        <div className="flex flex-col gap-2 w-full mt-4">
                            <Label htmlFor="category">Destination</Label>
                            <LabelDescription text="These are the major destinations like country (Nepal, Bhutan, Tibet, India,etc), specific location points" />
                            <Combobox
                                options={cityOptions}
                                value={selectedCity ?? ""}
                                setValue={setSelectedCity}
                                placeholder="Select Destination"
                                notFoundPlaceholder="No destinations found."
                            />
                            {errors.cityId && (
                                <p className="text-sm text-red-500">{errors.cityId.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <Label htmlFor="activityType" className="mt-4">
                                Region
                            </Label>
                            <LabelDescription text="These are the major regions for the activity like Annapurna Region, Everest Regions,etc" />
                            <Combobox
                                options={regionOptions}
                                value={selectedRegion ?? ""}
                                setValue={setSelectedRegion}
                                placeholder="Select region"
                                notFoundPlaceholder="No region found."
                            />
                            {errors.regionId && (
                                <p className="text-sm text-red-500">
                                    {errors.regionId.message}
                                </p>
                            )}
                        </div>
                    </div>
                </fieldset>

                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <Label htmlFor="shortDescription">
                            Overview <span className="text-red-500 text-xs">*</span>
                        </Label>
                        <InstructionTooltip instruction="Write 3–5 sentences describing what travelers will do and experience on the trip." />
                    </div>
                    <QuillField name="shortDescription" control={control} />
                    {errors.shortDescription && (
                        <p className="text-sm text-red-500">
                            {errors.shortDescription.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="fullDescription">Full Description</Label>
                    <ListBox
                        list={[
                            "List the main sights, activities, or experiences included in the trip.",
                            "Indicate whether the trip is relaxed, active, or moderate.",
                            "Write a short sentence explaining what makes this trip special or different from others.",
                        ]}
                    />
                    <QuillField name={`fullDescription`} control={control} />
                    {errors.fullDescription && (
                        <p className="text-sm text-red-500">
                            {errors.fullDescription.message}
                        </p>
                    )}
                </div>
            </div>

            {/* STEP 2 */}
            <div className={cn(currStep === 2 ? "flex flex-col gap-3" : "hidden")}>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="duration">Duration</Label>
                    <LabelDescription text="Enter the total length of the trip. Eg. 8 hours or 3 Days" />
                    <Input
                        {...register("duration", { required: "Duration is required" })}
                        placeholder="Enter duration (e.g., 2 hours, 1 day)"
                    />
                    {errors.duration && (
                        <p className="text-sm text-red-500">{errors.duration.message}</p>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <LabelDescription text="Select the trip's difficulty level: Easy, Moderate, or Hard" />
                    <Combobox
                        options={difficultyOptions}
                        value={difficulty ?? ""}
                        setValue={setDifficulty}
                        placeholder="Select difficulty"
                        notFoundPlaceholder="No difficulty level found."
                    />
                    {errors.difficultyLevel && (
                        <p className="text-sm text-red-500">
                            {errors.difficultyLevel.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="guestCapacity">Trip Capacity</Label>
                    <LabelDescription text="The maximum number of participants allowed on the trip. You can also add a minimum if required." />
                    <Input
                        type="number"
                        {...register("guestCapacity", {
                            required: "Capacity is required",
                            valueAsNumber: true,
                            min: { value: 1, message: "At least 1 guest required" },
                        })}
                        placeholder="Enter guest capacity"
                    />
                    {errors.guestCapacity && (
                        <p className="text-sm text-red-500">
                            {errors.guestCapacity.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="locations">Locations (comma separated)</Label>
                    <LabelDescription
                        text="List all destinations or key places separated by commas.
          Eg: Pokhara, Sarangkot, Phewa Lake, Devi's Fall"
                    />
                    <Input
                        {...register("locations", {
                            required: "At least one location required",
                        })}
                        placeholder="Enter Location(s)"
                    />
                    {errors.locations && (
                        <p className="text-sm text-red-500">{errors.locations.message}</p>
                    )}
                </div>
            </div>

            {/* STEP 3: ITINERARY */}
            <div
                className={cn(
                    currStep === 3 ? "flex flex-col gap-2 space-y-6" : "hidden",
                )}
            >
                {itineraryFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-sm relative">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold">Day {index + 1}</h3>
                            {itineraryFields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => removeItinerary(index)}
                                >
                                    <Trash2 className="h-4 w-4 text-foreground/70" />
                                </Button>
                            )}
                        </div>

                        <Input
                            {...register(`itinerary.${index}.title` as const, {
                                required: "Day title is required",
                            })}
                            placeholder={"Give a short, descriptive title for the day. Example:  Sunrise at Sarangkot & Lakeside Tour"}
                        className="mb-3"
            />
                        <p></p>

                        {errors.itinerary?.[index]?.title && (
                            <p className="text-sm text-red-500">
                                {errors.itinerary[index].title?.message}
                            </p>
                        )}
                        <QuillField
                            placeholder="Write 2-4 sentences detailing the activities, key stops, and experiences for that day."
                            name={`itinerary.${index}.description`}
                            control={control}
                        />
                        {errors.itinerary?.[index]?.description && (
                            <p className="text-sm text-red-500">
                                {errors.itinerary[index].description?.message}
                            </p>
                        )}
                    </div>
                ))}

                <div className="flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            addItinerary({
                                day: itineraryFields.length + 1,
                                title: "",
                                description: "",
                            })
                        }
                        className="rounded-full flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Day
                    </Button>
                </div>
            </div>

            {/* STEP 4: INCLUSIONS/EXCLUSIONS */}
            <div className={cn(currStep === 4 ? "flex flex-col gap-3" : "hidden")}>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="inclusions">Inclusions (one per line)</Label>
                    <LabelDescription text="List everything that is included in the trip. Write one item per line." />
                    <QuillField
                        placeholder="Enter inclusions, one per line"
                        name={`inclusions`}
                        control={control}
                    />
                    {errors.inclusions && (
                        <p className="text-sm text-red-500">{errors.inclusions.message}</p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="exclusions">Exclusions (one per line)</Label>
                    <LabelDescription text="List everything not included in the trip. Write one item per line." />
                    <QuillField
                        placeholder="Enter exclusions, one per line"
                        name={`exclusions`}
                        control={control}
                    />
                    {errors.exclusions && (
                        <p className="text-sm text-red-500">{errors.exclusions.message}</p>
                    )}
                </div>
                <InfoCard info="Be clear and specific. Travelers should know exactly what they are paying for and what is extra." />
            </div>

            {/* STEP 5: MEETING POINTS */}
            <div className={cn(currStep === 5 ? "flex flex-col gap-3" : "hidden")}>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="meetingPoint">Meeting Point</Label>
                    <LabelDescription text="Enter the exact place where travelers should meet." />
                    <Input
                        {...register("meetingPoint", {
                            required: "Meeting point is required",
                        })}
                        placeholder="Enter meeting point"
                    />
                    {errors.meetingPoint && (
                        <p className="text-sm text-red-500">
                            {errors.meetingPoint.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="dropOffPoint">Dropoff Point</Label>
                    <LabelDescription text="Enter the location where the trip ends, or where travelers will be dropped off." />
                    <Input
                        {...register("dropOffPoint", {
                            required: "Dropoff point is required",
                        })}
                        placeholder="Enter dropoff point"
                    />
                    {errors.dropOffPoint && (
                        <p className="text-sm text-red-500">
                            {errors.dropOffPoint.message}
                        </p>
                    )}
                </div>
                <InfoCard info="Include landmarks, hotel names, or clear instructions so travelers can easily find the locations." />
            </div>

            {/* FIXED: Preview section with proper URL construction */}
            {currStep == 6 && renderedPreviews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                    {renderedPreviews.map((fullUrl, idx) => (
                        <div
                            key={fullUrl}
                            className="relative w-32 h-32 border rounded-md overflow-hidden"
                        >
                            <Image
                                fill
                                src={fullUrl}
                                alt={`preview-${idx}`}
                                className="object-cover"
                                unoptimized // Add this to avoid Next.js image optimization issues
                            />
                            <button
                                type="button"
                                onClick={() => handleRemovePreview(idx)}
                                className="absolute top-1 right-1 bg-primary/90 text-background rounded-full p-1"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* STEP 6 media upload */}
            <div className={cn(currStep == 6 ? "flex flex-col gap-3" : "hidden")}>
                <div>
                    <ListBox
                        list={[
                            "Upload clear, high-resolution images that show the destination.",
                            "Use JPEG, PNG, or WebP Format.",
                            "Make sure images are bright, well-lit, and properly framed.",
                            "Select one main thumbnail image for the trip listing.",
                            "Use real photos that represent the actual trip.",
                            "Upload at least 3 images for better experience.",
                        ]}
                    />
                </div>
                <Label htmlFor="upload_file">
                    <div
                        className={cn(
                            "w-full hover:bg-primary/10 rounded-sm border border-dashed p-8 flex flex-col items-center justify-center cursor-pointer",
                            isUploading && "opacity-50 pointer-events-none",
                        )}
                    >
                        <Upload className="h-6 w-6 mb-2" />
                        <p className="font-medium">
                            {isUploading ? "Uploading..." : "Drop your files here or browse"}
                        </p>
                        <p className="text-sm text-foreground">Max file size up to 5MB</p>
                    </div>
                </Label>
                <input
                    id="upload_file"
                    hidden
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/webp, image/avif"
                    onChange={handleFileChange}
                />

                <div className="flex flex-col gap-2">
                    <Label htmlFor="highlights">Highlights (one per line)</Label>
                    <LabelDescription text="List the key attractions and experiences." />
                    <QuillField
                        placeholder="Enter highlights, one per line"
                        name={`highlights`}
                        control={control}
                    />
                    {errors.highlights && (
                        <p className="text-sm text-red-500">{errors.highlights.message}</p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="keywords">Keywords (comma separated)</Label>
                    <LabelDescription text="Keep keywords relevant and specific to the trip. Eg: Pokhara, Sarangkot Sunrise, Phewa Lake" />
                    <Textarea
                        {...register("keywords", { required: "Keywords are required" })}
                        placeholder="Enter keywords, comma separated"
                        rows={3}
                    />
                    {errors.keywords && (
                        <p className="text-sm text-red-500">{errors.keywords.message}</p>
                    )}
                </div>
            </div>

            {/* STEP 7: PRICING */}
            <div className={cn(currStep === 7 ? "flex flex-col gap-3" : "hidden")}>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="price">Price (per person in USD)</Label>
                    <Input
                        required
                        type="number"
                        step="0.01"
                        {...register("price", {
                            required: "Price is required",
                            valueAsNumber: true,
                            min: { value: 0.01, message: "Price must be positive" },
                        })}
                        placeholder="Enter price"
                    />
                    {errors.price && (
                        <p className="text-sm text-red-500">{errors.price.message}</p>
                    )}
                </div>
            </div>

            {/* STEP 8: ADDITIONAL INFO */}
            <div className={cn(currStep === 8 ? "flex flex-col gap-2" : "hidden")}>
                <ListBox
                    list={[
                        "Write what travelers should bring (clothes, gear, etc.).",
                        "Say if the trip is good for kids, older people, or people with mobility issues.",
                        "Note any safety or health warnings.",
                        "Add other helpful tips (weather, local customs, language, etc.).",
                        "Extra Tips, if any.",
                    ]}
                />
                {infoFields.map((field, index) => (
                    <div key={field.id} className="p-4 relative border rounded-sm">
                        <div className="flex justify-end mb-3">
                            {infoFields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeInfo(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <Input
                            {...register(`additionalInfo.${index}.title` as const, {
                                required: "Title is required",
                            })}
                            placeholder="Title"
                            className="mb-3"
                        />
                        {errors.additionalInfo?.[index]?.title && (
                            <p className="text-sm text-red-500">
                                {errors.additionalInfo[index].title?.message}
                            </p>
                        )}

                        <QuillField
                            name={`additionalInfo.${index}.description`}
                            control={control}
                        />
                        {errors.additionalInfo?.[index]?.description && (
                            <p className="text-sm text-red-500">
                                {errors.additionalInfo[index].description?.message}
                            </p>
                        )}
                    </div>
                ))}
                <InfoCard info="Use clear, engaging language. Avoid all caps and excessive punctuation." />
                <div className="flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => addInfo({ title: "", description: "" })}
                        className="rounded-full flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add More Info
                    </Button>
                </div>
            </div>

            {/* Faqs */}
            <div
                className={cn(
                    currStep === 9 ? "flex flex-col gap-2 space-y-6" : "hidden",
                )}
            >
                {faqFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-sm relative">
                        <div className="flex justify-between items-center mb-3">
                            <div>{index + 1}. {getValues(`faqs.${index}.question`)}</div>
                            {faqFields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => removeFaq(index)}
                                >
                                    <Trash2 className="h-4 w-4 text-foreground/70" />
                                </Button>
                            )}
                        </div>

                        <Input
                            {...register(`faqs.${index}.question` as const, {
                                required: "Question is required",
                            })}
                            className="mb-3"
                        />
                        <p></p>

                        {errors.faqs?.[index]?.question && (
                            <p className="text-sm text-red-500">
                                {errors.faqs[index].question?.message}
                            </p>
                        )}
                        <QuillField
                            placeholder=""
                            name={`faqs.${index}.answer`}
                            control={control}
                        />
                        {errors.faqs?.[index]?.answer && (
                            <p className="text-sm text-red-500">
                                {errors.faqs[index].answer?.message}
                            </p>
                        )}
                    </div>
                ))}

                <div className="flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            addFaq({
                                question: "",
                                answer: "",
                            })
                        }
                        className=" flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Add Another
                    </Button>
                </div>
            </div>

            {/* STEP 10: SEO */}
            <div
                className={cn(currStep === 10 ? "flex flex-col gap-2 p-2" : "hidden")}
            >
                {/* Meta Title */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-1 items-center">
                        <Label htmlFor="metaTitle">Meta Title</Label>
                        <InstructionTooltip instruction="The main title shown on Google search results and browser tabs." />
                    </div>
                    <LabelDescription text="Keep it 50–60 characters. Include your primary keyword and make it readable for humans." />
                    <Input
                        {...register("seo.metaTitle")}
                        placeholder="Annapurna Circuit Trek 16 Days | Cost & Itinerary"
                    />
                    {errors.seo?.metaTitle && (
                        <p className="text-sm text-red-500">
                            {errors?.seo?.metaTitle?.message}
                        </p>
                    )}
                </div>

                {/* Meta Description */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-1 items-center">
                        <Label htmlFor="metaDescription">Meta Description</Label>
                        <InstructionTooltip instruction="A short summary shown under the title in search results." />
                    </div>
                    <LabelDescription text="Keep it 150–160 characters. Write it like an ad that encourages clicks." />
                    <Textarea
                        {...register("seo.metaDescription")}
                        placeholder="Discover affordable Nepal tour packages with local experts. Custom itineraries, trusted guides, and 24/7 support."
                    />
                    {errors.seo?.metaDescription && (
                        <p className="text-sm text-red-500">
                            {errors?.seo?.metaDescription?.message}
                        </p>
                    )}
                </div>

                {/* OG Image - FIXED VERSION */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-1 items-center">
                        <Label
                            htmlFor="featuredMedia"
                            className="flex flex-col items-start"
                        >
                            <span className="flex items-center gap-2">
                                Media
                                <InstructionTooltip instruction="Primary image used for social sharing (Facebook, X, WhatsApp) and SEO previews." />
                            </span>
                            <LabelDescription text="Use high-quality image (recommended: 1200×630). Avoid text-heavy images." />
                            {featuredMediaUrl ? (
                                <div className="relative">
                                    <img
                                        src={getFullImageUrl(featuredMediaUrl)}
                                        className="w-54 h-auto rounded-sm"
                                        alt="Featured media"
                                    />
                                    <Button
                                        size={"icon-sm"}
                                        className="absolute bottom-1 right-1"
                                        type="button"
                                    >
                                        <LucideEdit2 />
                                    </Button>
                                </div>
                            ) : (
                                <div className="size-54 bg-accent p-2 rounded-sm flex items-center justify-center cursor-pointer border-dotted border-2">
                                    <LucideCloudUpload />
                                </div>
                            )}
                        </Label>
                    </div>
                    <Input
                        type="file"
                        name="featuredMedia"
                        id="featuredMedia"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleMediaChange(file);
                        }}
                    />
                    {errors.seo?.featuredMedia && (
                        <p className="text-sm text-red-500">
                            {errors?.seo?.featuredMedia?.message}
                        </p>
                    )}
                </div>

                {/* Schema */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-1 items-center">
                        <Label htmlFor="schema">Schema Markup (JSON-LD)</Label>
                        <InstructionTooltip instruction="Structured data to help search engines understand this page better." />
                    </div>
                    <LabelDescription text="Paste valid JSON-LD schema only (e.g., Article, BlogPosting, Product, Organization)." />
                    <Textarea rows={32} {...register("seo.schema")} />
                    <InfoCard
                        type={"warning"}
                        title="Info"
                        info="Invalid JSON may break rich results."
                    />
                    {errors.seo?.schema && (
                        <p className="text-sm text-red-500">
                            {errors?.seo?.schema?.message}
                        </p>
                    )}
                </div>

                {/* Keywords */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-1 items-center">
                        <Label htmlFor="metaKeywords">Keywords </Label>
                    </div>
                    <LabelDescription text="Comma-separated keywords related to this page. Note: Most search engines ignore this field, but it can help for internal search or legacy systems." />
                    <Input
                        {...register("seo.metaKeywords")}
                        placeholder="nepal travel, trekking agency, tour packages"
                    />
                    {errors.seo?.metaKeywords && (
                        <p className="text-sm text-red-500">
                            {errors?.seo?.metaKeywords?.message}
                        </p>
                    )}
                </div>

                {/* Meta Author */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-1 items-center">
                        <Label htmlFor="metaAuthor">Meta Author</Label>
                    </div>
                    <LabelDescription text="Name of the content author or organization. Useful for attribution and content management." />
                    <Input {...register("seo.metaAuthor")} />
                    {errors.seo?.metaAuthor && (
                        <p className="text-sm text-red-500">
                            {errors?.seo?.metaAuthor?.message}
                        </p>
                    )}
                </div>
            </div>


            {/* Feature */}
            <div className={cn(currStep === 11 ? "flex flex-col gap-3 p-2" : "hidden")}>
                <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor="featuredTags">Featured Tags</Label>
                    <LabelDescription text="Select the tags that you want this trip to be featured on. You can select multiple tags." />
                    <MultiSelect
                        options={featuredTagsOptions}
                        selected={selectedFeaturedTags}
                        onChange={setSelectedFeaturedTags}
                        placeholder="Select Featured Tags"
                        className="w-full"
                    />
                    <InfoCard
                        info="Featured tags help travelers discover your trip through curated collections and themed browsing."
                    />
                </div>

                {/* Show selected tags preview */}
                {selectedFeaturedTags.length > 0 && (
                    <div className="flex flex-col gap-2 mt-4">
                        <Label>Selected Tags ({selectedFeaturedTags.length})</Label>
                        <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
                            {selectedFeaturedTags.map((tagId) => {
                                const tag = featuredTags.find((t) => t.id === tagId);
                                return tag ? (
                                    <Badge key={tagId} variant="secondary" className="text-sm">
                                        {tag.name}
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* NAVIGATION */}
            <div className="flex gap-2 w-full justify-end mt-12">
                <Button
                    size="lg"
                    type="button"
                    onClick={handlePrevStep}
                    disabled={currStep === 1}
                    variant="outline"
                >
                    Prev
                </Button>

                {/* Conditionally render two different buttons based on the step */}
                {currStep === maxStep ? (
                    <Button size={"lg"} type="submit" disabled={isUploading}>
                        Finish
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        type="button" // Explicitly type button ensures it never submits
                        onClick={(e) => handleNextStep(e)}
                        disabled={isUploading}
                    >
                        Next
                    </Button>
                )}
            </div>
        </form>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TripForm />
        </Suspense>
    );
}