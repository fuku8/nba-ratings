"use client";

import { useState, useMemo } from "react";
import { PlayerRating, NBA_TEAMS } from "@/lib/types";
import { PlayerRatingsTable } from "@/components/player-ratings-table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface Props {
  players: PlayerRating[];
}

const MIN_GP_OPTIONS = [0, 10, 20, 30, 40, 50];

export function PlayersPageClient({ players }: Props) {
  const [minGP, setMinGP] = useState(20);
  const [teamFilter, setTeamFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");

  const filtered = useMemo(() => {
    return players.filter((p) => {
      if (p.gp < minGP) return false;
      if (teamFilter && p.teamAbbreviation !== teamFilter) return false;
      if (nameFilter && !p.playerName.toLowerCase().includes(nameFilter.toLowerCase()))
        return false;
      return true;
    });
  }, [players, minGP, teamFilter, nameFilter]);

  const teamAbbreviations = useMemo(() => {
    const set = new Set(players.map((p) => p.teamAbbreviation));
    return Array.from(set).sort();
  }, [players]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Players</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Win Shares for all NBA players
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          OWS = Offensive Win Shares / DWS = Defensive Win Shares / WS = Total Win Shares (estimated wins contributed)
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="w-60"
        />
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Teams</option>
          {teamAbbreviations.map((abbr) => (
            <option key={abbr} value={abbr}>
              {NBA_TEAMS[abbr]?.name || abbr}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Min GP:</span>
          {MIN_GP_OPTIONS.map((gp) => (
            <button
              key={gp}
              onClick={() => setMinGP(gp)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                minGP === gp
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {gp}+
            </button>
          ))}
        </div>
        <Badge variant="secondary" className="ml-auto gap-1">
          <Users className="h-3 w-3" />
          {filtered.length} players
        </Badge>
      </div>

      <PlayerRatingsTable players={filtered} />
    </div>
  );
}
