"use client";

import { useState, useMemo } from "react";
import { PlayerRating, NBA_TEAMS } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Props {
  players: PlayerRating[];
}

export function SearchPageClient({ players }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return players
      .filter((p) => p.playerName.toLowerCase().includes(q))
      .sort((a, b) => b.ws - a.ws)
      .slice(0, 30);
  }, [players, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Player Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search NBA players by name to view their stats
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          OWS = Offensive Win Shares / DWS = Defensive Win Shares / WS = Total Win Shares (estimated wins contributed)
        </p>
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Type a player name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 text-base"
          autoFocus
        />
      </div>

      {query.length >= 2 && results.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No players found for &quot;{query}&quot;
        </p>
      )}

      {results.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((player) => {
            const teamInfo = NBA_TEAMS[player.teamAbbreviation];
            return (
              <div
                key={`${player.playerName}-${player.teamAbbreviation}`}
                className="group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{player.playerName}</h3>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: teamInfo?.darkColor || "#888" }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {teamInfo?.name || player.teamAbbreviation}
                      </span>
                    </div>
                  </div>
                  <span className="rounded-lg px-2 py-1 text-sm font-bold tabular-nums bg-[var(--color-positive)]/10 text-[var(--color-positive)]">
                    {player.ws.toFixed(1)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { label: "OWS", value: player.ows.toFixed(1) },
                    { label: "DWS", value: player.dws.toFixed(1) },
                    { label: "GP", value: player.gp.toString() },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-[10px] font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-sm font-semibold tabular-nums">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {query.length < 2 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Search className="mb-3 h-10 w-10 opacity-20" />
          <p className="text-sm">Type at least 2 characters to search</p>
        </div>
      )}
    </div>
  );
}
