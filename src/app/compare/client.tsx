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
          !selected.some((s) => s.playerId === p.playerId)
      )
      .slice(0, 8);
  }, [players, searchQuery, selected]);

  function addPlayer(player: PlayerRating) {
    if (selected.length < 4) {
      setSelected([...selected, player]);
      setSearchQuery("");
    }
  }

  function removePlayer(playerId: number) {
    setSelected(selected.filter((p) => p.playerId !== playerId));
  }

  const radarData = useMemo(() => {
    if (selected.length === 0) return [];
    const allPlayers = players.filter((p) => p.gp >= 20);
    const maxOff = Math.max(...allPlayers.map((p) => p.offRating));
    const minDef = Math.min(...allPlayers.map((p) => p.defRating));
    const maxMin = Math.max(...allPlayers.map((p) => p.min));
    const maxPie = Math.max(...allPlayers.map((p) => p.pie));
    const maxGp = Math.max(...allPlayers.map((p) => p.gp));

    const metrics = [
      { key: "ORtg", normalize: (p: PlayerRating) => (p.offRating / maxOff) * 100 },
      { key: "DRtg", normalize: (p: PlayerRating) => (minDef / p.defRating) * 100 },
      { key: "MIN", normalize: (p: PlayerRating) => (p.min / maxMin) * 100 },
      { key: "PIE", normalize: (p: PlayerRating) => (p.pie / maxPie) * 100 },
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
          Select up to 4 players to compare their ratings side by side
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {selected.map((player, i) => {
          const teamInfo = NBA_TEAMS[player.teamAbbreviation];
          return (
            <Badge
              key={player.playerId}
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
                onClick={() => removePlayer(player.playerId)}
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
                {suggestions.map((player) => (
                  <button
                    key={player.playerId}
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
                  key={player.playerId}
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
                key={player.playerId}
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
                    { label: "ORtg", value: player.offRating.toFixed(1) },
                    { label: "DRtg", value: player.defRating.toFixed(1) },
                    {
                      label: "NRtg",
                      value: `${player.netRating > 0 ? "+" : ""}${player.netRating.toFixed(1)}`,
                      color:
                        player.netRating > 0
                          ? "text-[var(--color-positive)]"
                          : "text-[var(--color-negative)]",
                    },
                    { label: "GP", value: player.gp.toString() },
                    { label: "MIN", value: player.min.toFixed(1) },
                    { label: "PIE", value: `${player.pie.toFixed(1)}%` },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                      <span
                        className={`text-sm font-semibold tabular-nums ${stat.color || ""}`}
                      >
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
