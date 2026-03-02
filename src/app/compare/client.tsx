"use client";

import { useState, useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { PlayerRating, NBA_TEAMS } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, GitCompareArrows } from "lucide-react";

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"];

interface Props {
  players: PlayerRating[];
}

export function ComparePageClient({ players }: Props) {
  const [selected, setSelected] = useState<PlayerRating[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return players
      .filter(
        (p) =>
          p.playerName.toLowerCase().includes(q) &&
          !selected.some((s) => s.playerName === p.playerName && s.teamAbbreviation === p.teamAbbreviation)
      )
      .slice(0, 8);
  }, [players, searchQuery, selected]);

  function addPlayer(player: PlayerRating) {
    if (selected.length < 4) {
      setSelected([...selected, player]);
      setSearchQuery("");
    }
  }

  function removePlayer(index: number) {
    setSelected(selected.filter((_, i) => i !== index));
  }

  const radarData = useMemo(() => {
    if (selected.length === 0) return [];
    const allPlayers = players.filter((p) => p.gp >= 20);
    const maxOws = Math.max(...allPlayers.map((p) => p.ows));
    const maxDws = Math.max(...allPlayers.map((p) => p.dws));
    const maxWs = Math.max(...allPlayers.map((p) => p.ws));
    const maxGp = Math.max(...allPlayers.map((p) => p.gp));

    const metrics = [
      { key: "OWS", normalize: (p: PlayerRating) => (p.ows / maxOws) * 100 },
      { key: "DWS", normalize: (p: PlayerRating) => (p.dws / maxDws) * 100 },
      { key: "WS", normalize: (p: PlayerRating) => (p.ws / maxWs) * 100 },
      { key: "GP", normalize: (p: PlayerRating) => (p.gp / maxGp) * 100 },
    ];

    return metrics.map((m) => {
      const entry: Record<string, string | number> = { metric: m.key };
      selected.forEach((p) => {
        entry[p.playerName] = Number(m.normalize(p).toFixed(1));
      });
      return entry;
    });
  }, [selected, players]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compare Players</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select up to 4 players to compare their stats side by side
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          OWS = Offensive Win Shares / DWS = Defensive Win Shares / WS = Total Win Shares (estimated wins contributed)
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {selected.map((player, i) => {
          const teamInfo = NBA_TEAMS[player.teamAbbreviation];
          return (
            <Badge
              key={`${player.playerName}-${i}`}
              variant="outline"
              className="gap-1.5 py-1.5 pl-2.5 pr-1.5"
              style={{ borderColor: COLORS[i] }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: teamInfo?.darkColor || "#888" }}
              />
              {player.playerName}
              <button
                onClick={() => removePlayer(i)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
        {selected.length < 4 && (
          <div className="relative">
            <Input
              placeholder="Add player..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-52"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-50 mt-1 w-72 rounded-lg border border-border bg-card shadow-xl">
                {suggestions.map((player, idx) => (
                  <button
                    key={`${player.playerName}-${player.teamAbbreviation}-${idx}`}
                    onClick={() => addPlayer(player)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    <Plus className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{player.playerName}</span>
                    <span className="text-xs text-muted-foreground">
                      {player.teamAbbreviation}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selected.length >= 2 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-semibold">Radar Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
              />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
              {selected.map((player, i) => (
                <Radar
                  key={`${player.playerName}-${i}`}
                  name={player.playerName}
                  dataKey={player.playerName}
                  stroke={COLORS[i]}
                  fill={COLORS[i]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              ))}
              <Legend
                wrapperStyle={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {selected.length >= 1 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {selected.map((player, i) => {
            const teamInfo = NBA_TEAMS[player.teamAbbreviation];
            return (
              <div
                key={`${player.playerName}-${i}`}
                className="rounded-xl border bg-card p-4"
                style={{ borderColor: COLORS[i] }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: teamInfo?.darkColor || "#888" }}
                  />
                  <h3 className="font-semibold">{player.playerName}</h3>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {teamInfo?.name || player.teamAbbreviation}
                </p>
                <div className="mt-3 space-y-1.5">
                  {[
                    { label: "OWS", value: player.ows.toFixed(1) },
                    { label: "DWS", value: player.dws.toFixed(1) },
                    { label: "WS", value: player.ws.toFixed(1) },
                    { label: "GP", value: player.gp.toString() },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                      <span className="text-sm font-semibold tabular-nums">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <GitCompareArrows className="mb-3 h-10 w-10 opacity-20" />
          <p className="text-sm">Search and add players to compare</p>
        </div>
      )}
    </div>
  );
}
