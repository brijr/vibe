"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const RechartsAreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> }
);

const Area = dynamic(() => import("recharts").then((mod) => mod.Area), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
  ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

interface StatsChartProps {
  data: { date: string; count: number }[];
}

export function StatsChart({ data }: StatsChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-64 items-center justify-center">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <RechartsAreaChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary) / 0.2)"
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
