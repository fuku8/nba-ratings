"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";
import { TeamRating, NBA_TEAMS } from "@/lib/types";

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
      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
        <p>
          ORtg: <span className="font-medium text-foreground">{team.offRating}</span>
        </p>
        <p>
          DRtg: <span className="font-medium text-foreground">{team.defRating}</span>
        </p>
        <p>
          NRtg:{" "}
          <span
            className={`font-semibold ${
              team.netRating > 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
            }`}
          >
            {team.netRating > 0 ? "+" : ""}
            {team.netRating}
          </span>
        </p>
      </div>
    </div>
  );
}

function CustomDot(props: {
  cx?: number;
  cy?: number;
  payload?: TeamRating;
}) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;
  const teamInfo = NBA_TEAMS[payload.teamAbbreviation];
  const color = teamInfo?.darkColor || "#888";
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={color} opacity={0.9} stroke="white" strokeWidth={1.5} />
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        className="fill-foreground text-[9px] font-semibold"
      >
        {payload.teamAbbreviation}
      </text>
    </g>
  );
}

export function RatingScatterChart({ teams }: Props) {
  if (teams.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center text-sm text-muted-foreground">
        No team data available.
      </div>
    );
  }

  const avgOff = teams.reduce((s, t) => s + t.offRating, 0) / teams.length;
  const avgDef = teams.reduce((s, t) => s + t.defRating, 0) / teams.length;

  return (
    <ResponsiveContainer width="100%" height={420}>
      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
        <XAxis
          type="number"
          dataKey="offRating"
          name="ORtg"
          domain={["dataMin - 2", "dataMax + 2"]}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--color-border)" }}
        >
          <Label
            value="Offensive Rating →"
            position="bottom"
            offset={0}
            style={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
          />
        </XAxis>
        <YAxis
          type="number"
          dataKey="defRating"
          name="DRtg"
          domain={["dataMin - 2", "dataMax + 2"]}
          reversed
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--color-border)" }}
        >
          <Label
            value="← Defensive Rating (lower is better)"
            angle={-90}
            position="insideLeft"
            offset={10}
            style={{ fontSize: 12, fill: "var(--color-muted-foreground)", textAnchor: "middle" }}
          />
        </YAxis>
        <ReferenceLine
          x={avgOff}
          stroke="var(--color-muted-foreground)"
          strokeDasharray="4 4"
          opacity={0.4}
        />
        <ReferenceLine
          y={avgDef}
          stroke="var(--color-muted-foreground)"
          strokeDasharray="4 4"
          opacity={0.4}
        />
        <Tooltip content={<CustomTooltip />} />
        <Scatter data={teams} shape={<CustomDot />} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
