"use client";
import { StatCard } from "@/components/cards/stat-card";
import {
  LucideClock,
  LucideMegaphone,
  LucideUsers,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

type StatsProps = {
  total_activity_count: number;
  active_activities: number;
  activities_pending_approval: number;
  suppliers_pending_verification: number;
  total_registered_suppliers: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<StatsProps>();

  useEffect(() => {
    async function fetchAnalytics() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/analytics`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      setStats(data?.data);
    }
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Activity Status
        </p>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          description="Available in system"
          value={stats?.total_activity_count}
          icon={TrendingUp}
        />
        <StatCard
          description="Currently Visible"
          value={stats?.active_activities}
          icon={LucideMegaphone}
        />
        <StatCard
          description="Requires Action"
          value={stats?.activities_pending_approval}
          icon={LucideClock}
        />
      </div>
    </div>
  );
}
