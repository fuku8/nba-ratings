"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamRating, NBA_TEAMS } from "@/lib/types";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortKey = "teamName" | "offRating" | "defRating" | "netRating";

interface Props {
  teams: TeamRating[];
}

export function TeamRatingsTable({ teams }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("netRating");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...teams].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "string" && typeof bv === "string") {
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "teamName" || key === "defRating");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-30" />;
    return sortAsc ? (
      <ArrowUp className="ml-1 inline h-3 w-3" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3" />
    );
  }

  const columns: { key: SortKey; label: string; align?: "left" | "right" }[] = [
    { key: "teamName", label: "Team", align: "left" },
    { key: "offRating", label: "ORtg" },
    { key: "defRating", label: "DRtg" },
    { key: "netRating", label: "NRtg" },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10 text-center text-xs text-muted-foreground">#</TableHead>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={`cursor-pointer select-none text-xs font-semibold transition-colors hover:text-foreground ${
                  col.align === "left" ? "text-left" : "text-right"
                }`}
                onClick={() => toggleSort(col.key)}
              >
                {col.label}
                <SortIcon col={col.key} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((team, i) => {
            const teamInfo = NBA_TEAMS[team.teamAbbreviation];
            return (
              <TableRow
                key={team.teamAbbreviation}
                className="group transition-colors hover:bg-accent/50"
              >
                <TableCell className="text-center text-xs text-muted-foreground">
                  {i + 1}
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: teamInfo?.darkColor || "#888" }}
                    />
                    <span className="text-sm font-medium">{team.teamName}</span>
                    <span className="text-xs text-muted-foreground">
                      {team.teamAbbreviation}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">
                  {team.offRating.toFixed(1)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">
                  {team.defRating.toFixed(1)}
                </TableCell>
                <TableCell
                  className={`text-right tabular-nums text-sm font-bold ${
                    team.netRating > 0
                      ? "text-[var(--color-positive)]"
                      : team.netRating < 0
                        ? "text-[var(--color-negative)]"
                        : ""
                  }`}
                >
                  {team.netRating > 0 ? "+" : ""}
                  {team.netRating.toFixed(1)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
