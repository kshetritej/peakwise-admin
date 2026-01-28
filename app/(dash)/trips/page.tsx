"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DataTable } from "./data-table";
import { PlusIcon } from "lucide-react";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Trips() {
  const [tripData, setTripData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [pagination, setPagination] = useState<any>();

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "10");

  useEffect(() => {
    let mounted = true;

    async function loadTrips() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/activity/a?page=${page}&limit=${limit}`,
          { credentials: "include", cache: "no-store" },
        );

        if (!res.ok) throw new Error("Failed to fetch trips");

        const data = await res.json();

        const activities = data?.activities ?? [];
        const pagination = data?.pagination;
        setPagination(pagination);

        const mapped: any[] = activities.map((activity: any) => ({
          id: String(activity.id),
          thumbnail: activity.images?.[0] || "",
          title: activity.title || "",
          slug: activity.slug,
          description: activity.shortDescription || "",
          duration: activity.duration || "",
          guestCapacity: activity.guestCapacity || 0,
          amount: activity.price || 0,
          status: activity.status || "",
          availability: activity.availability || null,
        }));

        if (mounted) setTripData(mapped);
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTrips();
    return () => {
      mounted = false;
    };
  }, [page, limit]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">All Trips</h1>
          <p className="text-muted-foreground">
            Our collections of amazing travel experiences
          </p>
        </div>
        <Link href="/trips/edit/">
          <Button size="lg">
            <PlusIcon /> Add New Trip
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : loading ? (
        <p> Loading ...</p>
      ) : (
        <DataTable data={tripData} columns={columns} pagination={pagination} />
      )}
    </div>
  );
}
