"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { TeamRating } from "@/lib/types";

interface Props {
  teams: TeamRating[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TeamRating }[];
}) {
  if (!active || !payload?.length) return null;
  const team = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl">
      <p className="text-sm font-semibold">{team.teamName}</p>
      <p className="mt-1 text-xs">
        NRtg:{" "}
        <span
          className={`font-bold ${
            team.netRating > 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
          }`}
        >
          {team.netRating > 0 ? "+" : ""}
          {team.netRating}
        </span>
      </p>
    </div>
  );
}

export function RatingBarChart({ teams }: Props) {
  const sorted = [...teams].sort((a, b) => b.netRating - a.netRating);

  return (
    <ResponsiveContainer width="100%" height={600}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 5, right: 30, bottom: 5, left: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
          stroke="var(--color-border)"
          opacity={0.3}
        />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--color-border)" }}
        />
        <YAxis
          type="category"
          dataKey="teamAbbreviation"
          width={45}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)", fontWeight: 600 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-accent)", opacity: 0.3 }} />
        <ReferenceLine x={0} stroke="var(--color-muted-foreground)" strokeWidth={1} opacity={0.5} />
        <Bar dataKey="netRating" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {sorted.map((team) => (
            <Cell
              key={team.teamAbbreviation}
              fill={
                team.netRating > 0
                  ? "var(--color-positive)"
                  : "var(--color-negative)"
              }
              opacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
