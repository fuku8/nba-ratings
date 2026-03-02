import { TeamRating, PlayerRating, TEAM_NAME_TO_ABBR } from "./types";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// CSV data loading
// ---------------------------------------------------------------------------

function resolveDataPath(filename: string): string {
  return join(process.cwd(), "data", filename);
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? "";
    });
    return obj;
  });
}

export function getLastUpdated(): string | null {
  const path = resolveDataPath("last_updated.txt");
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf-8").trim();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getTeamRatings(): Promise<TeamRating[]> {
  const path = resolveDataPath("team_ratings.csv");
  if (!existsSync(path)) return [];
  const rows = parseCSV(readFileSync(path, "utf-8"));
  return rows
    .filter((r) => r.TEAM_NAME && r.TEAM_NAME !== "League Average")
    .map((r) => ({
      teamName: r.TEAM_NAME,
      teamAbbreviation: TEAM_NAME_TO_ABBR[r.TEAM_NAME] || "",
      offRating: Number(r.OFF_RATING) || 0,
      defRating: Number(r.DEF_RATING) || 0,
      netRating: Number(r.NET_RATING) || 0,
    }));
}

export async function getPlayerRatings(teamAbbreviation?: string): Promise<PlayerRating[]> {
  const path = resolveDataPath("player_ratings.csv");
  if (!existsSync(path)) return [];
  let rows = parseCSV(readFileSync(path, "utf-8"));
  if (teamAbbreviation) {
    rows = rows.filter((r) => r.TEAM_ID === teamAbbreviation);
  }
  return rows
    .filter((r) => r.PLAYER_NAME && r.PLAYER_NAME !== "Player")
    .map((r) => ({
      playerName: r.PLAYER_NAME,
      teamAbbreviation: r.TEAM_ID || "",
      gp: Number(r.GP) || 0,
      ows: Number(r.OFF_RATING) || 0,
      dws: Number(r.DEF_RATING) || 0,
      ws: Number(r.NET_RATING) || 0,
    }));
}

export async function searchPlayers(query: string): Promise<PlayerRating[]> {
  const allPlayers = await getPlayerRatings();
  const q = query.toLowerCase();
  return allPlayers.filter((p) => p.playerName.toLowerCase().includes(q));
}
