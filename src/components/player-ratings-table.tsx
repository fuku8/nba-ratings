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
import { PlayerRating, NBA_TEAMS } from "@/lib/types";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortKey = "playerName" | "teamAbbreviation" | "gp" | "ows" | "dws" | "ws";

interface Props {
  players: PlayerRating[];
  showTeam?: boolean;
}

export function PlayerRatingsTable({ players, showTeam = true }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("ws");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...players].sort((a, b) => {
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
      setSortAsc(key === "playerName" || key === "teamAbbreviation");
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

  const columns: { key: SortKey; label: string; align?: "left" }[] = [
    { key: "playerName", label: "Player", align: "left" },
    ...(showTeam ? [{ key: "teamAbbreviation" as SortKey, label: "Team", align: "left" as const }] : []),
    { key: "gp", label: "GP" },
    { key: "ows", label: "OWS" },
    { key: "dws", label: "DWS" },
    { key: "ws", label: "WS" },
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
          {sorted.map((player, i) => {
            const teamInfo = NBA_TEAMS[player.teamAbbreviation];
            return (
              <TableRow key={`${player.playerName}-${player.teamAbbreviation}`} className="transition-colors hover:bg-accent/50">
                <TableCell className="text-center text-xs text-muted-foreground">
                  {i + 1}
                </TableCell>
                <TableCell className="text-sm font-medium">{player.playerName}</TableCell>
                {showTeam && (
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: teamInfo?.darkColor || "#888" }}
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {player.teamAbbreviation}
                      </span>
                    </span>
                  </TableCell>
                )}
                <TableCell className="text-right tabular-nums text-sm">{player.gp}</TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">
                  {player.ows.toFixed(1)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm font-medium">
                  {player.dws.toFixed(1)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm font-bold text-[var(--color-positive)]">
                  {player.ws.toFixed(1)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
