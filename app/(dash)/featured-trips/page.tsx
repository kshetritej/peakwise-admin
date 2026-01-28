"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    DollarSign,
    MapPin,
    Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FeaturedTag {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

interface Activity {
    id: number;
    title: string;
    slug: string;
    shortDescription?: string;
    price?: number;
    duration?: string;
    images: string[];
    locations: string[];
    views: number;
    averageRating: number;
    tripCategory?: {
        categoryName: string;
    };
    city?: {
        cityName: string;
    };
    createdAt: string;
}

export default function FeaturedTrips() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [featuredTags, setFeaturedTags] = useState<FeaturedTag[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [selectedTagInfo, setSelectedTagInfo] = useState<FeaturedTag | null>(null);
    const [loading, setLoading] = useState(false);
    const [tagsLoading, setTagsLoading] = useState(true);

    const [page, setPage] = useState<number>(
        Number(searchParams.get("page") ?? "1")
    );
    const [limit, setLimit] = useState<number>(
        Number(searchParams.get("limit") ?? "10")
    );

    // Fetch all featured tags
    const fetchFeaturedTags = async () => {
        try {
            setTagsLoading(true);
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/featured`,
                { cache: "no-store" }
            );

            if (!res.ok) throw new Error();
            const data = await res.json();

            setFeaturedTags(data.data.featuredTags || []);

            // Auto-select first tag if available
            if (data.data.featuredTags.length > 0 && !selectedTag) {
                setSelectedTag(data.data.featuredTags[0].slug);
            }
        } catch {
            toast.error("Failed to load featured tags");
        } finally {
            setTagsLoading(false);
        }
    };

    // Fetch activities by selected tag
    const fetchActivitiesByTag = async (tagSlug: string) => {
        try {
            setLoading(true);
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/featured/${tagSlug}?includeActivity=true`,
                { cache: "no-store" }
            );

            if (!res.ok) throw new Error();
            const data = await res.json();

            // Extract activities from the nested structure
            const tagData = data.data.featuredTag;
            setSelectedTagInfo({
                id: tagData.id,
                name: tagData.name,
                slug: tagData.slug,
                description: tagData.description,
            });

            // Get activities and apply pagination on client side
            const allActivities = tagData.activity || [];
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedActivities = allActivities.slice(startIndex, endIndex);

            setActivities(paginatedActivities);
        } catch (error) {
            toast.error("Failed to load trips");
            setActivities([]);
            setSelectedTagInfo(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeaturedTags();
    }, []);

    useEffect(() => {
        if (selectedTag) {
            fetchActivitiesByTag(selectedTag);
        }
    }, [selectedTag, page, limit]);

    const handleTagClick = (slug: string) => {
        setSelectedTag(slug);
        setPage(1); // Reset to first page when changing tags
    };

    const handleViewTrip = (slug: string) => {
        router.replace(`${process.env.NEXT_PUBLIC_WEBSITE_URL}/${slug}`);
    };

    // Strip HTML tags for display
    const stripHtml = (html: string) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-bold">Featured Trips</h1>
                <p className="text-muted-foreground">
                    Explore our curated collections of amazing travel experiences
                </p>
            </div>

            {/* Featured Tags Badges */}
            <Card className="rounded-sm">
                <CardContent>
                    {tagsLoading ? (
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-9 w-24" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {featuredTags.map((tag) => (
                                <Badge
                                    key={tag.id}
                                    variant={selectedTag === tag.slug ? "default" : "outline"}
                                    className={cn(
                                        "cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105",
                                        selectedTag === tag.slug
                                            ? "shadow-md"
                                            : "hover:bg-accent"
                                    )}
                                    onClick={() => handleTagClick(tag.slug)}
                                >
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Selected Tag Info */}
            {selectedTagInfo && !tagsLoading && (
                <Card className="border-l-4 border-l-primary rounded-sm">
                    <CardContent className="">
                        <h3 className="font-semibold text-lg mb-2">
                            {selectedTagInfo.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {selectedTagInfo.description ||
                                "Discover handpicked trips in this category"}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Trips Table */}
            {loading ? (
                <Card className="rounded-sm">
                    <CardContent className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-20 w-full" />
                        ))}
                    </CardContent>
                </Card>
            ) : (
                <Card className="rounded-sm">
                    <CardContent>
                        <Table>
                            <TableCaption>
                                {activities.length === 0
                                    ? "No trips found in this category"
                                    : `Showing ${activities.length} trip(s)`}
                            </TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">S.N</TableHead>
                                    <TableHead>Trip Name</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Views</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {activities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <MapPin className="h-12 w-12 text-muted-foreground" />
                                                <p className="text-muted-foreground">
                                                    No trips available in this category yet
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    activities.map((trip, index) => (
                                        <TableRow key={trip.id}>
                                            <TableCell>
                                                {(page - 1) * limit + index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {trip.images[0] && (
                                                        <img
                                                            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${trip.images[0]}`}
                                                            alt={trip.title}
                                                            className="h-12 w-16 object-cover rounded-md"
                                                        />
                                                    )}
                                                    <p className="font-medium text-md">{trip.title}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    {trip.duration || "—"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {trip.price ? `$${trip.price}` : "—"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3 text-muted-foreground" />
                                                    {trip.views}
                                                </div>
                                            </TableCell>
                                            <TableCell className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewTrip(trip.slug)}
                                                >
                                                    View
                                                </Button>
                                                <Button size={'sm'} variant={'outline'}
                                                    onClick={() =>
                                                        router.push(
                                                            `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL
                                                            }/trips/edit?id=${trip.id}`,
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Pagination */}
            {activities.length > 0 && (
                <div className="flex justify-end items-center">
                    <div className="flex items-center gap-3">
                        <Button
                            size="lg"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1 || loading}
                            variant="outline"
                        >
                            <ChevronLeft size={16} /> Prev
                        </Button>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Page {page}
                            </span>
                        </div>

                        <Select
                            value={String(limit)}
                            onValueChange={(v) => {
                                setLimit(Number(v));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            size="lg"
                            onClick={() => setPage(page + 1)}
                            disabled={loading}
                            variant="outline"
                        >
                            Next <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}